// THE WORLD. Areas are grids of rooms; walking off an edge scrolls to the neighbour.
// Rooms not in any layout (e.g. caves) are reached with warps.
//
// Room format:
//   area:    which area layout it belongs to (for neighbours + minimap)
//   map:     11 strings x 16 chars. Legend in data/tiles.js.
//            Edge openings must line up with the neighbour room's openings
//            (run `node tools/check.js` to verify).
//   enemies: ['octorok', ...]  -> random free tiles
//            or [{type: 'octorok', x: 3, y: 4}] -> exact tile
//   items:   [{type: 'key', x, y, flag: 'unique_flag'}] -- with flag = only collectable once
//   npcs:    [{type: 'oldman', x, y, text: 'Shown when the room is entered'}]
//   warps:   [{x, y, to: 'roomId', tx, ty}] -- stepping on warp tile (x,y) sends the
//            player to tile (tx,ty) of room `to`. Warp tiles are 'C' (cave) and '>' (stairs).
//   clearReward: {type, x, y, flag} -- item appears when every enemy is dead
//   exits:   {up|down|left|right: 'roomId'} -- optional override of layout neighbours
//   onEnter(game, room): optional hook
(function () {
  var W = Game.World;

  // ================================================================== OVERWORLD
  W.area('overworld', {
    name: 'OVERWORLD',
    layout: [
      ['forest_nw', 'forest_n', 'lake_ne'],
      ['west', 'start', 'east'],
      ['graveyard', 'south', 'dungeon_gate'],
    ],
  });

  W.room('start', {
    area: 'overworld',
    map: [
      'TTTTTTT..TTTTTTT',
      'TTCTTTT..TTTTTTT',
      'T..............T',
      'T..,......,....T',
      '................',
      '................',
      '................',
      'T....,.....,...T',
      'T..............T',
      'TTTTTTT..TTTTTTT',
      'TTTTTTT..TTTTTTT',
    ],
    warps: [{ x: 2, y: 1, to: 'cave_sword', tx: 7, ty: 9 }],
  });

  W.room('cave_sword', {
    area: 'caves',
    map: [
      'RRRRRRRRRRRRRRRR',
      'RRRRRRRRRRRRRRRR',
      'RR            RR',
      'RR            RR',
      'RR            RR',
      'RR            RR',
      'RR            RR',
      'RR            RR',
      'RR            RR',
      'RR            RR',
      'RRRRRRRCCRRRRRRR',
    ],
    npcs: [
      { type: 'oldman', x: 7, y: 3, text: "IT'S DANGEROUS TO GO ALONE! TAKE THIS." },
      { type: 'fire', x: 4, y: 3 },
      { type: 'fire', x: 11, y: 3 },
    ],
    items: [{ type: 'sword', x: 7, y: 5, flag: 'got_sword' }],
    warps: [
      { x: 7, y: 10, to: 'start', tx: 2, ty: 2 },
      { x: 8, y: 10, to: 'start', tx: 2, ty: 2 },
    ],
  });

  W.room('forest_n', {
    area: 'overworld',
    map: [
      'TTTTTTTTTTTTTTTT',
      'T..T....T....T.T',
      'T......T.......T',
      'T.T..........T.T',
      '................',
      '....T......T....',
      '................',
      'T.T....T.....T.T',
      'T....T....T....T',
      'TTTTTTT..TTTTTTT',
      'TTTTTTT..TTTTTTT',
    ],
    enemies: ['octorok', 'octorok', 'octorok'],
  });

  W.room('forest_nw', {
    area: 'overworld',
    map: [
      'TTTTTTTTTTTTTTTT',
      'T..............T',
      'T.TTT....TTTT..T',
      'T.T..........T.T',
      'T.T..BBBB.......',
      'T....B..........',
      'T.T..BBBB.......',
      'T.T..........T.T',
      'T.TTTT...TTTTT.T',
      'T..............T',
      'TTTTTTTTTTTTTTTT',
    ],
    enemies: ['moblin', 'moblin'],
    items: [{ type: 'rupee_blue', x: 6, y: 5 }, { type: 'rupee_blue', x: 7, y: 5 }],
  });

  W.room('lake_ne', {
    area: 'overworld',
    map: [
      'RRRRRRRRRRRRRRRR',
      'R..............R',
      'R...WWWWWWWW...R',
      'R..WWWWWWWWWW..R',
      '...WWWWWWWWWW..R',
      '...WWWW,,WWWW..R',
      '...WWWW=WWWWW..R',
      'R..WWWW=WWWWW..R',
      'R...WWW=WWWW...R',
      'R..............R',
      'RRRRRRRRRRRRRRRR',
    ],
    enemies: ['octorok', 'keese', 'keese'],
    items: [{ type: 'heart_container', x: 8, y: 5, flag: 'hc_lake' }],
  });

  W.room('west', {
    area: 'overworld',
    map: [
      'RRRRRRRRRRRRRRRR',
      'R..............R',
      'R..R.......R...R',
      'R..............R',
      'R.....RR........',
      'R.....RR........',
      'R...............',
      'R..R........R..R',
      'R..............R',
      'RRRRRRR..RRRRRRR',
      'RRRRRRR..RRRRRRR',
    ],
    enemies: ['slime', 'slime', 'slime'],
  });

  W.room('graveyard', {
    area: 'overworld',
    map: [
      'RRRRRRR..RRRRRRR',
      'R..............R',
      'R.S..S..S..S...R',
      'R..............R',
      'R.S..S..S..S...R',
      'R..............R',
      'R.S..S..S..S...R',
      'R..............R',
      'R......S>S.....R',
      'R..............R',
      'RRRRRRRRRRRRRRRR',
    ],
    enemies: ['keese', 'keese', 'keese'],
    items: [{ type: 'rupee_blue', x: 13, y: 2 }, { type: 'bomb', x: 13, y: 6 }],
    warps: [{ x: 8, y: 8, to: 'cv_s', tx: 7, ty: 8 }],
  });

  W.room('east', {
    area: 'overworld',
    map: [
      'TTTTTTTTTTTTTTTT',
      'T..............T',
      'T..TT......TT..T',
      'T..............T',
      '...........s...T',
      '..........sss..T',
      '...........s...T',
      'T..............T',
      'T..TT......TT..T',
      'TTTTTTT..TTTTTTT',
      'TTTTTTT..TTTTTTT',
    ],
    enemies: ['octorok', 'octorok', 'moblin'],
  });

  W.room('south', {
    area: 'overworld',
    map: [
      'TTTTTTT..TTTTTTT',
      'T......ss......T',
      'T.....ssss.....T',
      'T....ssssss....T',
      'T...ssssssss...T',
      'T...ssssssss...T',
      'T...ssssssss...T',
      'T....ssssss....T',
      'T..............T',
      'T..............T',
      'TTTTTTTTTTTTTTTT',
    ],
    enemies: ['slime', 'slime', 'octorok_blue', 'octorok_blue'],
  });

  W.room('dungeon_gate', {
    area: 'overworld',
    map: [
      'RRRRRRR..RRRRRRR',
      'R..............R',
      'R..............R',
      'R....RRRRRR....R',
      'R....R.>..R....R',
      'R....R....R....R',
      'R....RR..RR....R',
      'R.....S..S.....R',
      'R..............R',
      'R..............R',
      'RRRRRRRRRRRRRRRR',
    ],
    enemies: [{ type: 'moblin', x: 3, y: 8 }, { type: 'moblin', x: 12, y: 8 }],
    warps: [{ x: 7, y: 4, to: 'd_entry', tx: 7, ty: 8 }],
  });

  // ================================================================== DUNGEON 1
  W.area('dungeon1', {
    name: 'LEVEL-1',
    layout: [
      [null, 'd_boss', null],
      ['d_key', 'd_hub', null],
      [null, 'd_entry', null],
    ],
  });

  W.room('d_entry', {
    area: 'dungeon1',
    map: [
      '#######ff#######',
      '#ffffffffffffff#',
      '#ffXffffffffXff#',
      '#ffffffffffffff#',
      '#ffffffffffffff#',
      '#ffffffffffffff#',
      '#ffffffffffffff#',
      '#ffXffffffffXff#',
      '#ffffffffffffff#',
      '#ffffff>fffffff#',
      '################',
    ],
    enemies: ['keese', 'keese'],
    warps: [{ x: 7, y: 9, to: 'dungeon_gate', tx: 7, ty: 5 }],
  });

  W.room('d_hub', {
    area: 'dungeon1',
    map: [
      '#######LL#######',
      '#ffffffffffffff#',
      '#ffffffffffffff#',
      '#ffffSSffSSffff#',
      'fffffffffffffff#',
      'fffffffffffffff#',
      'fffffffffffffff#',
      '#ffffSSffSSffff#',
      '#ffffffffffffff#',
      '#ffffffffffffff#',
      '#######ff#######',
    ],
    enemies: ['slime', 'slime', 'slime'],
  });

  W.room('d_key', {
    area: 'dungeon1',
    map: [
      '################',
      '#ffffffffffffff#',
      '#ffXXffffffXXff#',
      '#ffXffffffffXff#',
      '#fffffffffffffff',
      '#fffffffffffffff',
      '#fffffffffffffff',
      '#ffXffffffffXff#',
      '#ffXXffffffXXff#',
      '#ffffffffffffff#',
      '################',
    ],
    enemies: ['keese', 'keese', 'moblin'],
    clearReward: { type: 'key', x: 7, y: 5, flag: 'd1_key' },
  });

  W.room('d_boss', {
    area: 'dungeon1',
    map: [
      '################',
      '#ffffffffffffff#',
      '#fSffffffffffSf#',
      '#ffffffffffffff#',
      '#ffffffffffffff#',
      '#ffffffffffffff#',
      '#ffffffffffffff#',
      '#ffffffffffffff#',
      '#fSffffffffffSf#',
      '#ffffffffffffff#',
      '#######ff#######',
    ],
    enemies: [{ type: 'boss_moblin', x: 7, y: 3 }],
    clearReward: { type: 'triforce', x: 7, y: 5, flag: 'triforce' },
  });

  // ================================================================== LEVEL-2: THE CAVERN
  // Under the graveyard (stairs at 8,8). Tiles: '%' rock wall, ':' cave floor, '^' stalagmite,
  // '~' black water, '*' bones, '&' glowing mushrooms, 'D' locked door (opens to cave floor).
  W.area('cavern', {
    name: 'LEVEL-2',
    layout: [
      ['cv_nw', 'cv_n', 'cv_ne'],
      ['cv_w', 'cv_hub', 'cv_e'],
      ['cv_sw', 'cv_s', 'cv_se'],
    ],
  });

  // Entrance. Stairs at (7,9) lead back up to the graveyard.
  W.room('cv_s', {
    area: 'cavern',
    map: [
      '%%%%%%%::%%%%%%%',
      '%::::::::::::::%',
      '%:^::::::::::^:%',
      '%::::::::::::::%',
      '::::::::::::::::',
      '::::::::::::::::',
      '::::::::::::::::',
      '%::::::::::::::%',
      '%:*::::::::::*:%',
      '%::::::>:::::::%',
      '%%%%%%%%%%%%%%%%',
    ],
    enemies: ['keese', 'keese'],
    warps: [{ x: 7, y: 9, to: 'graveyard', tx: 8, ty: 9 }],
    onEnter: function (game) {
      if (game.flags.cv_seen) return;
      game.flags.cv_seen = true;
      game.say('THE AIR IS COLD. SOMETHING STIRS BELOW.');
    },
  });

  // Crossroads around a black pond. The north door is locked (key from cv_ne).
  W.room('cv_hub', {
    area: 'cavern',
    map: [
      '%%%%%%%DD%%%%%%%',
      '%::::::::::::::%',
      '%:^:::~~~~:::^:%',
      '%::::~~~~~~::::%',
      '::::::~~~~::::::',
      '::::::~~~~::::::',
      '::::::::::::::::',
      '%::::::::::::::%',
      '%:^::::::::::^:%',
      '%::::::::::::::%',
      '%%%%%%%::%%%%%%%',
    ],
    enemies: ['ghost', 'ghost', 'keese'],
  });

  // Boss lair. Beat the wraith for a heart container; the white sword appears after.
  W.room('cv_n', {
    area: 'cavern',
    map: [
      '%%%%%%%%%%%%%%%%',
      '%::::::::::::::%',
      '%:*::::::::::*:%',
      '%::::::::::::::%',
      '%::::::::::::::%',
      '%::::::::::::::%',
      '%::::::::::::::%',
      '%::::::::::::::%',
      '%:*::::::::::*:%',
      '%::::::::::::::%',
      '%%%%%%%::%%%%%%%',
    ],
    enemies: [{ type: 'boss_wraith', x: 7, y: 3 }],
    clearReward: { type: 'sword_white', x: 7, y: 5, flag: 'cv_sword' },
  });

  // Ossuary: skeletons among the bones.
  W.room('cv_w', {
    area: 'cavern',
    map: [
      '%%%%%%%::%%%%%%%',
      '%:*:::::::::*::%',
      '%::::^:::::::::%',
      '%:::::::::*::::%',
      '%:::::::::::::::',
      '%::*:::::^::::::',
      '%:::::::::::::::',
      '%::::^::::::*::%',
      '%:*::::::::::::%',
      '%::::::::*:::::%',
      '%%%%%%%::%%%%%%%',
    ],
    enemies: ['stalfos', 'stalfos'],
  });

  // The black lake. A plank bridge reaches an island with a prize; ghosts cross water freely.
  W.room('cv_e', {
    area: 'cavern',
    map: [
      '%%%%%%%::%%%%%%%',
      '%::::::::::::::%',
      '%:::~~~~~~~~~~:%',
      '%::~~~~~~~~~~~:%',
      '::::~~~~~~:::~:%',
      '::::~~~~~~:::~:%',
      ':::::=====:::~:%',
      '%::~~~~~~~~~~~:%',
      '%:::~~~~~~~~~~:%',
      '%::::::::::::::%',
      '%%%%%%%::%%%%%%%',
    ],
    enemies: ['ghost', 'keese', 'keese'],
    items: [{ type: 'rupee_blue', x: 11, y: 5 }],
  });

  // Key room: clear it to reveal the key that opens the hub's north door.
  W.room('cv_ne', {
    area: 'cavern',
    map: [
      '%%%%%%%%%%%%%%%%',
      '%::::::::::::::%',
      '%:^^::::::::^^:%',
      '%:^::::::::::^:%',
      '%::::::::::::::%',
      '%::::::::::::::%',
      '%::::::::::::::%',
      '%:^::::::::::^:%',
      '%:^^::::::::^^:%',
      '%::::::::::::::%',
      '%%%%%%%::%%%%%%%',
    ],
    enemies: ['stalfos', 'stalfos', 'keese'],
    clearReward: { type: 'key', x: 7, y: 5, flag: 'cv_key' },
  });

  // Mushroom grotto: a dead end with supplies, haunted.
  W.room('cv_nw', {
    area: 'cavern',
    map: [
      '%%%%%%%%%%%%%%%%',
      '%:&::::::::::&:%',
      '%::::~~~~~~::::%',
      '%:::~~~~~~~~:::%',
      '%:::~~~~~~~~:::%',
      '%::::~~~~~~::::%',
      '%::::::::::::::%',
      '%::::::::::::::%',
      '%:&::::::::::&:%',
      '%::::::::::::::%',
      '%%%%%%%::%%%%%%%',
    ],
    enemies: ['ghost', 'ghost'],
    items: [{ type: 'bomb', x: 13, y: 4 }, { type: 'rupee_blue', x: 2, y: 4 }],
  });

  // Shrine: no enemies, a hint, and a heart that comes back every visit.
  W.room('cv_sw', {
    area: 'cavern',
    map: [
      '%%%%%%%::%%%%%%%',
      '%::::::::::::::%',
      '%::::::::::::::%',
      '%:::&::::::&:::%',
      '%:::::::::::::::',
      '%:::::::::::::::',
      '%:::::::::::::::',
      '%:::&::::::&:::%',
      '%::::::::::::::%',
      '%::::::::::::::%',
      '%%%%%%%%%%%%%%%%',
    ],
    npcs: [
      { type: 'oldman', x: 7, y: 3, text: 'THE KEY LIES BEYOND THE BLACK LAKE. BEWARE THE WRAITH.' },
      { type: 'fire', x: 5, y: 3 },
      { type: 'fire', x: 9, y: 3 },
    ],
    items: [{ type: 'heart', x: 7, y: 6 }],
  });

  // Bat cave: a forest of stalagmites.
  W.room('cv_se', {
    area: 'cavern',
    map: [
      '%%%%%%%::%%%%%%%',
      '%::::::::::::::%',
      '%:^:^::::^:^:^:%',
      '%::::::^:::::::%',
      ':::^::::::^::::%',
      '::::::^:::::^::%',
      ':::^::::::^::::%',
      '%::::::^:::::::%',
      '%:^:^::::^:^:^:%',
      '%:::*::::::::*:%',
      '%%%%%%%%%%%%%%%%',
    ],
    enemies: ['keese', 'keese', 'keese'],
    items: [{ type: 'rupee_blue', x: 13, y: 1 }],
  });
})();
