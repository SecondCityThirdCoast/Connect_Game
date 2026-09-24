// Creates the canvas inside #game-root (or <body>) and runs the main loop.
(function () {
  var C = Game.Config;

  function boot() {
    var root = document.getElementById('game-root');
    if (!root) {
      root = document.createElement('div');
      root.id = 'game-root';
      document.body.appendChild(root);
    }
    root.innerHTML = '';
    root.style.position = 'relative';
    root.style.maxWidth = (C.WIDTH * C.SCALE) + 'px';
    root.style.margin = '0 auto';

    var canvas = document.createElement('canvas');
    canvas.width = C.WIDTH;
    canvas.height = C.HEIGHT;
    canvas.tabIndex = 0;
    canvas.setAttribute('aria-label', C.TITLE);
    canvas.style.cssText = 'display:block;width:100%;height:auto;aspect-ratio:' + C.WIDTH + '/' + C.HEIGHT +
      ';image-rendering:pixelated;image-rendering:crisp-edges;background:#000;outline:none;';
    root.appendChild(canvas);

    // "Click to play" overlay when the canvas doesn't have keyboard focus (e.g. embedded in WordPress).
    var overlay = document.createElement('div');
    overlay.textContent = 'CLICK TO PLAY';
    overlay.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;' +
      'background:rgba(0,0,0,.6);color:#fff;font:16px "Press Start 2P",monospace;cursor:pointer;';
    root.appendChild(overlay);
    function focus() { canvas.focus(); Game.Audio.unlock(); }
    overlay.addEventListener('click', focus);
    canvas.addEventListener('focus', function () { overlay.style.display = 'none'; });
    canvas.addEventListener('blur', function () { overlay.style.display = 'flex'; });

    Game.Input.attach(canvas);
    var game = new Game.GameState(canvas);
    Game.current = game;

    if (root.hasAttribute('data-autofocus')) canvas.focus();

    var last = performance.now();
    function frame(now) {
      var dt = Math.min((now - last) / 1000, 1 / 20); // clamp so tab-switching doesn't teleport things
      last = now;
      try {
        if (document.activeElement === canvas) game.update(dt);
        game.render();
      } catch (err) {
        console.error(err);
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = '#800';
        ctx.fillRect(0, 0, C.WIDTH, 24);
        Game.HUD.text(ctx, 'ERROR - SEE CONSOLE', 4, 8);
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
