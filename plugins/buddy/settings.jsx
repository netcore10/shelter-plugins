import { apply, say, lookup, wanderNow, stunt, testPing, resetPosition, reloadSheet } from "./buddy";
import { STATES, importSheet, exportSheet, resetSheet } from "./sheet";
import { TEST } from "./lines";

const {
  plugin: { store },
  solid: { createSignal, For, onCleanup },
  ui: { showToast, Button, ButtonSizes, ButtonColors, Header, HeaderTags, Slider, SwitchItem },
} = shelter;

const synth = window.speechSynthesis;

const SAM_VOICES = [
  "Adult Male #2, American English (TruVoice)",
  "Sam",
  "Adult Male #1, American English (TruVoice)",
  "Adult Female #1, American English (TruVoice)",
  "Mike",
  "Mary",
  "Bonzi",
  "RoboSoft One",
];

// the service takes pitch/speed as 50..200; sliders step in 5s
const toSam = (v) => 50 + v * 5;
const fromSam = (n) => (n - 50) / 5;

// `checked` is the documented prop; `value` is what older shelter builds read.
const Toggle = (props) => (
  <SwitchItem checked={props.checked} value={props.checked} onChange={props.onChange} note={props.note} hideBorder>
    {props.children}
  </SwitchItem>
);

const Field = (props) => (
  <div class="bd-row">
    <div class="bd-label">{props.label}</div>
    {props.children}
  </div>
);

const toast = (title, content) => showToast({ title, content, duration: 5000 });

