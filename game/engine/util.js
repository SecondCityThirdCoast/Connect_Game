Game.Util = {
  DIRS: {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
  },
  DIR_NAMES: ['up', 'down', 'left', 'right'],

  randomDir: function () {
    return Game.Util.DIR_NAMES[Math.floor(Math.random() * 4)];
  },

  rand: function (min, max) {
    return min + Math.random() * (max - min);
  },

  chance: function (p) {
    return Math.random() < p;
  },

  clamp: function (v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  },

  // Axis-aligned box overlap. Boxes are {x, y, w, h}.
  overlap: function (a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  },

  // Unit direction name pointing from a toward b (dominant axis).
  dirToward: function (a, b) {
    var dx = b.x - a.x, dy = b.y - a.y;
    if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'right' : 'left';
    return dy > 0 ? 'down' : 'up';
  },

  // Pick from a weighted table: [{weight: 3, value: 'a'}, ...]
  weighted: function (table) {
    var total = 0;
    table.forEach(function (e) { total += e.weight; });
    var r = Math.random() * total;
    for (var i = 0; i < table.length; i++) {
      r -= table[i].weight;
      if (r <= 0) return table[i].value;
    }
    return table[table.length - 1].value;
  },
};
