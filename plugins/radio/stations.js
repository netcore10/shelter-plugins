import { store } from "./data";

// ---------------------------------------------------------------------------
// The station registry.
//
// Every endpoint here was checked against the live service before it went in.
// A station is:
//
//   id        stable key; it's what gets persisted as the current station
//   name      what the user sees
//   group     heading it sits under in the station list
//   accent    colour used for its tile and the panel's highlights
//   logo      artwork shown when the station has no per-track art
//   streams   qualityId -> URL. Stations with one stream just have one entry.
//   provider  how to find out what's playing; see providers/
//
// None of these streams send CORS headers, so Web Audio can't analyse them —
// that's why the toolbar bars are a decorative animation rather than a real
// spectrum.
// ---------------------------------------------------------------------------

// Written out rather than generated from a path template. Building the K-POP
// URLs by pattern produced https://listen.moe/kpop/opus, which exists, returns
// valid Ogg, and serves the *J-POP* stream — `icy-name: JPOP Stream`. Switching
// to K-POP played J-POP with a straight face. There is no K-POP Opus endpoint.
//
// Every URL below was confirmed by its Icecast `icy-name`.
const listenmoe = (channel, name, gateway, streams) => ({
  id: `listenmoe-${channel}`,
  name,
  group: "LISTEN.moe",
  accent: "#ff015b",
  logo: null, // the gateway supplies album art for every track
  streams,
  provider: { type: "listenmoe", gateway },
});

const somafm = (channel, name, genre) => ({
  id: `somafm-${channel}`,
  name,
  group: "SomaFM",
  genre,
  accent: "#d4633a",
  logo: `https://api.somafm.com/logos/256/${channel}256.png`,
  streams: { mp3: `https://ice1.somafm.com/${channel}-128-mp3` },
  provider: { type: "somafm", channel },
});

const nightride = (channel, name) => ({
  id: `nightride-${channel}`,
  name,
  group: "Nightride FM",
  genre: "synthwave",
  accent: "#ff2e97",
  logo: null,
  streams: { mp3: `https://stream.nightride.fm/${channel}.mp3` },
  provider: { type: "nightride", channel },
});

export const BUILT_IN = [
  listenmoe("jpop", "J-POP", "wss://listen.moe/gateway_v2", {
    opus: "https://listen.moe/opus",
    vorbis: "https://listen.moe/stream",
    mp3: "https://listen.moe/fallback",
  }),
  listenmoe("kpop", "K-POP", "wss://listen.moe/kpop/gateway_v2", {
    // No Opus: the only URL that would serve it is the J-POP stream.
    vorbis: "https://listen.moe/kpop/stream",
    mp3: "https://listen.moe/kpop/fallback",
  }),

  {
    id: "radio-main",
    name: "r/a/dio",
    group: "Anime",
    genre: "anime, j-pop",
    accent: "#3b9ddd",
    logo: null,
    streams: { mp3: "https://relay0.r-a-d.io/main.mp3" },
    provider: { type: "radio" },
  },
  {
    id: "plaza",
    name: "Nightwave Plaza",
    group: "Anime",
    genre: "vaporwave",
    accent: "#b06ede",
    logo: null,
    streams: { mp3: "https://radio.plaza.one/mp3" },
    provider: { type: "plaza" },
  },

  nightride("nightride", "Nightride"),
  nightride("chillsynth", "ChillSynth"),
  nightride("datawave", "Datawave"),
  nightride("spacesynth", "Spacesynth"),
  nightride("darksynth", "Darksynth"),
  nightride("rekt", "REKT"),

  somafm("groovesalad", "Groove Salad", "ambient, downtempo"),
  somafm("dronezone", "Drone Zone", "ambient"),
  somafm("spacestation", "Space Station Soma", "electronic"),
  somafm("lush", "Lush", "vocal electronica"),
  somafm("vaporwaves", "Vaporwaves", "vaporwave"),
  somafm("defcon", "DEF CON Radio", "electronic"),
  somafm("secretagent", "Secret Agent", "lounge, spy jazz"),
  somafm("u80s", "Underground 80s", "80s underground"),
  somafm("indiepop", "Indie Pop Rocks!", "indie pop"),
  somafm("metal", "Metal Detector", "metal"),
];

