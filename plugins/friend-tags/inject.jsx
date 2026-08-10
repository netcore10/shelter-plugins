import TagRow, { openTagEditor } from "./ui/TagRow";

const {
  flux: {
    storesFlat: { UserStore, ChannelStore, SelectedChannelStore },
  },
  plugin: { store, scoped },
  ui: { ReactiveRoot },
  util: { getFiber, reactFiberWalker, log },
  observeDom,
} = shelter;

// Marks handled elements. Also used as a `:not()` filter in the selectors so
// shelter skips re-processing them cheaply.
const MARK = "ftags";

// Applied per comma-separated branch: `a, b` + `:not(…)` would otherwise only
// filter `b`, and the first branch would be re-injected on every mutation.
const unhandled = (selector) =>
  selector
    .split(",")
    .map((part) => `${part.trim()}:not([data-${MARK}])`)
    .join(", ");

// ---------------------------------------------------------------------------
// Surfaces
//
// If Discord reshuffles its markup, this table is the only thing that needs
// touching. `selector` finds the row, `anchors` picks where inside that row the
// chips go (first match wins; the row itself is the fallback), and `props` is
// the order in which we try to pull a user off the react fiber.
// ---------------------------------------------------------------------------

// How far a fiber walk may travel before giving up. The user we want is always
// on or very near the row's own component; anything further is a different part
// of the page and would produce a wrong tag rather than no tag.
const DEFAULT_DEPTH = 12;

const SURFACES = [
  {
    id: "friends",
    // The friends list — the one place where tags are editable.
    selector: '[class*="peopleListItem"]',
    anchors: ['[class*="nameAndDecorators"]', '[class*="discordTag"]', '[class*="userInfo"]'],
    props: ["user"],
    editable: true,
    enabled: () => store.inFriends,
  },
  {
    id: "messages",
    // Every message in every guild channel and DM.
    selector: '[id^="message-username-"]',
    anchors: [],
    props: ["message", "user"],
    enabled: () => store.inMessages,
    // Messages churn constantly, so these are observed per-dispatch instead of
    // with a permanent observer.
    onDispatch: true,
  },
  {
    id: "members",
    // The member list on the right of a server.
    selector: '[class*="memberInner"]',
    anchors: ['[class*="nameAndDecorators"]', '[class*="name_"]'],
    props: ["user"],
    compact: true,
    enabled: () => store.inMembers,
  },
  {
    id: "dms",
    // The DM list in the home sidebar. Friends / Message Requests / Nitro /
    // Shop / Quests are rows in this very same list, so they match too — they
    // get filtered out in resolveDmUser instead of by the selector, which
    // avoids depending on where the link sits within the row.
    selector: '[data-list-item-id^="private-channels-uid_"]',
    anchors: ['[class*="nameAndDecorators"]', '[class*="name_"]'],
    resolve: resolveDmUser,
    compact: true,
    enabled: () => store.inDms,
  },
  {
    id: "profiles",
    // Profile popouts and the full profile modal.
    selector: '[class*="userPopoutOuter"] [class*="usernameRow"], [class*="userProfileModalInner"] [class*="usernameRow"]',
    anchors: [],
    props: ["user", "userId", "displayProfile"],
    // Profiles nest deeper than a list row, and a popout is self-contained
    // enough that a longer walk can't stray into someone else's data.
    depth: 20,
    editable: true,
    enabled: () => store.inProfiles,
  },
];

// ---------------------------------------------------------------------------

/**
 * Read a DM row's user straight from its link target, e.g.
 * `/channels/@me/1234` -> that channel -> its single recipient.
 *
 * The sidebar's nav entries (Friends, Message Requests, Nitro, Shop, Quests)
 * sit in the same list as real DMs, and none of them carry a user of their own,
 * so a fiber walk climbs past them and finds whichever DM is currently open —
 * which is how one friend's tags ended up on every nav item. Matching a numeric
 * channel ID rules all of those out with no walking at all.
 */
