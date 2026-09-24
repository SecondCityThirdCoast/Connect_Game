// Tile legend: the character used in room maps (data/rooms.js) -> tile behaviour.
//   sprite:  sprite name from data/sprites.js
//   solid:   blocks walking entities (player, most enemies)
//   water:   solid, but projectiles fly over it
//   warp:    stepping on it triggers the room's warp for that tile (caves, stairs)
//   locked:  solid until the player bumps it holding a key (becomes `opensTo`)
//   onTouch: optional function(game, tileX, tileY) called when the player stands on it
Game.Tiles = {
  '.': { sprite: 'tile_grass' },
  ',': { sprite: 'tile_flowers' },
  's': { sprite: 'tile_sand' },
  '=': { sprite: 'tile_bridge' },
  'T': { sprite: 'tile_tree', solid: true },
  'R': { sprite: 'tile_rock', solid: true },
  'B': { sprite: 'tile_bush', solid: true },
  'W': { sprite: 'tile_water', solid: true, water: true },
  'C': { sprite: 'tile_cave', warp: true },
  ' ': { sprite: 'tile_dark' },
  // Dungeon
  'f': { sprite: 'tile_floor' },
  '#': { sprite: 'tile_wall', solid: true },
  'X': { sprite: 'tile_block', solid: true },
  'S': { sprite: 'tile_statue', solid: true },
  'L': { sprite: 'tile_locked', solid: true, locked: true, opensTo: 'f' },
  '>': { sprite: 'tile_stairs', warp: true },
};

Game.Tiles.DEFAULT = '.';
Game.Tiles.get = function (ch) {
  return Game.Tiles[ch] || Game.Tiles[Game.Tiles.DEFAULT];
};
