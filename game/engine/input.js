// Keyboard + gamepad input mapped to abstract actions.
// Use Game.Input.down('left') for held, Game.Input.pressed('attack') for this-frame taps.
Game.Input = (function () {
  var BINDINGS = {
    up: ['ArrowUp', 'KeyW'],
    down: ['ArrowDown', 'KeyS'],
    left: ['ArrowLeft', 'KeyA'],
    right: ['ArrowRight', 'KeyD'],
    attack: ['Space', 'KeyJ', 'KeyZ'],
    item: ['KeyK', 'KeyX'],          // B button -- free for a secondary item
    start: ['Enter', 'KeyP'],
    debug: ['Backquote'],
  };
  // Standard gamepad mapping
  var PAD = { attack: [0], item: [2, 1], start: [9], up: [12], down: [13], left: [14], right: [15] };

  var keys = {};
  var tapped = {}; // keys pressed since last update -- so very quick taps are never missed
  var held = {};
  var prev = {};

  function actionFor(code) {
    for (var a in BINDINGS) if (BINDINGS[a].indexOf(code) !== -1) return a;
    return null;
  }

  function attach(el) {
    el.addEventListener('keydown', function (e) {
      if (actionFor(e.code)) e.preventDefault(); // stop page scrolling
      keys[e.code] = true;
      if (!e.repeat) tapped[e.code] = true;
    });
    el.addEventListener('keyup', function (e) { keys[e.code] = false; });
    el.addEventListener('blur', function () { keys = {}; });
  }

  function update() {
    prev = held;
    held = {};
    for (var a in BINDINGS) {
      held[a] = BINDINGS[a].some(function (c) { return keys[c] || tapped[c]; });
    }
    tapped = {};
    var pads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (var i = 0; i < pads.length; i++) {
      var p = pads[i];
      if (!p) continue;
      for (var act in PAD) {
        PAD[act].forEach(function (b) { if (p.buttons[b] && p.buttons[b].pressed) held[act] = true; });
      }
      if (p.axes[0] < -0.5) held.left = true;
      if (p.axes[0] > 0.5) held.right = true;
      if (p.axes[1] < -0.5) held.up = true;
      if (p.axes[1] > 0.5) held.down = true;
    }
  }

  return {
    BINDINGS: BINDINGS,
    attach: attach,
    update: update,
    down: function (a) { return !!held[a]; },
    pressed: function (a) { return !!held[a] && !prev[a]; },
    // Most recently relevant movement direction (4-way, like the NES).
    moveDir: function () {
      if (held.up) return 'up';
      if (held.down) return 'down';
      if (held.left) return 'left';
      if (held.right) return 'right';
      return null;
    },
  };
})();