export default function Settings() {
  let file;
  const [voices, setVoices] = createSignal(synth?.getVoices() ?? []);
  const refresh = () => setVoices(synth.getVoices());
  synth?.addEventListener("voiceschanged", refresh);
  onCleanup(() => synth?.removeEventListener("voiceschanged", refresh));

  return (
    <>
      <Header tag={HeaderTags.H3}>Wumpus</Header>
      <Toggle
        checked={store.wander}
        onChange={(v) => {
          store.wander = v;
          apply();
        }}
        note="Strolls along the screen every so often."
      >
        Wander
      </Toggle>
      <Toggle
        checked={store.dodge}
        onChange={(v) => (store.dodge = v)}
        note="Rest your cursor on the buddy and it steps aside so you can click what's underneath. A quick click still grabs it."
      >
        Dodge the cursor
      </Toggle>
      <Toggle
        checked={store.watch}
        onChange={(v) => (store.watch = v)}
        note="Click into the message box and the buddy walks over and faces your cursor as you type."
      >
        Watch you type
      </Toggle>
      <Toggle
        checked={store.antics}
        onChange={(v) => (store.antics = v)}
        note="Comments on long messages, questions, quiet spells, voice calls, your status, the time and how much you've typed today. At most once a minute."
      >
        Commentary
      </Toggle>
      <Toggle checked={store.speak} onChange={(v) => (store.speak = v)} note="Read what the buddy says out loud.">
        Speak aloud
      </Toggle>
      <Toggle
        checked={store.mentions}
        onChange={(v) => (store.mentions = v)}
        note="Walk over and point out DMs and @mentions from your friends, at most once every 15 seconds."
      >
        React to friends' pings
      </Toggle>
      <Toggle
        checked={store.sam}
        onChange={(v) => (store.sam = v)}
        note="The classic SAPI4 voices, via tetyys.com. Sends the spoken text, including your friends' names in pings, to that site. Falls back to the system voice if Discord blocks it."
      >
        SAM voice
      </Toggle>

      <Field label="SAM voice">
        <select class="bd-select" onChange={(e) => (store.samVoice = e.currentTarget.value)}>
          <For each={SAM_VOICES}>
            {(v) => (
              <option value={v} selected={v === store.samVoice}>
                {v}
              </option>
            )}
          </For>
        </select>
      </Field>
      <Field label={`SAM pitch — ${store.samPitch}`}>
        <Slider min={0} max={30} step={1} value={fromSam(store.samPitch)} onInput={(v) => (store.samPitch = toSam(v))} />
      </Field>
      <Field label={`SAM speed — ${store.samSpeed}`}>
        <Slider min={0} max={30} step={1} value={fromSam(store.samSpeed)} onInput={(v) => (store.samSpeed = toSam(v))} />
      </Field>

      <Field label="System voice (fallback)">
        <select class="bd-select" onChange={(e) => (store.voice = e.currentTarget.value)}>
          <option value="" selected={!store.voice}>
            System default
          </option>
          <For each={voices()}>
            {(v) => (
              <option value={v.name} selected={v.name === store.voice}>
                {v.name}
              </option>
            )}
          </For>
        </select>
      </Field>
      <Field label={`Speed — ${store.rate}×`}>
        <Slider min={5} max={20} step={1} value={store.rate * 10} onInput={(v) => (store.rate = v / 10)} />
      </Field>
      <Field label={`Pitch — ${store.pitch}`}>
        <Slider min={0} max={20} step={1} value={store.pitch * 10} onInput={(v) => (store.pitch = v / 10)} />
      </Field>
      <Field label={`Volume — ${store.volume}%`}>
        <Slider min={0} max={100} step={1} value={store.volume} onInput={(v) => (store.volume = v)} />
      </Field>
      <Field label={`Size — ${store.scale}×`}>
        <Slider
          min={1}
          max={4}
          step={1}
          value={store.scale}
          onInput={(v) => {
            store.scale = v;
            apply();
          }}
        />
      </Field>
      <Field label={`Colour — ${store.hue}°`}>
        <Slider
          min={0}
          max={360}
          step={5}
          value={store.hue}
          onInput={(v) => {
            store.hue = v;
            apply();
          }}
        />
      </Field>
      <Field label="Hat">
        <select
          class="bd-select"
          onChange={(e) => {
            store.hat = e.currentTarget.value;
            apply();
          }}
        >
          <For each={["", "🎩", "👑", "🥳", "🎓", "🤠", "🪖", "🎅", "🧢"]}>
            {(h) => (
              <option value={h} selected={h === store.hat}>
                {h || "None"}
              </option>
            )}
          </For>
        </select>
      </Field>
      <Field label="Random chatter">
        <select
          class="bd-select"
          onChange={(e) => {
            store.chatter = +e.currentTarget.value;
            apply();
          }}
        >
          <For each={[0, 5, 15, 30, 60]}>
            {(m) => (
              <option value={m} selected={m === store.chatter}>
                {m ? `Every ${m} min` : "Off"}
              </option>
            )}
          </For>
        </select>
      </Field>

      <Header tag={HeaderTags.H3}>Search</Header>
      <div class="bd-label">
        Say yes when he offers to search, or highlight text and click "Search with Wumpus". Answers come from Wikipedia (intro and
        picture), else a GIF from Discord's GIF search. No key needed. What you search for is sent only when you ask.
      </div>
      <Field label="Extra blocked words (comma separated, on top of the built-in list)">
        <input class="bd-select" value={store.blockExtra} onInput={(e) => (store.blockExtra = e.currentTarget.value)} />
      </Field>
      <div class="bd-btns">
        <Button size={ButtonSizes.SMALL} onClick={() => lookup("wumpus discord mascot")}>
          Test search
        </Button>
      </div>

      <Header tag={HeaderTags.H3}>Sprites</Header>
      <div class="bd-label">
        Export the sheet, edit it in any pixel editor, import it back. 4 columns of frames; rows top to bottom:{" "}
        {Object.keys(STATES).join(", ")}. Frames are square, drawn facing right.
      </div>
      <input
        type="file"
        accept="image/png,image/webp"
        hidden
        ref={file}
        onChange={async (e) => {
          const f = e.currentTarget.files[0];
          e.currentTarget.value = "";
          if (!f) return;
          try {
            await importSheet(f);
            await reloadSheet();
            toast("Wumpus", "Sprites imported.");
          } catch (err) {
            toast("Couldn't import sprites", err.message);
          }
        }}
      />
      <div class="bd-btns">
        <Button size={ButtonSizes.SMALL} onClick={exportSheet}>
          Export sheet
        </Button>
        <Button size={ButtonSizes.SMALL} onClick={() => file.click()}>
          Import sheet
        </Button>
        <Button
          size={ButtonSizes.SMALL}
          color={ButtonColors.RED}
          onClick={async () => {
            await resetSheet();
            await reloadSheet();
          }}
        >
          Reset sprites
        </Button>
      </div>

      <div class="bd-label">
        Hotkeys: Alt+Shift+W wander now, Alt+Shift+S stunt, Alt+Shift+G replay the greeting, Alt+Shift+K sing (DECtalk), Alt+Shift+P test ping, Alt+Shift+D show what he can stand on, Alt+Shift+R copy a
        diagnostic report.
      </div>
      <div class="bd-btns">
        <Button size={ButtonSizes.SMALL} onClick={() => say(TEST)}>
          Test voice
        </Button>
        <Button size={ButtonSizes.SMALL} onClick={wanderNow}>
          Wander now
        </Button>
        <Button size={ButtonSizes.SMALL} onClick={stunt}>
          Stunt
        </Button>
        <Button size={ButtonSizes.SMALL} onClick={testPing}>
          Test ping
        </Button>
        <Button size={ButtonSizes.SMALL} color={ButtonColors.SECONDARY} onClick={resetPosition}>
          Reset position
        </Button>
      </div>
    </>
  );
}
