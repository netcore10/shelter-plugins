import { store } from "./data";
import { QUALITIES, currentStation, qualitiesFor } from "./stations";
import { selectQuality } from "./session";
import { setVolume } from "./player";
import Segmented from "./ui/Segmented";

const {
  solid: { createSignal, For, Show },
  ui: { Button, ButtonColors, ButtonSizes, Divider, Header, HeaderTags, Slider, SwitchItem, TextBox },
} = shelter;

function CustomStations() {
  const [name, setName] = createSignal("");
  const [url, setUrl] = createSignal("");

  const add = () => {
    const trimmed = url().trim();
    if (!trimmed) return;

    store.custom = [
      ...(store.custom ?? []),
      { id: `${Date.now().toString(36)}`, name: name().trim() || "Custom stream", url: trimmed },
    ];

    setName("");
    setUrl("");
  };

  // Replaced wholesale rather than spliced: only top-level writes persist.
  const remove = (id) => (store.custom = (store.custom ?? []).filter((s) => s.id !== id));

  return (
    <>
      <Header tag={HeaderTags.H3}>Your stations</Header>

      <div class="rad-settings-row">
        <div class="rad-settings-label">
          Any direct stream URL works — an Icecast or SHOUTcast MP3, AAC or Ogg endpoint. There's no
          now-playing info for these; a bare stream doesn't expose it to the page.
        </div>

        <For each={store.custom ?? []}>
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

      <SwitchItem
        checked={store.romaji}
        onChange={(v) => (store.romaji = v)}
        note="Show romanised titles and artist names where the station provides them, instead of the original script."
      >
        Prefer romanised names
      </SwitchItem>

      <SwitchItem
        checked={store.mediaSession}
        onChange={(v) => (store.mediaSession = v)}
        note="Show what's playing in your system's media controls, and let media keys pause it."
        hideBorder
      >
        Use system media controls
      </SwitchItem>

      <Divider mt mb />

      <CustomStations />
    </>
  );
}
