// Hero select screen: state 'select', shown between the title and play.
// Layout follows hero-select.html: logo, a hero on a pedestal between torches with the
// neighbours dimmed either side, a text box with title/stats/description, name plates,
// and a lock-in flash. Left/right picks, Enter or the sword button confirms.
(function () {
  var C = Game.Config;
  var Input = Game.Input;
  var S = Game.Sprites;
  var G = Game.GameState.prototype;
  var GOLD = '#f8b800', GOLD_DK = '#a84000', CREAM = '#fcf4dc', DIM = '#8a82a8', EMBER = '#e45c10',
      MOSS = '#58d854', TEXT = '#d8d0f0', STONE = '#3a3258', STONE_DK = '#211c35', STONE_HI = '#5a4f86';
  var LOCK_TIME = 1.4; // seconds of celebration before play starts

  G.openSelect = function () {
    var i = Game.Heroes.indexOf(this.hero);
    this.sel = { i: i < 0 ? 0 : i, locked: 0, t: 0, typed: 0 };
    this.state = 'select';
  };

  G.updateSelect = function (dt) {
    var s = this.sel, n = Game.Heroes.length;
    s.t += dt;
    if (s.locked) {
      s.locked += dt;
      if (s.locked >= LOCK_TIME) {
        this.hero = Game.Heroes[s.i];
        Game.Heroes.remember(this.hero);
        this.newGame();
        this.state = 'play';
      }
      return;
    }
    s.typed += dt * 30;
    if (Input.pressed('left')) { s.i = (s.i + n - 1) % n; s.typed = 0; Game.Audio.play('cursor'); }
    if (Input.pressed('right')) { s.i = (s.i + 1) % n; s.typed = 0; Game.Audio.play('cursor'); }
    if (Input.pressed('start') || Input.pressed('attack')) { s.locked = 0.0001; Game.Audio.play('select'); }
  };

  function drawHero(ctx, hero, cx, bottom, scale, dim) {
    var img = S.get(hero.sprite + '_down_0');
    if (!img) return;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    if (dim) { ctx.globalAlpha = 0.55; ctx.filter = 'brightness(0.6) saturate(0.6)'; }
    ctx.drawImage(img, Math.round(cx - img.width * scale / 2), Math.round(bottom - img.height * scale), img.width * scale, img.height * scale);
    ctx.restore();
  }

  function glow(ctx, cx, cy, r, a) {
    var g = ctx.createRadialGradient(cx, cy, 2, cx, cy, r);
    g.addColorStop(0, 'rgba(228,92,16,' + a + ')');
    g.addColorStop(1, 'rgba(228,92,16,0)');
    ctx.fillStyle = g;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  }

  // Classic text box: cream border, black gap, stone ring.
  function box(ctx, x, y, w, h) {
    ctx.fillStyle = STONE_HI; ctx.fillRect(x - 5, y - 5, w + 10, h + 10);
    ctx.fillStyle = '#000'; ctx.fillRect(x - 3, y - 3, w + 6, h + 6);
    ctx.fillStyle = CREAM; ctx.fillRect(x - 2, y - 2, w + 4, h + 4);
    ctx.fillStyle = '#000'; ctx.fillRect(x, y, w, h);
  }

  function bigText(ctx, HUD, str, x, y) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(2, 2);
    HUD.text(ctx, str, 1.5, 1.5, { align: 'center', color: '#000', shadow: false });
    HUD.text(ctx, str, 1, 1, { align: 'center', color: GOLD_DK, shadow: false });
    HUD.text(ctx, str, 0, 0, { align: 'center', color: GOLD, shadow: false });
    ctx.restore();
  }

  function speedPips(hero) { return Math.max(1, Math.min(5, Math.round((hero.speed - 50) / 10))); }

  G.renderSelect = function (ctx) {
    var HUD = Game.HUD, s = this.sel, H = Game.Heroes, hero = H[s.i], W = C.WIDTH, n = H.length;
    var blink = Math.floor(s.t * 2) % 2 === 0;
    var tf = Math.floor(s.t * 6) % 2;

    // screen: void with a soft glow behind the stage
    ctx.fillStyle = '#07060d';
    ctx.fillRect(0, 0, W, C.HEIGHT);
    var g = ctx.createRadialGradient(W / 2, 96, 8, W / 2, 96, 120);
    g.addColorStop(0, '#1a1430');
    g.addColorStop(1, 'rgba(26,20,48,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, C.HEIGHT);

    HUD.text(ctx, 'P1', 8, 6, { color: EMBER });
    HUD.text(ctx, 'HERO SELECT', 28, 6, { color: DIM });
    HUD.text(ctx, (s.i + 1) + '/' + n, W - 8, 6, { align: 'right', color: DIM });
    HUD.text(ctx, 'THE LEGEND OF THE', W / 2, 20, { align: 'center', color: CREAM });
    bigText(ctx, HUD, 'HACKATHON', W / 2, 31);

    if (s.locked) HUD.text(ctx, hero.name + ' JOINS THE QUEST!', W / 2, 56, { align: 'center', color: MOSS });
    else HUD.text(ctx, (blink ? '> ' : '  ') + 'CHOOSE YOUR HERO', W / 2, 56, { align: 'center', color: CREAM });

    // stage
    glow(ctx, 32, 82, 40, tf ? 0.22 : 0.15);
    glow(ctx, W - 32, 82, 40, tf ? 0.15 : 0.22);
    S.draw(ctx, 'torch_' + tf, 24, 70);
    S.draw(ctx, 'torch_' + (tf ^ 1), W - 40, 70);
    var px = W / 2 - 32, py = 118;
    ctx.fillStyle = '#000'; ctx.fillRect(px, py, 64, 10);
    ctx.fillStyle = STONE; ctx.fillRect(px, py, 64, 8);
    ctx.fillStyle = STONE_HI; ctx.fillRect(px, py, 64, 2);
    ctx.fillStyle = STONE_DK; ctx.fillRect(px, py + 6, 64, 2);
    ctx.fillStyle = GOLD; ctx.fillRect(px + 4, py + 3, 2, 2); ctx.fillRect(px + 58, py + 3, 2, 2);

    if (!s.locked) {
      drawHero(ctx, H[(s.i + n - 1) % n], W / 2 - 72, py, 2, true);
      drawHero(ctx, H[(s.i + 1) % n], W / 2 + 72, py, 2, true);
      var nudge = Math.floor(s.t * 3) % 2 ? 2 : 0;
      S.draw(ctx, 'ui_arrow', 6 - nudge, 84, { flip: true });
      S.draw(ctx, 'ui_arrow', W - 11 + nudge, 84);
    }
    var bob = s.locked ? -Math.round(Math.abs(Math.sin(s.locked * 7)) * 12) : (Math.floor(s.t * 1.25) % 2 ? -2 : 0);
    drawHero(ctx, hero, W / 2, py + bob, 3, false);
    if (s.locked && s.locked < 0.35) {
      ctx.fillStyle = 'rgba(252,244,220,' + (0.85 * (1 - s.locked / 0.35)).toFixed(2) + ')';
      ctx.fillRect(0, 0, W, C.HEIGHT);
    }

    // text box
    box(ctx, 12, 134, W - 24, 52);
    HUD.text(ctx, hero.name, 20, 139, { color: GOLD });
    HUD.text(ctx, hero.title, W - 20, 139, { align: 'right', color: CREAM });
    HUD.text(ctx, 'LIFE', 20, 152, { color: CREAM });
    for (var h = 0; h < hero.hearts; h++) S.draw(ctx, 'heart', 56 + h * 9, 152);
    HUD.text(ctx, 'SPEED', 132, 152, { color: CREAM });
    for (var p = 0; p < 5; p++) {
      ctx.fillStyle = p < speedPips(hero) ? MOSS : STONE_HI;
      ctx.fillRect(180 + p * 9, 153, 7, 7);
    }
    HUD.text(ctx, hero.move, 20, 165, { color: EMBER });
    HUD.text(ctx, hero.desc.slice(0, Math.floor(s.typed)), 20, 176, { color: TEXT });

    // roster plates
    var pw = 64, gap = 8, x0 = (W - (n * pw + (n - 1) * gap)) / 2;
    H.forEach(function (hh, k) {
      var x = x0 + k * (pw + gap), cur = k === s.i, accent = s.locked ? MOSS : GOLD;
      ctx.fillStyle = cur ? '#1d1733' : STONE_DK;
      ctx.fillRect(x, 196, pw, 16);
      ctx.fillStyle = cur ? accent : STONE_HI;
      ctx.fillRect(x, 196, pw, 1); ctx.fillRect(x, 211, pw, 1); ctx.fillRect(x, 196, 1, 16); ctx.fillRect(x + pw - 1, 196, 1, 16);
      HUD.text(ctx, hh.name, x + pw / 2, 200, { align: 'center', color: cur ? CREAM : DIM });
      if (cur && (blink || s.locked)) {
        ctx.fillStyle = accent;
        ctx.fillRect(x + pw / 2 - 3, 190, 6, 2); ctx.fillRect(x + pw / 2 - 2, 192, 4, 1); ctx.fillRect(x + pw / 2 - 1, 193, 2, 1);
      }
    });
    HUD.text(ctx, s.locked ? 'GET READY...' : '< > MOVE   ENTER SELECT', W / 2, 215, { align: 'center', color: DIM });
  };
})();
