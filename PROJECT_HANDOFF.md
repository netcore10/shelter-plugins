# shelter-plugins: Project Handoff (2026-10-25)

## What it is
Discord client mods for [shelter](https://shelter.uwu.network), mainly used on Dorion. Built with lune, deployed to GitHub Pages by Actions. Repo: `github.com/netcore10/shelter-plugins`. Install URLs follow the pattern `https://netcore10.github.io/shelter-plugins/<plugin>`.

## Plugins
| Plugin | What it does | State |
|---|---|---|
| `friend-tags` | Tag chips on users | Shipped. Also an additional working dir in Claude Code. |
| `radio` | Internet radio in the toolbar (LISTEN.moe, r/a/dio, Nightwave, Nightride, SomaFM, custom streams), media keys | Shipped |
| `nav-buttons` | Back/forward buttons for clients that lack them | Shipped |
| `keybinds` | Unblocks Dorion's Custom Keybinds panel (Dorion #492) | **Uncommitted rewrite.** `actions.js`, `settings.jsx` and `styles.js` are deleted, `index.jsx` is cut down by about 90 lines, and the description changed. It looks like it went from a full mouse4/5 binder to a minimal panel fix. Verify and commit. |
| `buddy` ("Wumpus") | Animated buddy that floats over Discord, talks with TTS, reacts to mentions | **New, untracked.** Has songs, voice and path logic, plus tests (`path.test.mjs`, `voice.test.mjs`). `package.json`/lock changed for it. Not in the README install list yet. |

## Workflow
- `push.bat ["message"]` builds (`npx lune ci`), commits everything, and pushes. Actions then redeploys in about a minute. Reload Discord with Ctrl+R.
- **Read `SHELTER-NOTES.md` before writing plugin code.** It covers hard-won gotchas: `scoped.ui.injectCss`, tight fiber-walk limits, store persistence being top-level only, and never memoising store reads in a shared root. `SHELTER-GUIDE.md` is the general guide.

## Next
1. Run the buddy tests, `node --test plugins/buddy/*.test.mjs`.
2. Check the keybinds change works in Dorion.
3. Add buddy to the README.
4. `push.bat`. It runs `git add -A`, but `.gitignore` already covers `node_modules/` and `push.bat` itself.
