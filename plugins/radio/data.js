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

// Custom stations live as a JSON string, not an array.
//
// shelter's store hands nested values back as proxies, and reading an array
// straight off it trips its raw-object guard — "Please use proxy object",
// followed by a throw from inside the getter. Every station lookup goes through
// this, so it took the entire settings panel down with it.
//
// A string is a plain top-level scalar, which is the one shape the store
// promises to persist and read back intact.
try {
  if (typeof store.custom !== "string") store.custom = "[]";
} catch {
  // Reading it is what throws, so an older array value can only be replaced.
  store.custom = "[]";
}

export { store };
