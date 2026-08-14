Friend tags, Radio, TBD was made by ai for personal use, my friend wanted to use it so i updated it here. Feel free to edit/modify/and clean up this shitshow and use it as you will.
# shelter-plugins

My plugins for [shelter](https://shelter.uwu.network).

## Install

Add any of these URLs in shelter's plugin list:

```
https://netcore10.github.io/shelter-plugins/friend-tags
https://netcore10.github.io/shelter-plugins/radio
https://netcore10.github.io/shelter-plugins/nav-buttons
```

## Back & Forward

Adds the back and forward navigation buttons from the Discord desktop app to
clients that don't have them, in their usual spot at the top left.

Useful on clients like Dorion, which route navigation through normal browser
history — the same thing your mouse's back and forward buttons already do — but
don't draw the buttons themselves.

The plugin skips injecting entirely on a client that already has the buttons, so
it's safe to leave enabled everywhere.

Both buttons are always live — they don't grey out at the ends of the history
stack. Nothing exposes the position needed to do that honestly: `history` has a
length but no index, `popstate` doesn't say which direction it moved, and this
client's router keeps no index of its own. Tracking it meant patching
`pushState` and `replaceState` to stamp every entry, which is a lot of
machinery whose only failure mode was grey­ing out a button that would have
worked. A press at the end of the stack just does nothing instead.

## Radio

An internet radio in Discord's toolbar. The broadcast icon sits next to Inbox
and Help; clicking it opens a player.

Stations, each with live now-playing info pulled from the station's own API:

| Station | What you get |
|---|---|
| **LISTEN.moe** — J-POP, K-POP | Album art, both scripts, progress, listener count, who requested the track |
| **r/a/dio** | Anime and J-pop, progress, listener count, the DJ when one is on air |
| **Nightwave Plaza** | Vaporwave, album art, progress, listener count |
| **Nightride FM** ×6 | Synthwave — Nightride, ChillSynth, Datawave, Spacesynth, Darksynth, REKT |
| **SomaFM** ×10 | Groove Salad, Drone Zone, Space Station, Lush, Vaporwaves, DEF CON, Secret Agent, Underground 80s, Indie Pop Rocks!, Metal Detector |

You can add any other stream in settings — a direct Icecast or SHOUTcast MP3,
AAC or Ogg URL. Those play fine but show no track info: a bare stream carries
its metadata inside the audio connection, where an `<audio>` element never
exposes it to the page.

Other settings: volume, romanised vs original titles, stream quality for
LISTEN.moe (Opus, Vorbis or MP3), and whether to drive your system's media
controls.

### Media keys

**Use system media controls** needs the client to register with the OS, which
not every client does. Dorion on its own doesn't — Windows never shows a media
control for it, for the radio or for any other audio.

Equicord's **WebPWA** plugin fixes that: it makes Discord installable as an app
(PWA), which brings notification badges, global key-binds and Discord's custom
title bar with it. With that enabled, media keys and headset buttons reach the
radio.

Pausing deliberately keeps the audio element loaded rather than tearing it down.
Dropping the source ends the OS media session, and the play key would then have
nothing to resume — which matters most as a PWA, where there may be no window to
click. Resuming still starts from live, because play always sets a fresh source.

The connection to a station's API is only held while you're listening or have
the panel open, so an idle client isn't polling anything.

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
