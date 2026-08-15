import { store } from "./data";
import { QUALITIES, currentStation, qualitiesFor, readCustom, writeCustom } from "./stations";
import { selectQuality } from "./session";
import { setVolume } from "./player";
import Segmented from "./ui/Segmented";

const {
  solid: { createSignal, For, Show },
  ui: { Button, ButtonColors, ButtonSizes, Divider, Header, HeaderTags, Slider, SwitchItem, TextBox },
} = shelter;

// `checked` is the documented prop; `value` is what older shelter builds read.
// Passing both keeps the switch working either way — with only `checked`, a
// build that wants `value` renders a switch that never reflects its own state,
// which looks exactly like a toggle you can't click. Same fix as friend-tags.
const Toggle = (props) => (
  <SwitchItem
    checked={props.checked}
    value={props.checked}
    onChange={props.onChange}
    note={props.note}
    hideBorder={props.hideBorder}
  >
    {props.children}
  </SwitchItem>
);

function CustomStations() {
  const [name, setName] = createSignal("");
  const [url, setUrl] = createSignal("");

  const add = () => {
    const trimmed = url().trim();
    if (!trimmed) return;

    writeCustom([
      ...readCustom(),
      { id: Date.now().toString(36), name: name().trim() || "Custom stream", url: trimmed },
    ]);

    setName("");
    setUrl("");
  };

  const remove = (id) => writeCustom(readCustom().filter((s) => s.id !== id));

  return (
    <>
      <Header tag={HeaderTags.H3}>Your stations</Header>

      <div class="rad-settings-row">
        <div class="rad-settings-label">
          Any direct stream URL works — an Icecast or SHOUTcast MP3, AAC or Ogg endpoint. There's no
          now-playing info for these; a bare stream doesn't expose it to the page.
        </div>

        <For each={readCustom()}>
          {(station) => (
            <div class="rad-custom">
              <div class="rad-custom-text">
                <div>{station.name}</div>
                <div class="rad-custom-url">{station.url}</div>
              </div>
              <Button size={ButtonSizes.SMALL} color={ButtonColors.RED} onClick={() => remove(station.id)}>
                Remove
              </Button>
            </div>
          )}
        </For>

        <div class="rad-custom">
          <TextBox placeholder="Name" value={name()} onInput={setName} />
          <TextBox placeholder="https://…" value={url()} onInput={setUrl} />
          <Button size={ButtonSizes.SMALL} onClick={add}>
            Add
          </Button>
        </div>
      </div>
    </>
  );
}

export default function Settings() {
  const qualities = () => qualitiesFor(currentStation());

  return (
    <>
      <Header tag={HeaderTags.H3}>Playback</Header>

      <div class="rad-settings-row">
        <div class="rad-settings-label">Volume</div>
        {/* 0–100: Slider clamps anything above 100 before min/max apply. */}
        <Slider min={0} max={100} step={1} value={store.volume} onInput={setVolume} />
      </div>

      <Show when={qualities().length > 1}>
        <div class="rad-settings-row">
          <div class="rad-settings-label">Stream quality — {currentStation().name}</div>
          <Segmented
            value={store.quality}
            onSelect={selectQuality}
            options={qualities().map((q) => ({ value: q, label: QUALITIES[q].label, hint: QUALITIES[q].hint }))}
          />
        </div>
      </Show>

      <Toggle
        checked={store.romaji}
        onChange={(v) => (store.romaji = v)}
        note="Show romanised titles and artist names where the station provides them, instead of the original script."
      >
        Prefer romanised names
      </Toggle>

      <Toggle
        checked={store.mediaSession}
        onChange={(v) => (store.mediaSession = v)}
        note="Show what's playing in your system's media controls, so media keys and headset buttons can pause it. Needs a client that forwards media keys to the OS: the desktop app and browsers do, clients built on the system webview (Dorion) generally don't, and there's nothing this plugin can do about that."
        hideBorder
      >
        Use system media controls
      </Toggle>


      <Divider mt mb />

      <CustomStations />
    </>
  );
}
