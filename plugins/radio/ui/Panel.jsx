import { store } from "../data";
import { track, status } from "../nowplaying";
import { playing, loading, setVolume, setMuted } from "../player";
import { anchorEl, closePanel, panelOpen, showPlayer, showStations, toggle, view } from "../session";
import { currentStation } from "../stations";
import Artwork from "./Artwork";
import StationList from "./StationList";
import { Bars, CaretIcon, PauseIcon, PlayIcon, VolumeIcon } from "./icons";

const {
  solid: { createEffect, createMemo, createSignal, onCleanup, onMount, Show },
  ui: { Slider },
} = shelter;

const pad = (n) => String(Math.floor(n)).padStart(2, "0");
const clock = (seconds) => `${Math.floor(seconds / 60)}:${pad(seconds % 60)}`;

function NowPlaying() {
  const station = () => currentStation();

  // Both scripts come down for LISTEN.moe; which is primary is the user's
  // choice, and the other one goes underneath when it differs.
  const primary = createMemo(() => {
    const t = track();
    if (!t) return station().name;
    return (store.romaji && t.titleAlt) || t.title || station().name;
  });

  const secondary = createMemo(() => {
    const t = track();
    if (!t) return null;
    return (store.romaji && t.artistAlt) || t.artist;
  });

  const alternate = createMemo(() => {
    const t = track();
    if (!t) return null;

    const other = store.romaji ? t.title : t.titleAlt;
    return other && other !== primary() ? other : null;
  });

  return (
    <div class="rad-track">
      <Artwork class="rad-art" src={track()?.art} station={station()} />

      <div class="rad-meta">
        <div class="rad-title">{primary()}</div>

        <Show when={secondary()}>
          <div class="rad-sub">{secondary()}</div>
        </Show>

        <Show when={alternate()}>
          <div class="rad-alt">{alternate()}</div>
        </Show>

        <Show when={track()?.source}>
          <div class="rad-alt">from {track().source}</div>
        </Show>

        <Show when={track()?.event}>
          <div class="rad-tag" style={{ background: station().accent }}>
            {track().event}
          </div>
        </Show>
      </div>
    </div>
  );
}

function Progress() {
  const [now, setNow] = createSignal(Date.now());

  const duration = () => track()?.duration || 0;

  // SomaFM and Nightride publish no timing at all, so there's nothing to
  // advance for them and no bar to draw.
  const hasBar = () => duration() > 0 && !!track()?.startedAt;

  // The clock only runs when something is actually counting. The component is
  // already only mounted while the panel is open, so between the two there's no
  // timer at all unless a bar is on screen moving.
  createEffect(() => {
    if (!hasBar()) return;

    const timer = setInterval(() => setNow(Date.now()), 1000);
    onCleanup(() => clearInterval(timer));
  });

  const elapsed = createMemo(() => {
    const started = track()?.startedAt;
    if (!started) return 0;

    return Math.max(0, Math.min(duration(), (now() - started) / 1000));
  });

  return (
    <Show when={hasBar()}>
      <div class="rad-progress">
        <div class="rad-bar">
          <span
            style={{
              width: `${Math.min(100, (elapsed() / duration()) * 100)}%`,
              background: currentStation().accent,
            }}
          />
        </div>
        <div class="rad-times">
          <span>{clock(elapsed())}</span>
          <span>{clock(duration())}</span>
        </div>
      </div>
    </Show>
  );
}

function Controls() {
  return (
    <div class="rad-controls">
      <button
        type="button"
        class="rad-play"
        style={{ background: currentStation().accent }}
        aria-label={playing() ? "Pause" : "Play"}
        onClick={toggle}
      >
        <Show when={!loading()} fallback={<div class="rad-spinner" />}>
          <Show when={playing()} fallback={<PlayIcon />}>
            <PauseIcon />
          </Show>
        </Show>
      </button>

      <div class="rad-volume">
        <button
          type="button"
          class="rad-mute"
          aria-label={store.muted ? "Unmute" : "Mute"}
          onClick={() => setMuted(!store.muted)}
        >
          <VolumeIcon muted={store.muted || store.volume === 0} />
        </button>

        {/* 0–100 deliberately: Slider clamps a value above 100 to 100 before
            min/max are applied, which strands the thumb. */}
        <Slider min={0} max={100} step={1} value={store.volume} onInput={setVolume} />
      </div>
    </div>
  );
}

