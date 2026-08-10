
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
