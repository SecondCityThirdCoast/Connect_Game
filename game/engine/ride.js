// Winterbird rides (state 'ride'): touch a 'winterbird' NPC (data/npcs.js) and it lifts you off
// the ground and carries you to another room. Spawn one with
//   game.spawn(new Game.Npc('winterbird', x, y, { ride: { to: 'd_boss', tx: 7, ty: 8, say: '...' } }))
// (see cv_n in data/rooms.js, which does it once the wraith is beaten).
(function () {
  var G = Game.GameState.prototype;
  var RIDE_TIME = 1.6; // seconds from touch to the fade-out
  var LIFT = 70;       // climb speed in px/s

  G.startRide = function (bird, dest) {
    if (this.state !== 'play' || !dest) return;
    var p = this.player;
    bird.x = p.x;
    bird.y = p.y - 12; // perches over your head
    p.attackTime = 0;
    p.kb = null;
    this.message = null;
    this.ride = { t: 0, bird: bird, dest: dest };
    this.state = 'ride';
    Game.Audio.play('bird');
  };

  G.updateRide = function (dt) {
    var r = this.ride, b = r.bird, p = this.player;
    r.t += dt;
    b.animTime += dt;
    b.frame = Math.floor(b.animTime * 14) % 2; // fast flapping
    if (r.t > 0.4) b.y -= LIFT * dt;          // a beat to grab hold, then climb
    p.x = b.x;
    p.y = b.y + 12;
    p.dir = 'down';
    if (r.t >= RIDE_TIME || b.y < -20) {
      this.ride = null;
      if (r.dest.say) this.pendingSay = r.dest.say;
      this.warp(r.dest.to, r.dest.tx, r.dest.ty, 'stairs');
    }
  };
})();
