// Cheat codes: sequences of input actions entered during play (or on the pause screen).
// Add one: push {name, seq: [...actions], run(game)} into CODES. Actions are Game.Input action
// names, so a code works on keyboard and gamepad alike ('item' is the B button, 'attack' is A).
Game.Cheats = (function () {
  var Input = Game.Input;

  var CODES = [
    {
      name: 'konami',
      seq: ['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right', 'item', 'attack'],
      run: function (game) {
        var p = game.player;
        p.hp = p.maxHp;
        Game.Audio.play('secret');
        game.say('SECRET CODE! LIFE RESTORED.');
      },
    },
  ];

  var WATCH = ['up', 'down', 'left', 'right', 'attack', 'item'];
  var buffer = [];
  var longest = 0;
  CODES.forEach(function (c) { longest = Math.max(longest, c.seq.length); });

  // Call once per frame after Input.update(). Fires a code's run() when its sequence
  // is the most recent thing the player pressed.
  function update(game) {
    var typed = false;
    WATCH.forEach(function (a) { if (Input.pressed(a)) { buffer.push(a); typed = true; } });
    if (!typed) return;
    if (buffer.length > longest) buffer.splice(0, buffer.length - longest);
    CODES.forEach(function (c) {
      var n = c.seq.length;
      if (buffer.length < n) return;
      for (var i = 0; i < n; i++) if (buffer[buffer.length - n + i] !== c.seq[i]) return;
      buffer.length = 0;
      c.run(game);
    });
  }

  return { CODES: CODES, update: update, reset: function () { buffer.length = 0; } };
})();
