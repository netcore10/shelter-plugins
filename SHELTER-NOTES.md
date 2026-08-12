# Writing shelter plugins — what actually matters

Notes from building `friend-tags`. Everything here was learned by hitting it, and
most of it isn't in the docs. Read this before writing shelter plugin code.

## The design stance (why shelter is different)

shelter deliberately does **no webpack module searching and no React component
patching**. Vencord and BetterDiscord find Discord's components and inject into
React's tree; shelter doesn't. That's what makes shelter plugins survive Discord
updates — and it's also the source of most of the friction below.

Consequence: your elements are **foreign children** appended into DOM that React
owns. React doesn't know about them, doesn't lay them out, and will move them.

## API surface

```js
const {
  plugin: { store, scoped },
  flux: { storesFlat: { UserStore, ChannelStore } },
  ui: { Button, TextBox, Slider, ModalRoot, openModal, showToast, ReactiveRoot },
  solid: { createSignal, createMemo, createEffect, onMount, onCleanup, For, Show },
  util: { getFiber, reactFiberWalker, log },
  observeDom,
} = shelter;
```

- **`scoped.ui.injectCss(css)`** — *not* `scoped.injectCss`. The docs' flat bullet
  list makes it look top-level. It isn't.
- Plugin entry points: `onLoad()`, `onUnload()`, `settings` (a Solid component).

## The injection pattern

There is no component to patch, so:

1. `observeDom(selector, handler)` — fires for matching elements as they appear
2. Mark handled elements (`data-*`) and filter with `:not([data-x])` **per
   comma-separated branch** — `a, b:not([data-x])` only filters `b`
3. Resolve the user from the React fiber
4. Append a Solid-rendered node inside `<ReactiveRoot>`

```js
const mount = <span class="mount" />;
mount.append(<ReactiveRoot><MyChip userId={user.id} /></ReactiveRoot>);
anchor.append(mount);
```

`ReactiveRoot` is what keeps Solid's lifecycle working for nodes you hand-place
into a document React also owns.

### Fiber walking

```js
const fiber = reactFiberWalker(getFiber(el), "user", true, false, 12);
const user = fiber?.memoizedProps?.user ?? fiber?.pendingProps?.user;
```

**`reactFiberWalker` also recurses through siblings.** The default depth of 100
will happily wander out of the row and return a *different user's* data — which
looks like tags appearing on the wrong people. Keep the limit tight (12 for list
rows, ~20 for profile popouts).

Prefer not walking at all where you can. A DM row's user is derivable from its
`href` (`/channels/@me/<channelId>` → `ChannelStore.getChannel()` → recipient),
which is both faster and immune to picking up the wrong fiber.

## The store

```js
store.tags ??= {};
```

- **Only top-level property writes are persisted.** Mutating a nested object
  saves nothing. Replace maps wholesale: `store.tags = { ...store.tags, [id]: v }`
- Replacing them wholesale is also what makes Solid re-render your chips
- **Every property read creates a Solid signal *and* a store-wide valtio
  subscription.** Reading per-component scales badly
- Values come back as **proxies**. Deep-copy before handing them to components,
  and before anything that structured-clones them

⚠️ **Do not cache store reads behind memos in a shared `createRoot`.** Tried
twice. `onUnload` disposes the root, a disposed memo stops recomputing, and every
read afterwards returns frozen data — new items never appear and settings
toggles silently stop working. Read the store directly in each consumer; that
direct subscription is what makes updates propagate.

⚠️ **`detach()` with a depth limit will hand back a raw proxy at the boundary.**
If that reaches IndexedDB, structured-clone walks getters that mint fresh proxies
forever → `RangeError: Maximum call stack size exceeded`. Use a JSON round-trip
for anything being persisted.

## Storage is wiped more often than you think

shelter deletes a plugin's storage when it's updated, reinstalled, **or when dev
mode ends** (`removePlugin(devModeReservedId)`). Users lose everything without
warning.

Mirror important data into **your own IndexedDB database**, and restore on load
when shelter's copy comes back empty. Your DB isn't touched by any of that.

Also: **the dev-mode plugin and the installed plugin have separate storage.**
Tags added in dev mode don't exist in the installed copy. Running both at once
means two stores and two sets of injected elements.

## Modals

shelter modals are a `<dialog>` in the browser **top layer**:

- Portalling to `document.body` renders *behind* it — portal into the dialog
- A backdrop click calls `popModal()`, which pops the **topmost** modal
- **`<input type="color">` is unusable**: the Chromium colour popup closes onto
  the backdrop, which dismisses your modal

### Modals animate in from `transform: scale(0)`

**Anything that measures itself on mount misbehaves inside a modal.** A
transform on an ancestor changes what `getBoundingClientRect()` returns, so a
drag surface measures a box that isn't its final size — which is why a custom
control "only works the second time you open it". Defer mounting past the
~250ms transition, or measure in the element's own untransformed coordinates.

