// Game state machine, main update/render, room loading, collisions.
// States: 'title' | 'play' | 'scroll' | 'fade' | 'pause' | 'gameover' | 'win'
// The running game is available in the browser console as `Game.current`.
(function () {
  var C = Game.Config;
  var U = Game.Util;
  var Input = Game.Input;

  // Draw order (lower first)
  function layer(e) {
    if (e instanceof Game.Pickup) return 0;
    if (e instanceof Game.Npc) return 1;
    if (e instanceof Game.Enemy) return 2;
    if (e instanceof Game.Player) return 3;
    if (e instanceof Game.Projectile) return 4;
    return 5;
  }

  function GameState(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
    this.state = 'title';
    this.time = 0;
    this.shake = 0; // seconds of screen shake left (bombs)
    this.debug = C.DEBUG;
    this.params = new URLSearchParams(window.location.search);
    if (this.params.get('debug')) this.debug = true;
    this.newGame();
    this.state = 'title';
    // ?room=<id> skips the title screen and starts there (handy for testing).
    if (this.params.get('room')) this.state = 'play';
    if (this.params.get('select')) this.openSelect(); // ?select=1 opens the hero select screen
  }

  var G = GameState.prototype;

  // ---------------------------------------------------------------- lifecycle
  G.newGame = function () {
    this.flags = {};
    this.inventory = { rupees: 0, keys: 0, bombs: 0, lives: 0 };
    this.hero = this.hero || Game.Heroes.byId(this.params.get('hero')) || Game.Heroes.recall() || Game.Heroes[0];
    this.player = new Game.Player(0, 0, this.hero);
    if (this.params.get('sword')) this.player.hasSword = true;
    if (this.params.get('sword') === '2') this.player.swordDamage = 2; // ?sword=2 starts with the white sword
    var start = this.params.get('room') || C.START_ROOM;
    this.loadRoom(start, C.START_TILE.x, C.START_TILE.y);
  };

  // Continue after game over: keep progress, refill hearts, back to the start.
  G.continueGame = function () {
    this.player.hp = Math.max(6, Math.floor(this.player.maxHp / 2));
    this.player.invuln = 0;
    this.player.kb = null;
    this.loadRoom(C.START_ROOM, C.START_TILE.x, C.START_TILE.y);
    this.state = 'play';
  };

  G.gameOver = function () {
    // An extra life: spend it and fade back in where you entered this room, hearts full.
    if (this.inventory.lives > 0) {
      this.inventory.lives--;
      this.player.hp = this.player.maxHp;
      this.player.invuln = 0;
      this.player.kb = null;
      this.pendingSay = 'EXTRA LIFE USED!';
      var e = this.entry || C.START_TILE;
      this.warp(this.room.id, e.x, e.y, 'gameover');
      return;
    }
    this.state = 'gameover';
    this.stateTime = 0;
    Game.Audio.play('gameover');
  };

  G.win = function () {
    this.state = 'win';
    this.stateTime = 0;
  };

  // ---------------------------------------------------------------- rooms
  G.loadRoom = function (id, tx, ty) {
    this.room = Game.World.instantiate(id, this.flags);
    if (tx !== undefined) {
      this.player.x = tx * C.TILE;
      this.player.y = ty * C.TILE;
      this.entry = { x: tx, y: ty }; // where an extra life puts you back
    }
    this.enterRoom();
  };

  G.enterRoom = function () {
    var def = this.room.def;
    var self = this;
    this.flags['visited:' + this.room.id] = true;
    this.entities = [];
    this.message = null;
    if (this.pendingSay) { this.say(this.pendingSay); this.pendingSay = null; }
    this.rewardGiven = false;
    this.player.onWarp = true;

    (def.items || []).forEach(function (it) {
      if (it.flag && self.flags[it.flag]) return;
      self.spawn(new Game.Pickup(it.type, it.x * C.TILE, it.y * C.TILE, { flag: it.flag, price: it.price }));
    });
    (def.npcs || []).forEach(function (n) {
      self.spawn(new Game.Npc(n.type, n.x * C.TILE, n.y * C.TILE, n));
      if (n.text) self.say(n.text);
    });
    var enemies = def.enemies || [];
    // Don't respawn enemies in rooms whose reward was already claimed.
    if (def.clearReward && this.flags[def.clearReward.flag]) enemies = [];
    enemies.forEach(function (en) {
      var spec = typeof en === 'string' ? { type: en } : en;
      if (!Game.Enemies.get(spec.type)) return;
      var tile = spec.x !== undefined ? { x: spec.x, y: spec.y } : self.freeTile();
      if (tile) self.spawn(new Game.Enemy(spec.type, tile.x * C.TILE, tile.y * C.TILE));
    });
    this.hadEnemies = this.entities.some(function (e) { return e instanceof Game.Enemy; });
    if (def.onEnter) def.onEnter(this, this.room);
  };

  // A random walkable tile away from the player and other entities.
  G.freeTile = function () {
    var p = this.player.center();
    for (var tries = 0; tries < 200; tries++) {
      var tx = Math.floor(U.rand(1, C.COLS - 1)), ty = Math.floor(U.rand(1, C.ROWS - 1));
      var t = this.room.tileInfoAt(tx, ty);
      if (!t || t.solid || t.warp) continue;
      var cx = tx * C.TILE + 8, cy = ty * C.TILE + 8;
      if (Math.abs(cx - p.x) + Math.abs(cy - p.y) < 64) continue;
      var taken = this.entities.some(function (e) { return Math.abs(e.x - tx * C.TILE) < 16 && Math.abs(e.y - ty * C.TILE) < 16; });
      if (!taken) return { x: tx, y: ty };
    }
    return null;
  };

  G.startScroll = function (dir) {
    var nextId = Game.World.neighbor(this.room.id, dir);
    var next = Game.World.instantiate(nextId, this.flags);
    var p = this.player;
    var from = { x: p.x, y: p.y };
    var to = { x: p.x, y: p.y };
    if (dir === 'right') to.x = -p.hb.x;
    if (dir === 'left') to.x = C.WIDTH - p.hb.x - p.hb.w;
    if (dir === 'down') to.y = -p.hb.y;
    if (dir === 'up') to.y = C.ROOM_HEIGHT - p.hb.y - p.hb.h;
    this.scroll = { dir: dir, t: 0, from: from, to: to, next: next };
    this.entities = [];
    this.message = null;
    this.state = 'scroll';
  };

  G.warp = function (roomId, tx, ty, sound) {
    if (!Game.World.rooms[roomId]) { console.warn('[Game] warp to unknown room "' + roomId + '"'); return; }
    this.fade = { t: 0, to: roomId, tx: tx, ty: ty, switched: false };
    this.state = 'fade';
    Game.Audio.play(sound || 'stairs');
  };

  // ---------------------------------------------------------------- helpers used by entities/data
  G.spawn = function (e) { this.entities.push(e); return e; };

  G.enemies = function () {
    return this.entities.filter(function (e) { return e instanceof Game.Enemy && !e.dead; });
  };

  G.dropLoot = function (enemy) {
    var table = enemy.spec.drops;
    if (!table) return;
    var type = U.weighted(table);
    if (type) this.spawn(new Game.Pickup(type, enemy.x, enemy.y, { lifetime: 8 }));
  };

  G.say = function (text) {
    this.message = { text: text, chars: 0, t: 0 };
  };

  // ---------------------------------------------------------------- update
  G.update = function (dt) {
    Input.update();
    this.time += dt;
    this.stateTime = (this.stateTime || 0) + dt;

    if (Input.pressed('debug')) this.debug = !this.debug;
    if (this.shake > 0) this.shake -= dt;
    if (this.state === 'play' || this.state === 'pause') Game.Cheats.update(this); // cheat codes, see engine/cheats.js

    switch (this.state) {
      case 'title':
        if (Input.pressed('start') || Input.pressed('attack')) { Game.Audio.unlock(); this.openSelect(); }
        break;
      case 'select':
        this.updateSelect(dt);
        break;
      case 'play':
        if (Input.pressed('start')) { this.state = 'pause'; break; }
        this.updatePlay(dt);
        break;
      case 'pause':
        if (Input.pressed('start')) this.state = 'play';
        break;
      case 'scroll':
        this.updateScroll(dt);
        break;
      case 'fade':
        this.updateFade(dt);
        break;
      case 'gameover':
        if (this.stateTime > 1 && Input.pressed('start')) this.continueGame();
        break;
      case 'win':
        if (this.stateTime > 1 && Input.pressed('start')) { this.newGame(); this.state = 'title'; }
        break;
    }
  };

  G.updatePlay = function (dt) {
    var self = this;
    var p = this.player;
    p.update(dt, this);
    if (this.state !== 'play') return; // player may have triggered a scroll / warp

    this.entities.forEach(function (e) { if (!e.dead) e.update(dt, self); });
    this.handleCollisions();
    this.entities = this.entities.filter(function (e) { return !e.dead; });

    // Room cleared?
    var def = this.room.def;
    if (this.hadEnemies && !this.rewardGiven && this.enemies().length === 0) {
      this.rewardGiven = true;
      var r = def.clearReward;
      if (r && !this.flags[r.flag]) {
        this.spawn(new Game.Pickup(r.type, r.x * C.TILE, r.y * C.TILE, { flag: r.flag }));
        Game.Audio.play('door');
      }
      if (def.onClear) def.onClear(this, this.room);
    }

    if (this.message) {
      var m = this.message;
      var before = Math.floor(m.chars);
      m.chars = Math.min(m.text.length, m.chars + dt * 20);
      if (Math.floor(m.chars) > before && m.text[before] !== ' ') Game.Audio.play('text');
    }
  };

  G.handleCollisions = function () {
    var self = this;
    var p = this.player;
    var pBox = p.box();
    var sword = p.swordBox();
    var enemies = this.enemies();

    this.entities.forEach(function (e) {
      if (e.dead) return;
      if (e instanceof Game.Enemy) {
        if (e.spawnTime > 0) return;
        if (sword && U.overlap(sword, e.box())) e.hurt(p.swordDamage, p, self);
        if (!e.dead && U.overlap(pBox, e.box())) p.hurt(e.damage, e, self);
      } else if (e instanceof Game.Projectile) {
        if (e.team === 'player') {
          for (var i = 0; i < enemies.length; i++) {
            var en = enemies[i];
            if (!en.dead && en.spawnTime <= 0 && U.overlap(e.box(), en.box())) {
              en.hurt(e.damage, e, self);
              if (e.onHit) e.onHit(en, self);
              if (!e.pierce) { e.dead = true; break; }
            }
          }
        } else {
          if (sword && U.overlap(sword, e.box())) { e.dead = true; return; } // deflect
          if (U.overlap(pBox, e.box())) { p.hurt(e.damage, e, self); e.dead = true; }
        }
      } else if (e instanceof Game.Pickup) {
        if (U.overlap(pBox, e.box()) || (sword && U.overlap(sword, e.box()))) e.collect(self);
      }
    });
  };

  G.updateScroll = function (dt) {
    var s = this.scroll;
    s.t += dt / C.SCROLL_TIME;
    if (s.t >= 1) {
      this.room = s.next;
      this.player.x = s.to.x;
      this.player.y = s.to.y;
      this.entry = { x: Math.round(s.to.x / C.TILE), y: Math.round(s.to.y / C.TILE) };
      this.scroll = null;
      this.state = 'play';
      this.enterRoom();
    }
  };

  G.updateFade = function (dt) {
    var f = this.fade;
    f.t += dt / C.FADE_TIME;
    if (f.t >= 1 && !f.switched) {
      f.switched = true;
      this.loadRoom(f.to, f.tx, f.ty);
      this.player.dir = 'down';
    }
    if (f.t >= 2) { this.fade = null; this.state = 'play'; }
  };

  // ---------------------------------------------------------------- render
  G.render = function () {
    var ctx = this.ctx;
    var HUD = Game.HUD;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, C.WIDTH, C.HEIGHT);

    if (this.state === 'title') return this.renderTitle(ctx);
    if (this.state === 'select') return this.renderSelect(ctx);

    HUD.draw(ctx, this);

    var oy = C.HUD_HEIGHT;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, oy, C.WIDTH, C.ROOM_HEIGHT);
    ctx.clip();
    if (this.shake > 0) ctx.translate(Math.round(U.rand(-2, 2)), Math.round(U.rand(-2, 2)));

    if (this.state === 'scroll') {
      var s = this.scroll;
      var d = U.DIRS[s.dir];
      var t = s.t;
      var offX = -d.x * C.WIDTH * t, offY = -d.y * C.ROOM_HEIGHT * t;
      Game.World.drawRoom(ctx, this.room, offX, oy + offY);
      Game.World.drawRoom(ctx, s.next, offX + d.x * C.WIDTH, oy + offY + d.y * C.ROOM_HEIGHT);
      var p = this.player;
      var px = p.x, py = p.y;
      // The camera carries the player across, like the NES.
      p.x = s.from.x + (s.to.x - s.from.x) * t;
      p.y = s.from.y + (s.to.y - s.from.y) * t;
      p.draw(ctx, 0, oy);
      p.x = px; p.y = py;
    } else {
      Game.World.drawRoom(ctx, this.room, 0, oy);
      var all = this.entities.concat([this.player]);
      all.sort(function (a, b) { return layer(a) - layer(b); });
      var self = this;
      all.forEach(function (e) { e.draw(ctx, 0, oy); });
      if (this.debug) {
        all.forEach(function (e) { e.drawDebug(ctx, 0, oy, e === self.player ? '#0f0' : '#ff0'); });
        var sw = this.player.swordBox();
        if (sw) { ctx.strokeStyle = '#f00'; ctx.strokeRect(sw.x + 0.5, oy + sw.y + 0.5, sw.w - 1, sw.h - 1); }
      }
      HUD.drawMessage(ctx, this);
    }
    ctx.restore();

    if (this.state === 'fade') {
      var f = this.fade;
      ctx.fillStyle = 'rgba(0,0,0,' + (f.t < 1 ? f.t : 2 - f.t) + ')';
      ctx.fillRect(0, oy, C.WIDTH, C.ROOM_HEIGHT);
    }
    if (this.state === 'pause') this.renderOverlay(ctx, 'PAUSED', ['ARROWS/WASD  MOVE', 'SPACE/J  SWORD', 'K/X  BOMB', 'ENTER  RESUME', '`  DEBUG VIEW']);
    if (this.state === 'gameover') this.renderOverlay(ctx, 'GAME OVER', ['PRESS ENTER TO CONTINUE'], '#d82800');
    if (this.state === 'win') this.renderOverlay(ctx, 'YOU WIN!', ['YOU RECOVERED THE TRIFORCE', '', 'RUPEES: ' + this.inventory.rupees, '', 'PRESS ENTER'], '#f8b800');

    if (this.debug) {
      HUD.text(ctx, this.room.id + '  ' + Math.round(this.player.x) + ',' + Math.round(this.player.y), 2, C.HEIGHT - 10, { color: '#0f0' });
    }
  };

  G.renderOverlay = function (ctx, title, lines, color) {
    var HUD = Game.HUD;
    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.fillRect(0, C.HUD_HEIGHT, C.WIDTH, C.ROOM_HEIGHT);
    HUD.text(ctx, title, C.WIDTH / 2, C.HUD_HEIGHT + 40, { align: 'center', color: color || '#fcfcfc' });
    lines.forEach(function (l, i) {
      HUD.text(ctx, l, C.WIDTH / 2, C.HUD_HEIGHT + 70 + i * 12, { align: 'center' });
    });
  };

  G.renderTitle = function (ctx) {
    var HUD = Game.HUD;
    var img = Game.Sprites.get('triforce');
    ctx.save();
    ctx.translate(C.WIDTH / 2, 70);
    ctx.scale(4, 4);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    ctx.restore();
    var lines = HUD.wrap(C.TITLE, 24);
    lines.forEach(function (l, i) {
      HUD.text(ctx, l, C.WIDTH / 2, 110 + i * 14, { align: 'center', color: '#f8b800' });
    });
    if (Math.floor(this.time * 2) % 2 === 0) {
      HUD.text(ctx, C.SUBTITLE, C.WIDTH / 2, 160, { align: 'center' });
    }
    HUD.text(ctx, 'ARROWS MOVE  SPACE SWORD', C.WIDTH / 2, 196, { align: 'center', color: '#a0a0a0' });
    HUD.text(ctx, 'ENTER PAUSE', C.WIDTH / 2, 208, { align: 'center', color: '#a0a0a0' });
  };

  Game.GameState = GameState;
})();
