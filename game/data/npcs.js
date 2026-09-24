// Non-player characters and decorations. Place them in rooms via `npcs: [{type, x, y}]`.
// If a room npc has `text`, it is shown when the player enters the room.
//   sprite: base sprite name
//   update(npc, dt, game): optional per-frame logic
(function () {
  var N = Game.Npcs;

  N.define('oldman', { sprite: 'oldman' });
  N.define('fire', { sprite: 'fire' });
  N.define('merchant', { sprite: 'merchant' }); // shopkeeper; items with a `price` do the selling

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