## Component gotchas

### `Slider` clamps values above 100

```js
splitProps(mergeProps({ step: "any", value: rawProps.min }, rawProps), […])
```

`mergeProps` puts the defaults' keys **first**, so the spread assigns `value`
before `min`/`max` regardless of the order you write them. A range input clamps
on assignment: `700` meets the default `0–100`, clamps to `100`, then `min=400`
pushes it to `400` — thumb pinned left while the fill (computed separately from
the prop) stays correct.

Every example in shelter's docs and demo uses `0–10`, so this never shows there.
Stay in a small integer range and map to your real values.

The docs also note `tick` must be an even divisor of the range.

### CSS is torn down on every reload

`@property` declared in injected CSS is lost when the stylesheet is replaced,
leaving the property unregistered — and an unregistered custom property can't be
interpolated, so animations using it become **discrete** (hold, jump at halfway,
hold). Register from JS instead:

```js
try {
  CSS.registerProperty({ name: "--x", syntax: "<angle>", inherits: false, initialValue: "0deg" });
} catch {}
```

## Fighting Discord's layout

Your element is a foreign child in a flex container written for a fixed set of
children. Expect:

- A sibling with `flex-grow` eats the free space and strands your element at the
  row's edge — a "gap" you cannot close by styling your own element
- Elements in *other subtrees* (close buttons, hover actions) paint over the row
  from outside any container you can anchor into
- **React re-renders move your node.** Its position right after injection is not
  where it stays. Re-check after hovering, scrolling, and status changes

Constrain your own element; don't restyle Discord's. Overriding their `display`,
`overflow` or `flex` will fix your symptom and break their truncation, hover
icons, or status line.

### Substring selectors match parents

`[class*="username"]` also matches `usernameContainer`, and `querySelector`
returns the **first match in document order** — which is usually the parent.
Order anchors specific-before-general (`usernameFont` before `username`).

## Rendering pitfalls

- **Flex containers drop leading/trailing whitespace** of anonymous text runs, so
  `~a~ b` renders as `ab`. `white-space: pre` on the label preserves it
- **`var(--x, fallback)` only uses the fallback when the variable is
  *undefined*.** Defined-but-invalid resolves to `initial` — a floating panel
  ends up transparent. Hard-code colours for anything that must never be
  see-through, and handle light theme explicitly
- **Animated children can toggle a modal's scrollbar.** A breathing or floating
  element that spills its box intermittently overflows the body; the scrollbar
  flickers in time with the animation. Clip it and use padding for the movement
- Rotating a **linear** gradient looks like it speeds up and slows down: the
  gradient line is `|W·sinθ| + |H·cosθ|`, so on a 10:1 element the bands compress
  and stretch. Use `conic-gradient` if you need constant apparent speed

## Emoji

Real `EmojiStore` API (methods, not properties):

```js
EmojiStore.getGuilds()
EmojiStore.getDisambiguatedEmojiContext().getByName(name)
```

Walking every guild's emoji per lookup is far too slow — cache with a `Map`
index and a generation counter.

## Build & dev loop

```
npx lune ci                       # build once
npx lune dev plugins/my-plugin    # watch + push to the client (ports 1211/1112)
```

Enable **Lune Dev Mode** in shelter's Developer Options — reachable from
Discord's help "?" button, which shelter hijacks into a Dev button. Dev mode
connects on load, so **refresh after enabling it**.

⚠️ **A green build does not mean working code.** esbuild treats unknown
identifiers as runtime globals, so a missing import builds fine and throws when
the component renders. Check imports by hand after refactors.

⚠️ **Stale elements masquerade as broken code.** Injected elements persist until
the DOM is rebuilt, and your `data-*` marker stops re-injection. If a change
"does nothing", hard-reload (Ctrl+R) before believing it. If you clear elements
manually, clear the markers too, or nothing will ever re-inject.

## Debugging method

The single most useful lesson from this build: **measure, don't theorise.**

Symptoms in a shelter plugin are consistently misleading — "can't click it" was a
zero-size measurement, a "gap" was a sibling's `flex-grow`, "not animating" was a
discrete animation from an unregistered property. Every one of those got several
wrong confident explanations before someone read a number.

When something's wrong, get the number first:

```js
// where is it, how big is it, what is it inheriting
const el = document.querySelector('.my-thing');
console.log(getComputedStyle(el).display, el.getBoundingClientRect());

// is a custom property actually registered and animating?
setInterval(() => console.log(getComputedStyle(el).getPropertyValue('--my-prop')), 500);

// where did my node actually end up?
console.log(el.parentElement.className, [...el.parentElement.children].indexOf(el));
```
