// Pixel-art sprites defined as text. Each character is one pixel, looked up in PALETTE.
// '.' or ' ' = transparent. Rows shorter than the widest row are padded, so small typos
// won't crash anything. Sprites are rendered once to offscreen canvases and cached.
Game.Sprites = (function () {
  var PALETTE = {
    K: '#000000', // black
    W: '#fcfcfc', // white
    G: '#80d010', // link green
    g: '#008800', // dark green
    B: '#c84c0c', // brown
    b: '#7c3000', // dark brown
    S: '#fcbcb0', // skin
    R: '#d82800', // red
    r: '#881400', // dark red
    O: '#fc9838', // orange
    Y: '#fcd8a8', // sand
    y: '#f8b800', // gold
    U: '#2038ec', // blue
    u: '#0000a8', // dark blue
    C: '#3cbcfc', // cyan
    A: '#a0a0a0', // grey
    a: '#595959', // dark grey
    P: '#b53120', // pink-red
    M: '#d800cc', // magenta
  };

  var defs = {};
  var cache = {};

  // define('name', ['..KK..', ...], {scale: 2})  -- scale lets you author 8x8 art for 16x16 tiles
  function define(name, rows, opts) {
    defs[name] = { rows: rows, scale: (opts && opts.scale) || 1 };
    delete cache[name];
    delete cache[name + ':flip'];
  }

  function build(name, flip) {
    var def = defs[name];
    if (!def) return null;
    var rows = def.rows, s = def.scale;
    var w = 0;
    rows.forEach(function (r) { w = Math.max(w, r.length); });
    var h = rows.length;
    var c = document.createElement('canvas');
    c.width = w * s;
    c.height = h * s;
    var x = c.getContext('2d');
    for (var j = 0; j < h; j++) {
      for (var i = 0; i < w; i++) {
        var ch = rows[j][i];
        if (!ch || ch === '.' || ch === ' ') continue;
        var color = PALETTE[ch];
        if (!color) continue;
        x.fillStyle = color;
        var px = flip ? (w - 1 - i) : i;
        x.fillRect(px * s, j * s, s, s);
      }
    }
    return c;
  }

  function get(name, flip) {
    var key = flip ? name + ':flip' : name;
    if (!cache[key]) cache[key] = build(name, flip);
    return cache[key];
  }

  // draw(ctx, 'octorok_down', x, y, {flip: true, flash: true})
  function draw(ctx, name, x, y, opts) {
    var img = get(name, opts && opts.flip);
    if (!img) {
      // Missing sprite: draw a magenta box so it's obvious but not fatal.
      ctx.fillStyle = '#ff00ff';
      ctx.fillRect(Math.round(x), Math.round(y), 16, 16);
      return;
    }
    if (opts && opts.flash) {
      ctx.save();
      ctx.filter = 'invert(1)';
      ctx.drawImage(img, Math.round(x), Math.round(y));
      ctx.restore();
      return;
    }
    ctx.drawImage(img, Math.round(x), Math.round(y));
  }

  return { PALETTE: PALETTE, define: define, get: get, draw: draw, has: function (n) { return !!defs[n]; } };
})();
