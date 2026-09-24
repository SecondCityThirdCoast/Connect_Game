// Shops (state 'shop'): stand at a vendor's counter and press the sword button to open a menu of
// its wares. A vendor is an NPC whose type has an `interact` hook and whose room entry lists
//   wares: [{ item: 'key', price: 15, label: 'KEY' }, ...]
// (see 'merchant' in data/npcs.js and the 'shop' room in data/rooms.js). Up/down picks, the sword
// button or Enter buys, the B button or LEAVE closes.
(function () {
  var C = Game.Config, Input = Game.Input, S = Game.Sprites;
  var G = Game.GameState.prototype;
  var REACH = 48; // px between your centre and the vendor's

  // Called by player.update on the sword button: talk to a nearby NPC instead of swinging.
  G.tryInteract = function () {
    var p = this.player.center(), best = null, bestD = REACH;
    this.entities.forEach(function (e) {
      if (!(e instanceof Game.Npc) || !e.spec.interact) return;
      var c = e.center(), d = Math.sqrt((c.x - p.x) * (c.x - p.x) + (c.y - p.y) * (c.y - p.y));
      if (d < bestD) { best = e; bestD = d; }
    });
    if (!best) return false;
    best.spec.interact(this, best);
    return true;
  };

  G.openShop = function (npc) {
    this.shop = { npc: npc, wares: npc.opts.wares || [], sel: 0, note: null, noteT: 0 };
    this.message = null;
    this.state = 'shop';
    Game.Audio.play('cursor');
  };
  G.closeShop = function () {
    this.shop = null;
    this.state = 'play';
    Game.Audio.play('cursor');
  };
  G.shopMove = function (step) {
    var s = this.shop, n = s.wares.length + 1; // + LEAVE
    s.sel = (s.sel + step + n) % n;
    Game.Audio.play('cursor');
  };
  G.shopSelect = function () {
    var s = this.shop;
    if (s.sel >= s.wares.length) { this.closeShop(); return; }
    var w = s.wares[s.sel], spec = Game.Items.get(w.item);
    if (this.inventory.rupees < w.price) { note(s, 'NOT ENOUGH RUPEES.'); Game.Audio.play('deny'); return; }
    var ok = spec && spec.onPickup ? spec.onPickup(this, this.player) !== false : true;
    if (!ok) { note(s, 'YOU CANNOT CARRY THAT.'); Game.Audio.play('deny'); return; }
    this.inventory.rupees -= w.price;
    note(s, 'YOU BOUGHT ' + label(w) + '!');
    Game.Audio.play(spec && spec.sound ? spec.sound : 'pickup');
  };
  G.updateShop = function (dt) {
    var s = this.shop;
    if (s.noteT > 0) { s.noteT -= dt; if (s.noteT <= 0) s.note = null; }
    if (Input.pressed('up') || Input.pressed('left')) this.shopMove(-1);
    if (Input.pressed('down') || Input.pressed('right')) this.shopMove(1);
    if (Input.pressed('attack') || Input.pressed('start')) this.shopSelect();
    else if (Input.pressed('item')) this.closeShop();
  };

  function note(s, text) { s.note = text; s.noteT = 1.6; }
  function label(w) { return w.label || String(w.item).toUpperCase().replace(/_/g, ' '); }

  G.renderShop = function (ctx) {
    var HUD = Game.HUD, s = this.shop, oy = C.HUD_HEIGHT, n = s.wares.length;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, oy, C.WIDTH, C.ROOM_HEIGHT);
    var x = 24, y = oy + 16, w = C.WIDTH - 48;
    var rowY = y + 30, leaveY = rowY + n * 14, noteY = leaveY + 22, hintY = noteY + 12, h = hintY + 14 - y;
    ctx.fillStyle = '#fcfcfc'; ctx.fillRect(x - 2, y - 2, w + 4, h + 4);
    ctx.fillStyle = '#000'; ctx.fillRect(x, y, w, h);
    HUD.wrap(s.npc.opts.text || 'WHAT WILL YOU BUY?', 22).forEach(function (l, i) {
      HUD.text(ctx, l, x + w / 2, y + 8 + i * 10, { align: 'center', color: '#f8b800' });
    });
    s.wares.forEach(function (ware, i) {
      var spec = Game.Items.get(ware.item) || {}, name = spec.sprite || ware.item;
      var img = S.get(name), iw = img ? img.width : 8, ih = img ? img.height : 8;
      var ry = rowY + i * 14, cur = i === s.sel;
      if (cur) HUD.text(ctx, '>', x + 8, ry + 2);
      S.draw(ctx, name, x + 22 + Math.floor((12 - iw) / 2), ry + Math.floor((12 - ih) / 2));
      HUD.text(ctx, label(ware), x + 42, ry + 2, { color: cur ? '#fcfcfc' : '#a0a0a0' });
      S.draw(ctx, 'rupee', x + w - 44, ry + 1);
      HUD.text(ctx, String(ware.price), x + w - 8, ry + 2, { align: 'right', color: cur ? '#fcfcfc' : '#a0a0a0' });
    });
    if (s.sel === n) HUD.text(ctx, '>', x + 8, leaveY + 2);
    HUD.text(ctx, 'LEAVE', x + 42, leaveY + 2, { color: s.sel === n ? '#fcfcfc' : '#a0a0a0' });
    HUD.text(ctx, s.note || ('YOU HAVE ' + this.inventory.rupees + ' RUPEES'), x + w / 2, noteY, { align: 'center', color: s.note ? '#f8b800' : '#a0a0a0' });
    HUD.text(ctx, 'SPACE BUY   K LEAVE', x + w / 2, hintY, { align: 'center', color: '#595959' });
  };
})();
