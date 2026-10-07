(function(exports) {

//#region rolldown:runtime
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function() {
	return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
};
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));

//#endregion

//#region plugins/radio/data.js
const { plugin: { store } } = shelter;
store.station ??= "listenmoe-jpop";
store.quality ??= "opus";
store.volume ??= 35;
store.muted ??= false;
store.romaji ??= true;
store.mediaSession ??= true;
store.spotifyClientId ??= "";
store.spotifyAccess ??= "";
store.spotifyRefresh ??= "";
store.spotifyExpires ??= 0;
store.spotifyVerifier ??= "";
store.spotifyState ??= "";
try {
	if (typeof store.custom !== "string") store.custom = "[]";
} catch {
	store.custom = "[]";
}

//#endregion
//#region plugins/radio/styles.js
var styles_default = `
.rad-mount, .rad-host { display: contents; }

.rad-root {
  --rad-fb-bg: #111214;
  --rad-fb-text: #f2f3f5;
  --rad-fb-dim: #b5bac1;
  --rad-fb-muted: #949ba4;
  --rad-fb-line: rgba(255, 255, 255, .07);
  --rad-fb-hover: rgba(255, 255, 255, .06);
  --rad-fb-active: rgba(255, 255, 255, .09);
  --rad-fb-track: rgba(255, 255, 255, .12);
  --rad-fb-shadow: rgba(0, 0, 0, .5);
}

.rad-root.theme-light {
  --rad-fb-bg: #fff;
  --rad-fb-text: #14151a;
  --rad-fb-dim: #4e5058;
  --rad-fb-muted: #5c5e66;
  --rad-fb-line: rgba(0, 0, 0, .09);
  --rad-fb-hover: rgba(0, 0, 0, .05);
  --rad-fb-active: rgba(0, 0, 0, .07);
  --rad-fb-track: rgba(0, 0, 0, .12);
  --rad-fb-shadow: rgba(0, 0, 0, .16);
}

.rad-root {
  /* Darkest-first, and the base tokens lead deliberately.
     Measured on a current build: --background-floating and --background-secondary
     both come back EMPTY, and an empty custom property still counts as defined —
     var() takes the empty value rather than the fallback, and the declaration
     goes invalid at computed-value time. They stay in the chain for older builds
     that do define them, but never ahead of a token known to resolve. */
  --rad-bg: var(--background-base-lowest, var(--background-base-lower, var(--background-floating, var(--background-secondary, var(--rad-fb-bg)))));
  --rad-text: var(--text-default, var(--text-normal, var(--rad-fb-text)));
  --rad-dim: var(--text-secondary, var(--interactive-normal, var(--rad-fb-dim)));
  --rad-muted: var(--text-muted, var(--channels-default, var(--rad-fb-muted)));
  --rad-line: var(--border-subtle, var(--background-modifier-accent, var(--rad-fb-line)));
  --rad-hover: var(--background-modifier-hover, var(--rad-fb-hover));
  --rad-active: var(--background-modifier-selected, var(--rad-fb-active));
  --rad-track: var(--background-modifier-accent, var(--rad-fb-track));
}

/* ------------------------------------------------------------------ button */

.rad-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  cursor: pointer;
}

/* Decorative, not a spectrum: the streams send no CORS headers, so Web Audio
   can't see the audio at all. */
.rad-bars {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 13px;
}

.rad-bars i {
  width: 2.5px;
  height: 100%;
  border-radius: 1px;
  background: currentColor;
  transform-origin: bottom;
  animation: rad-bar 900ms ease-in-out infinite;
}

.rad-bars i:nth-child(2) { animation-delay: -300ms; }
.rad-bars i:nth-child(3) { animation-delay: -600ms; }

@keyframes rad-bar {
  0%, 100% { transform: scaleY(.28); }
  50%      { transform: scaleY(1); }
}

@media (prefers-reduced-motion: reduce) {
  .rad-bars i { animation: none; transform: scaleY(.6); }
}

/* ------------------------------------------------------------------- panel */

.rad-panel {
  position: fixed;
  z-index: 3000;
  width: 328px;
  border-radius: 10px;
  overflow: hidden;
  /* Solid colour underneath, themed colour layered on top. A bad theme
     variable kills the image, never the colour, so this can't go transparent. */
  background-color: var(--rad-fb-bg);
  background-image: linear-gradient(var(--rad-bg), var(--rad-bg));
  color: var(--rad-text);
  border: 1px solid var(--rad-line);
  box-shadow: 0 10px 34px var(--rad-fb-shadow);
  font-family: var(--font-primary, "gg sans", sans-serif);
  animation: rad-in 140ms ease-out;
}

@keyframes rad-in {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: none; }
}

@media (prefers-reduced-motion: reduce) {
  .rad-panel { animation: none; }
}

.rad-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--rad-line);
}

.rad-station {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: baseline;
  gap: 6px;
  cursor: pointer;
  background: none;
  border: 0;
  padding: 0;
  color: inherit;
  font: inherit;
  text-align: left;
}

.rad-station-name {
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rad-station-group {
  font-size: 11px;
  color: var(--rad-muted);
  white-space: nowrap;
}

.rad-head-btn {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  background: none;
  border: 0;
  padding: 0;
  cursor: pointer;
  color: var(--rad-muted);
}

.rad-head-btn:hover { color: var(--rad-text); }

.rad-station .rad-caret {
  flex: 0 0 auto;
  opacity: .55;
  transition: transform 120ms ease;
}

.rad-station:hover .rad-caret { opacity: 1; }

/* --------------------------------------------------------------- now playing */

.rad-body { padding: 14px 12px 12px; }

.rad-track {
  display: flex;
  gap: 12px;
  align-items: center;
}

.rad-art {
  flex: 0 0 auto;
  width: 72px;
  height: 72px;
  border-radius: 8px;
  object-fit: cover;
  background: var(--rad-hover);
}

.rad-art-blank {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, .3);
}

.rad-meta {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* Two lines, then ellipsis. Track titles get long and a panel that changes
   height every few minutes is distracting. */
.rad-title {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.25;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  overflow-wrap: anywhere;
}

.rad-sub, .rad-alt {
  font-size: 12px;
  color: var(--rad-dim);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rad-alt { color: var(--rad-muted); font-size: 11px; }

.rad-tag {
  align-self: flex-start;
  margin-top: 2px;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: .02em;
  text-transform: uppercase;
  color: #fff;
}

/* ---------------------------------------------------------------- progress */

.rad-progress { margin: 12px 0 2px; }

.rad-bar {
  height: 4px;
  border-radius: 2px;
  background: var(--rad-track);
  overflow: hidden;
}

/* Matches the 1s tick, so the fill glides instead of stepping. */
.rad-bar span {
  display: block;
  height: 100%;
  border-radius: 2px;
  transition: width 1s linear;
}

.rad-times {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  color: var(--rad-muted);
}

/* ---------------------------------------------------------------- controls */

.rad-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
}

.rad-play {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border: 0;
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  transition: transform 100ms ease, filter 100ms ease;
}

.rad-skip {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: none;
  border: 0;
  border-radius: 50%;
  color: var(--interactive-normal, #b5bac1);
  cursor: pointer;
}

.rad-skip:hover { color: var(--interactive-hover, #fff); background: var(--rad-line, rgba(255, 255, 255, .08)); }

.rad-play:hover { filter: brightness(1.12); }
.rad-play:active { transform: scale(.93); }

.rad-spinner {
  width: 15px;
  height: 15px;
  border: 2px solid rgba(255, 255, 255, .35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: rad-spin 700ms linear infinite;
}

@keyframes rad-spin { to { transform: rotate(360deg); } }

.rad-volume {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.rad-mute {
  flex: 0 0 auto;
  display: flex;
  background: none;
  border: 0;
  padding: 0;
  cursor: pointer;
  color: var(--rad-dim);
}

.rad-mute:hover { color: var(--rad-text); }

/* shelter's Slider is built for a settings page: --bar-offset gives it 24px of
   lead-in for tick labels we don't use, making the control 48px tall. */
.rad-volume [class*="scontainer"] {
  --bar-offset: 0px;
  margin: 0 !important;
  flex: 1;
  height: 24px;
}

/* The fill is painted on the track pseudo-elements (::-webkit-slider-runnable-track
   and friends) from var(--blurple-50) — the input's own background is
   transparent, which is why styling it did nothing. Redefining the variable
   here recolours the fill to the station accent: custom properties inherit into
   pseudo-elements, so there's no need to restate the gradient or fight
   specificity. */
.rad-volume input[type="range"] {
  --blurple-50: var(--rad-accent, #ff015b);
}

/* ------------------------------------------------------------------ footer */

.rad-foot {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-top: 1px solid var(--rad-line);
  font-size: 11px;
  color: var(--rad-muted);
}

.rad-foot-text {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rad-dot {
  flex: 0 0 auto;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--rad-muted);
}

/* Status colours are semantic, not decorative — Discord's own green/amber/red
   where the build exposes them. */
.rad-dot[data-status="live"] { background: var(--status-positive, var(--text-positive, #23a55a)); }
.rad-dot[data-status="connecting"] { background: var(--status-warning, var(--text-warning, #f0b232)); animation: rad-blink 1s ease-in-out infinite; }
.rad-dot[data-status="error"] { background: var(--status-danger, var(--text-danger, #f23f43)); }

@keyframes rad-blink { 50% { opacity: .3; } }

@media (prefers-reduced-motion: reduce) {
  .rad-dot[data-status="connecting"] { animation: none; }
}

/* ------------------------------------------------------------ station list */

.rad-list {
  max-height: 340px;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 6px;
}

.rad-list::-webkit-scrollbar { width: 8px; }
.rad-list::-webkit-scrollbar-thumb {
  background: var(--rad-track);
  border-radius: 4px;
}

.rad-group {
  padding: 8px 6px 4px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .04em;
  text-transform: uppercase;
  color: var(--rad-muted);
}

.rad-item {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  padding: 6px;
  border: 0;
  border-radius: 6px;
  background: none;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.rad-item:hover { background: var(--rad-hover); }
.rad-item[aria-current="true"] { background: var(--rad-active); }

.rad-item-art {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  object-fit: cover;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
}

.rad-item-text { min-width: 0; flex: 1; }

.rad-item-name {
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rad-item-genre {
  font-size: 11px;
  color: var(--rad-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* --------------------------------------------------------------- segmented */

.rad-seg {
  display: flex;
  gap: 4px;
  padding: 3px;
  border-radius: 7px;
  background: var(--rad-hover);
}

.rad-seg button {
  flex: 1;
  padding: 5px 8px;
  border: 0;
  border-radius: 5px;
  background: none;
  color: var(--rad-dim);
  font: inherit;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
}

.rad-seg button:hover { color: var(--rad-text); }

.rad-seg button[aria-pressed="true"] {
  background: var(--rad-active);
  color: var(--rad-text);
}

/* ---------------------------------------------------------------- settings */

/* Rendered inside Discord's settings modal, which is already in the themed
   subtree, so these read the variables directly. */
.rad-settings-row { margin: 14px 0; }

.rad-settings-label {
  margin-bottom: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--header-secondary, var(--text-secondary, #b5bac1));
}

.rad-custom {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
}

.rad-custom-text { flex: 1; min-width: 0; }

.rad-custom-url {
  font-size: 11px;
  color: var(--text-muted, #949ba4);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
`;

//#endregion
//#region solid-js/web
var require_web = __commonJS({ "solid-js/web"(exports, module) {
	module.exports = shelter.solidWeb;
} });