export const DEFAULT_STATION = "listenmoe-jpop";

// Quality only means anything for LISTEN.moe, which is the one service offering
// the same channel in several codecs. Everything else has a single stream and
// falls through to it.
export const QUALITIES = {
  opus: { label: "Opus", hint: "Best quality for the bandwidth." },
  vorbis: { label: "Vorbis", hint: "Ogg Vorbis. A little heavier." },
  mp3: { label: "MP3", hint: "Most compatible. Use this if a stream is silent." },
};

const QUALITY_ORDER = ["opus", "vorbis", "mp3"];

// Derived-value cache, keyed on the raw string it came from.
//
// The store read itself is deliberately NOT cached — it happens on every call,
// which is what keeps the Solid subscription alive and the UI reactive. Only
// the parse and the station objects built from it are reused, because
// currentStation() sits under several reactive expressions and was otherwise
// re-parsing JSON and rebuilding two dozen objects every time any of them ran.
let cacheRaw = null;
let cacheParsed = [];
let cacheStations = [];

function raw() {
  return typeof store.custom === "string" ? store.custom : "[]";
}

/** The user's own stations, decoded from the store's JSON string. See data.js. */
export function readCustom() {
  const current = raw();
  if (current === cacheRaw) return cacheParsed;

  try {
    const parsed = JSON.parse(current || "[]");
    cacheParsed = Array.isArray(parsed) ? parsed : [];
  } catch {
    // Corrupt or half-written value: an empty list beats a broken settings page.
    cacheParsed = [];
  }

  cacheRaw = current;
  cacheStations = [];
  return cacheParsed;
}

/** Replaces the whole list — the only kind of write the store persists. */
export function writeCustom(list) {
  store.custom = JSON.stringify(list);
}

export function customStations() {
  // readCustom() invalidates this whenever the underlying string changes.
  const list = readCustom();
  if (cacheStations.length || !list.length) return cacheStations;

  cacheStations = list.map((s) => ({
    id: `custom-${s.id}`,
    name: s.name || "Custom stream",
    group: "Yours",
    accent: "#5865f2",
    logo: null,
    custom: true,
    streams: { mp3: s.url },
    // A bare stream URL tells us nothing about what's playing. Icecast's own
    // metadata rides inside the audio connection, which an <audio> element
    // never exposes to script.
    provider: { type: "none" },
  }));

  return cacheStations;
}

export function allStations() {
  const custom = customStations();
  // Overwhelmingly the common case, and it avoids copying the built-in list on
  // every station lookup.
  return custom.length ? [...BUILT_IN, ...custom] : BUILT_IN;
}

export function stationById(id) {
  return allStations().find((s) => s.id === id) ?? null;
}

export function currentStation() {
  return stationById(store.station) ?? stationById(DEFAULT_STATION) ?? BUILT_IN[0];
}

/** The URL to actually play, honouring the quality preference where it exists. */
export function streamUrl(station) {
  const streams = station?.streams ?? {};
  return (
    streams[store.quality] ??
    QUALITY_ORDER.map((q) => streams[q]).find(Boolean) ??
    Object.values(streams)[0] ??
    null
  );
}

/** Which quality buttons to offer for a station — usually none. */
export function qualitiesFor(station) {
  return QUALITY_ORDER.filter((q) => station?.streams?.[q]);
}

export function groupedStations() {
  const groups = new Map();
  for (const station of allStations()) {
    if (!groups.has(station.group)) groups.set(station.group, []);
    groups.get(station.group).push(station);
  }
  return [...groups].map(([name, stations]) => ({ name, stations }));
}
