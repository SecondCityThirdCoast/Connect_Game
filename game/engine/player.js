// The player. Movement is 4-directional with NES-style grid alignment so doorways are easy.
(function () {
  var C = Game.Config;
  var P = C.PLAYER;
  var U = Game.Util;
  var Input = Game.Input;

  function Player(x, y, hero) {
    Game.Entity.call(this, x, y);
    this.team = 'player';
    this.hb = { x: 2, y: 6, w: 12, h: 10 }; // lower body, so you can overlap walls with your head
    this.hero = hero || Game.Heroes[0];
    this.sprite = this.hero.sprite || 'player';
    this.speed = this.hero.speed || P.SPEED;
    this.maxHp = (this.hero.hearts || P.MAX_HEARTS) * 2;
    this.hp = this.maxHp;
    this.hasSword = P.START_WITH_SWORD;
    this.swordDamage = P.SWORD_DAMAGE; // the white sword (data/items.js) raises this
    this.attackTime = 0;
    this.walkDist = 0;
    this.onWarp = true; // must step off a warp tile before it can trigger
  }
  Player.prototype = Object.create(Game.Entity.prototype);

  Player.prototype.heal = function (n) { this.hp = Math.min(this.maxHp, this.hp + n); };

  Player.prototype.hurt = function (amount, source, game) {
    if (this.invuln > 0 || game.state !== 'play') return;
    this.hp -= amount;
    this.invuln = P.INVULN_TIME;
    this.attackTime = 0;
    Game.Audio.play('hurt');
    var c = source.center ? source.center() : source;
    this.knockback(c.x, c.y, P.KNOCKBACK, 0.15);
    if (this.hp <= 0) { this.hp = 0; game.gameOver(); }
  };

  // Hitbox of the swinging sword, or null when not attacking.
  Player.prototype.swordBox = function () {
    if (this.attackTime <= 0) return null;
    switch (this.dir) {
      case 'up': return { x: this.x + 5, y: this.y - 12, w: 6, h: 14 };
      case 'down': return { x: this.x + 5, y: this.y + 14, w: 6, h: 14 };
      case 'left': return { x: this.x - 12, y: this.y + 6, w: 14, h: 6 };
      case 'right': return { x: this.x + 14, y: this.y + 6, w: 14, h: 6 };
    }
  };

  Player.prototype.update = function (dt, game) {
    var room = game.room;
    if (this.invuln > 0) this.invuln -= dt;
    if (this.updateKnockback(dt, room)) return;

    if (this.attackTime > 0) {
      this.attackTime -= dt;
      return;
    }

    if (Input.pressed('attack') && game.tryInteract && game.tryInteract()) return; // talk to a vendor
    if (Input.pressed('attack') && this.hasSword) {
      this.attack(game);
      return;
    }
    if (Input.pressed('item') && game.useItem) game.useItem();

    var dir = Input.moveDir();
    if (!dir) return;
    this.dir = dir;
    var d = U.DIRS[dir];
    var step = this.speed * dt;

    // Grid alignment: slide the cross-axis toward the nearest half-tile.
    var HALF = C.TILE / 2;
    if (d.x !== 0) this.tryMove(0, approach(this.y, Math.round(this.y / HALF) * HALF, step) - this.y, room);
    if (d.y !== 0) this.tryMove(approach(this.x, Math.round(this.x / HALF) * HALF, step) - this.x, 0, room);

    var blocked = this.tryMove(d.x * step, d.y * step, room);
    if (blocked) this.tryUnlock(game);

    this.walkDist += step;
    this.frame = Math.floor(this.walkDist / 8) % 2;

    // Leaving the room?
    var b = this.box();
    if (b.x < 0 || b.y < 0 || b.x + b.w > C.WIDTH || b.y + b.h > C.ROOM_HEIGHT) {
      var exitDir = b.x < 0 ? 'left' : b.x + b.w > C.WIDTH ? 'right' : b.y < 0 ? 'up' : 'down';
      if (Game.World.neighbor(room.id, exitDir)) game.startScroll(exitDir);
      else {
        this.x = U.clamp(this.x, -this.hb.x, C.WIDTH - this.hb.x - this.hb.w);
        this.y = U.clamp(this.y, -this.hb.y, C.ROOM_HEIGHT - this.hb.y - this.hb.h);
      }
      return;
    }

    this.checkTileTriggers(game);
  };

  Player.prototype.attack = function (game) {
    this.attackTime = P.ATTACK_TIME;
    Game.Audio.play('sword');
    if (P.SWORD_BEAM && this.hp >= this.maxHp && !game.entities.some(function (e) { return e.kind === 'beam' && !e.dead; })) {
      var d = U.DIRS[this.dir];
      game.spawn(new Game.Projectile({
        x: this.x + 6 + d.x * 12, y: this.y + 6 + d.y * 12, dir: this.dir, kind: 'beam',
        sprite: 'beam', speed: 220, damage: this.swordDamage, team: 'player',
      }));
      Game.Audio.play('beam');
    }
  };

  // Standing on a warp tile (cave / stairs)? Tile-specific onTouch hooks?
  Player.prototype.checkTileTriggers = function (game) {
    var b = this.box();
    var tx = Math.floor((b.x + b.w / 2) / C.TILE);
    var ty = Math.floor((b.y + b.h / 2) / C.TILE);
    var t = game.room.tileInfoAt(tx, ty);
    if (!t) return;
    if (t.onTouch) t.onTouch(game, tx, ty);
    if (t.warp) {
      if (this.onWarp) return;
      var w = game.room.warpAt(tx, ty);
      if (w) game.warp(w.to, w.tx, w.ty);
      else console.warn('[Player] warp tile at ' + tx + ',' + ty + ' in "' + game.room.id + '" has no warp entry');
    } else {
      this.onWarp = false;
    }
  };

  // Bumped into something solid -- is it a locked door we can open?
  Player.prototype.tryUnlock = function (game) {
    var d = U.DIRS[this.dir];
    var b = this.box();
    var probe = { x: b.x + d.x * 2, y: b.y + d.y * 2, w: b.w, h: b.h };
    var T = C.TILE;
    for (var ty = Math.floor(probe.y / T); ty <= Math.floor((probe.y + probe.h - 0.01) / T); ty++) {
      for (var tx = Math.floor(probe.x / T); tx <= Math.floor((probe.x + probe.w - 0.01) / T); tx++) {
        var t = game.room.tileInfoAt(tx, ty);
        if (t && t.locked && game.inventory.keys > 0) {
          game.inventory.keys--;
          openDoor(game.room, tx, ty, game.room.tileAt(tx, ty));
          Game.Audio.play('door');
          return;
        }
      }
    }
  };

  Player.prototype.draw = function (ctx, ox, oy) {
    if (this.invuln > 0 && Math.floor(this.invuln * 20) % 2) return; // blink
    var attacking = this.attackTime > 0;
    var savedFrame = this.frame;
    if (attacking) this.frame = 0;
    // Draw sword behind the player when facing up, in front otherwise.
    if (attacking && this.dir === 'up') this.drawSword(ctx, ox, oy);
    this.drawSprite(ctx, this.sprite, ox, oy);
    if (attacking && this.dir !== 'up') this.drawSword(ctx, ox, oy);
    this.frame = savedFrame;
  };

  Player.prototype.drawSword = function (ctx, ox, oy) {
    var s = this.swordBox();
    var S = Game.Sprites;
    switch (this.dir) {
      case 'up': S.draw(ctx, 'sword_up', ox + s.x, oy + s.y - 1); break;
      case 'down': S.draw(ctx, 'sword_down', ox + s.x, oy + s.y - 1); break;
      case 'right': S.draw(ctx, 'sword_right', ox + s.x - 2, oy + s.y); break;
      case 'left': S.draw(ctx, 'sword_right', ox + s.x, oy + s.y, { flip: true }); break;
    }
  };

  // Opens the locked tile and any touching tiles of the same kind (double doors = one key).
  function openDoor(room, tx, ty, ch) {
    if (room.tileAt(tx, ty) !== ch) return;
    room.setTile(tx, ty, Game.Tiles.get(ch).opensTo || Game.Tiles.DEFAULT, true);
    openDoor(room, tx + 1, ty, ch);
    openDoor(room, tx - 1, ty, ch);
    openDoor(room, tx, ty + 1, ch);
    openDoor(room, tx, ty - 1, ch);
  }

  function approach(v, target, step) {
    if (v < target) return Math.min(target, v + step);
    if (v > target) return Math.max(target, v - step);
    return v;
  }

  Game.Player = Player;
})();
