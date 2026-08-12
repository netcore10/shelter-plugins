import { store } from "./data";

const {
  solid: { createSignal },
  ui: { showToast, ToastColors },
} = shelter;

const [playing, setPlaying] = createSignal(false);
const [loading, setLoading] = createSignal(false);

export { playing, loading };

export const active = () => playing() || loading();

/**
 * Whether audio is actually coming out, asked of the element rather than our
 * signals. The two can drift — a `pause` event we mis-read, a recovery that
 * gave up — and when they do, "is it playing?" has to be answered by the thing
 * making the sound, or a station switch turns into a no-op you can still hear.
 *
 * Deliberately not reactive: it's for decisions, not rendering.
 */
export const isLive = () => !!audio && !audio.paused && !!audio.getAttribute("src");

let audio = null;
let retryTimer = null;
let retries = 0;

// Bumped on every deliberate play() or stop(). Tearing down a load makes the
// element fire `error`, so without a way to tell "the stream died" from "we
// replaced it on purpose", switching station looked like a failure: the
// recovery below fought the new load, ran out of attempts, and left the state
// saying stopped while the previous station was still audible.
let generation = 0;

function element() {
  if (audio) return audio;

  audio = new Audio();
  audio.preload = "none";
  audio.volume = (store.volume ?? 35) / 100;
  audio.muted = !!store.muted;

  audio.addEventListener("playing", () => {
    retries = 0;
    setLoading(false);
    setPlaying(true);
  });
  audio.addEventListener("waiting", () => setLoading(true));
  audio.addEventListener("pause", () => setPlaying(false));

  // A live stream never legitimately ends, so `ended` means the same as `error`.
  audio.addEventListener("error", recover);
  audio.addEventListener("ended", recover);

  return audio;
}

/**
 * A dropped stream is routine — relay restarts, the station cycling servers, a
 * flaky connection. Reconnect a few times before bothering the user.
 */
function recover() {
  if (!audio?.getAttribute("src")) return; // we tore the source down on purpose

  // An aborted load is us replacing the source, not the stream failing.
  if (audio.error?.code === MediaError.MEDIA_ERR_ABORTED) return;

  const token = generation;

  setPlaying(false);

  if (retries >= 5) {
    // Leave the element genuinely stopped rather than claiming it is. Getting
    // this wrong is what made a later station switch a no-op.
    teardownSource();
    setLoading(false);
    showToast({
      title: "Radio",
      content: "The stream keeps dropping. Try another station or quality.",
      color: ToastColors.DANGER,
    });
    return;
  }

  setLoading(true);

  const url = audio.getAttribute("src");
  clearTimeout(retryTimer);
  retryTimer = setTimeout(
    () => {
      // Anything the user did in the meantime wins over this retry.
      if (!audio || token !== generation) return;

      audio.src = url;
      audio.load();
      audio.play().catch(() => {});
    },
    Math.min(15_000, 1000 * 2 ** retries++),
  );
}

/** Drop the source so the buffer goes with it; see stop(). */
function teardownSource() {
  if (!audio) return;

  audio.pause();
  audio.removeAttribute("src");
  audio.load();
}

export function play(url) {
  if (!url) {
    showToast({ title: "Radio", content: "That station has no stream URL.", color: ToastColors.DANGER });
    return;
  }

  const el = element();
  const token = ++generation;

  clearTimeout(retryTimer);
  retries = 0;
  setLoading(true);

  el.src = url;
  el.load();
  el.play().catch((err) => {
    // A play() cut short by the next station's load is expected, not an error
    // worth showing — and the newer load owns the state now.
    if (token !== generation || err?.name === "AbortError") return;

    setLoading(false);
    setPlaying(false);
    showToast({
      title: "Radio",
      content: `Couldn't start the stream: ${err?.message ?? err}`,
      color: ToastColors.DANGER,
    });
  });
}

export function stop() {
  clearTimeout(retryTimer);
  retries = 0;
  generation++;

  setPlaying(false);
  setLoading(false);

  // Drop the source as well as pausing. Without this the buffer survives and a
  // resume picks up where it left off — minutes behind live.
  teardownSource();
}

export function setVolume(percent) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));

  store.volume = clamped;
  if (audio) audio.volume = clamped / 100;
}

export function setMuted(muted) {
  store.muted = !!muted;
  if (audio) audio.muted = !!muted;
}

export function destroy() {
  stop();

  if (audio) {
    audio.removeEventListener("error", recover);
    audio.removeEventListener("ended", recover);
    audio = null;
  }
}
