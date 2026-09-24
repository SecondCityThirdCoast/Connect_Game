// Items that can be picked up. Place them in rooms (data/rooms.js `items`) or drop them
// from enemies (data/enemies.js `drops`).
//   sprite:      sprite name
//   sound:       Game.Audio sound on pickup (default 'pickup')
//   message:     optional text shown on pickup
//   onPickup(game, player): apply the effect. Return false to refuse the pickup.
(function () {
  var I = Game.Items;

  I.define('heart', {
    sprite: 'heart',
    sound: 'heart',
    onPickup: function (game, p) { p.heal(2); },
  });

  I.define('heart_container', {
    sprite: 'heart_container',
    sound: 'item',
    message: 'YOUR LIFE GROWS!',
    onPickup: function (game, p) { p.maxHp += 2; p.hp = p.maxHp; },
  });

  I.define('rupee', {
    sprite: 'rupee',
    sound: 'rupee',
    onPickup: function (game) { game.inventory.rupees = Math.min(255, game.inventory.rupees + 1); },
  });

  I.define('rupee_blue', {
    sprite: 'rupee_blue',
    sound: 'rupee',
    onPickup: function (game) { game.inventory.rupees = Math.min(255, game.inventory.rupees + 5); },
  });

  I.define('key', {
    sprite: 'key',
    onPickup: function (game) { game.inventory.keys++; },
  });

  I.define('bomb', {
    sprite: 'bomb',
    onPickup: function (game) { game.inventory.bombs = Math.min(8, game.inventory.bombs + 4); },
  });

  I.define('sword', {
    sprite: 'sword_item',
    sound: 'item',
    message: 'YOU GOT THE SWORD! PRESS SPACE TO SWING.',
    onPickup: function (game, p) { p.hasSword = true; },
  });

  I.define('triforce', {
    sprite: 'triforce',
    sound: 'item',
    onPickup: function (game) { game.win(); },
  });

  // Treasure chest: opens on touch and prints what was inside. Random chests appear on room entry
  // (Config.CHEST.CHANCE, once per room). Place one with { type: 'chest', x, y, flag: 'chest_x' } and
  // add loot: 'key' to fix its contents; otherwise it rolls this table (weights are relative).
  var CHEST_LOOT = [
    { weight: 3, value: { item: 'rupee', n: 5, text: '5 RUPEES' } },
    { weight: 2, value: { item: 'rupee_blue', n: 2, text: '10 RUPEES' } },
    { weight: 2, value: { item: 'heart', n: 1, text: 'A HEART' } },
    { weight: 2, value: { item: 'bomb', n: 1, text: '4 BOMBS' } },
    { weight: 1.5, value: { item: 'key', n: 1, text: 'A KEY' } },
    { weight: 0.6, value: { item: 'life', n: 1, text: 'AN EXTRA LIFE' } },
    { weight: 0.4, value: { item: 'heart_container', n: 1, text: 'A HEART CONTAINER' } },
    { weight: 1.5, value: null }, // empty
  ];
  Game.CHEST_LOOT = CHEST_LOOT;
  function lootEntry(item) {
    for (var i = 0; i < CHEST_LOOT.length; i++) if (CHEST_LOOT[i].value && CHEST_LOOT[i].value.item === item) return CHEST_LOOT[i].value;
    return { item: item, n: 1, text: 'A ' + item.toUpperCase().replace(/_/g, ' ') };
  }
  I.define('chest', {
    sprite: 'chest',
    sound: 'chest',
    loot: CHEST_LOOT,
    onPickup: function (game, p, pickup) {
      var got = pickup && pickup.loot ? lootEntry(pickup.loot) : Game.Util.weighted(CHEST_LOOT);
      var x = pickup ? pickup.x : p.x, y = pickup ? pickup.y : p.y;
      game.spawn(new Game.Npc('chest_open', x, y)); // the empty chest stays until you leave
      if (!got) { Game.Audio.play('deny'); game.say('THE CHEST IS EMPTY!'); return; }
      var spec = Game.Items.get(got.item);
      for (var i = 0; i < (got.n || 1); i++) if (spec && spec.onPickup) spec.onPickup(game, p);
      Game.Audio.play(spec && spec.sound ? spec.sound : 'item');
      game.say('YOU FOUND ' + got.text + '!');
    },
  });

  // Sold in the shop. Spent automatically when your hearts run out: you respawn where you entered the room.
  I.define('life', {
    sprite: 'doll',
    sound: 'item',
    message: 'AN EXTRA LIFE!',
    onPickup: function (game) { game.inventory.lives = Math.min(9, game.inventory.lives + 1); },
  });

  // Level-2 reward: sword upgrade. engine/player.js reads p.swordDamage.
  I.define('sword_white', {
    sprite: 'sword_white',
    sound: 'item',
    message: 'THE WHITE SWORD! IT STRIKES TWICE AS HARD.',
    onPickup: function (game, p) { p.hasSword = true; p.swordDamage = 2; },
  });
})();
