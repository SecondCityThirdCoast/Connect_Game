# Legend of the Hackathon

A Zelda (NES) style action-adventure. It's plain JavaScript on a canvas with no build step and no dependencies.

## Play locally
Double-click `index.html`, or serve the folder (`python -m http.server`) and open http://localhost:8000.

**Controls:** Arrows/WASD move · Space/J/Z sword · Enter pause · `` ` `` debug hitboxes · gamepad supported.

**Current content:** a 3×3 overworld, a sword cave with an old man, a 4-room dungeon with a key,
a locked door, a mini-boss and the Triforce. There are 5 enemy types, 8 items, room-scroll
transitions, warps, a heart container, a sword beam at full health, and game over/continue.

## Testing shortcuts
- `index.html?room=d_boss&sword=1&debug=1`: jump to a room with the sword and hitboxes shown
- `node tools/check.js`: validate all maps and data (run after every edit)
- Browser console: `Game.current` is the live game state

## WordPress
The repo root is a WordPress plugin.
1. Run `powershell tools/build-plugin.ps1`. It creates `dist/hackathon-quest.zip`.
   You can also zip `hackathon-quest.php` and `game/` into a `hackathon-quest` folder yourself.
2. In WordPress, go to Plugins → Add New → Upload Plugin, upload the zip, and activate it.
3. Add the shortcode `[hackathon_quest]` to any page. Players click the game to focus it.

## Hacking on it
See [AGENTS.md](AGENTS.md) for the file map and recipes: add a room, enemy, item, tile, NPC, sound, or sprite.
`CLAUDE.md` imports it, so Claude Code and Codex both pick it up automatically.
