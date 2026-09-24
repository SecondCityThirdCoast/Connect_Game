// Enemy AI behaviours and enemy types.
//
// Game.Enemies.define(name, {
//   sprite:    base sprite name ('octorok' -> octorok_down_0, octorok_right_0, ...)
//   hp:        hit points (sword does 1)
//   speed:     px/second
//   damage:    half-hearts dealt on touch
//   behavior:  key into Game.Behaviors, OR provide update(e, dt, game) directly
//   flying:    ignores tiles (still stays in the room)
//   knockback: false to make it immune to knockback
//   hitbox:    {x, y, w, h} relative to the 16x16 box
//   drops:     weighted loot table (see DEFAULT_DROPS)
//   init(e), onDeath(e, game), draw(e, ctx, ox, oy): optional hooks
// })
//
// Inside a behaviour, `e` is a Game.Enemy: e.dir, e.timer, e.state, e.speed, e.walk(dt, room),
// e.shoot(game, opts), e.x/e.y. `game.player` is the player.
(function () {
  var U = Game.Util;
  var B = Game.Behaviors;

  // Walk around, randomly change direction every so often.
  B.wander = function (e, dt, game) {
    e.timer -= dt;
    if (e.timer <= 0) {
      e.dir = U.randomDir();
      e.timer = U.rand(0.5, 2);
    }
    e.walk(dt, game.room);
  };

  // Wander, occasionally stop and shoot in the facing direction.
  B.wanderShoot = function (e, dt, game) {
    if (e.state === 'aim') {
      e.timer -= dt;
      if (e.timer <= 0) {
        e.shoot(game, { sprite: e.spec.projectile || 'rock_shot' });
        e.state = 'walk';
        e.timer = U.rand(0.8, 2.5);
      }
      return;
    }
    e.timer -= dt;
    if (e.timer <= 0) {
      if (U.chance(0.4)) { e.state = 'aim'; e.timer = 0.4; return; }
      e.dir = U.randomDir();
      e.timer = U.rand(0.5, 2);
    }
    e.walk(dt, game.room);
  };

  // Move toward the player along one axis at a time.
  B.chase = function (e, dt, game) {
    e.timer -= dt;
    if (e.timer <= 0) {
      e.dir = U.chance(0.75) ? U.dirToward(e.center(), game.player.center()) : U.randomDir();
      e.timer = U.rand(0.3, 0.8);
    }
    e.walk(dt, game.room);
  };

  // Erratic flying with pauses (keese).
  B.flutter = function (e, dt, game) {
    e.timer -= dt;
    if (e.timer <= 0) {
      e.resting = !e.resting && U.chance(0.3);
      e.timer = e.resting ? U.rand(0.5, 1.2) : U.rand(0.2, 0.6);
      e.vx = U.rand(-1, 1);
      e.vy = U.rand(-1, 1);
    }
    if (e.resting) { e.frame = 0; return; }
    e.x += e.vx * e.speed * dt;
    e.y += e.vy * e.speed * dt;
    if (!e.inRoom()) { e.clampToRoom(); e.vx = -e.vx; e.vy = -e.vy; }
  };

  // Hop toward the player in bursts (slimes).
  B.hop = function (e, dt, game) {
    e.timer -= dt;
    if (e.timer <= 0) {
      e.hopping = !e.hopping;
      e.timer = e.hopping ? 0.35 : U.rand(0.4, 1.0);
      if (e.hopping) e.dir = U.chance(0.6) ? U.dirToward(e.center(), game.player.center()) : U.randomDir();
    }
    if (e.hopping) e.walk(dt, game.room);
  };

  // Shamble toward the player in lurches, stopping now and then to stand and drool.
  B.shamble = function (e, dt, game) {
    e.timer -= dt;
    if (e.timer <= 0) {
      if (e.state !== 'drool' && U.chance(0.35)) {
        e.state = 'drool';
        e.timer = U.rand(0.5, 1.0);
      } else {
        e.state = 'lurch';
        e.dir = U.chance(0.8) ? U.dirToward(e.center(), game.player.center()) : U.randomDir();
        e.timer = U.rand(0.6, 1.2);
      }
    }
    if (e.state === 'drool') { e.frame = 1; return; }
    e.walk(dt, game.room);
  };

  // Level-1 boss AI. Stalks you, then either breathes a fan of fireballs (aim -> breath) or
  // charges across the room leaving burning ground (wind -> charge). Under a third of its
  // health it breathes a wider fan and charges faster.
  var SAL = { FAN: 3, FAN_RAGE: 5, SPREAD: 0.5, CHARGE: 210, CHARGE_RAGE: 260, FIREBALL: 130, FLAME_EVERY: 0.07 };
  function salamanderRage(e) { return e.hp <= Math.ceil(e.spec.hp / 3); }
  function salamanderBreath(e, game, n) {
    var c = e.center(), p = game.player.center();
    var base = Math.atan2(p.y - c.y, p.x - c.x);
    for (var i = 0; i < n; i++) {
      var a = base + (i - (n - 1) / 2) * SAL.SPREAD;
      game.spawn(new Game.Projectile({
        x: c.x - 4, y: c.y - 4, dir: e.dir, sprite: 'fireball', damage: 2, team: 'enemy',
        vx: Math.cos(a) * SAL.FIREBALL, vy: Math.sin(a) * SAL.FIREBALL,
      }));
    }
    Game.Audio.play('fire');
  }
  function salamanderFlame(e, game) {
    var c = e.center();
    game.spawn(new Game.Projectile({
      x: c.x - 6, y: c.y - 6, dir: e.dir, speed: 0, sprite: 'flame', damage: 1, team: 'enemy',
      lifetime: U.rand(1.2, 1.8),
    }));
  }
  B.salamander = function (e, dt, game) {
    var rage = salamanderRage(e), c = e.center(), p = game.player.center();
    e.timer -= dt;
    if (e.state === 'aim') {
      if (e.timer > 0) return;
      salamanderBreath(e, game, rage ? SAL.FAN_RAGE : SAL.FAN);
      e.state = 'walk';
      e.timer = U.rand(0.6, 1.0);
      return;
    }
    if (e.state === 'wind') {
      if (e.timer > 0) return;
      e.state = 'charge';
      e.timer = 0.55;
      e.trail = 0;
      e.dir = U.dirToward(c, p);
      return;
    }
    if (e.state === 'charge') {
      var d = U.DIRS[e.dir], speed = rage ? SAL.CHARGE_RAGE : SAL.CHARGE;
      var blocked = e.tryMove(d.x * speed * dt, d.y * speed * dt, game.room, { edgesSolid: true });
      e.trail -= dt;
      if (e.trail <= 0) { e.trail = SAL.FLAME_EVERY; salamanderFlame(e, game); }
      if (blocked || e.timer <= 0) { e.clampToRoom(); e.state = 'walk'; e.timer = U.rand(0.5, 0.9); }
      return;
    }
    // stalk
    if (e.timer <= 0) {
      e.stalked = (e.stalked || 0) + 1;
      if (e.stalked > 1 && U.chance(rage ? 0.7 : 0.5)) {
        e.stalked = 0;
        e.dir = U.dirToward(c, p);
        if (U.chance(0.5)) { e.state = 'aim'; e.timer = 0.45; Game.Audio.play('hiss'); }
        else { e.state = 'wind'; e.timer = 0.5; Game.Audio.play('roar'); }
        return;
      }
      e.dir = U.chance(0.8) ? U.dirToward(c, p) : U.randomDir();
      e.timer = U.rand(0.4, 0.9);
    }
    e.walk(dt, game.room);
  };

  // ------------------------------------------------------------------ loot
  // weight = relative chance, value = item type or null (nothing)
  var DEFAULT_DROPS = [
    { weight: 5, value: null },
    { weight: 3, value: 'rupee' },
    { weight: 2, value: 'heart' },
    { weight: 0.5, value: 'rupee_blue' },
    { weight: 0.3, value: 'bomb' },
  ];
  Game.DEFAULT_DROPS = DEFAULT_DROPS;

  // ------------------------------------------------------------------ enemy types
  var E = Game.Enemies;

  E.define('octorok', {
    sprite: 'octorok', hp: 1, speed: 35, damage: 1,
    behavior: 'wanderShoot', projectile: 'rock_shot',
    drops: DEFAULT_DROPS,
  });

  E.define('octorok_blue', {
    sprite: 'octorok', hp: 2, speed: 50, damage: 1,
    behavior: 'wanderShoot', projectile: 'rock_shot',
    drops: DEFAULT_DROPS,
    // Example of a custom draw: recolour by drawing the normal sprite with a CSS filter.
    draw: function (e, ctx, ox, oy) {
      ctx.save();
      ctx.filter = e.invuln > 0 ? 'invert(1)' : 'hue-rotate(220deg)';
      e.drawSprite(ctx, 'octorok', ox, oy);
      ctx.restore();
    },
  });

  E.define('moblin', {
    sprite: 'moblin', hp: 2, speed: 30, damage: 1,
    behavior: 'wanderShoot', projectile: 'arrow',
    drops: DEFAULT_DROPS,
  });

  E.define('keese', {
    sprite: 'keese', hp: 1, speed: 70, damage: 1,
    behavior: 'flutter', flying: true, animSpeed: 10,
    hitbox: { x: 2, y: 4, w: 12, h: 8 },
    drops: DEFAULT_DROPS,
  });

  E.define('slime', {
    sprite: 'slime', hp: 1, speed: 60, damage: 1,
    behavior: 'hop', animSpeed: 4,
    hitbox: { x: 2, y: 6, w: 12, h: 10 },
    drops: DEFAULT_DROPS,
  });

  // Graveyard zombie: slow and tough, shambles toward you and pauses to drool.
  E.define('zombie', {
    sprite: 'zombie', hp: 3, speed: 24, damage: 1,
    behavior: 'shamble', animSpeed: 4,
    drops: DEFAULT_DROPS,
  });

  // Level-1 boss: a fire salamander. See B.salamander for its attacks. Always drops a heart container.
  E.define('boss_salamander', {
    sprite: 'salamander', hp: 20, speed: 60, damage: 2,
    behavior: 'salamander', knockback: false, animSpeed: 5, projectile: 'fireball',
    drops: [{ weight: 1, value: 'heart_container' }],
    draw: function (e, ctx, ox, oy) {
      ctx.save();
      if (e.state === 'wind' && Math.floor(e.animTime * 12) % 2) ctx.filter = 'brightness(1.7)';
      else if (salamanderRage(e)) ctx.filter = 'saturate(1.7) hue-rotate(-12deg)';
      e.drawSprite(ctx, 'salamander', ox, oy, { flash: e.invuln > 0 });
      ctx.restore();
    },
  });

  // ------------------------------------------------------------------ LEVEL-2 (cavern)
  // Ghosts drift straight through walls toward you and fade in and out.
  B.haunt = function (e, dt, game) {
    e.timer -= dt;
    if (e.timer <= 0) {
      e.dir = U.chance(0.7) ? U.dirToward(e.center(), game.player.center()) : U.randomDir();
      e.timer = U.rand(0.4, 1.0);
      e.faded = U.chance(0.35);
    }
    e.walk(dt, game.room);
  };
  function drawFaded(base) {
    return function (e, ctx, ox, oy) {
      ctx.save();
      ctx.globalAlpha = e.faded ? 0.45 : 1;
      e.drawSprite(ctx, base, ox, oy, { flash: e.invuln > 0 });
      ctx.restore();
    };
  }

  E.define('ghost', {
    sprite: 'ghost', hp: 2, speed: 40, damage: 1,
    behavior: 'haunt', flying: true, animSpeed: 3,
    hitbox: { x: 2, y: 2, w: 12, h: 12 },
    drops: DEFAULT_DROPS,
    draw: drawFaded('ghost'),
  });

  // Skeleton warrior: tougher than a moblin and it hunts you down.
  E.define('stalfos', {
    sprite: 'stalfos', hp: 3, speed: 45, damage: 1,
    behavior: 'chase', animSpeed: 6,
    drops: DEFAULT_DROPS,
  });

  // Level-2 boss: a wraith that hunts through walls and guarantees a heart container.
  E.define('boss_wraith', {
    sprite: 'wraith', hp: 10, speed: 55, damage: 2,
    behavior: 'haunt', flying: true, knockback: false, animSpeed: 3,
    hitbox: { x: 2, y: 2, w: 12, h: 12 },
    drops: [{ weight: 1, value: 'heart_container' }],
    draw: drawFaded('wraith'),
  });
})();
