// Top status bar + text helpers.
Game.HUD = (function () {
  var C = Game.Config;
  var FONT = '8px "Press Start 2P", monospace';

  function text(ctx, str, x, y, opts) {
    opts = opts || {};
    ctx.font = FONT;
    ctx.textBaseline = 'top';
    ctx.textAlign = opts.align || 'left';
    if (opts.shadow !== false) {
      ctx.fillStyle = '#000';
      ctx.fillText(str, x + 1, y + 1);
    }
    ctx.fillStyle = opts.color || '#fcfcfc';
    ctx.fillText(str, x, y);
  }

  // Splits text into lines of at most `max` characters.
  function wrap(str, max) {
    var words = str.split(' '), lines = [], line = '';
    words.forEach(function (w) {
      if ((line + ' ' + w).trim().length > max) { lines.push(line); line = w; }
      else line = (line + ' ' + w).trim();
    });
    if (line) lines.push(line);
    return lines;
  }

  function drawMinimap(ctx, game, x, y, w, h) {
    ctx.fillStyle = '#595959';
    ctx.fillRect(x, y, w, h);
    var pos = Game.World.position(game.room.id);
    if (!pos) return;
    var layout = pos.area.layout;
    var rows = layout.length, cols = layout[0].length;
    var cw = Math.floor(w / cols), ch = Math.floor(h / rows);
    for (var j = 0; j < rows; j++) {
      for (var i = 0; i < cols; i++) {
        var id = layout[j][i];
        if (!id) continue;
        if (game.flags['visited:' + id]) {
          ctx.fillStyle = '#a0a0a0';
          ctx.fillRect(x + i * cw + 1, y + j * ch + 1, cw - 2, ch - 2);
        }
      }
    }
    ctx.fillStyle = '#80d010';
    ctx.fillRect(x + pos.x * cw + cw / 2 - 2, y + pos.y * ch + ch / 2 - 2, 4, 4);
  }

  function drawHearts(ctx, game, x, y) {
    var p = game.player;
    var hearts = Math.ceil(p.maxHp / 2);
    for (var i = 0; i < hearts; i++) {
      var hx = x + (i % 8) * 8, hy = y + Math.floor(i / 8) * 8;
      var v = p.hp - i * 2;
      var s = v >= 2 ? 'heart' : v === 1 ? 'heart_half' : 'heart_empty';
      Game.Sprites.draw(ctx, s, hx, hy);
    }
  }

  function draw(ctx, game) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, C.WIDTH, C.HUD_HEIGHT);
    var pos = Game.World.position(game.room.id);
    text(ctx, pos ? pos.area.name || '' : '', 16, 4, { color: '#a0a0a0' });
    drawMinimap(ctx, game, 16, 14, 64, 28);

    var inv = game.inventory;
    Game.Sprites.draw(ctx, 'rupee', 88, 12);
    text(ctx, 'X' + inv.rupees, 98, 13);
    Game.Sprites.draw(ctx, 'key', 89, 23);
    text(ctx, 'X' + inv.keys, 98, 25);
    Game.Sprites.draw(ctx, 'bomb', 88, 34);
    text(ctx, 'X' + inv.bombs, 98, 36);

    // B / A item boxes
    ctx.strokeStyle = '#2038ec';
    ctx.strokeRect(136.5, 14.5, 15, 25);
    ctx.strokeRect(160.5, 14.5, 15, 25);
    text(ctx, 'B', 141, 6);
    text(ctx, 'A', 165, 6);
    if (game.player.hasSword) Game.Sprites.draw(ctx, game.player.swordDamage > 1 ? 'sword_white' : 'sword_item', 166, 21);
    if (inv.bombs > 0) Game.Sprites.draw(ctx, 'bomb', 140, 22);

    text(ctx, '-LIFE-', 184, 8, { color: '#d82800' });
    drawHearts(ctx, game, 184, 24);
    Game.Sprites.draw(ctx, 'doll', 184, 37);
    text(ctx, 'X' + inv.lives, 194, 39);
  }

  // Dialogue box drawn over the top of the room.
  function drawMessage(ctx, game) {
    var m = game.message;
    if (!m) return;
    var shown = m.text.slice(0, Math.floor(m.chars));
    var lines = wrap(shown, 28);
    lines.forEach(function (l, i) {
      text(ctx, l, C.WIDTH / 2, C.HUD_HEIGHT + 12 + i * 10, { align: 'center' });
    });
  }

  return { draw: draw, drawMessage: drawMessage, text: text, wrap: wrap, FONT: FONT };
})();