function Footer() {
  const detail = createMemo(() => {
    const t = track();

    if (status() === "error") return "Can't reach this station's info";
    if (!t) return status() === "connecting" ? "Connecting…" : currentStation().name;

    const parts = [];
    if (t.listeners != null) parts.push(`${t.listeners} listening`);
    if (t.dj) parts.push(`DJ ${t.dj}`);
    if (t.requester) parts.push(`requested by ${t.requester}`);
    if (!parts.length && t.album) parts.push(t.album);

    return parts.join(" · ") || currentStation().name;
  });

  return (
    <div class="rad-foot">
      <span class="rad-dot" data-status={status()} />
      <span class="rad-foot-text">{detail()}</span>
    </div>
  );
}

export default function Panel() {
  let panel;
  const [pos, setPos] = createSignal({ top: 44, right: 12 });

  const place = () => {
    const anchor = anchorEl();
    if (!anchor?.isConnected) return;

    const rect = anchor.getBoundingClientRect();
    setPos({
      top: Math.round(rect.bottom + 10),
      // Right-aligned to the button, but never off the edge of a narrow window.
      right: Math.max(12, Math.round(window.innerWidth - rect.right)),
    });
  };

  // The panel is mounted at #app-mount so that `position: fixed` can't be
  // captured by a transformed ancestor. That puts Discord's .theme-light /
  // .theme-dark class in a sibling subtree rather than above us, so the class
  // is copied onto our own root instead — read fresh on every open, which is
  // also what makes it follow a theme change.
  const applyTheme = () => {
    const root = panel?.closest(".rad-root");
    if (!root) return;

    const light = !!anchorEl()?.closest(".theme-light");
    root.classList.toggle("theme-light", light);
    root.classList.toggle("theme-dark", !light);
  };

  onMount(() => {
    place();
    applyTheme();

    const dismiss = (e) => {
      if (panel?.contains(e.target)) return;
      // The button toggles itself; closing here too would immediately reopen it.
      if (anchorEl()?.contains(e.target)) return;
      closePanel();
    };

    const escape = (e) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      closePanel();
    };

    // Capture, so Discord's own handlers can't swallow these first.
    document.addEventListener("pointerdown", dismiss, true);
    document.addEventListener("keydown", escape, true);
    window.addEventListener("resize", place);

    onCleanup(() => {
      document.removeEventListener("pointerdown", dismiss, true);
      document.removeEventListener("keydown", escape, true);
      window.removeEventListener("resize", place);
    });
  });

  return (
    <div
      class="rad-panel"
      ref={panel}
      style={{
        top: `${pos().top}px`,
        right: `${pos().right}px`,
        // Read by the progress fill, the play button and the volume slider.
        "--rad-accent": currentStation().accent,
      }}
      role="dialog"
      aria-label="Radio"
    >
      <div class="rad-head">
        <button
          type="button"
          class="rad-station"
          aria-label="Choose a station"
          onClick={() => (view() === "stations" ? showPlayer() : showStations())}
        >
          <span class="rad-station-name">{currentStation().name}</span>
          <span class="rad-station-group">{currentStation().group}</span>
          <CaretIcon up={view() === "stations"} />
        </button>

        <Show when={playing()}>
          <div style={{ color: currentStation().accent }}>
            <Bars />
          </div>
        </Show>
      </div>

      {/* One element per branch. Show memoizes whatever `children` evaluates
          to, and a multi-child branch makes that an array rebuilt as a unit. */}
      <Show when={view() === "player"} fallback={<StationView />}>
        <PlayerView />
      </Show>
    </div>
  );
}

function PlayerView() {
  return (
    <div>
      <div class="rad-body">
        <NowPlaying />
        <Progress />
        <Controls />
      </div>
      <Footer />
    </div>
  );
}

function StationView() {
  return (
    <div>
      <StationList />
      <Footer />
    </div>
  );
}

/** Rendered once at load; the panel itself only exists while it's open. */
export function PanelHost() {
  return (
    <Show when={panelOpen()}>
      <Panel />
    </Show>
  );
}
