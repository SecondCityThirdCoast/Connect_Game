// Base entity + the generic Enemy / Projectile / Pickup / Npc / Effect classes.
// Content (which enemies/items/npcs exist) is defined in data/*.js via the registries below.
//
// Health is measured in HALF HEARTS everywhere (damage: 1 = half a heart).
(function () {
  var C = Game.Config;
  var U = Game.Util;

  // ---------------------------------------------------------------- registries
  function registry(kind) {
    var defs = {};
    return {
      defs: defs,
      define: function (name, spec) { spec.name = name; defs[name] = spec; },
      get: function (name) {
        if (!defs[name]) console.warn('[' + kind + '] unknown type "' + name + '"');
        return defs[name];
      },
    };
  }
  Game.Enemies = registry('Enemies');
  Game.Items = registry('Items');
  Game.Npcs = registry('Npcs');
  Game.Behaviors = {}; // enemy AI functions, see data/enemies.js

  // ---------------------------------------------------------------- Entity
  function Entity(x, y) {
    this.x = x;
    this.y = y;
    this.w = 16;
    this.h = 16;
    this.hb = { x: 1, y: 1, w: 14, h: 14 }; // hitbox relative to x,y
    this.dir = 'down';
    this.frame = 0;
    this.animTime = 0;
    this.dead = false;
    this.team = 'neutral';
    this.invuln = 0;
    this.kb = null; // knockback {vx, vy, t}
  }

  Entity.prototype.box = function () {
    return { x: this.x + this.hb.x, y: this.y + this.hb.y, w: this.hb.w, h: this.hb.h };
  };
  Entity.prototype.center = function () {
    return { x: this.x + this.w / 2, y: this.y + this.h / 2 };
  };

  // Move with tile collision, one axis at a time. Returns true if blocked.
  Entity.prototype.tryMove = function (dx, dy, room, opts) {
    var blocked = false;
    if (dx) {
      this.x += dx;
      if (room.blocked(this.box(), opts)) { this.x -= dx; blocked = true; }
    }
    if (dy) {
      this.y += dy;
      if (room.blocked(this.box(), opts)) { this.y -= dy; blocked = true; }
    }
    return blocked;
  };

  Entity.prototype.inRoom = function (margin) {
    margin = margin || 0;
    return this.x >= -margin && this.y >= -margin &&
      this.x + this.w <= C.WIDTH + margin && this.y + this.h <= C.ROOM_HEIGHT + margin;
  };

  Entity.prototype.clampToRoom = function () {
    this.x = U.clamp(this.x, 0, C.WIDTH - this.w);
    this.y = U.clamp(this.y, 0, C.ROOM_HEIGHT - this.h);
  };

  Entity.prototype.knockback = function (fromX, fromY, power, time) {
    var c = this.center();
    var dir = U.dirToward({ x: fromX, y: fromY }, c);
    var d = U.DIRS[dir];
    this.kb = { vx: d.x * power, vy: d.y * power, t: time || 0.15 };
  };

  // Returns true while knockback is active (entity should skip its own movement).
  Entity.prototype.updateKnockback = function (dt, room, opts) {
    if (!this.kb) return false;
    this.tryMove(this.kb.vx * dt, this.kb.vy * dt, room, opts);
    this.clampToRoom();
    this.kb.t -= dt;
    if (this.kb.t <= 0) this.kb = null;
    return true;
  };

  // Resolves '<base>_<dir>_<frame>' with sensible fallbacks; left = flipped right.
  Entity.prototype.drawSprite = function (ctx, base, ox, oy, extra) {
    var S = Game.Sprites;
    var dir = this.dir, flip = false;
    var f = this.frame;
    var name = null;
    var tries = [base + '_' + dir + '_' + f, base + '_' + dir + '_0', base + '_' + dir];
    if (dir === 'left') {
      if (!tries.some(S.has)) {
        tries = [base + '_right_' + f, base + '_right_0', base + '_right'];
        flip = true;
      }
    }
    tries.push(base + '_' + f, base + '_0', base);
    for (var i = 0; i < tries.length; i++) if (S.has(tries[i])) { name = tries[i]; break; }
    // 1-frame vertical walk cycles flip horizontally for animation (NES style)
    if (name && name.slice(-2) === '_0' && f === 1 && (dir === 'up' || dir === 'down')) flip = !flip;
    var img = S.get(name || base, flip);
    var w = img ? img.width : 16, h = img ? img.height : 16;
    // Sprites smaller than 16x16 are centred in the entity box.
    S.draw(ctx, name || base, ox + this.x + (this.w - w) / 2, oy + this.y + (this.h - h) / 2,
      { flip: flip, flash: extra && extra.flash });
  };

  Entity.prototype.drawDebug = function (ctx, ox, oy, color) {
    var b = this.box();
    ctx.strokeStyle = color || '#ff0';
    ctx.strokeRect(ox + b.x + 0.5, oy + b.y + 0.5, b.w - 1, b.h - 1);
  };

  Entity.prototype.update = function () {};
  Entity.prototype.draw = function () {};

  // ---------------------------------------------------------------- Enemy
  function Enemy(type, x, y) {
    Entity.call(this, x, y);
    var spec = Game.Enemies.get(type);
    this.type = type;
    this.spec = spec;
    this.team = 'enemy';
    this.hp = spec.hp || 1;
    this.speed = spec.speed || 30;
    this.damage = spec.damage || 1;
    this.dir = U.randomDir();
    this.timer = U.rand(0.3, 1.5);
    this.state = 'walk';
    if (spec.hitbox) this.hb = spec.hitbox;
    this.spawnTime = 0.4; // brief spawn puff before becoming active
    if (spec.init) spec.init(this);
  }
  Enemy.prototype = Object.create(Entity.prototype);

  // Walk forward in this.dir; turn randomly when blocked or at the room edge.
  Enemy.prototype.walk = function (dt, room) {
    var d = U.DIRS[this.dir];
    var opts = { overWater: !!this.spec.flying, edgesSolid: true };
    var blocked = this.spec.flying ? false : this.tryMove(d.x * this.speed * dt, d.y * this.speed * dt, room, opts);
    if (this.spec.flying) { this.x += d.x * this.speed * dt; this.y += d.y * this.speed * dt; }
    if (blocked || !this.inRoom()) {
      this.clampToRoom();
      this.dir = U.randomDir();
    }
    return blocked;
  };

  Enemy.prototype.update = function (dt, game) {
    if (this.spawnTime > 0) { this.spawnTime -= dt; return; }
    if (this.invuln > 0) this.invuln -= dt;
    this.animTime += dt;
    this.frame = Math.floor(this.animTime * (this.spec.animSpeed || 6)) % 2;
    if (this.updateKnockback(dt, game.room, { edgesSolid: true })) return;
    var behavior = this.spec.update || Game.Behaviors[this.spec.behavior || 'wander'];
    if (behavior) behavior(this, dt, game);
  };

  Enemy.prototype.hurt = function (amount, source, game) {
    if (this.invuln > 0 || this.spawnTime > 0) return false;
    this.hp -= amount;
    this.invuln = 0.3;
    if (this.hp <= 0) {
      this.dead = true;
      Game.Audio.play('kill');
      game.spawn(new Effect('poof', this.x, this.y, 0.3));
      game.dropLoot(this);
      if (this.spec.onDeath) this.spec.onDeath(this, game);
    } else {
      Game.Audio.play('hit');
      if (this.spec.knockback !== false) {
        var c = source.center ? source.center() : source;
        this.knockback(c.x, c.y, 200, 0.15);
      }
    }
    return true;
  };

  Enemy.prototype.draw = function (ctx, ox, oy) {
    if (this.spawnTime > 0) {
      Game.Sprites.draw(ctx, 'poof_' + (Math.floor(this.spawnTime * 10) % 2), ox + this.x, oy + this.y);
      return;
    }
    if (this.spec.draw) return this.spec.draw(this, ctx, ox, oy);
    this.drawSprite(ctx, this.spec.sprite || this.type, ox, oy, { flash: this.invuln > 0 });
  };

  // Fire a projectile in this.dir (or a given dir).
  Enemy.prototype.shoot = function (game, opts) {
    opts = opts || {};
    var c = this.center();
    game.spawn(new Projectile({
      x: c.x - 3, y: c.y - 3, dir: opts.dir || this.dir,
      sprite: opts.sprite || 'rock_shot', speed: opts.speed || 120,
      damage: opts.damage || this.damage, team: 'enemy',
    }));
    Game.Audio.play('enemyShot');
  };

  // ---------------------------------------------------------------- Projectile
  // opts: {x, y, dir, speed, sprite, damage, team:'player'|'enemy', pierce, onHit, w, h}
  function Projectile(opts) {
    Entity.call(this, opts.x, opts.y);
    this.dir = opts.dir;
    this.speed = opts.speed || 150;
    this.damage = opts.damage || 1;
    this.team = opts.team || 'enemy';
    this.pierce = !!opts.pierce;
    this.onHit = opts.onHit;
    this.kind = opts.kind || 'projectile';
    var img = Game.Sprites.get(this.resolveSprite(opts.sprite));
    this.baseSprite = opts.sprite;
    this.w = opts.w || (img ? img.width : 6);
    this.h = opts.h || (img ? img.height : 6);
    this.hb = { x: 0, y: 0, w: this.w, h: this.h };
  }
  Projectile.prototype = Object.create(Entity.prototype);
  Projectile.prototype.resolveSprite = function (base) {
    var S = Game.Sprites, d = this.dir;
    if (d === 'down' && S.has(base + '_up')) return base + '_up';
    if (d === 'left' && S.has(base + '_right')) return base + '_right';
    if (S.has(base + '_' + d)) return base + '_' + d;
    return base;
  };
  Projectile.prototype.update = function (dt, game) {
    var d = U.DIRS[this.dir];
    this.x += d.x * this.speed * dt;
    this.y += d.y * this.speed * dt;
    if (!this.inRoom(8) || game.room.blocked(this.box(), { overWater: true })) this.dead = true;
  };
  Projectile.prototype.draw = function (ctx, ox, oy) {
    var name = this.resolveSprite(this.baseSprite);
    var flipV = this.dir === 'down', flipH = this.dir === 'left';
    var img = Game.Sprites.get(name);
    if (!img) return;
    ctx.save();
    ctx.translate(Math.round(ox + this.x + this.w / 2), Math.round(oy + this.y + this.h / 2));
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    ctx.restore();
  };

  // ---------------------------------------------------------------- Pickup
  // opts: {lifetime: seconds or null, flag: string -- set when collected so it never respawns}
  function Pickup(type, x, y, opts) {
    Entity.call(this, x, y);
    opts = opts || {};
    this.type = type;
    this.spec = Game.Items.get(type) || {};
    this.lifetime = opts.lifetime || null;
    this.flag = opts.flag || null;
    this.hb = { x: 2, y: 2, w: 12, h: 12 };
  }
  Pickup.prototype = Object.create(Entity.prototype);
  Pickup.prototype.update = function (dt) {
    this.animTime += dt;
    if (this.lifetime !== null) {
      this.lifetime -= dt;
      if (this.lifetime <= 0) this.dead = true;
    }
  };
  Pickup.prototype.collect = function (game) {
    var ok = this.spec.onPickup ? this.spec.onPickup(game, game.player) !== false : true;
    if (!ok) return;
    this.dead = true;
    if (this.flag) game.flags[this.flag] = true;
    Game.Audio.play(this.spec.sound || 'pickup');
    if (this.spec.message) game.say(this.spec.message);
  };
  Pickup.prototype.draw = function (ctx, ox, oy) {
    // Blink when about to expire
    if (this.lifetime !== null && this.lifetime < 2 && Math.floor(this.animTime * 10) % 2) return;
    var sprite = this.spec.sprite || this.type;
    if (this.spec.animSprite && Math.floor(this.animTime * 4) % 2) sprite = this.spec.animSprite;
    var img = Game.Sprites.get(sprite);
    var w = img ? img.width : 16, h = img ? img.height : 16;
    Game.Sprites.draw(ctx, sprite, ox + this.x + (16 - w) / 2, oy + this.y + (16 - h) / 2);
  };

  // ---------------------------------------------------------------- Npc
  function Npc(type, x, y, opts) {
    Entity.call(this, x, y);
    this.type = type;
    this.spec = Game.Npcs.get(type) || {};
    this.opts = opts || {};
  }
  Npc.prototype = Object.create(Entity.prototype);
  Npc.prototype.update = function (dt, game) {
    this.animTime += dt;
    this.frame = Math.floor(this.animTime * 8) % 2;
    if (this.spec.update) this.spec.update(this, dt, game);
  };
  Npc.prototype.draw = function (ctx, ox, oy) {
    this.drawSprite(ctx, this.spec.sprite || this.type, ox, oy);
  };

  // ---------------------------------------------------------------- Effect (visual only)
  function Effect(sprite, x, y, duration) {
    Entity.call(this, x, y);
    this.sprite = sprite;
    this.t = duration || 0.3;
  }
  Effect.prototype = Object.create(Entity.prototype);
  Effect.prototype.update = function (dt) {
    this.animTime += dt;
    this.t -= dt;
    if (this.t <= 0) this.dead = true;
  };
  Effect.prototype.draw = function (ctx, ox, oy) {
    this.frame = Math.floor(this.animTime * 10) % 2;
    this.drawSprite(ctx, this.sprite, ox, oy);
  };

  Game.Entity = Entity;
  Game.Enemy = Enemy;
  Game.Projectile = Projectile;
  Game.Pickup = Pickup;
  Game.Npc = Npc;
  Game.Effect = Effect;
})();