//#endregion
//#region plugins/radio/player.js
const { solid: { createSignal: createSignal$6 }, ui: { showToast: showToast$2, ToastColors: ToastColors$2 } } = shelter;
const [playing$1, setPlaying$1] = createSignal$6(false);
const [loading, setLoading] = createSignal$6(false);
const active = () => playing$1() || loading();
const isLive = () => !!audio && !audio.paused && !!audio.getAttribute("src");
function state() {
	if (!audio) return { element: false };
	return {
		element: true,
		src: audio.currentSrc || null,
		paused: audio.paused,
		muted: audio.muted,
		volume: audio.volume,
		currentTime: audio.currentTime,
		readyState: audio.readyState,
		networkState: audio.networkState,
		error: audio.error?.code ?? null
	};
}
let audio = null;
let retryTimer = null;
let retries = 0;
let generation = 0;
function element() {
	if (audio) return audio;
	audio = new Audio();
	audio.preload = "none";
	audio.volume = (store.volume ?? 35) / 100;
	audio.muted = !!store.muted;
	audio.setAttribute("aria-hidden", "true");
	audio.style.display = "none";
	document.body.append(audio);
	audio.addEventListener("playing", () => {
		retries = 0;
		setLoading(false);
		setPlaying$1(true);
	});
	audio.addEventListener("waiting", () => setLoading(true));
	audio.addEventListener("pause", () => setPlaying$1(false));
	audio.addEventListener("error", recover);
	audio.addEventListener("ended", recover);
	return audio;
}
/**
* A dropped stream is routine — relay restarts, the station cycling servers, a
* flaky connection. Reconnect a few times before bothering the user.
*/
function recover() {
	if (!audio?.getAttribute("src")) return;
	if (audio.error?.code === MediaError.MEDIA_ERR_ABORTED) return;
	const token = generation;
	setPlaying$1(false);
	if (retries >= 5) {
		teardownSource();
		setLoading(false);
		showToast$2({
			title: "Radio",
			content: "The stream keeps dropping. Try another station or quality.",
			color: ToastColors$2.DANGER
		});
		return;
	}
	setLoading(true);
	const url = audio.getAttribute("src");
	clearTimeout(retryTimer);
	retryTimer = setTimeout(() => {
		if (!audio || token !== generation) return;
		audio.src = url;
		audio.load();
		audio.play().catch(() => {});
	}, Math.min(15e3, 1e3 * 2 ** retries++));
}
/** Drop the source so the buffer goes with it; see stop(). */
function teardownSource() {
	if (!audio) return;
	audio.pause();
	audio.removeAttribute("src");
	audio.load();
}
function resume() {
	if (!audio?.getAttribute("src")) return false;
	const token = ++generation;
	setLoading(true);
	audio.play().catch((err) => {
		if (token !== generation || err?.name === "AbortError") return;
		setLoading(false);
		setPlaying$1(false);
	});
	return true;
}
function play$1(url) {
	if (!url) {
		showToast$2({
			title: "Radio",
			content: "That station has no stream URL.",
			color: ToastColors$2.DANGER
		});
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
		if (token !== generation || err?.name === "AbortError") return;
		setLoading(false);
		setPlaying$1(false);
		showToast$2({
			title: "Radio",
			content: `Couldn't start the stream: ${err?.message ?? err}`,
			color: ToastColors$2.DANGER
		});
	});
}
function pause$2() {
	clearTimeout(retryTimer);
	retries = 0;
	generation++;
	setPlaying$1(false);
	setLoading(false);
	audio?.pause();
}
function stop$1() {
	clearTimeout(retryTimer);
	retries = 0;
	generation++;
	setPlaying$1(false);
	setLoading(false);
	teardownSource();
}
function setVolume$1(percent) {
	const clamped = Math.max(0, Math.min(100, Math.round(percent)));
	store.volume = clamped;
	if (audio) audio.volume = clamped / 100;
}
function setMuted(muted) {
	store.muted = !!muted;
	if (audio) audio.muted = !!muted;
}
function destroy$1() {
	stop$1();
	if (audio) {
		audio.removeEventListener("error", recover);
		audio.removeEventListener("ended", recover);
		audio.remove();
		audio = null;
	}
}

//#endregion
//#region plugins/radio/providers/listenmoe.js
var listenmoe_exports = {};
__export(listenmoe_exports, { connect: () => connect$6 });
const OP_HELLO = 0;
const OP_EVENT = 1;
const OP_HEARTBEAT = 9;
const CDN = "https://cdn.listen.moe";
const asset = (kind, file) => `${CDN}/${kind}/${encodeURIComponent(file)}`;
function artworkFor(song) {
	const album = song?.albums?.find((a) => a.image)?.image;
	if (album) return asset("covers", album);
	const artist = song?.artists?.find((a) => a.image)?.image;
	if (artist) return asset("artists", artist);
	return null;
}
const join = (list, pick) => list?.map(pick).filter(Boolean).join(", ") || null;
/**
* Both scripts are kept — which one is shown is a display preference that can
* change without a new track arriving, so the UI picks rather than us.
*/
function normalise(d) {
	const song = d?.song ?? {};
	const source$1 = song.sources?.[0];
	const duration = song.duration || null;
	const ends = d?.startTime ? Date.parse(d.startTime) || null : null;
	return {
		title: song.title || "Unknown track",
		titleAlt: song.titleRomaji || null,
		artist: join(song.artists, (a) => a.name),
		artistAlt: join(song.artists, (a) => a.nameRomaji || a.name),
		album: song.albums?.[0]?.name || null,
		source: source$1?.nameRomaji || source$1?.name || null,
		art: artworkFor(song),
		startedAt: ends && duration ? ends - duration * 1e3 : null,
		duration,
		listeners: d?.listeners ?? null,
		requester: d?.requester?.displayName || d?.requester?.username || null,
		event: d?.event?.name || null
	};
}
function connect$6(station, sink) {
	let socket = null;
	let heartbeat = null;
	let retryTimer$1 = null;
	let attempt = 0;
	let stopped = false;
	const open$1 = () => {
		if (stopped) return;
		sink.status("connecting");
		const sock = new WebSocket(station.provider.gateway);
		socket = sock;
		sock.onopen = () => sock.send(JSON.stringify({
			op: OP_HELLO,
			d: { auth: "" }
		}));
		sock.onmessage = (e) => {
			let msg;
			try {
				msg = JSON.parse(e.data);
			} catch {
				return;
			}
			if (msg.op === OP_HELLO) {
				attempt = 0;
				sink.status("live");
				clearInterval(heartbeat);
				heartbeat = setInterval(() => {
					if (sock.readyState === WebSocket.OPEN) sock.send(JSON.stringify({ op: OP_HEARTBEAT }));
				}, msg.d?.heartbeat ?? 35e3);
				return;
			}
			if (msg.op !== OP_EVENT) return;
			if (msg.t !== "TRACK_UPDATE" && msg.t !== "TRACK_UPDATE_REQUEST") return;
			sink.track(normalise(msg.d));
		};
		sock.onerror = () => {
			try {
				sock.close();
			} catch {}
		};
		sock.onclose = () => {
			if (socket !== sock) return;
			socket = null;
			clearInterval(heartbeat);
			heartbeat = null;
			if (stopped) return;
			sink.status(attempt > 2 ? "error" : "connecting");
			const base = Math.min(3e4, 1e3 * 2 ** attempt++);
			retryTimer$1 = setTimeout(open$1, base * (.7 + Math.random() * .6));
		};
	};
	open$1();
	return () => {
		stopped = true;
		clearInterval(heartbeat);
		clearTimeout(retryTimer$1);
		if (!socket) return;
		const dying = socket;
		socket = null;
		dying.onopen = dying.onmessage = dying.onerror = dying.onclose = null;
		try {
			dying.close();
		} catch {}
	};
}

//#endregion
//#region plugins/radio/providers/poll.js
function startPolling({ url, interval, parse, sink }) {
	let timer = null;
	let stopped = false;
	let failures = 0;
	const tick = async () => {
		try {
			const res = await fetch(url, { cache: "no-store" });
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const body = await res.json();
			if (stopped) return;
			failures = 0;
			sink.status("live");
			sink.track(parse(body));
		} catch {
			if (stopped) return;
			failures++;
			sink.status(failures > 2 ? "error" : "connecting");
		} finally {
			if (!stopped) {
				const wait = failures ? Math.min(6e4, interval * 2 ** failures) : interval;
				timer = setTimeout(tick, wait);
			}
		}
	};
	sink.status("connecting");
	tick();
	return () => {
		stopped = true;
		clearTimeout(timer);
	};
}

//#endregion
//#region plugins/radio/providers/radio.js
var radio_exports = {};
__export(radio_exports, { connect: () => connect$5 });
/** Now-playing arrives as one "artist - title" string, sometimes without the dash. */
function split(np = "") {
	const at = np.indexOf(" - ");
	if (at < 0) return {
		artist: null,
		title: np.trim() || "Unknown track"
	};
	return {
		artist: np.slice(0, at).trim(),
		title: np.slice(at + 3).trim()
	};
}
function connect$5(station, sink) {
	return startPolling({
		url: "https://r-a-d.io/api",
		interval: 15e3,
		sink,
		parse: (body) => {
			const main = body?.main ?? {};
			const { artist, title } = split(main.np);
			return {
				title,
				artist,
				startedAt: main.start_time ? main.start_time * 1e3 : null,
				duration: main.start_time && main.end_time ? main.end_time - main.start_time : null,
				listeners: main.listeners ?? null,
				dj: !main.isafkstream ? main.dj?.djname || null : null
			};
		}
	});
}

//#endregion
//#region plugins/radio/providers/plaza.js
var plaza_exports = {};
__export(plaza_exports, { connect: () => connect$4 });
function connect$4(station, sink) {
	return startPolling({
		url: "https://api.plaza.one/status",
		interval: 1e4,
		sink,
		parse: (body) => {
			const song = body?.song ?? {};
			return {
				title: song.title || "Unknown track",
				artist: song.artist || null,
				album: song.album || null,
				art: song.artwork_src || null,
				duration: song.length || null,
				startedAt: song.position != null ? Date.now() - song.position * 1e3 : null,
				listeners: body?.listeners ?? null
			};
		}
	});
}

//#endregion
//#region plugins/radio/providers/somafm.js
var somafm_exports = {};
__export(somafm_exports, { connect: () => connect$3 });
function connect$3(station, sink) {
	return startPolling({
		url: `https://somafm.com/songs/${station.provider.channel}.json`,
		interval: 2e4,
		sink,
		parse: (body) => {
			const song = body?.songs?.[0] ?? {};
			return {
				title: song.title || "Unknown track",
				artist: song.artist || null,
				album: song.album || null,
				art: song.albumArt || null
			};
		}
	});
}

//#endregion
//#region plugins/radio/providers/nightride.js
var nightride_exports = {};
__export(nightride_exports, { connect: () => connect$2 });
const META_URL = "https://nightride.fm/meta";
const sinks = new Map();
let source = null;
function open() {
	if (source) return;
	source = new EventSource(META_URL);
	source.onopen = () => sinks.forEach((sink) => sink.status("live"));
	source.onmessage = (e) => {
		let rows;
		try {
			rows = JSON.parse(e.data);
		} catch {
			return;
		}
		for (const row of rows ?? []) {
			const sink = sinks.get(row?.station);
			if (!sink) continue;
			sink.status("live");
			sink.track({
				title: row.title || "Unknown track",
				artist: row.artist || null
			});
		}
	};
	source.onerror = () => sinks.forEach((sink) => sink.status("connecting"));
}
function close() {
	source?.close();
	source = null;
}
function connect$2(station, sink) {
	const { channel } = station.provider;
	sinks.set(channel, sink);
	sink.status("connecting");
	open();
	return () => {
		sinks.delete(channel);
		if (sinks.size === 0) close();
	};
}

