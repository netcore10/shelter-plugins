# Building a shelter plugin — reference

Start here when asked to build a shelter (Discord client mod) plugin.
Read [`SHELTER-NOTES.md`](./SHELTER-NOTES.md) alongside this — it documents the
traps, and most of them are not in the official docs.

## Where to look things up

**Docs** — https://shelter.uwu.network

Read the guides in order the first time — they build on each other.

| Page | Use it for |
|---|---|
| `/guides/` | Getting started: repo setup, dependencies |
| `/guides/plugin` | Your first plugin — entry points, structure |
| `/guides/settings` | Settings, storage and UI |
| `/guides/patterns` | **The important one** — how shelter expects you to do things |
| `/guides/lune` | The build tool; `/guides/lune-ssg` for static output |
| `/guides/ideals` | Why there's no webpack/React patching — explains the constraints |
| `/ui` | **UI reference** — every component's type signature, with live demos |
| `/reference` | API reference: `store`, `scoped`, `flux`, `util`, `observeDom` |
| `/install`, `/plugins` | Installing shelter; the public plugin list |

Note there is **no `/reference/ui`** — component signatures live on `/ui`, and
everything else is on the single `/reference` page.

**The docs are summaries and are sometimes wrong or incomplete.** When behaviour
doesn't match, read the source — it's short and definitive:

```bash
gh api "repos/uwu/shelter/contents/packages/shelter-ui/src/slider.tsx" --jq '.content' | base64 -d
```

| Path | What's in it |
|---|---|
| `packages/shelter-ui/src/*.tsx` | Every component (`button`, `slider`, `modals`, `textbox`…) |
| `packages/shelter-ui/src/*.scss` | Their styles — needed for overrides |
| `packages/shelter/src/plugins.tsx` | Plugin lifecycle, storage, **when data is deleted** |
| `packages/shelter/src/devmode/` | Dev mode, and what stopping it destroys |
| `packages/shelter-docs/demos/src/demos/` | Working usage examples per component |
| `packages/lune/` | Build tool |

Real-world plugin examples: search GitHub for `shelter-plugins` repos.

**Discord's own markup has no documentation.** Get it from the running client:

```js
// one element's full markup
copy(document.querySelector('SELECTOR').outerHTML);

// the whole DOM, to a file you can read
const a = document.createElement('a');
a.href = URL.createObjectURL(new Blob([document.documentElement.outerHTML]));
a.download = 'discord.html'; a.click();
```

Discord's class names are hashed (`name__20a53`) and change between builds — always
match with `[class*="name_"]`, never the full name.

## Project layout

```
shelter-plugins/
├── package.json          # workspaces: ["plugins/*"], devDeps @uwu/lune, @uwu/shelter-defs
├── lune.config.js        # defineConfig({})
└── plugins/
    └── my-plugin/
        ├── package.json  # { "name": "my-plugin", "type": "module", "main": "index.jsx" }
        ├── plugin.json   # { "name", "author", "description" }  ← shown in shelter's UI
        └── index.jsx     # entry point
```

`lune ci` builds every plugin into `dist/<name>/{plugin.js,plugin.json}`. That
directory is what gets served — a user installs by URL, e.g.
`https://<user>.github.io/shelter-plugins/my-plugin`.

## Skeleton

```jsx
const {
  plugin: { store, scoped },
  ui: { Header, HeaderTags, SwitchItem, showToast },
  solid: { createSignal },
  observeDom,
} = shelter;

// Defaults. Only TOP-LEVEL writes persist.
store.enabled ??= true;

const css = `
.mp-thing { color: var(--text-default); }
`;

let unobserve;

export function onLoad() {
  scoped.ui.injectCss(css); // NOT scoped.injectCss

  unobserve = observeDom('[class*="someRow"]:not([data-mp])', (el) => {
    el.dataset.mp = "1";
    // …build and append your node here
  });
}

export function onUnload() {
  unobserve?.();
  document.querySelectorAll("[data-mp]").forEach((el) => delete el.dataset.mp);
  // scoped.ui.injectCss is cleaned up automatically
}

export function settings() {
  return (
    <>
      <Header tag={HeaderTags.H5}>My plugin</Header>
      <SwitchItem checked={store.enabled} onChange={(v) => (store.enabled = v)} hideBorder>
        Enabled
      </SwitchItem>
    </>
  );
}
```

## Recipes

**Inject next to something in Discord's UI**

```jsx
const { ui: { ReactiveRoot }, util: { getFiber, reactFiberWalker }, observeDom } = shelter;

observeDom('[class*="memberInner"]:not([data-mp])', (row) => {
  row.dataset.mp = "1";

  // depth limit matters — the walker recurses through SIBLINGS too
  const fiber = reactFiberWalker(getFiber(row), "user", true, false, 12);
  const user = fiber?.memoizedProps?.user;
  if (!user?.id) return;

  const anchor = row.querySelector('[class*="nameAndDecorators"]') ?? row;
  const mount = <span class="mp-mount" />;
  mount.append(<ReactiveRoot><MyThing userId={user.id} /></ReactiveRoot>);
  anchor.append(mount);
});
```

**React to Discord events instead of polling**

```jsx
const { flux: { dispatcher, storesFlat: { UserStore } } } = shelter;
dispatcher.subscribe("MESSAGE_CREATE", handler);
```

**A modal**

```jsx
const { ui: { openModal, ModalRoot, ModalHeader, ModalBody, ModalFooter, ModalSizes, Button } } = shelter;

openModal((props) => (
  <ModalRoot size={ModalSizes.SMALL}>
    <ModalHeader close={props.close}>Title</ModalHeader>
    <ModalBody>…</ModalBody>
    <ModalFooter><Button onClick={props.close}>Done</Button></ModalFooter>
  </ModalRoot>
));
```

**Persist data that survives updates** — shelter deletes plugin storage on
update, reinstall, and when dev mode ends. Mirror to your own IndexedDB and
restore on load when shelter's copy is empty. See `plugins/friend-tags/backup.js`.

## Build & test

```bash
npx lune ci                      # build all plugins → dist/
npx lune dev plugins/my-plugin   # watch + hot-push to the client
```

Then in Discord: **help "?" button → Developer Options → Lune Dev Mode**, and
**refresh** — dev mode connects on load.

Ship via GitHub Pages: a workflow that runs `lune ci` and publishes `dist/` to
`gh-pages`. Users install `https://<user>.github.io/<repo>/<plugin-name>`.

## Before writing code, know these

Full detail in [`SHELTER-NOTES.md`](./SHELTER-NOTES.md):

1. **No React patching** — your nodes are foreign children; React will move them
2. **`scoped.ui.injectCss`**, not `scoped.injectCss`
3. **`reactFiberWalker` walks siblings** — cap depth or you'll tag the wrong user
4. **Only top-level store writes persist**; replace nested maps wholesale
5. **Don't cache store reads in a shared `createRoot`** — dispose on unload
   freezes every later read
6. **Storage is deleted** on update/reinstall/dev-mode-exit
7. **Modals animate from `scale(0)`** — anything measuring on mount breaks
8. **`Slider` clamps values > 100** — use a small integer range and map
9. **`@property` in injected CSS dies on reload** — register from JS
10. **A green build ≠ working code**; **stale DOM ≠ broken change** (hard-reload)
11. **Measure before theorising** — symptoms here are consistently misleading
