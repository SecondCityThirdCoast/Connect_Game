// Global namespace. Every file attaches to `Game`.
window.Game = window.Game || {};

// Tweak numbers here first -- most "game feel" changes are one-liners in this file.
Game.Config = {
  TITLE: 'LEGEND OF THE HACKATHON',
  SUBTITLE: 'PRESS ENTER',

  TILE: 16,          // pixels per tile
  COLS: 16,          // tiles per room horizontally (NES Zelda = 16)
  ROWS: 11,          // tiles per room vertically   (NES Zelda = 11)
  HUD_HEIGHT: 48,    // pixels above the room
  SCALE: 3,          // CSS upscaling of the 256x224 canvas

  START_ROOM: 'start',     // override with ?room=<id> in the URL
  START_TILE: { x: 7, y: 6 },

  PLAYER: {
    SPEED: 80,             // px / second
    MAX_HEARTS: 3,
    START_WITH_SWORD: false,
    INVULN_TIME: 1.0,
    KNOCKBACK: 180,
    ATTACK_TIME: 0.25,
    SWORD_DAMAGE: 1,
    SWORD_BEAM: true,      // shoot a beam when at full health, like the original
  },

  SCROLL_TIME: 0.6,        // seconds for room-to-room scroll
  FADE_TIME: 0.35,         // seconds for warps (caves / stairs)
  DEBUG: false,            // toggle in-game with the ` key (shows hitboxes)
};

Game.Config.WIDTH = Game.Config.TILE * Game.Config.COLS;
Game.Config.ROOM_HEIGHT = Game.Config.TILE * Game.Config.ROWS;
Game.Config.HEIGHT = Game.Config.ROOM_HEIGHT + Game.Config.HUD_HEIGHT;
