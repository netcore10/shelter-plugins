import { store } from "./data";

const {
  solid: { createSignal },
  ui: { showToast, ToastColors },
} = shelter;

// Spotify as a remote control, not a player.
//
// Spotify audio is DRM-protected, so it can't go through the <audio> element
// every other station uses. Instead Spotify keeps playing wherever it already
// is — the desktop app, a phone, a speaker — and this module reads what's on and
// sends it play / pause / skip / volume through the Web API.
//
// Auth is the PKCE flow: no client secret, so it's safe to run in the page. The
// user brings their own Client ID (Spotify has no shared one), and because
// Discord has no redirect target we can listen on, the redirect goes to a
// loopback address nothing serves. The browser shows "can't connect", but the
// address bar holds the code, and the user pastes that address back.

// Spotify only accepts loopback redirects over plain http, and only as an IP —
// "localhost" is rejected. The user adds this exact string to their app.
export const REDIRECT_URI = "http://127.0.0.1:8888/callback";

const SCOPES = "user-read-playback-state user-modify-playback-state";
const ACCOUNTS = "https://accounts.spotify.com";
const API = "https://api.spotify.com/v1";

const [playing, setPlaying] = createSignal(false);
const [volume, setVolumeSignal] = createSignal(null);
const [canVolume, setCanVolume] = createSignal(true);

export { playing, volume, canVolume };

export const connected = () => !!store.spotifyRefresh;

// --- auth -----------------------------------------------------------------

const base64url = (bytes) =>
  btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

const randomString = (bytes) => base64url(crypto.getRandomValues(new Uint8Array(bytes)));

/** The URL to open in a browser. Remembers the verifier for finishAuth(). */
export async function beginAuth() {
  const clientId = store.spotifyClientId.trim();
  if (!clientId) throw new Error("Enter your Spotify Client ID first.");

  const verifier = randomString(48);
  const state = randomString(12);
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));

  store.spotifyVerifier = verifier;
  store.spotifyState = state;

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    state,
    code_challenge_method: "S256",
    code_challenge: base64url(new Uint8Array(digest)),
  });

  return `${ACCOUNTS}/authorize?${params}`;
}

