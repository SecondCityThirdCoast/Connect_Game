// Bombs: the B item (K / X, gamepad B). Press it to drop a lit bomb one tile ahead. After the
// fuse it explodes, hurting every enemy inside a square around it and knocking out enemy shots.
// Tune fuse, damage, blast size and the bomb limit in Config.BOMB.
(function () {
  var C = Game.Config, B = C.BOMB, U = Game.Util;
  var BOOM_TIME = 0.5;
  // Puff positions around the centre: the middle first, then the sides, then the corners.
  var PUFFS = [[0, 0], [0, -16], [0, 16], [-16, 0], [16, 0], [-13, -12], [13, -12], [-13, 12], [13, 12]];

  function Bomb(x, y) {
    Game.Entity.call(this, x, y);
    this.fuse = B.FUSE;
    this.boom = 0; // counts down while exploding
    this.animTime = 0;
    this.hb = { x: 4, y: 4, w: 8, h: 8 };
  }
  Bomb.prototype = Object.create(Game.Entity.prototype);

  Bomb.prototype.blastBox = function () {
    var c = this.center();
    return { x: c.x - B.RADIUS, y: c.y - B.RADIUS, w: B.RADIUS * 2, h: B.RADIUS * 2 };
  };

  Bomb.prototype.update = function (dt, game) {
    this.animTime += dt;
    if (this.boom > 0) {
      this.boom -= dt;
      if (this.boom <= 0) this.dead = true;
      return;
    }
    this.fuse -= dt;
    if (this.fuse > 0) return;
    this.explode(game);
  };

  Bomb.prototype.explode = function (game) {
    var box = this.blastBox(), self = this;
    this.boom = BOOM_TIME;
    game.entities.forEach(function (e) {
      if (e instanceof Game.Enemy) {
        if (!e.dead && e.spawnTime <= 0 && U.overlap(box, e.box())) e.hurt(B.DAMAGE, self, game);
      } else if (e instanceof Game.Projectile) {
        if (e.team !== 'player' && U.overlap(box, e.box())) e.dead = true;
      }
    });
    game.shake = 0.25;
    Game.Audio.play('explode');
  };

  Bomb.prototype.draw = function (ctx, ox, oy) {
    var S = Game.Sprites;
    if (this.boom <= 0) {
      // Lit: blinks, faster in the last moments.
      var rate = this.fuse < 0.4 ? 16 : 6;
      S.draw(ctx, 'bomb', ox + this.x + 4, oy + this.y + 4, { flash: Math.floor(this.animTime * rate) % 2 === 1 });
      return;
    }
    var p = 1 - this.boom / BOOM_TIME; // 0 -> 1 over the explosion
    var c = this.center();
    ctx.save();
    for (var i = 0; i < PUFFS.length; i++) {
      var ring = i === 0 ? 0 : i <= 4 ? 1 : 2;
      var start = ring * 0.12;
      if (p < start) continue;
      var local = (p - start) / (1 - start);
      var grow = Math.min(1, local * 2.5);
      ctx.globalAlpha = local < 0.7 ? 1 : Math.max(0, 1 - (local - 0.7) / 0.3);
      S.draw(ctx, local < 0.45 ? 'boom_0' : 'boom_1', ox + c.x + PUFFS[i][0] * grow - 8, oy + c.y + PUFFS[i][1] * grow - 8);
    }
    ctx.restore();
  };
  Game.Bomb = Bomb;

  // The B button (called from player.update).
  Game.GameState.prototype.useItem = function () {
    var inv = this.inventory, p = this.player;
    if (inv.bombs <= 0) return;
    var active = this.entities.filter(function (e) { return e instanceof Bomb && !e.dead; }).length;
    if (active >= B.MAX_ACTIVE) return;
    var d = U.DIRS[p.dir];
    var x = p.x + d.x * C.TILE, y = p.y + d.y * C.TILE;
    // Never inside a wall or off the room: fall back to where you stand.
    if (this.room.blocked({ x: x + 4, y: y + 4, w: 8, h: 8 }, { edgesSolid: true })) { x = p.x; y = p.y; }
    inv.bombs--;
    this.spawn(new Bomb(x, y));
    Game.Audio.play('place');
  };
})();
