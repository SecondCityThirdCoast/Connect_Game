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

  // Mini-boss: tough chaser that guarantees a heart container.
  E.define('boss_moblin', {
    sprite: 'moblin', hp: 8, speed: 45, damage: 2,
    behavior: 'chase', knockback: false,
    drops: [{ weight: 1, value: 'heart_container' }],
    draw: function (e, ctx, ox, oy) {
      ctx.save();
      ctx.filter = e.invuln > 0 ? 'invert(1)' : 'hue-rotate(-40deg) saturate(2)';
      e.drawSprite(ctx, 'moblin', ox, oy);
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
