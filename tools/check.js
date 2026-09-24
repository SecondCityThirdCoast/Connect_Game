#!/usr/bin/env node
// Validates game data without a browser: `node tools/check.js`
// Loads every script listed in game/loader.js with a stubbed DOM, then checks rooms,
// warps, edge openings, and references to enemies/items/npcs/sprites/tiles.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const GAME = path.join(__dirname, '..', 'game');
const loader = fs.readFileSync(path.join(GAME, 'loader.js'), 'utf8');
const files = [...loader.matchAll(/'([\w/.-]+\.js)'/g)].map((m) => m[1]).filter((f) => f !== 'engine/boot.js');

const warnings = [];
const errors = [];
const ctx = {
  console: { log() {}, warn: (m) => warnings.push(String(m)), error: (m) => errors.push(String(m)) },
  document: { createElement: () => ({ getContext: () => ({}) }), addEventListener() {} },
  navigator: {},
  performance: { now: () => 0 },
  URLSearchParams,
};
ctx.window = ctx;
vm.createContext(ctx);

for (const f of files) {
  try {
    vm.runInContext(fs.readFileSync(path.join(GAME, f), 'utf8'), ctx, { filename: f });
  } catch (e) {
    console.error(`FAILED to load ${f}: ${e.stack}`);
    process.exit(1);
  }
}

const { Game } = ctx;
const { World, Tiles, Config: C } = Game;
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

// ---- sprites
const spriteDefs = {};
const origDefine = Game.Sprites.define;
// Re-run the sprite data file capturing definitions.
Game.Sprites.define = (name, rows) => { spriteDefs[name] = rows; origDefine(name, rows); };
vm.runInContext(fs.readFileSync(path.join(GAME, 'data/sprites.js'), 'utf8'), ctx);
for (const [name, rows] of Object.entries(spriteDefs)) {
  rows.forEach((r, i) => {
    for (const ch of r) if (ch !== '.' && ch !== ' ' && !Game.Sprites.PALETTE[ch]) err(`sprite ${name} row ${i}: unknown palette char '${ch}'`);
  });
}
for (const [ch, t] of Object.entries(Tiles)) {
  if (typeof t === 'object' && t.sprite && !spriteDefs[t.sprite]) err(`tile '${ch}' uses missing sprite ${t.sprite}`);
}

for (const h of Game.Heroes || []) {
  for (const dir of ['down', 'up', 'right']) if (!spriteDefs[h.sprite + '_' + dir + '_0']) err(`hero ${h.id} uses missing sprite ${h.sprite}_${dir}_0`);
  if (h.desc && h.desc.length > 27) err(`hero ${h.id}: desc is ${h.desc.length} chars (max 27)`);
}

// ---- rooms
const passable = (ch) => { const t = Tiles.get(ch); return !t.solid || t.locked; };
const OPP = { up: 'down', down: 'up', left: 'right', right: 'left' };
const edge = (room, dir) => {
  const m = room.map;
  if (dir === 'up') return m[0].split('');
  if (dir === 'down') return m[C.ROWS - 1].split('');
  if (dir === 'left') return m.map((r) => r[0]);
  return m.map((r) => r[C.COLS - 1]);
};

