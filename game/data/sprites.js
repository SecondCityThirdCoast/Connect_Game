// ALL sprite art lives here. Letters map to colors in Game.Sprites.PALETTE (engine/sprites.js).
// Convention: entity sprites are named '<kind>_<dir>' or '<kind>_<dir>_<frame>'.
// A left-facing sprite is usually the right-facing one drawn flipped (automatic).
(function () {
  var D = Game.Sprites.define;

  // ---------------------------------------------------------------- PLAYER (16x16)
  D('player_down_0', [
    '.....gggggg.....',
    '....gGGGGGGg....',
    '...gGGGGGGGGg...',
    '...BSSSSSSSSB...',
    '...SSKSSSSKSS...',
    '...SSKSSSSKSS...',
    '....SSSbbSSS....',
    '.....SSSSSS.....',
    '...gGGGGGGGGg...',
    '..SgGGGyyGGGgS..',
    '..SSGGGGGGGGSS..',
    '...bGGGGGGGGb...',
    '....GGGGGGGG....',
    '....GGG..GGG....',
    '...bbbb..bbb....',
    '...bbbb.........',
  ]);
  D('player_down_1', [
    '.....gggggg.....',
    '....gGGGGGGg....',
    '...gGGGGGGGGg...',
    '...BSSSSSSSSB...',
    '...SSKSSSSKSS...',
    '...SSKSSSSKSS...',
    '....SSSbbSSS....',
    '.....SSSSSS.....',
    '...gGGGGGGGGg...',
    '..SgGGGyyGGGgS..',
    '..SSGGGGGGGGSS..',
    '...bGGGGGGGGb...',
    '....GGGGGGGG....',
    '....GGG..GGG....',
    '....bbb..bbbb...',
    '.........bbbb...',
  ]);
  D('player_up_0', [
    '.....gggggg.....',
    '....gGGGGGGg....',
    '...gGGGGGGGGg...',
    '...gGGGGGGGGg...',
    '...BGGGGGGGGB...',
    '...BBGGGGGGBB...',
    '....BBBBBBBB....',
    '.....BBBBBB.....',
    '...gGGGGGGGGg...',
    '..SgGGGGGGGGgS..',
    '..SSGGGGGGGGSS..',
    '...bGGGGGGGGb...',
    '....GGGGGGGG....',
    '....GGG..GGG....',
    '...bbbb..bbb....',
    '...bbbb.........',
  ]);
  D('player_up_1', [
    '.....gggggg.....',
    '....gGGGGGGg....',
    '...gGGGGGGGGg...',
    '...gGGGGGGGGg...',
    '...BGGGGGGGGB...',
    '...BBGGGGGGBB...',
    '....BBBBBBBB....',
    '.....BBBBBB.....',
    '...gGGGGGGGGg...',
    '..SgGGGGGGGGgS..',
    '..SSGGGGGGGGSS..',
    '...bGGGGGGGGb...',
    '....GGGGGGGG....',
    '....GGG..GGG....',
    '....bbb..bbbb...',
    '.........bbbb...',
  ]);
  D('player_right_0', [
    '....gggggg......',
    '...gGGGGGGgg....',
    '..gGGGGGGGGGgg..',
    '..BBBSSSSSG..gg.',
    '..BBSSKSSSG.....',
    '..BSSSKSSSS.....',
    '...SSSSSSbS.....',
    '....SSSSSS......',
    '...gGGGGGGg.....',
    '..gGGGGGGGSS....',
    '..gGGyyGGGSS....',
    '..bGGGGGGGb.....',
    '...GGGGGGG......',
    '...GGG.GGG......',
    '..bbbb.bbbb.....',
    '..bbb...........',
  ]);
  D('player_right_1', [
    '....gggggg......',
    '...gGGGGGGgg....',
    '..gGGGGGGGGGgg..',
    '..BBBSSSSSG..gg.',
    '..BBSSKSSSG.....',
    '..BSSSKSSSS.....',
    '...SSSSSSbS.....',
    '....SSSSSS......',
    '...gGGGGGGg.....',
    '..gGGGGGGGSS....',
    '..gGGyyGGGSS....',
    '..bGGGGGGGb.....',
    '...GGGGGGG......',
    '...GGGGGGG......',
    '...bbbbbbb......',
    '......bbbb......',
  ]);

  // Sword held while attacking. Vertical 6x16 / horizontal 16x6.
  D('sword_up', [
    '..WW..',
    '..WW..',
    '..WW..',
    '..WW..',
    '..WW..',
    '..WW..',
    '..WW..',
    '..WW..',
    '..WW..',
    '..WW..',
    'yyyyyy',
    '..BB..',
    '..BB..',
    '..BB..',
    '..BB..',
  ]);
  D('sword_down', [
    '..BB..',
    '..BB..',
    '..BB..',
    '..BB..',
    'yyyyyy',
    '..WW..',
    '..WW..',
    '..WW..',
    '..WW..',
    '..WW..',
    '..WW..',
    '..WW..',
    '..WW..',
    '..WW..',
    '..WW..',
  ]);
  D('sword_right', [
    '....y...........',
    '....y...........',
    'BBBBYWWWWWWWWWW.',
    'BBBBYWWWWWWWWWWW',
    '....y...........',
    '....y...........',
  ]);
  D('beam_up', ['.CC.', 'CWWC', 'CWWC', 'CWWC', 'CWWC', 'CWWC', 'CWWC', 'CWWC', 'CWWC', 'CWWC', '.CC.']);
  D('beam_right', ['.CCCCCCCCC.', 'CWWWWWWWWWC', 'CWWWWWWWWWC', '.CCCCCCCCC.']);

  // ---------------------------------------------------------------- ENEMIES
  D('octorok_down_0', [
    '....RRRRRRRR....',
    '...RRRRRRRRRR...',
    '..RRWWRRRRWWRR..',
    '..RRWKRRRRKWRR..',
    '..RRRRRRRRRRRR..',
    '..RRRRROORRRRR..',
    '..RRRRROORRRRR..',
    '...RRRRRRRRRR...',
    '....RRRRRRRR....',
    '...RR.RR.RR.R...',
    '..RR..RR..RR.R..',
    '..R...R...R..R..',
    '................',
  ]);
  D('octorok_down_1', [
    '....RRRRRRRR....',
    '...RRRRRRRRRR...',
    '..RRWWRRRRWWRR..',
    '..RRWKRRRRKWRR..',
    '..RRRRRRRRRRRR..',
    '..RRRRROORRRRR..',
    '..RRRRROORRRRR..',
    '...RRRRRRRRRR...',
    '....RRRRRRRR....',
    '....RR.RR.RR....',
    '...R.RR..RR.R...',
    '...R..R..R..R...',
    '................',
  ]);
  D('octorok_up_0', [
    '................',
    '..R...R...R..R..',
    '..RR..RR..RR.R..',
    '...RR.RR.RR.R...',
    '....RRRRRRRR....',
    '...RRRRRRRRRR...',
    '..RRRRROORRRRR..',
    '..RRRRROORRRRR..',
    '..RRRRRRRRRRRR..',
    '..RRRRRRRRRRRR..',
    '..RRRRRRRRRRRR..',
    '...RRRRRRRRRR...',
    '....RRRRRRRR....',
  ]);
  D('octorok_right_0', [
    '....RRRRRRR.....',
    '...RRRRRRRRR....',
    '..RRRRRRWWRRR...',
    '.RRRRRRRWKRRROO.',
    '.RRRRRRRRRRRROO.',
    '.RRRRRRRRRRRR...',
    '..RRRRRRRRRR....',
    '...RRRRRRRR.....',
    '..RR.RR.RR......',
    '.RR..RR..RR.....',
    '.R...R....R.....',
  ]);

  D('moblin_down_0', [
    '.....BBBBBB.....',
    '....BBBBBBBB....',
    '...BBWKBBKWBB...',
    '...BBBBBBBBBB...',
    '...BBOOOOOOBB...',
    '....BOKOOKOB....',
    '.....BOOOOB.....',
    '..bbbBBBBBBbbb..',
    '.bbBBBBBBBBBBbb.',
    '.bbBBBBrrBBBBbb.',
    '..bBBBBBBBBBBb..',
    '...BBBBBBBBBB...',
    '....BBB..BBB....',
    '...bbbb..bbbb...',
  ]);
  D('moblin_up_0', [
    '.....BBBBBB.....',
    '....BBBBBBBB....',
    '...BBBBBBBBBB...',
    '...BBBBBBBBBB...',
    '...BBBBBBBBBB...',
    '....BBBBBBBB....',
    '.....BBBBBB.....',
    '..bbbBBBBBBbbb..',
    '.bbBBBBBBBBBBbb.',
    '.bbBBBBBBBBBBbb.',
    '..bBBBBBBBBBBb..',
    '...BBBBBBBBBB...',
    '....BBB..BBB....',
    '...bbbb..bbbb...',
  ]);
  D('moblin_right_0', [
    '....BBBBBB......',
    '...BBBBBBBB.....',
    '..BBBBBBWKBB....',
    '..BBBBBBBBBBOO..',
    '..BBBBBBBOOOKO..',
    '...BBBBBBOOOO...',
    '....BBBBBBB.....',
    '..bbBBBBBBBb....',
    '.bbBBBBBBBBbb...',
    '.bbBBBBBBBBbb...',
    '..BBBBBBBBBB....',
    '...BBBBBBBB.....',
    '...BBB..BBB.....',
    '..bbbb..bbbb....',
  ]);

  D('keese_0', [
    'u..............u',
    'uu............uu',
    'uuu...uuuu...uuu',
    '.uuu.uWuuWu.uuu.',
    '..uuuuuuuuuuuu..',
    '...uu.uuuu.uu...',
    '.......uu.......',
  ]);
  D('keese_1', [
    '................',
    '......uuuu......',
    '....uuWuuWuu....',
    '..uuuuuuuuuuuu..',
    '.uuu..uuuu..uuu.',
    'uu.....uu.....uu',
    'u..............u',
  ]);

  D('slime_0', [
    '................',
    '................',
    '.....gggggg.....',
    '....gGGGGGGg....',
    '...gGWGGGGWGg...',
    '...gGKGGGGKGg...',
    '..gGGGGGGGGGGg..',
    '..gGGGGGGGGGGg..',
    '.gGGGGGGGGGGGGg.',
    '.gggggggggggggg.',
  ]);
  D('slime_1', [
    '................',
    '................',
    '................',
    '................',
    '....gggggggg....',
    '..ggGWGGGGWGgg..',
    '.gGGGKGGGGKGGGg.',
    '.gGGGGGGGGGGGGg.',
    'gGGGGGGGGGGGGGGg',
    'gggggggggggggggg',
  ]);

  D('zombie_down_0', [
    '.....gggggg.....',
    '....ggGGGGgg....',
    '...gGGGGGGGGg...',
    '...gGWKGGKWGg...',
    '...gGGGGGGGGg...',
    '...gGGKKKKGGg...',
    '....gGWKWKGg....',
    '.....gGCCGg.....',
    '...bbbbCbbbbb...',
    '..gbbbbCbbbbbg..',
    '..gbbbbbbbbbbg..',
    '..gGbBbbbbBbGg..',
    '..GG.bbbbbb.GG..',
    '.....bb..bb.....',
    '.....bb..bb.....',
    '....KKK..KKK....',
  ]);
  D('zombie_down_1', [
    '.....gggggg.....',
    '....ggGGGGgg....',
    '...gGGGGGGGGg...',
    '...gGWKGGKWGg...',
    '...gGGGGGGGGg...',
    '...gGGKKKKGGg...',
    '....gGWKWKGg....',
    '.....gGCCGg.....',
    '...bbbbCCbbbb...',
    '..gbbbbbCbbbbg..',
    '..gbbbbbCbbbbg..',
    '..gGbBbbbCbBGg..',
    '..GG.bbbbbb.GG..',
    '....bbb..bbb....',
    '....bb....bb....',
    '...KKK....KKK...',
  ]);
  D('zombie_up_0', [
    '.....gggggg.....',
    '....ggGGGGgg....',
    '...gGGGGGGGGg...',
    '...gGGGGGGGGg...',
    '...gGGgGGgGGg...',
    '...gGGGGGGGGg...',
    '....gGGGGGGg....',
    '.....gggggg.....',
    '...bbbbbbbbbb...',
    '..gbbbbbbbbbbg..',
    '..gbbBbbbbBbbg..',
    '..gbbbbbbbbbbg..',
    '..gg.bbbbbb.gg..',
    '.....bb..bb.....',
    '.....bb..bb.....',
    '....KKK..KKK....',
  ]);
  D('zombie_right_0', [
    '....gggggg......',
    '...ggGGGGgg.....',
    '..gGGGGGGGGg....',
    '..gGGGGGWKGg....',
    '..gGGGGGGGGg....',
    '..gGGGGGKKKg....',
    '...gGGGGGWKg....',
    '....ggggggCC....',
    '....bbbbbbbC....',
    '...bbbbbbbGGGGG.',
    '...bbbbbbbgggggg',
    '...bbbBbbbb.....',
    '....bbbbbb......',
    '....bb.bb.......',
    '....bb.bb.......',
    '...KKK.KKK......',
  ]);
  D('zombie_right_1', [
    '....gggggg......',
    '...ggGGGGgg.....',
    '..gGGGGGGGGg....',
    '..gGGGGGWKGg....',
    '..gGGGGGGGGg....',
    '..gGGGGGKKKg....',
    '...gGGGGGWKg....',
    '....ggggggCC....',
    '....bbbbbbbCC...',
    '...bbbbbbbGGGGG.',
    '...bbbbbbbgggggg',
    '...bbbBbbbbC....',
    '....bbbbbb......',
    '...bbb..bbb.....',
    '...bb....bb.....',
    '..KKK....KKK....',
  ]);

  D('rock_shot', ['..aa..', '.aAAa.', 'aAAWAa', 'aAAAAa', '.aAAa.', '..aa..']);
  D('arrow_up', ['.A.', 'AAA', '.B.', '.B.', '.B.', '.B.', '.B.', 'W.W']);
  D('arrow_right', ['..W.....A.', '..BBBBBBAA', '..W.....A.']);

  // Death puff
  D('poof_0', ['..W..W..', '.W.WW.W.', 'W.W..W.W', '.W....W.', '.W....W.', 'W.W..W.W', '.W.WW.W.', '..W..W..'], { scale: 2 });
  D('poof_1', ['W......W', '.W....W.', '........', '...WW...', '...WW...', '........', '.W....W.', 'W......W'], { scale: 2 });

  // ---------------------------------------------------------------- NPCS
  D('oldman', [
    '.....RRRRRR.....',
    '....RRRRRRRR....',
    '...RRSSSSSSRR...',
    '...RSKSSSSKSR...',
    '...RSSSSSSSSR...',
    '...RWWWWWWWWR...',
    '...RRWWWWWWRR...',
    '..RRRRWWWWRRRR..',
    '.RRRRRRWWRRRRRR.',
    '.RRSRRRRRRRRSRR.',
    '.RSSRRRRRRRRSSR.',
    '..RRRRRRRRRRRR..',
    '..RRRRRRRRRRRR..',
    '..RRRRRRRRRRRR..',
    '.RRRRRRRRRRRRRR.',
    '.rrrrrrrrrrrrrr.',
  ]);
  D('fire_0', [
    '.......R........',
    '......RR........',
    '.....RRO....R...',
    '....RROO...RR...',
    '...RROOOR.RRO...',
    '...ROOyOORROO...',
    '..RROyyyOOOOR...',
    '..ROOyWWyyOOR...',
    '..ROyyWWWyyORR..',
    '.RROyWWWWWyOOR..',
    '.ROOyWWWWWyyOR..',
    '.ROOyyWWWWyOOR..',
    '..ROOyyyyyyOR...',
    '...RROOOOOORR...',
    '....RRRRRRRR....',
  ]);
  D('fire_1', [
    '........R.......',
    '........RR......',
    '...R....ORR.....',
    '...RR...OORR....',
    '...ORR.ROOORR...',
    '...OORROOyOOR...',
    '...ROOOOyyyORR..',
    '...ROOyyWWyOOR..',
    '..RROyyWWWyyOR..',
    '..ROOyWWWWWyORR.',
    '..ROyyWWWWWyOOR.',
    '..ROOyWWWWyyOOR.',
    '...ROyyyyyyOOR..',
    '...RROOOOOORR...',
    '....RRRRRRRR....',
  ]);

  // ---------------------------------------------------------------- ITEMS
  D('heart', ['.RR.RR.', 'RRRRRRR', 'RWRRRRR', 'RRRRRRR', '.RRRRR.', '..RRR..', '...R...']);
  D('heart_empty', ['.rr.rr.', 'r..r..r', 'r.....r', 'r.....r', '.r...r.', '..r.r..', '...r...']);
  D('heart_half', ['.RR.rr.', 'RRRR..r', 'RWRR..r', 'RRRR..r', '.RRR.r.', '..RRr..', '...R...']);
  D('heart_container', [
    '.RRR..RRR.', 'RRRRRRRRRR', 'RWWRRRRRRR', 'RWRRRRRRRR', 'RRRRRRRRRR',
    '.RRRRRRRR.', '..RRRRRR..', '...RRRR...', '....RR....',
  ]);
  D('rupee', ['...y...', '..yWy..', '.yWyyy.', 'yWyyyyy', 'yWyyyyy', 'yWyyyyy', 'yyyyyyy', '.yyyyy.', '..yyy..', '...y...']);
  D('rupee_blue', ['...U...', '..UCU..', '.UCUUU.', 'UCUUUUU', 'UCUUUUU', 'UCUUUUU', 'UUUUUUU', '.UUUUU.', '..UUU..', '...U...']);
  D('key', ['.yyy.', 'yy.yy', 'y...y', 'yy.yy', '.yyy.', '..y..', '..y..', '..yy.', '..y..', '..yyy', '..y..']);
  D('sword_item', ['..W..', '..W..', '..W..', '..W..', '..W..', '..W..', '..W..', 'yyyyy', '..B..', '..B..', '..B..']);
  D('bomb', ['.....yW', '....y..', '..UUUU.', '.UCUUUU', 'UCUUUUUU', 'UUUUUUUU', 'UUUUUUUU', '.UUUUUU.', '..UUUU..']);
  D('triforce', [
    '.......y.......', '......yyy......', '.....yyyyy.....', '....yyyyyyy....',
    '...y.......y...', '..yyy.....yyy..', '.yyyyy...yyyyy.', 'yyyyyyy.yyyyyyy',
  ]);

  // ---------------------------------------------------------------- TILES (8x8 art drawn at 2x = 16x16)
  var T = function (name, rows) { D(name, rows, { scale: 2 }); };
  T('tile_grass', [
    'YYYYYYYY', 'YYYYYYYY', 'YYYYYYYY', 'YYYYYYYY', 'YYYYYYYY', 'YYYYYYYY', 'YYYYYYYY', 'YYYYYYYY',
  ]);
  T('tile_flowers', [
    'YYYYYYYY', 'YYRYYYYY', 'YRyRYYYY', 'YYRYYYRY', 'YYYYYRyR', 'YYYYYYRY', 'YYYYYYYY', 'YYYYYYYY',
  ]);
  T('tile_tree', [
    '.gggggg.', 'gGgGGgGg', 'gGGgGGGg', 'gGgGGgGg', 'ggGggGgg', '.ggggggY', 'YYbBBbYY', 'YYbBBbYY',
  ]);
  T('tile_rock', [
    'BBBBBBBB', 'BOOBBOOB', 'BOBBBBOB', 'BBBOOBBB', 'BBOOBOBB', 'BOOBBBOB', 'BBBBOBBB', 'bbbbbbbb',
  ]);
  T('tile_bush', [
    'YYggggYY', 'YgGGgGgY', 'gGgGGgGg', 'gGGgGGGg', 'gGgGGgGg', 'YggGgggY', 'YYggggYY', 'YYYYYYYY',
  ]);
  T('tile_water', [
    'UUUUUUUU', 'UUCUUUUU', 'UCUCUUUU', 'UUUUUUUU', 'UUUUUCUU', 'UUUUCUCU', 'UUUUUUUU', 'UUUUUUUU',
  ]);
  T('tile_sand', [
    'OOOOOOOO', 'OOOOOYOO', 'OOOOOOOO', 'OYOOOOOO', 'OOOOOOOO', 'OOOOOOYO', 'OOOOOOOO', 'OOYOOOOO',
  ]);
  T('tile_cave', [
    'KKKKKKKK', 'KKKKKKKK', 'KKKKKKKK', 'KKKKKKKK', 'KKKKKKKK', 'KKKKKKKK', 'KKKKKKKK', 'KKKKKKKK',
  ]);
  T('tile_bridge', [
    'bBBBBBBb', 'bBBBBBBb', 'bbbbbbbb', 'bBBBBBBb', 'bBBBBBBb', 'bbbbbbbb', 'bBBBBBBb', 'bBBBBBBb',
  ]);
  T('tile_floor', [
    'uuuuuuuu', 'uUUUUUUu', 'uUuuuuUu', 'uUuUUuUu', 'uUuUUuUu', 'uUuuuuUu', 'uUUUUUUu', 'uuuuuuuu',
  ]);
  T('tile_wall', [
    'CCCCCCCu', 'CUUUUUUu', 'CUUUUUUu', 'uuuuuuuu', 'CCCuCCCC', 'UUUuCUUU', 'UUUuCUUU', 'uuuuuuuu',
  ]);
  T('tile_block', [
    'CCCCCCCu', 'CCUUUUuu', 'CUCUUuUu', 'CUUCuUUu', 'CUUuCUUu', 'CUuUUCUu', 'CuuuuuCu', 'uuuuuuuu',
  ]);
  T('tile_locked', [
    'bbbbbbbb', 'bBBBBBBb', 'bBByyBBb', 'bByKKyBb', 'bBByyBBb', 'bBBKKBBb', 'bBBBBBBb', 'bbbbbbbb',
  ]);
  T('tile_stairs', [
    'KKKKKKKK', 'AAAAAAAK', 'KKKKKKKK', 'AAAAAAKK', 'KKKKKKKK', 'AAAAAKKK', 'KKKKKKKK', 'AAAAKKKK',
  ]);
  T('tile_statue', [
    '.AAAAA..', 'AWAAWAA.', 'AKAAKAa.', 'AAAAAAa.', '.AaaAa..', 'AAAAAAa.', 'AaAAaAa.', 'aaaaaaa.',
  ]);
  T('tile_dark', [
    'KKKKKKKK', 'KKKKKKKK', 'KKKKKKKK', 'KKKKKKKK', 'KKKKKKKK', 'KKKKKKKK', 'KKKKKKKK', 'KKKKKKKK',
  ]);

  // ---------------------------------------------------------------- LEVEL-2 ENEMIES
  D('ghost_0', [
    '.....AAAAAA.....',
    '....AWWWWWWA....',
    '...AWWWWWWWWA...',
    '...AWWWWWWWWA...',
    '...AWKKWWKKWA...',
    '...AWKKWWKKWA...',
    '...AWWWWWWWWA...',
    '...AWWWKKWWWA...',
    '...AWWWWWWWWA...',
    '...AWWWWWWWWA...',
    '...AWWWWWWWWA...',
    '...AWWWWWWWWA...',
    '...AWAWWAWWAA...',
    '...AA.AWWA.AA...',
    '......AAAA......',
    '................',
  ]);
  D('ghost_1', [
    '....AAAAAAAA....',
    '...AWWWWWWWWA...',
    '...AWWWWWWWWA...',
    '...AWKKWWKKWA...',
    '...AWKKWWKKWA...',
    '...AWWWWWWWWA...',
    '...AWWWKKWWWA...',
    '...AWWWWWWWWA...',
    '...AWWWWWWWWA...',
    '...AWWWWWWWWA...',
    '...AWWWWWWWWA...',
    '...AAWWAWWAWA...',
    '...A.AWA.AAA....',
    '......AAA.......',
    '................',
    '................',
  ]);
  D('stalfos_0', [
    '.....WWWWWW.....',
    '....WWWWWWWW....',
    '....WKKWWKKW....',
    '....WWWWWWWW....',
    '....WWKWWKWW....',
    '.....WKWKWW.....',
    '......AWWA......',
    '....WWWWWWWW....',
    '...WAWKWWKWAW...',
    '...W.WKWWKW.W...',
    '...W.WWWWWW.W...',
    '...AA.WWWW.AA...',
    '......WWWW......',
    '.....WW..WW.....',
    '.....WW..WW.....',
    '....AWW..WWA....',
  ]);
  D('stalfos_1', [
    '.....WWWWWW.....',
    '....WWWWWWWW....',
    '....WKKWWKKW....',
    '....WWWWWWWW....',
    '....WWKWWKWW....',
    '.....WKWKWW.....',
    '......AWWA......',
    '....WWWWWWWW....',
    '...WAWKWWKWAW...',
    '...W.WKWWKW.W...',
    '...W.WWWWWW.W...',
    '...AA.WWWW.AA...',
    '......WWWW......',
    '....WW....WW....',
    '...WW......WW...',
    '..AWW......WWA..',
  ]);
  D('wraith_0', [
    '.....KKKKKK.....',
    '....KRRRRRRK....',
    '...KRRRRRRRRK...',
    '...KRrrrrrrRK...',
    '...KrCCrrCCrK...',
    '...KrCCrrCCrK...',
    '...KRrrrrrrRK...',
    '..KKRRRRRRRRKK..',
    '.KRRRRRRRRRRRRK.',
    '.KRRARRRRRRARRK.',
    '.KRRRRRRRRRRRRK.',
    '..KRRRRRRRRRRK..',
    '..KRKRRKRRKRRK..',
    '...K.KRK.KR.K...',
    '.....K.K..K.....',
    '................',
  ]);
  D('wraith_1', [
    '....KKKKKKKK....',
    '...KRRRRRRRRK...',
    '...KRRRRRRRRK...',
    '...KRrrrrrrRK...',
    '...KrCCrrCCrK...',
    '...KrCCrrCCrK...',
    '..KKRRRRRRRRKK..',
    '.KRRRRRRRRRRRRK.',
    '.KRRARRRRRRARRK.',
    '.KRRRRRRRRRRRRK.',
    '..KRRRRRRRRRRK..',
    '..KRRKRRKRRRRK..',
    '...KRK.KRK.KK...',
    '....K...K..K....',
    '................',
    '................',
  ]);

  // ---------------------------------------------------------------- LEVEL-2 ITEMS
  D('sword_white', ['..C..', '..W..', '..C..', '..W..', '..C..', '..W..', '..C..', 'yyyyy', '..A..', '..A..', '..A..']);

  // ---------------------------------------------------------------- LEVEL-2 TILES (8x8 at 2x)
  T('tile_cavefloor', [
    'aaaaaaaa', 'aaaaaaKa', 'aKaaaaaa', 'aaaaaaaa', 'aaaaKaaa', 'aaaaaaaa', 'aaKaaaaa', 'aaaaaaaa',
  ]);
  T('tile_cavewall', [
    'AAAKAAAA', 'AAAKAAAK', 'KKKAAAKA', 'AAAAKKAA', 'AAKAAAAA', 'AKAAAKAA', 'KAAAAAKK', 'aaaaaaaa',
  ]);
  T('tile_stalagmite', [
    'aaaaaaaa', 'aaaAaaaa', 'aaaAaaaa', 'aaAWAaaa', 'aaAAAaaa', 'aAAAAAaa', 'aAAAAAKa', 'aaaKKKaa',
  ]);
  T('tile_pool', [
    'uuuuuuuu', 'uuUuuuuu', 'uuuuuuUu', 'uuuuuuuu', 'uUuuuuuu', 'uuuuUuuu', 'uuuuuuuu', 'uuUuuuuu',
  ]);
  T('tile_bones', [
    'aaaaaaaa', 'aWWWWWaa', 'aWKWKWaa', 'aWWWWWaa', 'aaWaWaaa', 'aaaaaWWa', 'aaaaWWaa', 'aaaaaaaa',
  ]);
  T('tile_shrooms', [
    'aaaaaaaa', 'aaCCaaaa', 'aCCCCaaa', 'aaWWaaCa', 'aaWWaCCC', 'aaaaaaWa', 'aMMaaaWa', 'aWWaaaaa',
  ]);
})();
