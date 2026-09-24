// Non-player characters and decorations. Place them in rooms via `npcs: [{type, x, y}]`.
// If a room npc has `text`, it is shown when the player enters the room.
//   sprite: base sprite name
//   update(npc, dt, game): optional per-frame logic
(function () {
  var N = Game.Npcs;

  N.define('oldman', { sprite: 'oldman' });
  N.define('fire', { sprite: 'fire' });
})();
