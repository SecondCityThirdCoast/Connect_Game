# Legend of the Hackathon — agent guide

NES-Zelda-style game. **Plain JavaScript, no build step, no dependencies, no modules.**
Every file attaches to the global `Game` object. Optimise for speed of change: make the
smallest edit that works, follow the existing patterns, and don't restructure.

## Run / verify
- Play: open `index.html` directly in a browser (double-click works; no server needed).
- **After every data change run `node tools/check.js`.** It validates rooms, tile chars, row
  lengths, room-edge alignment, warps, and enemy/item/npc/sprite references in about a second.
- URL flags for testing: `index.html?room=d_boss&sword=1&debug=1` (skip the title screen, start
  in a room, start with the sword (`sword=2` for the white sword), show hitboxes). Press `` ` `` in game to toggle debug view.
  `?hero=mark` plays as a given hero; `?select=1` opens the hero select screen directly.
- Browser console: `Game.current` is the live game (`Game.current.loadRoom('lake_ne', 7, 5)`,
  `Game.current.player.hp = 99`, `Game.current.inventory.keys = 5`).

## File map
| File | What's in it | Edit for… |
|---|---|---|
| `game/engine/config.js` | Constants: speed, hearts, damage, start room, title | tuning, game feel |
| `game/data/rooms.js` | **The world**: areas (room grids) and every room's map/enemies/items/warps | new rooms, level design |
| `game/data/tiles.js` | Map character → tile behaviour (solid, water, warp, locked) | new terrain |
| `game/data/enemies.js` | AI behaviours + enemy types + loot table | new enemies/AI |
| `game/data/items.js` | Pickups and their effects | new items/powerups |
| `game/data/npcs.js` | NPC types | new characters |
| `game/data/heroes.js` | Playable heroes: sprite base, hearts, speed, select-screen text | new heroes |
| `game/data/sprites.js` | **All pixel art** as text grids | new/changed graphics |
| `game/engine/sprites.js` | Palette (letter → colour) + renderer | new colours |
| `game/engine/audio.js` | Synth sound effects table | new sounds |
| `game/engine/player.js` | Player movement, sword, doors, warps | player abilities |
| `game/engine/entity.js` | Base Entity, Enemy, Projectile, Pickup, Npc, Effect classes | shared entity logic |
| `game/engine/game.js` | State machine, room loading, collisions, rendering | game rules, new states |
| `game/engine/hud.js` | Top bar, text drawing, dialog box | UI |
| `game/engine/bombs.js` | The B item: lit bomb, blast damage, explosion animation | bombs, other B items |
| `game/engine/ride.js` | Winterbird rides: state `ride` that carries you to another room | fast travel |
| `game/engine/shop.js` | Vendor menus: state `shop`, `tryInteract` for talk-to-NPC on the sword button | shops, dialogue |
| `game/engine/select.js` | Hero select screen (state `select`, between title and play) | select screen |
| `game/engine/input.js` | Key/gamepad bindings | controls |
| `game/engine/cheats.js` | Cheat codes typed as input sequences (Konami code = full health) | new cheats |
| `game/loader.js` | Ordered list of script files | **add any new .js file here** |
| `hackathon-quest.php` | WordPress plugin wrapper (shortcode `[hackathon_quest]`) | rarely |

Load order matters: engine basics → data/sprites → tiles → world → entity (registries) → data
(items/enemies/npcs) → player → rooms → hud → game → boot. Data files that call
`Game.Enemies.define` etc. must come after `engine/entity.js`.

## Core conventions
- Screen = 16×11 tiles of 16px (256×176) plus a 48px HUD. Positions are pixels; room data uses tile coords.
- **Health is in half-hearts.** `damage: 1` = half a heart. Player `maxHp` 6 = 3 hearts.
- Directions are strings: `'up' | 'down' | 'left' | 'right'`; vectors are in `Game.Util.DIRS`.
- Sprites are named `<base>_<dir>_<frame>` (e.g. `octorok_down_0`). Missing ones fall back:
  `left` draws `right` flipped; a missing `_1` frame reuses `_0` (flipped for up/down);
  otherwise `<base>_<frame>` or `<base>`. A missing sprite draws a magenta box and does not crash.
- Persistent progress lives in `game.flags` (string keys). Items with a `flag` are collected
  only once; opened doors are saved as `tile:<room>:<x>,<y>` flags.
- Enemies respawn every time you enter a room (like the NES), except in rooms whose
  `clearReward` has already been claimed.
- Treasure chests (`chest` item) open on touch, roll `Game.CHEST_LOOT` (or a placed chest's `loot`) and
  print what was inside. One may appear on a free tile of any room on entry (`Config.CHEST.CHANCE`,
  once per room; `?chest=1` forces one; `chest: false` on a room opts out).
- Shops: a vendor NPC (type with an `interact` hook, like `merchant`) lists `wares: [{item, price, label}]`
  in its room entry; it draws them on the counter (`t` tiles) in front of it and pressing the sword
  button within 3 tiles opens the buy menu (`engine/shop.js`). Room `items` with a `price` still work
  as walk-over stalls. `inventory.lives` (the `life` item) turns a death into a respawn at the tile
  where you entered the room.

## Recipes

### Add a room
1. In `game/data/rooms.js`, add `W.room('my_room', { area: 'overworld', map: [...11 rows of 16 chars...], enemies: ['octorok'] })`.
2. Put its id in the area's `layout` grid, next to the room it connects to.
3. Line up the edge openings with the neighbour (same columns/rows open on both sides).
4. `node tools/check.js`.

### Add a cave / secret room (warp)
Put a `C` (cave) or `>` (stairs) tile in the map, then add
`warps: [{ x, y, to: 'target_room', tx, ty }]` for that tile. Give the target room a way back
(another warp). The landing tile `tx,ty` must be walkable and **not** a warp tile.
Rooms that aren't in any layout use `area: 'caves'`.

### Add an enemy
```js
// game/data/enemies.js
E.define('darknut', {
  sprite: 'darknut', hp: 4, speed: 40, damage: 2,
  behavior: 'chase',            // wander | wanderShoot | chase | flutter | hop
  drops: DEFAULT_DROPS,
});
```
Then add sprites `darknut_down_0`, `darknut_up_0`, `darknut_right_0` in `game/data/sprites.js`
(or just `darknut_0` to use one sprite for every direction). For custom AI, write a new
`B.myBehavior = function (e, dt, game) {...}` or pass `update: function (e, dt, game) {...}`.
Useful inside AI: `e.walk(dt, game.room)`, `e.shoot(game, {sprite, speed, dir})`,
`Game.Util.dirToward(e.center(), game.player.center())`, `e.timer`, `e.state`.

### Add an item / power-up
```js
// game/data/items.js
I.define('boots', {
  sprite: 'boots', sound: 'item', message: 'YOU GOT THE PEGASUS BOOTS!',
  onPickup: function (game, p) { p.speedBoost = 1.5; },
});
```
Then place it in a room (`items: [{ type: 'boots', x: 7, y: 5, flag: 'got_boots' }]`), add it
to a loot table, or give it as a `clearReward`. If it changes the player, read the new field in
`engine/player.js`.

### Add a B-button item (boomerang, bow…)
`Input` already maps `item` to K/X. `player.update` calls `game.useItem()`, which bombs define in
`engine/bombs.js` (tuning in `Config.BOMB`). To swap in another item, replace or branch that
`Game.GameState.prototype.useItem = function () {...}`,
spawning a `new Game.Projectile({ x, y, dir, sprite, speed, damage, team: 'player', pierce, onHit })`.
Draw the item in the HUD's B box in `engine/hud.js`.

### Add a tile type
Add a character in `game/data/tiles.js` (`'^': { sprite: 'tile_spikes', onTouch: function (game) { game.player.hurt(1, game.player, game); } }`),
then draw `tile_spikes` in `data/sprites.js` (tiles are 8×8 art drawn at 2×, using `T(...)`).

### Add an NPC with dialogue
`npcs: [{ type: 'oldman', x: 7, y: 3, text: 'SECRET IS IN THE GRAVEYARD.' }]` in a room.
New NPC types go in `game/data/npcs.js` with a sprite. To spawn one only under a condition, use the
room's `onEnter`/`onClear` hooks (`cv_n` spawns a `winterbird` that flies you to `d_boss` once the
wraith is dead; give it `{ ride: { to, tx, ty, say } }`).

### Add a sound
Add an entry to `SFX` in `game/engine/audio.js` and call `Game.Audio.play('name')`.

### Draw pixel art
Each character is one pixel; letters are colours from `PALETTE` in `engine/sprites.js`
(`K` black, `W` white, `G`/`g` greens, `B`/`b` browns, `R`/`r` reds, `U`/`u` blues, `C` cyan,
`y` gold, `Y` sand, `O` orange, `S` skin, `A`/`a` greys, `M` magenta). `.` is transparent.
Keep entity sprites at 16×16 or smaller. Uneven row lengths are padded automatically.

## Gotchas
- No `import`/`export`. Wrap new files in `(function () { ... })();` and attach to `Game`.
- New file? Add it to `FILES` in `game/loader.js` in the correct order, or it won't load.
- Room maps must be exactly 16×11. `tools/check.js` catches this.
- Collision uses each entity's `hb` hitbox (player: lower body only), not its sprite.
- Don't use browser dialogs (`alert`/`confirm`). Show text with `game.say('TEXT')`.
