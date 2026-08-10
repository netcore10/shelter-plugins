
This was made by ai for personal use, my friend wanted to use it so i updated it here.
# shelter-plugins

My plugins for [shelter](https://shelter.uwu.network).

## Install

Add this URL in shelter's plugin list:

```
https://netcore10.github.io/shelter-plugins/friend-tags
```
## Friend Tags

Add custom tags to people from your friends list, then see those tags practically everywhere

Right-click anyone on those surfaces for an **Edit tags** entry in the context
menu.

Tags are shared labels, not per-person notes: "close friend" looks identical on
everyone who has it, and restyling it restyles it everywhere at once.

### Tag text

Tags render Discord emoji and inline markdown.

### Multiple accounts

**Separate tags per account** in settings gives each Discord account its own
tags. Turning it on copies your current tags to the account you're logged into,
and never touches the shared set — switch it off to get them back.

If the account ID can't be read for any reason, it falls back to the shared set
rather than showing an empty one, since "all my tags vanished" is a much worse
failure than "briefly showing the wrong set".

### Styling

Every tag gets its own look, via **Style** in the tag editor or tag manager:

- **Fill** — solid colour, or a multi-stop gradient at any angle, with presets
  (Sunset, Vaporwave, Goth, Toxic, Blood, Ocean, Gold, Mono)
- **Text** — auto black/white for contrast, or pick your own
- **Font** — Discord's own faces, mono, serif, comic, handwriting, impact, or any
  custom `font-family`. Remote web fonts aren't offered because Discord's CSP
  blocks them.
- **Weight** 400–900 and italic
- **Animation** — breathe, wiggle, pulse, glow, float, shake, rainbow, shimmer,
  each with a 0.25×–3× speed

Unstyled tags fall back to a stable colour derived from the tag's name, so they
never all come out the same.

Animations have a master off switch in settings, and `prefers-reduced-motion` is
always honoured regardless of your settings.

### Where the data lives

In `shelter.plugin.store`, so it persists across restarts and rides along with
shelter's own storage:

```js
store.tags   // { [userId]: string[] }
store.colors // { [tagName]: "#rrggbb" }   — plain colours, kept for old backups
store.styles // { [tagName]: StyleConfig } — gradients, fonts, animations
```

## Development

```sh
npm install
npm run dev            # or: npx lune dev plugins/friend-tags
```

Publishing is just `npx lune ci` to check it builds, then a normal commit and
push to `main` — GitHub Actions redeploys in about a minute. Reload Discord with
Ctrl+R to pick up the new version.

Enable **Lune Dev Mode** in shelter's settings first so lune can connect. The
plugin hot-reloads on save.

To build and install locally:

```sh
npx lune ci
npx http-server dist/ --cors
```

Then add `http://localhost:8080/friend-tags` in shelter's plugin list.

> The template is written for [pnpm](https://pnpm.io); `npm` works fine too, which
> is why each plugin folder carries its own `package.json`.

### If a surface stops working

Discord renames its CSS classes regularly. Every selector this plugin depends on
lives in one table at the top of
[`plugins/friend-tags/inject.jsx`](plugins/friend-tags/inject.jsx) — that's the
only place to touch. Turn on **Debug logging** in settings to get a console
warning whenever a user can't be resolved from an element.

### A note on fiber walking

`reactFiberWalker` recurses through **siblings** as well as parents, so its
default `recursionLimit` of 100 will happily wander out of the row you started
from and into an unrelated part of the page — where it finds a real user object
and confidently returns the wrong person. That's why every surface here caps the
walk (`DEFAULT_DEPTH`), and why the DM list skips fiber walking altogether in
favour of reading the channel ID out of the row's `href`.