for (const [id, room] of Object.entries(World.rooms)) {
  const where = `room "${id}"`;
  if (room.area && !World.areas[room.area] && room.area !== 'caves') warn(`${where}: area "${room.area}" has no layout (fine for caves)`);
  if (room.map.length !== C.ROWS) err(`${where}: ${room.map.length} rows (need ${C.ROWS})`);
  room.map.forEach((r, y) => {
    if (r.length !== C.COLS) err(`${where} row ${y}: ${r.length} chars (need ${C.COLS}): '${r}'`);
    for (const ch of r) if (!Tiles[ch]) err(`${where} row ${y}: unknown tile '${ch}'`);
  });
  const tileAt = (x, y) => (room.map[y] || '')[x];

  for (const e of room.enemies || []) {
    const type = typeof e === 'string' ? e : e.type;
    if (!Game.Enemies.defs[type]) err(`${where}: unknown enemy "${type}"`);
    if (typeof e === 'object' && e.x !== undefined && !passable(tileAt(e.x, e.y))) warn(`${where}: enemy ${type} placed on solid tile ${e.x},${e.y}`);
  }
  for (const it of room.items || []) {
    if (!Game.Items.defs[it.type]) err(`${where}: unknown item "${it.type}"`);
    if (!passable(tileAt(it.x, it.y))) warn(`${where}: item ${it.type} on solid tile ${it.x},${it.y}`);
    if (it.price !== undefined && !(it.price > 0)) err(`${where}: item ${it.type} has a bad price ${JSON.stringify(it.price)}`);
  }
  if (room.clearReward && !Game.Items.defs[room.clearReward.type]) err(`${where}: unknown clearReward item "${room.clearReward.type}"`);
  if (room.clearReward && !room.clearReward.flag) err(`${where}: clearReward needs a flag`);
  for (const n of room.npcs || []) if (!Game.Npcs.defs[n.type]) err(`${where}: unknown npc "${n.type}"`);

  // warps
  const warps = room.warps || [];
  for (const w of warps) {
    const t = Tiles.get(tileAt(w.x, w.y));
    if (!t.warp) err(`${where}: warp at ${w.x},${w.y} is not on a warp tile (it's '${tileAt(w.x, w.y)}')`);
    const target = World.rooms[w.to];
    if (!target) { err(`${where}: warp to unknown room "${w.to}"`); continue; }
    const tt = Tiles.get((target.map[w.ty] || '')[w.tx]);
    if (tt.solid) err(`${where}: warp lands on solid tile in "${w.to}" at ${w.tx},${w.ty}`);
    if (tt.warp) err(`${where}: warp lands on another warp tile in "${w.to}" at ${w.tx},${w.ty} (would loop)`);
  }
  room.map.forEach((r, y) => r.split('').forEach((ch, x) => {
    if (Tiles.get(ch).warp && !warps.some((w) => w.x === x && w.y === y)) err(`${where}: warp tile '${ch}' at ${x},${y} has no warps[] entry`);
  }));

  // edges
  for (const dir of ['up', 'down', 'left', 'right']) {
    const mine = edge(room, dir);
    const openings = mine.map(passable);
    const nId = World.neighbor(id, dir);
    if (!nId) {
      const walkOff = mine.some((ch) => passable(ch) && !Tiles.get(ch).warp);
      if (walkOff && !(room.exits && room.exits[dir])) warn(`${where}: ${dir} edge has openings but no neighbour (player is just blocked)`);
      continue;
    }
    const other = World.rooms[nId];
    if (!other) { err(`${where}: ${dir} neighbour "${nId}" does not exist`); continue; }
    const theirs = edge(other, OPP[dir]).map(passable);
    if (!openings.some(Boolean)) continue; // sealed on our side: fine
    openings.forEach((open, i) => {
      if (open && !theirs[i]) err(`${where}: ${dir} edge open at ${i} but "${nId}" is solid there -- player would walk into a wall`);
    });
  }
}

// layouts reference real rooms
for (const [id, a] of Object.entries(World.areas)) {
  a.layout.flat().forEach((r) => { if (r && !World.rooms[r]) err(`area "${id}": layout references missing room "${r}"`); });
}
if (!World.rooms[C.START_ROOM]) err(`Config.START_ROOM "${C.START_ROOM}" does not exist`);

warnings.forEach((w) => console.log('WARN  ' + w));
errors.forEach((e) => console.log('ERROR ' + e));
console.log(`\n${Object.keys(World.rooms).length} rooms, ${Object.keys(Game.Enemies.defs).length} enemies, ` +
  `${Object.keys(Game.Items.defs).length} items, ${Object.keys(spriteDefs).length} sprites -- ` +
  `${errors.length} errors, ${warnings.length} warnings`);
process.exit(errors.length ? 1 : 0);
