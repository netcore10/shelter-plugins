const {
  plugin: { store, scoped },
  flux: { storesFlat: { ChannelStore, SelectedChannelStore, FavoriteStore } },
  http,
  ui: { Button, showToast },
  solid: { For, Show },
} = shelter;

// ponytail: always-on logging while this is being debugged; strip once stable
const log = (...a) => console.log("%c[keep-threads]", "color:#5865f2;font-weight:bold", ...a);
const guard = (name, fn) => (...args) => {
  try {
    return fn(...args);
  } catch (e) {
    console.error("[keep-threads] " + name + " threw:", e, "args:", args);
  }
};

store.threads ??= {}; // { [threadId]: name }

// Unarchive is what Discord's own "Unarchive" button sends. With the thread
// unlocked it only needs send permission, so locked threads are left alone.
async function revive(id) {
  try {
    log("revive: checking", id);
    await http.ready;
    const { body } = await http.get(`/channels/${id}`);
    const meta = body?.thread_metadata;
    log("revive:", id, body?.name, "thread_metadata:", meta);
    if (!meta?.archived || meta.locked)
      return log("revive:", id, meta?.locked ? "locked, skipping" : "not archived, nothing to do");
    await http.patch({ url: `/channels/${id}`, body: { archived: false } });
    log("revive:", id, "unarchived");
  } catch (e) {
    // 404 / 403: thread deleted or access lost. Keep it listed so it can be removed by hand.
    console.warn("[keep-threads] could not unarchive", id, e);
  }
}

function keep(c) {
  log("keep:", c?.id, c?.name);
  store.threads = { ...store.threads, [c.id]: c.name };
  refreshPins();
  revive(c.id);
  showToast({ title: `Keeping #${c.name}` });
}
function drop(id) {
  log("drop:", id);
  const { [id]: _, ...rest } = store.threads;
  store.threads = rest;
  refreshPins();
}

// --- sidebar pin ---------------------------------------------------------------
// Kept rows get a data attribute; the pin itself is CSS.

const ROW = '[data-list-item-id^="channels___"]';
const markRow = (row) => {
  const kept = !!store.threads[row.dataset.listItemId.split("___")[1]];
  if (kept !== row.hasAttribute("data-kt-kept")) row.toggleAttribute("data-kt-kept", kept);
};
const refreshPins = () => {
  const rows = [...document.querySelectorAll(ROW)];
  rows.forEach(markRow);
  const kept = document.querySelectorAll("[data-kt-kept]");
  log("pins: rows found", rows.length, "marked kept", kept.length, [...kept]);
  kept.forEach((k) => log("pins: kept row", k, "name el", k.querySelector('[class*="overflow_"]')));
};

// --- right-click menu ---------------------------------------------------------
//
// No context-menu API in shelter, so: remember which channel the last
// right-click landed on, and when Discord's menu appears, clone one of its own
// items into it. Cloning borrows Discord's classes so it looks native.

let lastTarget = null;

function channelIdFrom(el) {
  const row = el.closest?.(ROW);
  log("contextmenu: row via data-list-item-id", row);
  if (row) return row.dataset.listItemId.split("___")[1];
  const a = el.closest?.('a[href*="/channels/"]');
  log("contextmenu: fell back to link", a, "ancestors:", (() => {
    const out = [];
    for (let n = el; n && out.length < 8; n = n.parentElement) out.push(n.tagName + "." + n.className + (n.dataset?.listItemId ? " [" + n.dataset.listItemId + "]" : ""));
    return out;
  })());
  return a?.getAttribute("href").split("/").pop();
}

function onContextMenu(e) {
  const id = channelIdFrom(e.target);
  const c = ChannelStore.getChannel(id);
  lastTarget = c?.isThread?.() ? c : null;
  log("contextmenu: channel id", id, "is thread", !!lastTarget);
}

function addMenuItem(menu) {
  menu.dataset.kt = "1";
  if (menu.matches('[class*="submenu_"]')) return; // Edit Tags etc. — not the thread menu
  const c = lastTarget;
  lastTarget = null;
  log("menu appeared:", menu.id, "for thread", c?.name);
  if (!c) return;

  const sample =
    menu.querySelector('[role="menuitem"]:not([aria-disabled="true"])') ?? menu.querySelector('[role="menuitem"]');
  const label = sample?.querySelector('[class*="label_"]');
  if (!sample) return log("menu: no menuitem to clone, giving up");

  const item = document.createElement("div");
  item.setAttribute("role", "menuitem");
  item.tabIndex = -1;
  item.dataset.ktItem = "1";
  item.className = [...sample.classList].filter((k) => !/focused|disabled/.test(k)).join(" ");
  const text = document.createElement("div");
  text.className = label?.className ?? "";
  text.textContent = store.threads[c.id] ? "Stop keeping thread" : "Keep thread";
  item.append(text);

  item.addEventListener(
    "click",
    guard("menu click", () => {
      store.threads[c.id] ? drop(c.id) : keep(c);
      // Discord closes its menus on Escape.
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", code: "Escape", keyCode: 27, bubbles: true }));
    }),
  );

  const group = sample.closest('[role="group"]') ?? sample.parentElement;
  group.append(item);
  log("menu: item added");
}

