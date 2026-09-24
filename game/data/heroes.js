// Playable heroes, picked on the select screen (engine/select.js) after the title.
// The player takes its sprite base, hearts and speed from the chosen hero.
//   sprite: base name -> <sprite>_down_0, _up_0, _right_0 (+ _1 walk frames) in data/sprites.js
//   hearts: starting max hearts   speed: px/second (the default hero is 80)
//   title/move/desc: shown in the select screen's text box; desc must fit 27 characters
// Pick one for testing with ?hero=<id>; ?select=1 opens the select screen directly.
(function () {
  var HEROES = [
    {
      id: 'jamie', name: 'JAMIE', title: 'FULL-STACK KNIGHT', sprite: 'player',
      hearts: 3, speed: 80,
      move: 'HOTFIX SLASH', desc: 'BALANCED. SHIPS TO PROD.',
    },
    {
      id: 'mark', name: 'MARK', title: 'BACKEND TANK', sprite: 'mark',
      hearts: 4, speed: 70,
      move: 'DATABASE WALL', desc: 'EXTRA HEART. A BIT SLOWER.',
    },
    {
      id: 'chris', name: 'CHRIS', title: 'FRONTEND SPEEDSTER', sprite: 'chris',
      hearts: 3, speed: 96,
      move: 'HOT RELOAD', desc: 'FAST FEET. SHIPS BY NOON.',
    },
  ];
  var KEY = 'hackathon.hero';
  HEROES.byId = function (id) {
    for (var i = 0; i < HEROES.length; i++) if (HEROES[i].id === id) return HEROES[i];
    return null;
  };
  // Last chosen hero for this browser; the select cursor starts on it.
  HEROES.recall = function () { try { return HEROES.byId(localStorage.getItem(KEY)); } catch (e) { return null; } };
  HEROES.remember = function (h) { try { localStorage.setItem(KEY, h.id); } catch (e) {} };
  Game.Heroes = HEROES;
})();