//#endregion
//#region plugins/radio/spotify.js
const { solid: { createSignal: createSignal$5 }, ui: { showToast: showToast$1, ToastColors: ToastColors$1 } } = shelter;
const REDIRECT_URI = "http://127.0.0.1:8888/callback";
const SCOPES = "user-read-playback-state user-modify-playback-state";
const ACCOUNTS = "https://accounts.spotify.com";
const API = "https://api.spotify.com/v1";
const [playing, setPlaying] = createSignal$5(false);
const [volume, setVolumeSignal] = createSignal$5(null);
const [canVolume, setCanVolume] = createSignal$5(true);
const connected = () => !!store.spotifyRefresh;
const base64url = (bytes) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const randomString = (bytes) => base64url(crypto.getRandomValues(new Uint8Array(bytes)));
async function beginAuth() {
	const clientId = store.spotifyClientId.trim();
	if (!clientId) throw new Error("Enter your Spotify Client ID first.");
	const verifier = randomString(48);
	const state$1 = randomString(12);
	const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
	store.spotifyVerifier = verifier;
	store.spotifyState = state$1;
	const params = new URLSearchParams({
		client_id: clientId,
		response_type: "code",
		redirect_uri: REDIRECT_URI,
		scope: SCOPES,
		state: state$1,
		code_challenge_method: "S256",
		code_challenge: base64url(new Uint8Array(digest))
	});
	return `${ACCOUNTS}/authorize?${params}`;
}
async function tokenRequest(body) {
	const res = await fetch(`${ACCOUNTS}/api/token`, {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: new URLSearchParams({
			client_id: store.spotifyClientId.trim(),
			...body
		})
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
	if (json.refresh_token) store.spotifyRefresh = json.refresh_token;
	store.spotifyExpires = Date.now() + json.expires_in * 1e3;
}
async function finishAuth(pasted) {
	const text = pasted.trim();
	if (!text) throw new Error("Paste the address you were sent to.");
	let code = text;
	let state$1 = null;
	if (text.includes("?") || text.includes("code=")) {
		const query = text.includes("?") ? text.slice(text.indexOf("?") + 1) : text;
		const params = new URLSearchParams(query.split("#")[0]);
		if (params.get("error")) throw new Error(`Spotify said: ${params.get("error")}`);
		code = params.get("code");
		state$1 = params.get("state");
		if (!code) throw new Error("That address has no code in it.");
	}
	if (state$1 && state$1 !== store.spotifyState) throw new Error("That login doesn't match this attempt. Press Connect again.");
	if (!store.spotifyVerifier) throw new Error("Press Connect first.");
	saveTokens(await tokenRequest({
		grant_type: "authorization_code",
		code,
		redirect_uri: REDIRECT_URI,
		code_verifier: store.spotifyVerifier
	}));
	store.spotifyVerifier = "";
	store.spotifyState = "";
}
function disconnect$1() {
	store.spotifyAccess = "";
	store.spotifyRefresh = "";
	store.spotifyExpires = 0;
	store.spotifyVerifier = "";
	store.spotifyState = "";
	setPlaying(false);
}
let refreshing = null;
function refresh() {
	refreshing ??= tokenRequest({
		grant_type: "refresh_token",
		refresh_token: store.spotifyRefresh
	}).then(saveTokens).catch((err) => {
		if (err.code === "invalid_grant") disconnect$1();
		throw err;
	}).finally(() => refreshing = null);
	return refreshing;
}
async function accessToken() {
	if (!store.spotifyRefresh) throw new Error("Spotify isn't connected.");
	if (!store.spotifyAccess || Date.now() > store.spotifyExpires - 3e4) await refresh();
	return store.spotifyAccess;
}
async function api(path, init = {}) {
	const send = async () => fetch(`${API}${path}`, {
		...init,
		headers: {
			...init.headers,
			Authorization: `Bearer ${await accessToken()}`
		}
	});
	let res = await send();
	if (res.status === 401) {
		store.spotifyExpires = 0;
		res = await send();
	}
	return res;
}
const pickArt = (images = []) => (images.filter((i) => (i.width ?? 0) >= 160).pop() ?? images[0])?.url ?? null;
async function fetchState() {
	const res = await api("/me/player?additional_types=episode");
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
		duration: item.duration_ms / 1e3,
		startedAt: Date.now() - body.progress_ms,
		progress: body.progress_ms / 1e3,
		paused: !body.is_playing,
		device: body.device?.name ?? null
	};
}
let nudgeFn = null;
const onNudge = (fn) => nudgeFn = fn;
const nudge = () => setTimeout(() => nudgeFn?.(), 350);
function complain(status$1) {
	const content = status$1 === 404 ? "No active Spotify device. Start playing something in Spotify first, then try again." : status$1 === 403 ? "Spotify only lets Premium accounts control playback." : status$1 === 429 ? "Spotify is rate-limiting us. Give it a moment." : `Spotify refused that (HTTP ${status$1}).`;
	showToast$1({
		title: "Radio",
		content,
		color: ToastColors$1.DANGER
	});
}
async function command(path, method = "PUT") {
	try {
		const res = await api(path, { method });
		if (!res.ok && res.status !== 204) complain(res.status);
	} catch (err) {
		showToast$1({
			title: "Radio",
			content: `Couldn't reach Spotify: ${err?.message ?? err}`,
			color: ToastColors$1.DANGER
		});
	}
	nudge();
}
function play() {
	setPlaying(true);
	return command("/me/player/play");
}
function pause$1() {
	setPlaying(false);
	return command("/me/player/pause");
}
const next = () => command("/me/player/next", "POST");
const previous = () => command("/me/player/previous", "POST");
let volumeTimer = null;
let volumeWanted = null;
function setVolume(percent) {
	volumeWanted = Math.max(0, Math.min(100, Math.round(percent)));
	setVolumeSignal(volumeWanted);
	if (volumeTimer) return;
	volumeTimer = setTimeout(() => {
		volumeTimer = null;
		command(`/me/player/volume?volume_percent=${volumeWanted}`);
	}, 250);
}
function destroy() {
	clearTimeout(volumeTimer);
	volumeTimer = null;
	nudgeFn = null;
}
async function debug$1() {
	try {
		const res = await api("/me/player");
		return {
			connected: connected(),
			status: res.status,
			playing: playing()
		};
	} catch (err) {
		return {
			connected: connected(),
			error: String(err?.message ?? err)
		};
	}
}

//#endregion
//#region plugins/radio/providers/spotify.js
var spotify_exports = {};
__export(spotify_exports, { connect: () => connect$1 });
const PLAYING_EVERY = 4e3;
const IDLE_EVERY = 8e3;
function connect$1(station, sink) {
	if (!connected()) {
		sink.status("live");
		sink.track(null);
		return () => {};
	}
	let timer = null;
	let stopped = false;
	let failures = 0;
	const tick = async () => {
		clearTimeout(timer);
		try {
			const track$1 = await fetchState();
			if (stopped) return;
			failures = 0;
			sink.status("live");
			sink.track(track$1);
		} catch {
			if (stopped) return;
			failures++;
			sink.status(failures > 2 ? "error" : "connecting");
		} finally {
			if (!stopped) {
				const wait = failures ? Math.min(6e4, IDLE_EVERY * 2 ** failures) : playing() ? PLAYING_EVERY : IDLE_EVERY;
				timer = setTimeout(tick, wait);
			}
		}
	};
	onNudge(tick);
	sink.status("connecting");
	tick();
	return () => {
		stopped = true;
		clearTimeout(timer);
		onNudge(null);
	};
}

//#endregion
//#region plugins/radio/providers/index.js
const PROVIDERS = {
	listenmoe: listenmoe_exports,
	radio: radio_exports,
	plaza: plaza_exports,
	somafm: somafm_exports,
	nightride: nightride_exports,
	spotify: spotify_exports
};
function connect(station, sink) {
	const provider = PROVIDERS[station?.provider?.type];
	if (!provider) {
		sink.status("live");
		sink.track(null);
		return () => {};
	}
	return provider.connect(station, sink);
}

//#endregion
//#region plugins/radio/nowplaying.js
const { solid: { createSignal: createSignal$4 } } = shelter;
const [track, setTrack] = createSignal$4(null);
const [status, setStatus] = createSignal$4("off");
const EMPTY = {
	title: null,
	titleAlt: null,
	artist: null,
	artistAlt: null,
	album: null,
	source: null,
	art: null,
	startedAt: null,
	duration: null,
	listeners: null,
	requester: null,
	dj: null,
	event: null,
	device: null,
	paused: false,
	progress: null
};
let disconnect = null;
let currentId = null;
let onTrackCb = null;
function onTrack(fn) {
	onTrackCb = fn;
}
function want(station) {
	const id = station?.id ?? null;
	if (id === currentId) return;
	currentId = id;
	disconnect?.();
	disconnect = null;
	setTrack(null);
	if (!station) {
		setStatus("off");
		return;
	}
	setStatus("connecting");
	disconnect = connect(station, {
		track: (t) => {
			if (currentId !== id) return;
			const normalised = t ? {
				...EMPTY,
				...t
			} : null;
			setTrack(normalised);
			onTrackCb?.(normalised);
		},
		status: (s) => {
			if (currentId === id) setStatus(s);
		}
	});
}

//#endregion
//#region plugins/radio/stations.js
const listenmoe = (channel, name, gateway, streams) => ({
	id: `listenmoe-${channel}`,
	name,
	group: "LISTEN.moe",
	accent: "#ff015b",
	logo: null,
	streams,
	provider: {
		type: "listenmoe",
		gateway
	}
});
const somafm = (channel, name, genre) => ({
	id: `somafm-${channel}`,
	name,
	group: "SomaFM",
	genre,
	accent: "#d4633a",
	logo: `https://api.somafm.com/logos/256/${channel}256.png`,
	streams: { mp3: `https://ice1.somafm.com/${channel}-128-mp3` },
	provider: {
		type: "somafm",
		channel
	}
});
const nightride = (channel, name) => ({
	id: `nightride-${channel}`,
	name,
	group: "Nightride FM",
	genre: "synthwave",
	accent: "#ff2e97",
	logo: null,
	streams: { mp3: `https://stream.nightride.fm/${channel}.mp3` },
	provider: {
		type: "nightride",
		channel
	}
});
const BUILT_IN = [
	listenmoe("jpop", "J-POP", "wss://listen.moe/gateway_v2", {
		opus: "https://listen.moe/opus",
		vorbis: "https://listen.moe/stream",
		mp3: "https://listen.moe/fallback"
	}),
	listenmoe("kpop", "K-POP", "wss://listen.moe/kpop/gateway_v2", {
		vorbis: "https://listen.moe/kpop/stream",
		mp3: "https://listen.moe/kpop/fallback"
	}),
	{
		id: "radio-main",
		name: "r/a/dio",
		group: "Anime",
		genre: "anime, j-pop",
		accent: "#3b9ddd",
		logo: null,
		streams: { mp3: "https://relay0.r-a-d.io/main.mp3" },
		provider: { type: "radio" }
	},
	{
		id: "plaza",
		name: "Nightwave Plaza",
		group: "Anime",
		genre: "vaporwave",
		accent: "#b06ede",
		logo: null,
		streams: { mp3: "https://radio.plaza.one/mp3" },
		provider: { type: "plaza" }
	},
	nightride("nightride", "Nightride"),
	nightride("chillsynth", "ChillSynth"),
	nightride("datawave", "Datawave"),
	nightride("spacesynth", "Spacesynth"),
	nightride("darksynth", "Darksynth"),
	nightride("rekt", "REKT"),
	somafm("groovesalad", "Groove Salad", "ambient, downtempo"),
	somafm("dronezone", "Drone Zone", "ambient"),
	somafm("spacestation", "Space Station Soma", "electronic"),
	somafm("lush", "Lush", "vocal electronica"),
	somafm("vaporwaves", "Vaporwaves", "vaporwave"),
	somafm("defcon", "DEF CON Radio", "electronic"),
	somafm("secretagent", "Secret Agent", "lounge, spy jazz"),
	somafm("u80s", "Underground 80s", "80s underground"),
	somafm("indiepop", "Indie Pop Rocks!", "indie pop"),
	somafm("metal", "Metal Detector", "metal")
];
const DEFAULT_STATION = "listenmoe-jpop";
const QUALITIES = {
	opus: {
		label: "Opus",
		hint: "Best quality for the bandwidth."
	},
	vorbis: {
		label: "Vorbis",
		hint: "Ogg Vorbis. A little heavier."
	},
	mp3: {
		label: "MP3",
		hint: "Most compatible. Use this if a stream is silent."
	}
};
const QUALITY_ORDER = [
	"opus",
	"vorbis",
	"mp3"
];
let cacheRaw = null;
let cacheParsed = [];
let cacheStations = [];
function raw() {
	return typeof store.custom === "string" ? store.custom : "[]";
}
function readCustom() {
	const current = raw();
	if (current === cacheRaw) return cacheParsed;
	try {
		const parsed = JSON.parse(current || "[]");
		cacheParsed = Array.isArray(parsed) ? parsed : [];
	} catch {
		cacheParsed = [];
	}
	cacheRaw = current;
	cacheStations = [];
	return cacheParsed;
}
function writeCustom(list) {
	store.custom = JSON.stringify(list);
}
function customStations() {
	const list = readCustom();
	if (cacheStations.length || !list.length) return cacheStations;
	cacheStations = list.map((s) => ({
		id: `custom-${s.id}`,
		name: s.name || "Custom stream",
		group: "Yours",
		accent: "#5865f2",
		logo: null,
		custom: true,
		streams: { mp3: s.url },
		provider: { type: "none" }
	}));
	return cacheStations;
}
const SPOTIFY = {
	id: "spotify",
	name: "Spotify",
	group: "Spotify",
	genre: "your account",
	accent: "#1db954",
	logo: null,
	remote: true,
	streams: {},
	provider: { type: "spotify" }
};
function allStations() {
	const custom = customStations();
	const spotify = store.spotifyClientId?.trim() ? [SPOTIFY] : [];
	return custom.length || spotify.length ? [
		...BUILT_IN,
		...spotify,
		...custom
	] : BUILT_IN;
}
function stationById(id) {
	return allStations().find((s) => s.id === id) ?? null;
}
function currentStation() {
	return stationById(store.station) ?? stationById(DEFAULT_STATION) ?? BUILT_IN[0];
}
function streamUrl(station) {
	const streams = station?.streams ?? {};
	return streams[store.quality] ?? QUALITY_ORDER.map((q) => streams[q]).find(Boolean) ?? Object.values(streams)[0] ?? null;
}
function qualitiesFor(station) {
	return QUALITY_ORDER.filter((q) => station?.streams?.[q]);
}
function groupedStations() {
	const groups = new Map();
	for (const station of allStations()) {
		if (!groups.has(station.group)) groups.set(station.group, []);
		groups.get(station.group).push(station);
	}
	return [...groups].map(([name, stations]) => ({
		name,
		stations
	}));
}

//#endregion
//#region plugins/radio/session.js
const { solid: { createSignal: createSignal$3 } } = shelter;
const [panelOpen, setPanelOpen] = createSignal$3(false);
const [view, setView] = createSignal$3("player");
let anchor = null;
const anchorEl = () => anchor;
let playbackHook = () => {};
function onPlaybackChange(fn) {
	playbackHook = fn;
}
/**
* Hold a metadata connection only while something is actually listening to it
* or looking at it. Everything that can change either condition calls this.
*/
function syncMetadata() {
	want(listening() || panelOpen() ? currentStation() : null);
}
const remote = () => !!currentStation().remote;
const listening = () => remote() ? playing() : active();
const isPlaying = () => remote() ? playing() : playing$1();
const isLoading = () => remote() ? false : loading();
function openPanel(el) {
	anchor = el ?? anchor;
	setPanelOpen(true);
	syncMetadata();
}
function closePanel() {
	setPanelOpen(false);
	setView("player");
	syncMetadata();
}
function togglePanel(el) {
	if (panelOpen()) closePanel();
else openPanel(el);
}
function showStations() {
	setView("stations");
}
function showPlayer() {
	setView("player");
}
function start() {
	if (remote()) {
		play();
		syncMetadata();
		playbackHook();
		return;
	}
	if (!resume()) play$1(streamUrl(currentStation()));
	syncMetadata();
	playbackHook();
}
function pause() {
	if (remote()) pause$1();
else pause$2();
	syncMetadata();
	playbackHook();
}
function stop() {
	stop$1();
	if (remote()) pause$1();
	syncMetadata();
	playbackHook();
}
function toggle() {
	if (remote() ? playing() : active() || isLive()) pause();
else start();
}
function selectStation(id) {
	const station = stationById(id);
	if (!station || id === store.station) return;
	const wasPlaying = listening();
	const wasRemote = remote();
	store.station = id;
	if (wasRemote && wasPlaying) pause$1();
	if (station.remote) stop$1();
	if (wasPlaying) if (station.remote) play();
else play$1(streamUrl(station));
	want(null);
	syncMetadata();
	playbackHook();
	showPlayer();
}
function selectQuality(quality) {
	if (quality === store.quality) return;
	store.quality = quality;
	if (active()) play$1(streamUrl(currentStation()));
}
function shutdown() {
	destroy$1();
	destroy();
	want(null);
	setPanelOpen(false);
	anchor = null;
}

//#endregion
//#region plugins/radio/ui/icons.jsx
var import_web$55 = __toESM(require_web(), 1);
var import_web$56 = __toESM(require_web(), 1);
var import_web$57 = __toESM(require_web(), 1);
var import_web$58 = __toESM(require_web(), 1);
var import_web$59 = __toESM(require_web(), 1);
var import_web$60 = __toESM(require_web(), 1);
const _tmpl$$7 = /*#__PURE__*/ (0, import_web$55.template)(`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="2.3" fill="currentColor"></circle><path d="M8.6 8.6a4.8 4.8 0 0 0 0 6.8M15.4 15.4a4.8 4.8 0 0 0 0-6.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path><path d="M5.7 5.7a8.9 8.9 0 0 0 0 12.6M18.3 18.3a8.9 8.9 0 0 0 0-12.6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path></svg>`, 8), _tmpl$2$6 = /*#__PURE__*/ (0, import_web$55.template)(`<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.5 5.4a1 1 0 0 1 1.52-.85l9 6.6a1 1 0 0 1 0 1.7l-9 6.6a1 1 0 0 1-1.52-.85V5.4Z" fill="currentColor"></path></svg>`, 4), _tmpl$3$3 = /*#__PURE__*/ (0, import_web$55.template)(`<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><rect x="6.5" y="5" width="4" height="14" rx="1.4" fill="currentColor"></rect><rect x="13.5" y="5" width="4" height="14" rx="1.4" fill="currentColor"></rect></svg>`, 6), _tmpl$4$3 = /*#__PURE__*/ (0, import_web$55.template)(`<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6.4a1 1 0 0 1 1.55-.83l7.2 5.6a1 1 0 0 1 0 1.66l-7.2 5.6A1 1 0 0 1 6 17.6V6.4Z" fill="currentColor"></path><rect x="16.5" y="5" width="2.6" height="14" rx="1.1" fill="currentColor"></rect></svg>`, 6), _tmpl$5$2 = /*#__PURE__*/ (0, import_web$55.template)(`<svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M10.56 2.2a1 1 0 0 0-.9.74l-.36 1.4a7.9 7.9 0 0 0-1.6.93l-1.38-.43a1 1 0 0 0-1.16.45l-1.44 2.5a1 1 0 0 0 .19 1.22l1.06.98a8 8 0 0 0 0 1.84l-1.06.98a1 1 0 0 0-.19 1.22l1.44 2.5a1 1 0 0 0 1.16.45l1.38-.43c.5.38 1.03.7 1.6.93l.36 1.4a1 1 0 0 0 .97.75h2.88a1 1 0 0 0 .97-.75l.36-1.4c.57-.23 1.1-.55 1.6-.93l1.38.43a1 1 0 0 0 1.16-.45l1.44-2.5a1 1 0 0 0-.19-1.22l-1.06-.98a8 8 0 0 0 0-1.84l1.06-.98a1 1 0 0 0 .19-1.22l-1.44-2.5a1 1 0 0 0-1.16-.45l-1.38.43a7.9 7.9 0 0 0-1.6-.93l-.36-1.4a1 1 0 0 0-.97-.75h-2.88ZM12 15.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4Z" clip-rule="evenodd"></path></svg>`, 4), _tmpl$6$2 = /*#__PURE__*/ (0, import_web$55.template)(`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 9.5h3.2L12 5.6v12.8L7.2 14.5H4a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1Z" fill="currentColor"></path><!#><!/></svg>`, 6), _tmpl$7$2 = /*#__PURE__*/ (0, import_web$55.template)(`<svg><path d="m16 9.5 4.5 5M20.5 9.5 16 14.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path></svg>`, 4, true), _tmpl$8$1 = /*#__PURE__*/ (0, import_web$55.template)(`<svg><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path></svg>`, 4, true), _tmpl$9$1 = /*#__PURE__*/ (0, import_web$55.template)(`<svg class="rad-caret" width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 9 6 6 6-6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`, 4), _tmpl$0$1 = /*#__PURE__*/ (0, import_web$55.template)(`<div class="rad-bars" aria-hidden="true"><i></i><i></i><i></i></div>`, 8);
const BroadcastIcon = () => (0, import_web$60.getNextElement)(_tmpl$$7);
const PlayIcon = () => (0, import_web$60.getNextElement)(_tmpl$2$6);
const PauseIcon = () => (0, import_web$60.getNextElement)(_tmpl$3$3);
const NextIcon = () => (0, import_web$60.getNextElement)(_tmpl$4$3);
const PrevIcon = () => (() => {
	const _el$5 = (0, import_web$60.getNextElement)(_tmpl$4$3);
	_el$5.style.setProperty("transform", "scaleX(-1)");
	return _el$5;
})();
const GearIcon = () => (0, import_web$60.getNextElement)(_tmpl$5$2);
const VolumeIcon = (props) => (() => {
	const _el$7 = (0, import_web$60.getNextElement)(_tmpl$6$2), _el$8 = _el$7.firstChild, _el$9 = _el$8.nextSibling, [_el$0, _co$] = (0, import_web$57.getNextMarker)(_el$9.nextSibling);
	(0, import_web$58.insert)(_el$7, (() => {
		const _c$ = (0, import_web$59.memo)(() => !!props.muted);
		return () => _c$() ? (0, import_web$60.getNextElement)(_tmpl$7$2) : (0, import_web$60.getNextElement)(_tmpl$8$1);
	})(), _el$0, _co$);
	return _el$7;
})();
const CaretIcon = (props) => (() => {
	const _el$11 = (0, import_web$60.getNextElement)(_tmpl$9$1);
	(0, import_web$56.effect)(() => _el$11.style.setProperty("transform", props.up ? "rotate(180deg)" : "none"));
	return _el$11;
})();
const Bars = () => (0, import_web$60.getNextElement)(_tmpl$0$1);

//#endregion
//#region plugins/radio/ui/ToolbarButton.jsx
var import_web$46 = __toESM(require_web(), 1);
var import_web$47 = __toESM(require_web(), 1);
var import_web$48 = __toESM(require_web(), 1);
var import_web$49 = __toESM(require_web(), 1);
var import_web$50 = __toESM(require_web(), 1);
var import_web$51 = __toESM(require_web(), 1);
var import_web$52 = __toESM(require_web(), 1);
var import_web$53 = __toESM(require_web(), 1);
var import_web$54 = __toESM(require_web(), 1);
const _tmpl$$6 = /*#__PURE__*/ (0, import_web$46.template)(`<div></div>`, 2), _tmpl$2$5 = /*#__PURE__*/ (0, import_web$46.template)(`<div role="button" tabindex="0" aria-label="Radio"></div>`, 2);
const { solid: { Show: Show$4 } } = shelter;
function ToolbarButton(props) {
	const activate = (e) => togglePanel(e.currentTarget);
	return (() => {
		const _el$ = (0, import_web$52.getNextElement)(_tmpl$2$5);
		_el$.$$keydown = (e) => {
			if (e.key !== "Enter" && e.key !== " ") return;
			e.preventDefault();
			activate(e);
		};
		_el$.$$click = activate;
		(0, import_web$53.insert)(_el$, (0, import_web$54.createComponent)(Show$4, {
			get when() {
				return playing$1();
			},
			get fallback() {
				return (0, import_web$54.createComponent)(BroadcastIcon, {});
			},
			get children() {
				const _el$2 = (0, import_web$52.getNextElement)(_tmpl$$6);
				(0, import_web$53.insert)(_el$2, (0, import_web$54.createComponent)(Bars, {}));
				(0, import_web$51.effect)(() => _el$2.style.setProperty("color", currentStation().accent));
				return _el$2;
			}
		}));
		(0, import_web$51.effect)((_p$) => {
			const _v$ = `rad-btn ${props.native ?? ""}`, _v$2 = panelOpen();
			_v$ !== _p$._v$ && (0, import_web$49.className)(_el$, _p$._v$ = _v$);
			_v$2 !== _p$._v$2 && (0, import_web$48.setAttribute)(_el$, "aria-expanded", _p$._v$2 = _v$2);
			return _p$;
		}, {
			_v$: undefined,
			_v$2: undefined
		});
		(0, import_web$50.runHydrationEvents)();
		return _el$;
	})();
}
(0, import_web$47.delegateEvents)(["click", "keydown"]);

//#endregion
//#region plugins/radio/ui/Artwork.jsx
var import_web$39 = __toESM(require_web(), 1);
var import_web$40 = __toESM(require_web(), 1);
var import_web$41 = __toESM(require_web(), 1);
var import_web$42 = __toESM(require_web(), 1);
var import_web$43 = __toESM(require_web(), 1);
var import_web$44 = __toESM(require_web(), 1);
var import_web$45 = __toESM(require_web(), 1);
const _tmpl$$5 = /*#__PURE__*/ (0, import_web$39.template)(`<img alt="" loading="lazy">`, 1), _tmpl$2$4 = /*#__PURE__*/ (0, import_web$39.template)(`<div aria-hidden="true"></div>`, 2);
const { solid: { createSignal: createSignal$2, createMemo: createMemo$1, Show: Show$3 } } = shelter;
function Artwork(props) {
	const [broken, setBroken] = createSignal$2(null);
	const src = createMemo$1(() => {
		const candidate = props.src || props.station?.logo || null;
		return candidate && candidate !== broken() ? candidate : null;
	});
	return (0, import_web$41.createComponent)(Show$3, {
		get when() {
			return src();
		},
		get fallback() {
			return (() => {
				const _el$2 = (0, import_web$45.getNextElement)(_tmpl$2$4);
				(0, import_web$40.insert)(_el$2, () => (props.station?.name ?? "?").trim().charAt(0).toUpperCase());
				(0, import_web$44.effect)((_p$) => {
					const _v$3 = `${props.class} rad-art-blank`, _v$4 = props.station?.accent ?? "#5865f2";
					_v$3 !== _p$._v$3 && (0, import_web$43.className)(_el$2, _p$._v$3 = _v$3);
					_v$4 !== _p$._v$4 && _el$2.style.setProperty("background", _p$._v$4 = _v$4);
					return _p$;
				}, {
					_v$3: undefined,
					_v$4: undefined
				});
				return _el$2;
			})();
		},
		get children() {
			const _el$ = (0, import_web$45.getNextElement)(_tmpl$$5);
			_el$.addEventListener("error", () => setBroken(src()));
			(0, import_web$44.effect)((_p$) => {
				const _v$ = props.class, _v$2 = src();
				_v$ !== _p$._v$ && (0, import_web$43.className)(_el$, _p$._v$ = _v$);
				_v$2 !== _p$._v$2 && (0, import_web$42.setAttribute)(_el$, "src", _p$._v$2 = _v$2);
				return _p$;
			}, {
				_v$: undefined,
				_v$2: undefined
			});
			return _el$;
		}
	});
}

//#endregion
//#region plugins/radio/ui/StationList.jsx
var import_web$30 = __toESM(require_web(), 1);
var import_web$31 = __toESM(require_web(), 1);
var import_web$32 = __toESM(require_web(), 1);
var import_web$33 = __toESM(require_web(), 1);
var import_web$34 = __toESM(require_web(), 1);
var import_web$35 = __toESM(require_web(), 1);
var import_web$36 = __toESM(require_web(), 1);
var import_web$37 = __toESM(require_web(), 1);
var import_web$38 = __toESM(require_web(), 1);
const _tmpl$$4 = /*#__PURE__*/ (0, import_web$30.template)(`<div class="rad-list"></div>`, 2), _tmpl$2$3 = /*#__PURE__*/ (0, import_web$30.template)(`<div class="rad-group"></div>`, 2), _tmpl$3$2 = /*#__PURE__*/ (0, import_web$30.template)(`<div class="rad-item-genre"></div>`, 2), _tmpl$4$2 = /*#__PURE__*/ (0, import_web$30.template)(`<button type="button" class="rad-item"><!#><!/><div class="rad-item-text"><div class="rad-item-name"></div><!#><!/></div></button>`, 10);
const { solid: { For: For$2, Show: Show$2 } } = shelter;
function StationList() {
	return (() => {
		const _el$ = (0, import_web$36.getNextElement)(_tmpl$$4);
		(0, import_web$37.insert)(_el$, (0, import_web$38.createComponent)(For$2, {
			get each() {
				return groupedStations();
			},
			children: (group) => [(() => {
				const _el$2 = (0, import_web$36.getNextElement)(_tmpl$2$3);
				(0, import_web$37.insert)(_el$2, () => group.name);
				return _el$2;
			})(), (0, import_web$38.createComponent)(For$2, {
				get each() {
					return group.stations;
				},
				children: (station) => (() => {
					const _el$3 = (0, import_web$36.getNextElement)(_tmpl$4$2), _el$9 = _el$3.firstChild, [_el$0, _co$2] = (0, import_web$35.getNextMarker)(_el$9.nextSibling), _el$4 = _el$0.nextSibling, _el$5 = _el$4.firstChild, _el$7 = _el$5.nextSibling, [_el$8, _co$] = (0, import_web$35.getNextMarker)(_el$7.nextSibling);
					_el$3.$$click = () => selectStation(station.id);
					(0, import_web$37.insert)(_el$3, (0, import_web$38.createComponent)(Artwork, {
						"class": "rad-item-art",
						station
					}), _el$0, _co$2);
					(0, import_web$37.insert)(_el$5, () => station.name);
					(0, import_web$37.insert)(_el$4, (0, import_web$38.createComponent)(Show$2, {
						get when() {
							return station.genre;
						},
						get children() {
							const _el$6 = (0, import_web$36.getNextElement)(_tmpl$3$2);
							(0, import_web$37.insert)(_el$6, () => station.genre);
							return _el$6;
						}
					}), _el$8, _co$);
					(0, import_web$33.effect)(() => (0, import_web$32.setAttribute)(_el$3, "aria-current", store.station === station.id));
					(0, import_web$34.runHydrationEvents)();
					return _el$3;
				})()
			})]
		}));
		return _el$;
	})();
}
(0, import_web$31.delegateEvents)(["click"]);

//#endregion
//#region plugins/radio/ui/Segmented.jsx
var import_web$22 = __toESM(require_web(), 1);
var import_web$23 = __toESM(require_web(), 1);
var import_web$24 = __toESM(require_web(), 1);
var import_web$25 = __toESM(require_web(), 1);
var import_web$26 = __toESM(require_web(), 1);
var import_web$27 = __toESM(require_web(), 1);
var import_web$28 = __toESM(require_web(), 1);
var import_web$29 = __toESM(require_web(), 1);
const _tmpl$$3 = /*#__PURE__*/ (0, import_web$22.template)(`<div class="rad-seg" role="group"></div>`, 2), _tmpl$2$2 = /*#__PURE__*/ (0, import_web$22.template)(`<button type="button"></button>`, 2);
const { solid: { For: For$1 } } = shelter;
function Segmented(props) {
	return (() => {
		const _el$ = (0, import_web$27.getNextElement)(_tmpl$$3);
		(0, import_web$28.insert)(_el$, (0, import_web$29.createComponent)(For$1, {
			get each() {
				return props.options;
			},
			children: (option) => (() => {
				const _el$2 = (0, import_web$27.getNextElement)(_tmpl$2$2);
				_el$2.$$click = () => props.onSelect(option.value);
				(0, import_web$28.insert)(_el$2, () => option.label);
				(0, import_web$25.effect)((_p$) => {
					const _v$ = props.value === option.value, _v$2 = option.hint;
					_v$ !== _p$._v$ && (0, import_web$24.setAttribute)(_el$2, "aria-pressed", _p$._v$ = _v$);
					_v$2 !== _p$._v$2 && (0, import_web$24.setAttribute)(_el$2, "title", _p$._v$2 = _v$2);
					return _p$;
				}, {
					_v$: undefined,
					_v$2: undefined
				});
				(0, import_web$26.runHydrationEvents)();
				return _el$2;
			})()
		}));
		return _el$;
	})();
}
(0, import_web$23.delegateEvents)(["click"]);

//#endregion
//#region plugins/radio/settings.jsx
var import_web$17 = __toESM(require_web(), 1);
var import_web$18 = __toESM(require_web(), 1);
var import_web$19 = __toESM(require_web(), 1);
var import_web$20 = __toESM(require_web(), 1);
var import_web$21 = __toESM(require_web(), 1);
const _tmpl$$2 = /*#__PURE__*/ (0, import_web$17.template)(`<div class="rad-settings-row"><div class="rad-settings-label">Spotify shows up as a station that controls whatever device is already playing: see the track, play, pause, skip and change volume. The audio stays in Spotify. Controlling playback needs Premium; seeing what's on doesn't.</div><div class="rad-settings-label">1. At developer.spotify.com/dashboard, create an app and add this exact Redirect URI: <code></code><br>2. Paste its Client ID below, then press Connect and approve in the browser.<br>3. The browser will say it can't connect. That's expected: copy the whole address from its address bar and paste it here.</div><!#><!/></div>`, 12), _tmpl$2$1 = /*#__PURE__*/ (0, import_web$17.template)(`<div class="rad-custom"><div class="rad-custom-text">Connected to Spotify.</div><!#><!/></div>`, 6), _tmpl$3$1 = /*#__PURE__*/ (0, import_web$17.template)(`<div class="rad-custom"><!#><!/><!#><!/><!#><!/></div>`, 8), _tmpl$4$1 = /*#__PURE__*/ (0, import_web$17.template)(`<div class="rad-settings-row"><div class="rad-settings-label">Any direct stream URL works — an Icecast or SHOUTcast MP3, AAC or Ogg endpoint. There's no now-playing info for these; a bare stream doesn't expose it to the page.</div><!#><!/><div class="rad-custom"><!#><!/><!#><!/><!#><!/></div></div>`, 14), _tmpl$5$1 = /*#__PURE__*/ (0, import_web$17.template)(`<div class="rad-custom"><div class="rad-custom-text"><div></div><div class="rad-custom-url"></div></div><!#><!/></div>`, 10), _tmpl$6$1 = /*#__PURE__*/ (0, import_web$17.template)(`<div class="rad-settings-row"><div class="rad-settings-label">Volume</div><!#><!/></div>`, 6), _tmpl$7$1 = /*#__PURE__*/ (0, import_web$17.template)(`<div class="rad-settings-row"><div class="rad-settings-label">Stream quality — <!#><!/></div><!#><!/></div>`, 8);
const { solid: { createSignal: createSignal$1, For, Show: Show$1 }, ui: { Button, ButtonColors, ButtonSizes, Divider, Header, HeaderTags, Slider: Slider$1, SwitchItem, TextBox, showToast, ToastColors } } = shelter;
const Toggle = (props) => (0, import_web$21.createComponent)(SwitchItem, {
	get checked() {
		return props.checked;
	},
	get value() {
		return props.checked;
	},
	get onChange() {
		return props.onChange;
	},
	get note() {
		return props.note;
	},
	get hideBorder() {
		return props.hideBorder;
	},
	get children() {
		return props.children;
	}
});
function SpotifySettings() {
	const [pasted, setPasted] = createSignal$1("");
	const [busy, setBusy] = createSignal$1(false);
	const fail = (err) => showToast({
		title: "Radio",
		content: String(err?.message ?? err),
		color: ToastColors.DANGER
	});
	const connect$7 = async () => {
		try {
			window.open(await beginAuth(), "_blank");
		} catch (err) {
			fail(err);
		}
	};
	const finish = async () => {
		setBusy(true);
		try {
			await finishAuth(pasted());
			setPasted("");
			showToast({
				title: "Radio",
				content: "Spotify connected.",
				color: ToastColors.SUCCESS
			});
		} catch (err) {
			fail(err);
		} finally {
			setBusy(false);
		}
	};
	return [
		(0, import_web$21.createComponent)(Header, {
			get tag() {
				return HeaderTags.H3;
			},
			children: "Spotify"
		}),
		(() => {
			const _el$ = (0, import_web$18.getNextElement)(_tmpl$$2), _el$2 = _el$.firstChild, _el$3 = _el$2.nextSibling, _el$4 = _el$3.firstChild, _el$6 = _el$4.nextSibling, _el$7 = _el$3.nextSibling, [_el$8, _co$] = (0, import_web$19.getNextMarker)(_el$7.nextSibling);
			(0, import_web$20.insert)(_el$6, () => REDIRECT_URI);
			(0, import_web$20.insert)(_el$, (0, import_web$21.createComponent)(TextBox, {
				placeholder: "Client ID",
				get value() {
					return store.spotifyClientId;
				},
				onInput: (v) => store.spotifyClientId = v.trim()
			}), _el$8, _co$);
			return _el$;
		})(),
		(0, import_web$21.createComponent)(Show$1, {
			get when() {
				return connected();
			},
			get fallback() {
				return (() => {
					const _el$11 = (0, import_web$18.getNextElement)(_tmpl$3$1), _el$12 = _el$11.firstChild, [_el$13, _co$3] = (0, import_web$19.getNextMarker)(_el$12.nextSibling), _el$14 = _el$13.nextSibling, [_el$15, _co$4] = (0, import_web$19.getNextMarker)(_el$14.nextSibling), _el$16 = _el$15.nextSibling, [_el$17, _co$5] = (0, import_web$19.getNextMarker)(_el$16.nextSibling);
					(0, import_web$20.insert)(_el$11, (0, import_web$21.createComponent)(Button, {
						get size() {
							return ButtonSizes.SMALL;
						},
						onClick: connect$7,
						children: "Connect"
					}), _el$13, _co$3);
					(0, import_web$20.insert)(_el$11, (0, import_web$21.createComponent)(TextBox, {
						placeholder: "http://127.0.0.1:8888/callback?code=…",
						get value() {
							return pasted();
						},
						onInput: setPasted
					}), _el$15, _co$4);
					(0, import_web$20.insert)(_el$11, (0, import_web$21.createComponent)(Button, {
						get size() {
							return ButtonSizes.SMALL;
						},
						onClick: finish,
						get disabled() {
							return busy();
						},
						children: "Finish"
					}), _el$17, _co$5);
					return _el$11;
				})();
			},
			get children() {
				const _el$9 = (0, import_web$18.getNextElement)(_tmpl$2$1), _el$0 = _el$9.firstChild, _el$1 = _el$0.nextSibling, [_el$10, _co$2] = (0, import_web$19.getNextMarker)(_el$1.nextSibling);
				(0, import_web$20.insert)(_el$9, (0, import_web$21.createComponent)(Button, {
					get size() {
						return ButtonSizes.SMALL;
					},
					get color() {
						return ButtonColors.RED;
					},
					get onClick() {
						return disconnect$1;
					},
					children: "Disconnect"
				}), _el$10, _co$2);
				return _el$9;
			}
		})
	];
}
function CustomStations() {
	const [name, setName] = createSignal$1("");
	const [url, setUrl] = createSignal$1("");
	const add = () => {
		const trimmed = url().trim();
		if (!trimmed) return;
		writeCustom([...readCustom(), {
			id: Date.now().toString(36),
			name: name().trim() || "Custom stream",
			url: trimmed
		}]);
		setName("");
		setUrl("");
	};
	const remove = (id) => writeCustom(readCustom().filter((s) => s.id !== id));
	return [(0, import_web$21.createComponent)(Header, {
		get tag() {
			return HeaderTags.H3;
		},
		children: "Your stations"
	}), (() => {
		const _el$18 = (0, import_web$18.getNextElement)(_tmpl$4$1), _el$19 = _el$18.firstChild, _el$27 = _el$19.nextSibling, [_el$28, _co$9] = (0, import_web$19.getNextMarker)(_el$27.nextSibling), _el$20 = _el$28.nextSibling, _el$21 = _el$20.firstChild, [_el$22, _co$6] = (0, import_web$19.getNextMarker)(_el$21.nextSibling), _el$23 = _el$22.nextSibling, [_el$24, _co$7] = (0, import_web$19.getNextMarker)(_el$23.nextSibling), _el$25 = _el$24.nextSibling, [_el$26, _co$8] = (0, import_web$19.getNextMarker)(_el$25.nextSibling);
		(0, import_web$20.insert)(_el$18, (0, import_web$21.createComponent)(For, {
			get each() {
				return readCustom();
			},
			children: (station) => (() => {
				const _el$29 = (0, import_web$18.getNextElement)(_tmpl$5$1), _el$30 = _el$29.firstChild, _el$31 = _el$30.firstChild, _el$32 = _el$31.nextSibling, _el$33 = _el$30.nextSibling, [_el$34, _co$0] = (0, import_web$19.getNextMarker)(_el$33.nextSibling);
				(0, import_web$20.insert)(_el$31, () => station.name);
				(0, import_web$20.insert)(_el$32, () => station.url);
				(0, import_web$20.insert)(_el$29, (0, import_web$21.createComponent)(Button, {
					get size() {
						return ButtonSizes.SMALL;
					},
					get color() {
						return ButtonColors.RED;
					},
					onClick: () => remove(station.id),
					children: "Remove"
				}), _el$34, _co$0);
				return _el$29;
			})()
		}), _el$28, _co$9);
		(0, import_web$20.insert)(_el$20, (0, import_web$21.createComponent)(TextBox, {
			placeholder: "Name",
			get value() {
				return name();
			},
			onInput: setName
		}), _el$22, _co$6);
		(0, import_web$20.insert)(_el$20, (0, import_web$21.createComponent)(TextBox, {
			placeholder: "https://…",
			get value() {
				return url();
			},
			onInput: setUrl
		}), _el$24, _co$7);
		(0, import_web$20.insert)(_el$20, (0, import_web$21.createComponent)(Button, {
			get size() {
				return ButtonSizes.SMALL;
			},
			onClick: add,
			children: "Add"
		}), _el$26, _co$8);
		return _el$18;
	})()];
}
function Settings() {
	const qualities = () => qualitiesFor(currentStation());
	return [
		(0, import_web$21.createComponent)(Header, {
			get tag() {
				return HeaderTags.H3;
			},
			children: "Playback"
		}),
		(() => {
			const _el$35 = (0, import_web$18.getNextElement)(_tmpl$6$1), _el$36 = _el$35.firstChild, _el$37 = _el$36.nextSibling, [_el$38, _co$1] = (0, import_web$19.getNextMarker)(_el$37.nextSibling);
			(0, import_web$20.insert)(_el$35, (0, import_web$21.createComponent)(Slider$1, {
				min: 0,
				max: 100,
				step: 1,
				get value() {
					return store.volume;
				},
				onInput: setVolume$1
			}), _el$38, _co$1);
			return _el$35;
		})(),
		(0, import_web$21.createComponent)(Show$1, {
			get when() {
				return qualities().length > 1;
			},
			get children() {
				const _el$39 = (0, import_web$18.getNextElement)(_tmpl$7$1), _el$40 = _el$39.firstChild, _el$41 = _el$40.firstChild, _el$42 = _el$41.nextSibling, [_el$43, _co$10] = (0, import_web$19.getNextMarker)(_el$42.nextSibling), _el$44 = _el$40.nextSibling, [_el$45, _co$11] = (0, import_web$19.getNextMarker)(_el$44.nextSibling);
				(0, import_web$20.insert)(_el$40, () => currentStation().name, _el$43, _co$10);
				(0, import_web$20.insert)(_el$39, (0, import_web$21.createComponent)(Segmented, {
					get value() {
						return store.quality;
					},
					onSelect: selectQuality,
					get options() {
						return qualities().map((q) => ({
							value: q,
							label: QUALITIES[q].label,
							hint: QUALITIES[q].hint
						}));
					}
				}), _el$45, _co$11);
				return _el$39;
			}
		}),
		(0, import_web$21.createComponent)(Toggle, {
			get checked() {
				return store.romaji;
			},
			onChange: (v) => store.romaji = v,
			note: "Show romanised titles and artist names where the station provides them, instead of the original script.",
			children: "Prefer romanised names"
		}),
		(0, import_web$21.createComponent)(Toggle, {
			get checked() {
				return store.mediaSession;
			},
			onChange: (v) => store.mediaSession = v,
			note: "Show what's playing in your system's media controls, so media keys and headset buttons can pause it. Needs a client that forwards media keys to the OS: the desktop app and browsers do, clients built on the system webview (Dorion) generally don't, and there's nothing this plugin can do about that.",
			hideBorder: true,
			children: "Use system media controls"
		}),
		(0, import_web$21.createComponent)(Divider, {
			mt: true,
			mb: true
		}),
		(0, import_web$21.createComponent)(SpotifySettings, {}),
		(0, import_web$21.createComponent)(Divider, {
			mt: true,
			mb: true
		}),
		(0, import_web$21.createComponent)(CustomStations, {})
	];
}

//#endregion
//#region plugins/radio/ui/openSettings.jsx
var import_web$16 = __toESM(require_web(), 1);
const { ui: { openModal, ModalRoot, ModalHeader, ModalBody, ModalSizes } } = shelter;
function openSettings() {
	openModal((props) => (0, import_web$16.createComponent)(ModalRoot, {
		get size() {
			return ModalSizes.MEDIUM;
		},
		get children() {
			return [(0, import_web$16.createComponent)(ModalHeader, {
				get close() {
					return props.close;
				},
				children: "Radio"
			}), (0, import_web$16.createComponent)(ModalBody, { get children() {
				return (0, import_web$16.createComponent)(Settings, {});
			} })];
		}
	}));
}

//#endregion
//#region plugins/radio/ui/Panel.jsx
var import_web$4 = __toESM(require_web(), 1);
var import_web$5 = __toESM(require_web(), 1);
var import_web$6 = __toESM(require_web(), 1);
var import_web$7 = __toESM(require_web(), 1);
var import_web$8 = __toESM(require_web(), 1);
var import_web$9 = __toESM(require_web(), 1);
var import_web$10 = __toESM(require_web(), 1);
var import_web$11 = __toESM(require_web(), 1);
var import_web$12 = __toESM(require_web(), 1);
var import_web$13 = __toESM(require_web(), 1);
var import_web$14 = __toESM(require_web(), 1);
var import_web$15 = __toESM(require_web(), 1);
const _tmpl$$1 = /*#__PURE__*/ (0, import_web$4.template)(`<div class="rad-sub"></div>`, 2), _tmpl$2 = /*#__PURE__*/ (0, import_web$4.template)(`<div class="rad-alt"></div>`, 2), _tmpl$3 = /*#__PURE__*/ (0, import_web$4.template)(`<div class="rad-alt">from <!#><!/></div>`, 4), _tmpl$4 = /*#__PURE__*/ (0, import_web$4.template)(`<div class="rad-tag"></div>`, 2), _tmpl$5 = /*#__PURE__*/ (0, import_web$4.template)(`<div class="rad-track"><!#><!/><div class="rad-meta"><div class="rad-title"></div><!#><!/><!#><!/><!#><!/><!#><!/></div></div>`, 16), _tmpl$6 = /*#__PURE__*/ (0, import_web$4.template)(`<div class="rad-progress"><div class="rad-bar"><span></span></div><div class="rad-times"><span></span><span></span></div></div>`, 12), _tmpl$7 = /*#__PURE__*/ (0, import_web$4.template)(`<button type="button" class="rad-skip" aria-label="Previous track"></button>`, 2), _tmpl$8 = /*#__PURE__*/ (0, import_web$4.template)(`<button type="button" class="rad-skip" aria-label="Next track"></button>`, 2), _tmpl$9 = /*#__PURE__*/ (0, import_web$4.template)(`<div class="rad-volume"><button type="button" class="rad-mute"></button><!#><!/></div>`, 6), _tmpl$0 = /*#__PURE__*/ (0, import_web$4.template)(`<div class="rad-controls"><!#><!/><button type="button" class="rad-play"></button><!#><!/><!#><!/></div>`, 10), _tmpl$1 = /*#__PURE__*/ (0, import_web$4.template)(`<div class="rad-spinner"></div>`, 2), _tmpl$10 = /*#__PURE__*/ (0, import_web$4.template)(`<div class="rad-volume"><span class="rad-mute"></span><!#><!/></div>`, 6), _tmpl$11 = /*#__PURE__*/ (0, import_web$4.template)(`<div class="rad-foot"><span class="rad-dot"></span><span class="rad-foot-text"></span></div>`, 6), _tmpl$12 = /*#__PURE__*/ (0, import_web$4.template)(`<div></div>`, 2), _tmpl$13 = /*#__PURE__*/ (0, import_web$4.template)(`<div class="rad-panel" role="dialog" aria-label="Radio"><div class="rad-head"><button type="button" class="rad-station" aria-label="Choose a station"><span class="rad-station-name"></span><span class="rad-station-group"></span><!#><!/></button><!#><!/><button type="button" class="rad-head-btn" aria-label="Radio settings"></button></div><!#><!/></div>`, 18), _tmpl$14 = /*#__PURE__*/ (0, import_web$4.template)(`<div><div class="rad-body"><!#><!/><!#><!/><!#><!/></div><!#><!/></div>`, 12), _tmpl$15 = /*#__PURE__*/ (0, import_web$4.template)(`<div><!#><!/><!#><!/></div>`, 6);
const { solid: { createEffect, createMemo, createSignal, onCleanup, onMount, Show }, ui: { Slider } } = shelter;
const pad = (n) => String(Math.floor(n)).padStart(2, "0");
const clock = (seconds) => `${Math.floor(seconds / 60)}:${pad(seconds % 60)}`;
function NowPlaying() {
	const station = () => currentStation();
	const primary = createMemo(() => {
		const t = track();
		if (!t) return station().name;
		return store.romaji && t.titleAlt || t.title || station().name;
	});
	const secondary = createMemo(() => {
		const t = track();
		if (!t) return null;
		return store.romaji && t.artistAlt || t.artist;
	});
	const alternate = createMemo(() => {
		const t = track();
		if (!t) return null;
		const other = store.romaji ? t.title : t.titleAlt;
		return other && other !== primary() ? other : null;
	});
	return (() => {
		const _el$ = (0, import_web$13.getNextElement)(_tmpl$5), _el$17 = _el$.firstChild, [_el$18, _co$6] = (0, import_web$12.getNextMarker)(_el$17.nextSibling), _el$2 = _el$18.nextSibling, _el$3 = _el$2.firstChild, _el$1 = _el$3.nextSibling, [_el$10, _co$2] = (0, import_web$12.getNextMarker)(_el$1.nextSibling), _el$11 = _el$10.nextSibling, [_el$12, _co$3] = (0, import_web$12.getNextMarker)(_el$11.nextSibling), _el$13 = _el$12.nextSibling, [_el$14, _co$4] = (0, import_web$12.getNextMarker)(_el$13.nextSibling), _el$15 = _el$14.nextSibling, [_el$16, _co$5] = (0, import_web$12.getNextMarker)(_el$15.nextSibling);
		(0, import_web$14.insert)(_el$, (0, import_web$15.createComponent)(Artwork, {
			"class": "rad-art",
			get src() {
				return track()?.art;
			},
			get station() {
				return station();
			}
		}), _el$18, _co$6);
		(0, import_web$14.insert)(_el$3, primary);
		(0, import_web$14.insert)(_el$2, (0, import_web$15.createComponent)(Show, {
			get when() {
				return secondary();
			},
			get children() {
				const _el$4 = (0, import_web$13.getNextElement)(_tmpl$$1);
				(0, import_web$14.insert)(_el$4, secondary);
				return _el$4;
			}
		}), _el$10, _co$2);
		(0, import_web$14.insert)(_el$2, (0, import_web$15.createComponent)(Show, {
			get when() {
				return alternate();
			},
			get children() {
				const _el$5 = (0, import_web$13.getNextElement)(_tmpl$2);
				(0, import_web$14.insert)(_el$5, alternate);
				return _el$5;
			}
		}), _el$12, _co$3);
		(0, import_web$14.insert)(_el$2, (0, import_web$15.createComponent)(Show, {
			get when() {
				return track()?.source;
			},
			get children() {
				const _el$6 = (0, import_web$13.getNextElement)(_tmpl$3), _el$7 = _el$6.firstChild, _el$8 = _el$7.nextSibling, [_el$9, _co$] = (0, import_web$12.getNextMarker)(_el$8.nextSibling);
				(0, import_web$14.insert)(_el$6, () => track().source, _el$9, _co$);
				return _el$6;
			}
		}), _el$14, _co$4);
		(0, import_web$14.insert)(_el$2, (0, import_web$15.createComponent)(Show, {
			get when() {
				return track()?.event;
			},
			get children() {
				const _el$0 = (0, import_web$13.getNextElement)(_tmpl$4);
				(0, import_web$14.insert)(_el$0, () => track().event);
				(0, import_web$11.effect)(() => _el$0.style.setProperty("background", station().accent));
				return _el$0;
			}
		}), _el$16, _co$5);
		return _el$;
	})();
}
function Progress() {
	const [now, setNow] = createSignal(Date.now());
	const duration = () => track()?.duration || 0;
	const hasBar = () => duration() > 0 && !!track()?.startedAt;
	createEffect(() => {
		if (!hasBar()) return;
		if (track()?.paused) return;
		const timer = setInterval(() => setNow(Date.now()), 1e3);
		onCleanup(() => clearInterval(timer));
	});
	const elapsed = createMemo(() => {
		const started = track()?.startedAt;
		if (!started) return 0;
		if (track().paused && track().progress != null) return track().progress;
		return Math.max(0, Math.min(duration(), (now() - started) / 1e3));
	});
	return (0, import_web$15.createComponent)(Show, {
		get when() {
			return hasBar();
		},
		get children() {
			const _el$19 = (0, import_web$13.getNextElement)(_tmpl$6), _el$20 = _el$19.firstChild, _el$21 = _el$20.firstChild, _el$22 = _el$20.nextSibling, _el$23 = _el$22.firstChild, _el$24 = _el$23.nextSibling;
			(0, import_web$14.insert)(_el$23, () => clock(elapsed()));
			(0, import_web$14.insert)(_el$24, () => clock(duration()));
			(0, import_web$11.effect)((_p$) => {
				const _v$ = `${Math.min(100, elapsed() / duration() * 100)}%`, _v$2 = currentStation().accent;
				_v$ !== _p$._v$ && _el$21.style.setProperty("width", _p$._v$ = _v$);
				_v$2 !== _p$._v$2 && _el$21.style.setProperty("background", _p$._v$2 = _v$2);
				return _p$;
			}, {
				_v$: undefined,
				_v$2: undefined
			});
			return _el$19;
		}
	});
}
function Controls() {
	const remote$1 = () => !!currentStation().remote;
	return (() => {
		const _el$25 = (0, import_web$13.getNextElement)(_tmpl$0), _el$33 = _el$25.firstChild, [_el$34, _co$8] = (0, import_web$12.getNextMarker)(_el$33.nextSibling), _el$27 = _el$34.nextSibling, _el$35 = _el$27.nextSibling, [_el$36, _co$9] = (0, import_web$12.getNextMarker)(_el$35.nextSibling), _el$37 = _el$36.nextSibling, [_el$38, _co$0] = (0, import_web$12.getNextMarker)(_el$37.nextSibling);
		(0, import_web$14.insert)(_el$25, (0, import_web$15.createComponent)(Show, {
			get when() {
				return remote$1();
			},
			get children() {
				const _el$26 = (0, import_web$13.getNextElement)(_tmpl$7);
				(0, import_web$10.addEventListener)(_el$26, "click", previous, true);
				(0, import_web$14.insert)(_el$26, (0, import_web$15.createComponent)(PrevIcon, {}));
				(0, import_web$9.runHydrationEvents)();
				return _el$26;
			}
		}), _el$34, _co$8);
		(0, import_web$10.addEventListener)(_el$27, "click", toggle, true);
		(0, import_web$14.insert)(_el$27, (0, import_web$15.createComponent)(Show, {
			get when() {
				return !isLoading();
			},
			get fallback() {
				return (0, import_web$13.getNextElement)(_tmpl$1);
			},
			get children() {
				return (0, import_web$15.createComponent)(Show, {
					get when() {
						return isPlaying();
					},
					get fallback() {
						return (0, import_web$15.createComponent)(PlayIcon, {});
					},
					get children() {
						return (0, import_web$15.createComponent)(PauseIcon, {});
					}
				});
			}
		}));
		(0, import_web$14.insert)(_el$25, (0, import_web$15.createComponent)(Show, {
			get when() {
				return remote$1();
			},
			get children() {
				const _el$28 = (0, import_web$13.getNextElement)(_tmpl$8);
				(0, import_web$10.addEventListener)(_el$28, "click", next, true);
				(0, import_web$14.insert)(_el$28, (0, import_web$15.createComponent)(NextIcon, {}));
				(0, import_web$9.runHydrationEvents)();
				return _el$28;
			}
		}), _el$36, _co$9);
		(0, import_web$14.insert)(_el$25, (0, import_web$15.createComponent)(Show, {
			get when() {
				return !remote$1();
			},
			get fallback() {
				return (0, import_web$15.createComponent)(Show, {
					get when() {
						return canVolume();
					},
					get children() {
						const _el$40 = (0, import_web$13.getNextElement)(_tmpl$10), _el$41 = _el$40.firstChild, _el$42 = _el$41.nextSibling, [_el$43, _co$1] = (0, import_web$12.getNextMarker)(_el$42.nextSibling);
						(0, import_web$14.insert)(_el$41, (0, import_web$15.createComponent)(VolumeIcon, { get muted() {
							return volume() === 0;
						} }));
						(0, import_web$14.insert)(_el$40, (0, import_web$15.createComponent)(Slider, {
							min: 0,
							max: 100,
							step: 1,
							get value() {
								return volume() ?? 0;
							},
							get onInput() {
								return setVolume;
							}
						}), _el$43, _co$1);
						return _el$40;
					}
				});
			},
			get children() {
				const _el$29 = (0, import_web$13.getNextElement)(_tmpl$9), _el$30 = _el$29.firstChild, _el$31 = _el$30.nextSibling, [_el$32, _co$7] = (0, import_web$12.getNextMarker)(_el$31.nextSibling);
				_el$30.$$click = () => setMuted(!store.muted);
				(0, import_web$14.insert)(_el$30, (0, import_web$15.createComponent)(VolumeIcon, { get muted() {
					return store.muted || store.volume === 0;
				} }));
				(0, import_web$14.insert)(_el$29, (0, import_web$15.createComponent)(Slider, {
					min: 0,
					max: 100,
					step: 1,
					get value() {
						return store.volume;
					},
					onInput: setVolume$1
				}), _el$32, _co$7);
				(0, import_web$11.effect)(() => (0, import_web$7.setAttribute)(_el$30, "aria-label", store.muted ? "Unmute" : "Mute"));
				(0, import_web$9.runHydrationEvents)();
				return _el$29;
			}
		}), _el$38, _co$0);
		(0, import_web$11.effect)((_p$) => {
			const _v$3 = currentStation().accent, _v$4 = isPlaying() ? "Pause" : "Play";
			_v$3 !== _p$._v$3 && _el$27.style.setProperty("background", _p$._v$3 = _v$3);
			_v$4 !== _p$._v$4 && (0, import_web$7.setAttribute)(_el$27, "aria-label", _p$._v$4 = _v$4);
			return _p$;
		}, {
			_v$3: undefined,
			_v$4: undefined
		});
		(0, import_web$9.runHydrationEvents)();
		return _el$25;
	})();
}
function Footer() {
	const detail = createMemo(() => {
		const t = track();
		if (currentStation().remote) {
			if (!connected()) return "Connect Spotify in Radio settings";
			if (status() === "error") return "Can't reach Spotify";
			if (!t) return status() === "connecting" ? "Connecting…" : "Nothing playing. Start Spotify on any device";
		}
		if (status() === "error") return "Can't reach this station's info";
		if (!t) return status() === "connecting" ? "Connecting…" : currentStation().name;
		const parts = [];
		if (t.listeners != null) parts.push(`${t.listeners} listening`);
		if (t.device) parts.push(`on ${t.device}`);
		if (t.dj) parts.push(`DJ ${t.dj}`);
		if (t.requester) parts.push(`requested by ${t.requester}`);
		if (!parts.length && t.album) parts.push(t.album);
		return parts.join(" · ") || currentStation().name;
	});
	return (() => {
		const _el$44 = (0, import_web$13.getNextElement)(_tmpl$11), _el$45 = _el$44.firstChild, _el$46 = _el$45.nextSibling;
		(0, import_web$14.insert)(_el$46, detail);
		(0, import_web$11.effect)(() => (0, import_web$7.setAttribute)(_el$45, "data-status", status()));
		return _el$44;
	})();
}
function Panel() {
	let panel$1;
	const [pos, setPos] = createSignal({
		top: 44,
		right: 12
	});
	const place = () => {
		const anchor$1 = anchorEl();
		if (!anchor$1?.isConnected) return;
		const rect = anchor$1.getBoundingClientRect();
		setPos({
			top: Math.round(rect.bottom + 10),
			right: Math.max(12, Math.round(window.innerWidth - rect.right))
		});
	};
	const applyTheme = () => {
		const root = panel$1?.closest(".rad-root");
		if (!root) return;
		const light = !!anchorEl()?.closest(".theme-light");
		root.classList.toggle("theme-light", light);
		root.classList.toggle("theme-dark", !light);
	};
	onMount(() => {
		place();
		applyTheme();
		const dismiss = (e) => {
			if (panel$1?.contains(e.target)) return;
			if (anchorEl()?.contains(e.target)) return;
			closePanel();
		};
		const escape = (e) => {
			if (e.key !== "Escape") return;
			e.stopPropagation();
			closePanel();
		};
		document.addEventListener("pointerdown", dismiss, true);
		document.addEventListener("keydown", escape, true);
		window.addEventListener("resize", place);
		onCleanup(() => {
			document.removeEventListener("pointerdown", dismiss, true);
			document.removeEventListener("keydown", escape, true);
			window.removeEventListener("resize", place);
		});
	});
	return (() => {
		const _el$47 = (0, import_web$13.getNextElement)(_tmpl$13), _el$48 = _el$47.firstChild, _el$49 = _el$48.firstChild, _el$50 = _el$49.firstChild, _el$51 = _el$50.nextSibling, _el$52 = _el$51.nextSibling, [_el$53, _co$10] = (0, import_web$12.getNextMarker)(_el$52.nextSibling), _el$56 = _el$49.nextSibling, [_el$57, _co$11] = (0, import_web$12.getNextMarker)(_el$56.nextSibling), _el$55 = _el$57.nextSibling, _el$58 = _el$48.nextSibling, [_el$59, _co$12] = (0, import_web$12.getNextMarker)(_el$58.nextSibling);
		const _ref$ = panel$1;
		typeof _ref$ === "function" ? (0, import_web$6.use)(_ref$, _el$47) : panel$1 = _el$47;
		_el$49.$$click = () => view() === "stations" ? showPlayer() : showStations();
		(0, import_web$14.insert)(_el$50, () => currentStation().name);
		(0, import_web$14.insert)(_el$51, () => currentStation().group);
		(0, import_web$14.insert)(_el$49, (0, import_web$15.createComponent)(CaretIcon, { get up() {
			return view() === "stations";
		} }), _el$53, _co$10);
		(0, import_web$14.insert)(_el$48, (0, import_web$15.createComponent)(Show, {
			get when() {
				return isPlaying();
			},
			get children() {
				const _el$54 = (0, import_web$13.getNextElement)(_tmpl$12);
				(0, import_web$14.insert)(_el$54, (0, import_web$15.createComponent)(Bars, {}));
				(0, import_web$11.effect)(() => _el$54.style.setProperty("color", currentStation().accent));
				return _el$54;
			}
		}), _el$57, _co$11);
		_el$55.$$click = () => {
			closePanel();
			openSettings();
		};
		(0, import_web$14.insert)(_el$55, (0, import_web$15.createComponent)(GearIcon, {}));
		(0, import_web$14.insert)(_el$47, (0, import_web$15.createComponent)(Show, {
			get when() {
				return view() === "player";
			},
			get fallback() {
				return (0, import_web$15.createComponent)(StationView, {});
			},
			get children() {
				return (0, import_web$15.createComponent)(PlayerView, {});
			}
		}), _el$59, _co$12);
		(0, import_web$11.effect)((_p$) => {
			const _v$5 = `${pos().top}px`, _v$6 = `${pos().right}px`, _v$7 = currentStation().accent;
			_v$5 !== _p$._v$5 && _el$47.style.setProperty("top", _p$._v$5 = _v$5);
			_v$6 !== _p$._v$6 && _el$47.style.setProperty("right", _p$._v$6 = _v$6);
			_v$7 !== _p$._v$7 && _el$47.style.setProperty("--rad-accent", _p$._v$7 = _v$7);
			return _p$;
		}, {
			_v$5: undefined,
			_v$6: undefined,
			_v$7: undefined
		});
		(0, import_web$9.runHydrationEvents)();
		return _el$47;
	})();
}
function PlayerView() {
	return (() => {
		const _el$60 = (0, import_web$13.getNextElement)(_tmpl$14), _el$61 = _el$60.firstChild, _el$62 = _el$61.firstChild, [_el$63, _co$13] = (0, import_web$12.getNextMarker)(_el$62.nextSibling), _el$64 = _el$63.nextSibling, [_el$65, _co$14] = (0, import_web$12.getNextMarker)(_el$64.nextSibling), _el$66 = _el$65.nextSibling, [_el$67, _co$15] = (0, import_web$12.getNextMarker)(_el$66.nextSibling), _el$68 = _el$61.nextSibling, [_el$69, _co$16] = (0, import_web$12.getNextMarker)(_el$68.nextSibling);
		(0, import_web$14.insert)(_el$61, (0, import_web$15.createComponent)(NowPlaying, {}), _el$63, _co$13);
		(0, import_web$14.insert)(_el$61, (0, import_web$15.createComponent)(Progress, {}), _el$65, _co$14);
		(0, import_web$14.insert)(_el$61, (0, import_web$15.createComponent)(Controls, {}), _el$67, _co$15);
		(0, import_web$14.insert)(_el$60, (0, import_web$15.createComponent)(Footer, {}), _el$69, _co$16);
		return _el$60;
	})();
}
function StationView() {
	return (() => {
		const _el$70 = (0, import_web$13.getNextElement)(_tmpl$15), _el$71 = _el$70.firstChild, [_el$72, _co$17] = (0, import_web$12.getNextMarker)(_el$71.nextSibling), _el$73 = _el$72.nextSibling, [_el$74, _co$18] = (0, import_web$12.getNextMarker)(_el$73.nextSibling);
		(0, import_web$14.insert)(_el$70, (0, import_web$15.createComponent)(StationList, {}), _el$72, _co$17);
		(0, import_web$14.insert)(_el$70, (0, import_web$15.createComponent)(Footer, {}), _el$74, _co$18);
		return _el$70;
	})();
}
function PanelHost() {
	return (0, import_web$15.createComponent)(Show, {
		get when() {
			return panelOpen();
		},
		get children() {
			return (0, import_web$15.createComponent)(Panel, {});
		}
	});
}
(0, import_web$5.delegateEvents)(["click"]);

//#endregion
//#region plugins/radio/inject.jsx
var import_web = __toESM(require_web(), 1);
var import_web$1 = __toESM(require_web(), 1);
var import_web$2 = __toESM(require_web(), 1);
var import_web$3 = __toESM(require_web(), 1);
const _tmpl$ = /*#__PURE__*/ (0, import_web.template)(`<div class="rad-host"></div>`, 2);
const { plugin: { scoped: scoped$1 }, solid: { createRoot }, ui: { ReactiveRoot } } = shelter;
const GROUP = "[class*=\"trailing_\"]:not([data-radio])";
const injected = new Map();
let panel = null;
function isToolbarGroup(el) {
	return !!el.querySelector("[class*=\"clickable_\"][role=\"button\"], [class*=\"iconWrapper\"]");
}
/** Borrow the class off a sibling so our button matches Discord's exactly. */
function nativeClass(group) {
	return group.querySelector("[class*=\"clickable_\"][role=\"button\"]")?.getAttribute("class") ?? "";
}
/**
* Render into a reactive root we can actually tear down.
*
* ReactiveRoot has no teardown. A detached node whose effects are still live
* keeps recomputing on every signal change for the rest of the session, and
* every store property it read holds a store-wide subscription — so each
* orphaned button makes every later store write a little more expensive. That
* cost is invisible for minutes and obvious after hours.
*/
function render(build) {
	const wrapped = () => (() => {
		const _el$ = (0, import_web$2.getNextElement)(_tmpl$);
		(0, import_web$3.insert)(_el$, build);
		return _el$;
	})();
	if (typeof createRoot !== "function") return {
		el: (0, import_web$1.createComponent)(ReactiveRoot, { get children() {
			return wrapped();
		} }),
		dispose: () => {}
	};
	let dispose = () => {};
	const el = createRoot((disposer) => {
		dispose = disposer;
		return wrapped();
	});
	return {
		el,
		dispose
	};
}
/**
* Drop anything whose toolbar React has since thrown away.
*
* A detached element's own MutationObserver never fires, so a group can't clean
* itself up — something outside has to notice. New groups only appear when old
* ones are replaced, which makes injection the natural place to check, and
* keeps this O(live groups) rather than a timer.
*/
function sweep() {
	for (const [group, entry] of injected) {
		if (group.isConnected) continue;
		entry.guard.disconnect();
		entry.dispose();
		entry.mount.remove();
		injected.delete(group);
	}
}
function inject(group) {
	sweep();
	if (injected.has(group) || group.dataset.radio || !isToolbarGroup(group)) return;
	group.dataset.radio = "1";
	const mount = document.createElement("div");
	mount.className = "rad-mount";
	const { el, dispose } = render(() => (0, import_web$1.createComponent)(ToolbarButton, { get native() {
		return nativeClass(group);
	} }));
	mount.append(el);
	group.prepend(mount);
	const guard = new MutationObserver(() => {
		if (group.isConnected && !mount.isConnected) group.prepend(mount);
	});
	guard.observe(group, { childList: true });
	injected.set(group, {
		mount,
		guard,
		dispose
	});
}
function startInjection() {
	scoped$1.observeDom(GROUP, inject);
	const root = document.createElement("div");
	root.className = "rad-root";
	const { el, dispose } = render(() => (0, import_web$1.createComponent)(PanelHost, {}));
	root.append(el);
	(document.querySelector("#app-mount") ?? document.body).append(root);
	panel = {
		root,
		dispose
	};
}
function stats() {
	return {
		mounts: injected.size,
		panel: !!panel
	};
}
function removeInjections() {
	for (const entry of injected.values()) {
		entry.guard.disconnect();
		entry.dispose();
	}
	injected.clear();
	panel?.dispose();
	panel = null;
	document.querySelectorAll(".rad-root, .rad-mount").forEach((el) => el.remove());
	document.querySelectorAll("[data-radio]").forEach((el) => delete el.dataset.radio);
}

//#endregion
//#region plugins/radio/mediasession.js
function sync() {
	const ms = navigator.mediaSession;
	if (!ms) return;
	if (!store.mediaSession || currentStation().remote) return clear();
	if (!active()) {
		attach();
		ms.playbackState = "paused";
		return;
	}
	attach();
	const now = track();
	const station = currentStation();
	const romaji = store.romaji;
	ms.metadata = new MediaMetadata({
		title: romaji && now?.titleAlt || now?.title || station.name,
		artist: romaji && now?.artistAlt || now?.artist || station.name,
		album: now?.album || station.name,
		artwork: now?.art || station.logo ? [{ src: now?.art || station.logo }] : []
	});
	ms.playbackState = "playing";
}
function clear() {
	const ms = navigator.mediaSession;
	if (!ms) return;
	ms.metadata = null;
	ms.playbackState = "none";
}
let lastAction = null;
function debug() {
	const ms = navigator.mediaSession;
	return {
		lastAction,
		state: ms?.playbackState ?? "(no mediaSession)",
		title: ms?.metadata?.title ?? null,
		enabled: !!store.mediaSession,
		playing: active()
	};
}
function handle(name, run) {
	lastAction = {
		name,
		at: new Date().toLocaleTimeString()
	};
	console.log("[radio] media key:", name);
	run();
}
const ACTIONS = {
	play: () => handle("play", () => start()),
	pause: () => handle("pause", () => pause()),
	stop: () => handle("stop", () => stop())
};
function attach() {
	const ms = navigator.mediaSession;
	if (!ms) return;
	for (const [action, handler] of Object.entries(ACTIONS)) try {
		ms.setActionHandler(action, handler);
	} catch {}
}
function detach() {
	const ms = navigator.mediaSession;
	if (!ms) return;
	for (const action of Object.keys(ACTIONS)) try {
		ms.setActionHandler(action, null);
	} catch {}
	clear();
}

//#endregion
//#region plugins/radio/index.jsx
const { plugin: { scoped } } = shelter;
function onLoad() {
	scoped.ui.injectCss(styles_default);
	attach();
	onTrack(() => sync());
	onPlaybackChange(() => sync());
	startInjection();
	window.__radio = {
		stats,
		media: debug,
		player: state,
		spotify: debug$1
	};
}
function onUnload() {
	shutdown();
	detach();
	removeInjections();
	delete window.__radio;
}

//#endregion
exports.onLoad = onLoad
exports.onUnload = onUnload
Object.defineProperty(exports, 'settings', {
  enumerable: true,
  get: function () {
    return Settings;
  }
});
return exports;
})({});