// --- favourites ----------------------------------------------------------------
// Anything in Discord's own Favorites that is (or might be) a thread is kept too.
// Archived threads can be missing from ChannelStore, so unknown ids are checked
// over HTTP; revive() is a no-op for anything without thread_metadata.

function favouriteIds() {
  const favs = FavoriteStore?.getFavoriteChannels?.() ?? {};
  return Object.keys(favs).filter((id) => {
    const c = ChannelStore.getChannel(id);
    return !c || c.isThread?.();
  });
}
const isKept = (id) => !!store.threads[id] || favouriteIds().includes(id);

let timer;
const reviveAll = () => new Set([...Object.keys(store.threads), ...favouriteIds()]).forEach(revive);
const onContextMenuSafe = guard("contextmenu", onContextMenu);

export function onLoad() {
  log("onLoad: kept threads", { ...store.threads });
  log(
    "onLoad: FavoriteStore",
    FavoriteStore,
    "methods",
    FavoriteStore && Object.getOwnPropertyNames(Object.getPrototypeOf(FavoriteStore)),
    "favourites",
    FavoriteStore?.getFavoriteChannels?.(),
    "favourite threads",
    favouriteIds(),
  );
  document.addEventListener("contextmenu", onContextMenuSafe, true);
  scoped.observeDom('[role="menu"]:not([data-kt])', guard("menu", addMenuItem));
  scoped.observeDom(ROW, guard("pin", markRow));
  refreshPins();
  scoped.ui.injectCss(`
    [data-kt-kept] [class*="overflow_"]::before { content: "\\1F4CC  "; }
    [data-kt-item]:hover { background: var(--menu-item-default-hover-bg, var(--brand-500)); color: #fff; }
    [data-kt-item]:hover * { color: #fff; }
  `);

  // Live: Discord tells us the moment it archives a thread we're subscribed to.
  scoped.flux.subscribe(
    "THREAD_UPDATE",
    guard("THREAD_UPDATE", ({ channel }) => {
      const meta = channel?.threadMetadata ?? channel?.thread_metadata;
      if (!isKept(channel?.id)) return;
      log("THREAD_UPDATE for kept thread", channel.id, "meta", meta);
      if (meta?.archived) revive(channel.id);
    }),
  );

  // Catch-up: anything archived while the client was closed or out of earshot.
  reviveAll();
  // ponytail: fixed 15 min poll, make it a setting if anyone needs it tighter
  timer = setInterval(reviveAll, 15 * 60 * 1000);
}

export function onUnload() {
  clearInterval(timer);
  document.removeEventListener("contextmenu", onContextMenuSafe, true);
  document.querySelectorAll("[data-kt-item]").forEach((n) => n.remove());
  document.querySelectorAll("[data-kt-kept]").forEach((n) => n.removeAttribute("data-kt-kept"));
  log("onUnload");
}

export function settings() {
  const c0 = ChannelStore.getChannel(SelectedChannelStore.getChannelId());
  const current = () => c0;
  const isThread = () => current()?.isThread?.();

  return (
    <>
      <Show when={isThread()} fallback={<p>Right-click a thread and pick Keep thread, or open one and come back here.</p>}>
        <Show when={!store.threads[current().id]} fallback={<p>#{current().name} is already kept.</p>}>
          <Button onClick={() => keep(current())}>Keep #{current().name}</Button>
        </Show>
      </Show>
      <h3 style={{ "margin-top": "16px" }}>Kept threads</h3>
      <For each={Object.entries(store.threads)} fallback={<p>None yet.</p>}>
        {([id, name]) => (
          <div style={{ display: "flex", "align-items": "center", gap: "8px", margin: "6px 0" }}>
            <span style={{ flex: 1 }}>#{name}</span>
            <Button size="small" onClick={() => drop(id)}>
              Remove
            </Button>
          </div>
        )}
      </For>
    </>
  );
}
