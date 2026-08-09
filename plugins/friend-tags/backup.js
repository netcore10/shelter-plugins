// ---------------------------------------------------------------------------
// A private IndexedDB mirror of the tag data.
//
// shelter keeps plugin data under the plugin's ID, and the dev-mode plugin's ID
// is a throwaway that shelter DELETES when dev mode stops:
//
//   if (id === devModeReservedId) delete pluginStorages[id];   // plugins.tsx
//
// It also changes when you move from the dev build to the installed one. Either
// way the tags vanish, which is what keeps wiping them on update.
//
// This database belongs to us, is keyed by nothing but its own name, and is
// never touched by shelter — so it survives plugin reloads, dev mode ending,
// reinstalls, and moving between the dev and published versions.
// ---------------------------------------------------------------------------

const DB_NAME = "friend-tags";
const STORE = "data";
const KEY = "snapshot";

function open() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore(mode, run) {
  const db = await open();

  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const request = run(tx.objectStore(STORE));

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}

/** Write the whole snapshot. Debounced by the caller. */
export async function saveSnapshot(snapshot) {
  try {
    await withStore("readwrite", (store) =>
      store.put({ ...snapshot, savedAt: Date.now() }, KEY),
    );
    return true;
  } catch {
    return false;
  }
}

export async function loadSnapshot() {
  try {
    return await withStore("readonly", (store) => store.get(KEY));
  } catch {
    return undefined;
  }
}

export async function clearSnapshot() {
  try {
    await withStore("readwrite", (store) => store.delete(KEY));
    return true;
  } catch {
    return false;
  }
}
