// Loads every game script in order. Both index.html and the WordPress plugin
// include ONLY this file. To add a new script, add it to FILES below.
// Classic scripts (not ES modules) so index.html works from file:// with no server.
(function () {
  var FILES = [
    'engine/config.js',
    'engine/util.js',
    'engine/input.js',
    'engine/audio.js',
    'engine/cheats.js',
    'engine/sprites.js',
    'data/sprites.js',
    'data/tiles.js',
    'engine/world.js',
    'engine/entity.js',
    'data/items.js',
    'data/enemies.js',
    'data/npcs.js',
    'data/heroes.js',
    'engine/player.js',
    'data/rooms.js',
    'engine/hud.js',
    'engine/game.js',
    'engine/bombs.js',
    'engine/ride.js',
    'engine/select.js',
    'engine/boot.js',
  ];

  var self = document.currentScript;
  var base = self.src.replace(/loader\.js.*$/, '');
  var version = (self.src.split('?')[1] || '');

  FILES.forEach(function (file) {
    var s = document.createElement('script');
    s.src = base + file + (version ? '?' + version : '');
    s.async = false; // preserve execution order
    document.head.appendChild(s);
  });
})();
