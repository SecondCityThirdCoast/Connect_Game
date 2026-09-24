// Rooms and areas.
//   Game.World.area(id, {layout: [[roomId|null, ...], ...], name})
//     A grid of rooms. Walking off a room edge scrolls to the neighbour in the layout.
//   Game.World.room(id, {area, map, enemies, items, npcs, warps, onEnter})
//     See data/rooms.js for the full format.
Game.World = (function () {
  var C = Game.Config;
  var rooms = {};
  var areas = {};

  function area(id, def) {
    def.id = id;
    areas[id] = def;
  }

  function room(id, def) {
    def.id = id;
    if (def.map.length !== C.ROWS) console.warn('[World] room "' + id + '" has ' + def.map.length + ' rows, expected ' + C.ROWS);
    def.map.forEach(function (row, i) {
      if (row.length !== C.COLS) console.warn('[World] room "' + id + '" row ' + i + ' has ' + row.length + ' cols, expected ' + C.COLS);
    });
    rooms[id] = def;
  }

  // Where is this room in its area's layout grid?
  function position(roomId) {
    var def = rooms[roomId];
    var a = def && areas[def.area];
    if (!a) return null;
    for (var y = 0; y < a.layout.length; y++) {
      var x = a.layout[y].indexOf(roomId);
      if (x !== -1) return { x: x, y: y, area: a };
    }
    return null;
  }

  function neighbor(roomId, dir) {
    var def = rooms[roomId];
    if (def && def.exits && def.exits[dir]) return def.exits[dir]; // explicit override
    var p = position(roomId);
    if (!p) return null;
    var d = Game.Util.DIRS[dir];
    var row = p.area.layout[p.y + d.y];
    return (row && row[p.x + d.x]) || null;
  }

  // A live copy of a room: mutable tiles, so doors can open, etc.
  function instantiate(roomId, flags) {
    var def = rooms[roomId];
    if (!def) throw new Error('[World] unknown room "' + roomId + '"');
    var tiles = def.map.map(function (row) {
      var r = row.split('');
      while (r.length < C.COLS) r.push(Game.Tiles.DEFAULT);
      return r.slice(0, C.COLS);
    });
    while (tiles.length < C.ROWS) tiles.push(new Array(C.COLS).fill(Game.Tiles.DEFAULT));
    // Re-apply persistent tile changes (opened doors, burned bushes...)
    Object.keys(flags).forEach(function (k) {
      var m = k.match(/^tile:([^:]+):(\d+),(\d+)$/);
      if (m && m[1] === roomId) tiles[+m[3]][+m[2]] = flags[k];
    });
    return {
      id: roomId,
      def: def,
      tiles: tiles,
      tileAt: function (tx, ty) {
        if (tx < 0 || ty < 0 || tx >= C.COLS || ty >= C.ROWS) return null;
        return tiles[ty][tx];
      },
      tileInfoAt: function (tx, ty) {
        var ch = this.tileAt(tx, ty);
        return ch === null ? null : Game.Tiles.get(ch);
      },
      // Is the pixel-space box blocked by solid tiles? Off-room counts as open
      // (room edges are handled by the scroll logic).
      blocked: function (box, opts) {
        var T = C.TILE;
        var x0 = Math.floor(box.x / T), x1 = Math.floor((box.x + box.w - 0.01) / T);
        var y0 = Math.floor(box.y / T), y1 = Math.floor((box.y + box.h - 0.01) / T);
        for (var ty = y0; ty <= y1; ty++) {
          for (var tx = x0; tx <= x1; tx++) {
            var t = this.tileInfoAt(tx, ty);
            if (!t) { if (opts && opts.edgesSolid) return true; continue; }
            if (t.solid && !(opts && opts.overWater && t.water)) return true;
          }
        }
        return false;
      },
      setTile: function (tx, ty, ch, persist) {
        tiles[ty][tx] = ch;
        if (persist) flags['tile:' + roomId + ':' + tx + ',' + ty] = ch;
      },
      warpAt: function (tx, ty) {
        return (def.warps || []).find(function (w) { return w.x === tx && w.y === ty; }) || null;
      },
    };
  }

  function drawRoom(ctx, roomInst, ox, oy) {
    var T = C.TILE;
    for (var y = 0; y < C.ROWS; y++) {
      for (var x = 0; x < C.COLS; x++) {
        var t = Game.Tiles.get(roomInst.tiles[y][x]);
        Game.Sprites.draw(ctx, t.sprite, ox + x * T, oy + y * T);
      }
    }
  }

  return {
    area: area,
    room: room,
    rooms: rooms,
    areas: areas,
    position: position,
    neighbor: neighbor,
    instantiate: instantiate,
    drawRoom: drawRoom,
  };
})();