function resolveDmUser(element) {
  // The row may be the link itself or merely contain one, depending on where
  // Discord hangs data-list-item-id, so accept either.
  const href =
    element.getAttribute?.("href") ?? element.querySelector("a[href]")?.getAttribute("href") ?? "";

  // Requiring a numeric channel ID is what rules out the nav rows: their hrefs
  // are /channels/@me, /shop, /quests, /channels/@me/message-requests, etc.
  const channelId = /\/channels\/@me\/(\d+)\b/.exec(href)?.[1];
  if (!channelId) return;

  const channel = ChannelStore.getChannel(channelId);
  // Group DMs have several recipients and no single user to tag.
  if (channel?.recipients?.length !== 1) return;

  return UserStore.getUser(channel.recipients[0]);
}

/**
 * Walk up the fiber tree looking for a prop, checking both prop bags.
 *
 * `depth` matters more than it looks: reactFiberWalker also recurses through
 * siblings, so the default limit of 100 will happily wander out of the row and
 * into unrelated parts of the page. Keep it tight.
 */
function walkProp(element, name, depth) {
  const fiber = reactFiberWalker(getFiber(element), name, true, false, depth);
  return fiber?.memoizedProps?.[name] ?? fiber?.pendingProps?.[name];
}

/**
 * Turn a DOM element into the user it represents, trying each prop in order.
 * Order matters: on a message the `message` prop is authoritative, while a
 * stray `user` prop further up the tree could belong to someone else entirely.
 */
function resolveUser(element, props, depth) {
  for (const prop of props) {
    const value = walkProp(element, prop, depth);
    if (!value) continue;

    switch (prop) {
      case "user":
        if (value.id) return value;
        break;

      case "message":
        if (value.author?.id) return value.author;
        break;

      case "userId":
        if (typeof value === "string") return UserStore.getUser(value);
        break;

      case "displayProfile":
        if (value.userId) return UserStore.getUser(value.userId);
        break;

      case "channel":
        // Only 1:1 DMs map to a single user; group DMs have several recipients.
        if (value.recipients?.length === 1) return UserStore.getUser(value.recipients[0]);
        break;
    }
  }
}

const firstMatch = (root, selectors) => {
  for (const selector of selectors) {
    const found = root.querySelector(selector);
    if (found) return found;
  }
};

function attach(element, surface) {
  if (element.dataset[MARK]) return;
  element.dataset[MARK] = "1";

  // This runs on every matching DOM mutation, and the fiber shapes it reads are
  // Discord's, not ours. One surface going bad shouldn't take out the rest.
  try {
    inject(element, surface);
  } catch (err) {
    if (store.debug) log([`[friend-tags] ${surface.id}: injection failed`, err], "error");
  }
}

function inject(element, surface) {
  const user = surface.resolve
    ? surface.resolve(element)
    : resolveUser(element, surface.props, surface.depth ?? DEFAULT_DEPTH);

  if (!user?.id) {
    // The DM list legitimately contains non-user rows — Friends, Message
    // Requests, Nitro, Shop, Quests — so "no user" is the expected answer there
    // and isn't worth warning about.
    if (store.debug && surface.id !== "dms")
      log(`[friend-tags] ${surface.id}: could not resolve a user`, "warn");
    return;
  }

  const anchor = firstMatch(element, surface.anchors) ?? element;

  // A `display: contents` wrapper so unload can remove everything we added in
  // one go, including solid's placeholder nodes for a hidden TagRow.
  // ReactiveRoot keeps solid's lifecycle working for elements we hand-place
  // into a document React also owns.
  const mount = <span class="ftags-mount" />;
  mount.append(
    <ReactiveRoot>
      <TagRow
        userId={user.id}
        compact={surface.compact}
        editable={surface.editable}
        show={surface.enabled}
      />
    </ReactiveRoot>,
  );

  anchor.append(mount);

  // Remember who was right-clicked so the context menu, which renders in a
  // detached layer with no link back to this row, knows whose tags to edit.
  element.addEventListener("contextmenu", () => {
    lastContextUser = { id: user.id, at: Date.now() };
  });
}