async function tokenRequest(body) {
  const res = await fetch(`${ACCOUNTS}/api/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: store.spotifyClientId.trim(), ...body }),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(json.error_description || json.error || `HTTP ${res.status}`);
    err.code = json.error;
    throw err;
  }

  return json;
}

function saveTokens(json) {
  store.spotifyAccess = json.access_token;
  // A refresh doesn't always hand back a new refresh token; keep the old one.
  if (json.refresh_token) store.spotifyRefresh = json.refresh_token;
  store.spotifyExpires = Date.now() + json.expires_in * 1000;
}

/** Takes whatever the user pasted: the full redirect address, or a bare code. */
export async function finishAuth(pasted) {
  const text = pasted.trim();
  if (!text) throw new Error("Paste the address you were sent to.");

  let code = text;
  let state = null;

  if (text.includes("?") || text.includes("code=")) {
    const query = text.includes("?") ? text.slice(text.indexOf("?") + 1) : text;
    const params = new URLSearchParams(query.split("#")[0]);

    if (params.get("error")) throw new Error(`Spotify said: ${params.get("error")}`);

    code = params.get("code");
    state = params.get("state");
    if (!code) throw new Error("That address has no code in it.");
  }

  if (state && state !== store.spotifyState) throw new Error("That login doesn't match this attempt. Press Connect again.");
  if (!store.spotifyVerifier) throw new Error("Press Connect first.");

  saveTokens(
    await tokenRequest({
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
      code_verifier: store.spotifyVerifier,
    }),
  );

  store.spotifyVerifier = "";
  store.spotifyState = "";
}

export function disconnect() {
  store.spotifyAccess = "";
  store.spotifyRefresh = "";
  store.spotifyExpires = 0;
  store.spotifyVerifier = "";
  store.spotifyState = "";
  setPlaying(false);
}

let refreshing = null;

function refresh() {
  // One at a time: the poll and a button press can both find the token stale.
  refreshing ??= tokenRequest({ grant_type: "refresh_token", refresh_token: store.spotifyRefresh })
    .then(saveTokens)
    .catch((err) => {
      // A revoked or rotated-out grant won't ever work again; anything else
      // (offline, a 5xx) is worth retrying later.
      if (err.code === "invalid_grant") disconnect();
      throw err;
    })
    .finally(() => (refreshing = null));

  return refreshing;
}

async function accessToken() {
  if (!store.spotifyRefresh) throw new Error("Spotify isn't connected.");
  if (!store.spotifyAccess || Date.now() > store.spotifyExpires - 30_000) await refresh();
  return store.spotifyAccess;
}

async function api(path, init = {}) {
  const send = async () =>
    fetch(`${API}${path}`, {
      ...init,
      headers: { ...init.headers, Authorization: `Bearer ${await accessToken()}` },
    });

  let res = await send();

  if (res.status === 401) {
    store.spotifyExpires = 0; // rejected early; force a refresh and go again
    res = await send();
  }

  return res;
}

// --- state ----------------------------------------------------------------

// The cover images come largest first. The panel shows it small, so take the
// smallest one that's still sharp rather than downloading 640px for a 56px tile.
const pickArt = (images = []) => (images.filter((i) => (i.width ?? 0) >= 160).pop() ?? images[0])?.url ?? null;

/**
 * What's on, as a normalised track — or null when no Spotify device is active.
 * Also keeps the playing / volume signals in step, so the panel's controls show
 * what the device is really doing rather than what we last asked of it.
 */
export async function fetchState() {
  const res = await api("/me/player?additional_types=episode");

  // 204: logged in, but no device has played anything recently.
  if (res.status === 204) {
    setPlaying(false);
    return null;
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const body = await res.json();

  setPlaying(!!body.is_playing);
  setVolumeSignal(body.device?.volume_percent ?? null);
  setCanVolume(body.device?.supports_volume !== false);

  const item = body.item;
  if (!item) return null;

  return {
    title: item.name,
    artist: item.artists?.map((a) => a.name).join(", ") || item.show?.name || null,
    album: item.album?.name || item.show?.name || null,
    art: pickArt(item.album?.images ?? item.images),
    duration: item.duration_ms / 1000,
    startedAt: Date.now() - body.progress_ms,
    progress: body.progress_ms / 1000,
    paused: !body.is_playing,
    device: body.device?.name ?? null,
  };
}

// --- controls -------------------------------------------------------------

// Set by the provider so a button press can ask for an immediate re-read instead
// of waiting out the poll interval.
let nudgeFn = null;
export const onNudge = (fn) => (nudgeFn = fn);
const nudge = () => setTimeout(() => nudgeFn?.(), 350);

function complain(status) {
  const content =
    status === 404
      ? "No active Spotify device. Start playing something in Spotify first, then try again."
      : status === 403
        ? "Spotify only lets Premium accounts control playback."
        : status === 429
          ? "Spotify is rate-limiting us. Give it a moment."
          : `Spotify refused that (HTTP ${status}).`;

  showToast({ title: "Radio", content, color: ToastColors.DANGER });
}

async function command(path, method = "PUT") {
  try {
    const res = await api(path, { method });
    if (!res.ok && res.status !== 204) complain(res.status);
  } catch (err) {
    showToast({ title: "Radio", content: `Couldn't reach Spotify: ${err?.message ?? err}`, color: ToastColors.DANGER });
  }

  nudge();
}

export function play() {
  setPlaying(true);
  return command("/me/player/play");
}

export function pause() {
  setPlaying(false);
  return command("/me/player/pause");
}

export const next = () => command("/me/player/next", "POST");
export const previous = () => command("/me/player/previous", "POST");

let volumeTimer = null;
let volumeWanted = null;

/** Throttled: a dragged slider would otherwise fire a request per pixel. */
export function setVolume(percent) {
  volumeWanted = Math.max(0, Math.min(100, Math.round(percent)));
  setVolumeSignal(volumeWanted);

  if (volumeTimer) return;

  volumeTimer = setTimeout(() => {
    volumeTimer = null;
    command(`/me/player/volume?volume_percent=${volumeWanted}`);
  }, 250);
}

export function destroy() {
  clearTimeout(volumeTimer);
  volumeTimer = null;
  nudgeFn = null;
}

/** Diagnostics: which half is failing — the network, the login, or the device. */
export async function debug() {
  try {
    const res = await api("/me/player");
    return { connected: connected(), status: res.status, playing: playing() };
  } catch (err) {
    return { connected: connected(), error: String(err?.message ?? err) };
  }
}
