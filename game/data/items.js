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
