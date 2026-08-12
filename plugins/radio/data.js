const {
  plugin: { store },
} = shelter;

// Defaults.
//
// Only top-level writes are persisted, which is why everything here is either a
// scalar or an array that gets replaced wholesale rather than mutated.
store.station ??= "listenmoe-jpop";
store.quality ??= "opus"; // only meaningful where a station offers a choice
store.volume ??= 35; // 0–100, kept integral for the Slider
store.muted ??= false;
store.romaji ??= true; // prefer romanised titles where the station provides them
store.mediaSession ??= true; // publish to the OS media controls
store.custom ??= []; // [{ id, name, url }]

export { store };