// ---------------------------------------------------------------------------
// Right-click -> "Edit tags"
//
// shelter has no context menu API, and Discord renders menus into a separate
// layer, so rather than fiber-walking the menu we note who was right-clicked on
// the way in and match it to the menu that appears immediately after.
// ---------------------------------------------------------------------------

let lastContextUser;

function addContextMenuItem(menu) {
  const recent = lastContextUser && Date.now() - lastContextUser.at < 1000;

  // Fall back to reading the user off the menu itself. Relying only on the
  // remembered right-click meant the item never appeared for someone with no
  // tags yet — the very case where you most want to add one — because nothing
  // had been injected onto their row to record the click.
  const userId =
    (recent && lastContextUser.id) ||
    resolveUser(menu, ["user", "message", "userId", "channel"], 25)?.id;

  if (!userId) return;
  const items = menu.querySelectorAll('[role="menuitem"]');
  if (!items.length) return;

  // Borrow the classes off a real item so the entry matches whatever Discord's
  // menus currently look like, including themes.
  const template = items[items.length - 1];

  const item = (
    <div role="menuitem" tabindex="-1" class={template.className}>
      Edit tags
    </div>
  );

  item.addEventListener("click", () => {
    // Let Discord tear the menu down first, or it closes our modal with it.
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    setTimeout(() => openTagEditor(userId), 0);
  });

  template.parentElement?.append(item);
}

// Dispatches that mean chat probably just re-rendered.
const MESSAGE_TRIGGERS = [
  "MESSAGE_CREATE",
  "MESSAGE_UPDATE",
  "CHANNEL_SELECT",
  "LOAD_MESSAGES_SUCCESS",
  "UPDATE_CHANNEL_DIMENSIONS",
];

export function startInjection() {
  for (const surface of SURFACES) {
    if (surface.onDispatch) continue;

    // Low-churn surfaces get a permanent observer: simpler and more reliable
    // than guessing which dispatch precedes them.
    scoped.observeDom(unhandled(surface.selector), (element) => attach(element, surface));
  }

  // Context menus are their own thing: not a user surface, just a menu we
  // append one item to whenever it follows a right-click on a tagged row.
  scoped.observeDom(`[role="menu"]:not([data-${MARK}-menu])`, (menu) => {
    menu.dataset[`${MARK}Menu`] = "1";
    try {
      addContextMenuItem(menu);
    } catch (err) {
      if (store.debug) log(["[friend-tags] context menu injection failed", err], "error");
    }
  });

  const messages = SURFACES.find((s) => s.id === "messages");

  const onDispatch = (payload) => {
    // MESSAGE_CREATE fires for every channel you can see, not just the open one.
    if (payload.type === "MESSAGE_CREATE" && payload.channelId !== SelectedChannelStore.getChannelId())
      return;

    // Unscoped on purpose: we dispose it ourselves, and routing every dispatch
    // through the scoped API would grow its disposer array without bound.
    const unobserve = observeDom(unhandled(messages.selector), (element) => {
      unobserve();
      attach(element, messages);
    });

    // Don't leave observers dangling if the render never comes.
    setTimeout(unobserve, 500);
  };

  for (const trigger of MESSAGE_TRIGGERS) scoped.flux.subscribe(trigger, onDispatch);

  // Catch whatever is already on screen when the plugin loads.
  for (const surface of SURFACES)
    for (const element of document.querySelectorAll(unhandled(surface.selector)))
      attach(element, surface);
}

/** Strip every injected chip and un-mark the elements we touched. */
export function removeInjections() {
  for (const mount of document.querySelectorAll(".ftags-mount")) mount.remove();
  for (const element of document.querySelectorAll(`[data-${MARK}]`)) delete element.dataset[MARK];
}

/**
 * Tear down and rebuild every chip on screen.
 *
 * Chips are reactive, so this is belt-and-braces — but a bulk import rewrites
 * whole maps at once, and "the data is right but the screen isn't" is a
 * miserable thing to debug, so the import path just redraws unconditionally.
 */
export function refreshInjections() {
  removeInjections();

  for (const surface of SURFACES)
    for (const element of document.querySelectorAll(unhandled(surface.selector)))
      attach(element, surface);
}
