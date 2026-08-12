Friend tags, Radio, TBD was made by ai for personal use, my friend wanted to use it so i updated it here. Feel free to edit/modify/and clean up this shitshow and use it as you will.
# shelter-plugins

My plugins for [shelter](https://shelter.uwu.network).

## Install

Add either URL in shelter's plugin list:

```
https://netcore10.github.io/shelter-plugins/friend-tags
https://netcore10.github.io/shelter-plugins/radio
```

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
controls so the media keys pause it.

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
