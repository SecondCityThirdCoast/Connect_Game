// Non-player characters and decorations. Place them in rooms via `npcs: [{type, x, y}]`.
// If a room npc has `text`, it is shown when the player enters the room.
//   sprite: base sprite name
//   update(npc, dt, game): optional per-frame logic
(function () {
  var N = Game.Npcs;

  N.define('oldman', { sprite: 'oldman' });
  N.define('fire', { sprite: 'fire' });
  // Shopkeeper: stand at the counter and press the sword button to open its menu (engine/shop.js).
  // Wares come from the room's npc entry (wares: [{ item, price, label }]) and are drawn on the
  // counter row in front of the merchant, one every two tiles, with their prices.
  N.define('merchant', {
    sprite: 'merchant',
    interact: function (game, npc) { game.openShop(npc); },
    draw: function (npc, ctx, ox, oy) {
      npc.drawSprite(ctx, 'merchant', ox, oy);
      var wares = npc.opts.wares || [], S = Game.Sprites;
      wares.forEach(function (w, i) {
        var spec = Game.Items.get(w.item) || {}, name = spec.sprite || w.item;
        var img = S.get(name), iw = img ? img.width : 8, ih = img ? img.height : 8;
        var x = npc.x + Math.round((i - (wares.length - 1) / 2) * 32), y = npc.y + 16;
        S.draw(ctx, name, ox + x + Math.floor((16 - iw) / 2), oy + y + Math.floor((14 - ih) / 2));
        Game.HUD.text(ctx, String(w.price), ox + x + 8, oy + y + 16, { align: 'center', color: '#f8b800' });
      });
    },
  });
  N.define('chest_open', { sprite: 'chest_open' }); // left behind by an opened treasure chest

  // Hovers in place; touch it and it carries you to npc.opts.ride (engine/ride.js).
  N.define('winterbird', {
    sprite: 'winterbird',
    update: function (npc, dt, game) {
      if (npc.restY === undefined) npc.restY = npc.y;
      if (game.state !== 'play') return;
      npc.y = npc.restY + Math.round(Math.sin(npc.animTime * 3) * 2);
      if (npc.opts.ride && Game.Util.overlap(game.player.box(), npc.box())) game.startRide(npc, npc.opts.ride);
    },
  });
})();
