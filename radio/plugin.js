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
try {
	if (typeof store.custom !== "string") store.custom = "[]";
} catch {
	store.custom = "[]";
}

//#endregion
//#region plugins/radio/styles.js
var styles_default = `
.rad-mount { display: contents; }

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
const { solid: { createSignal: createSignal$5 }, ui: { showToast, ToastColors } } = shelter;
const [playing, setPlaying] = createSignal$5(false);
const [loading, setLoading] = createSignal$5(false);
const active = () => playing() || loading();
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
	audio.addEventListener("playing", () => {
		retries = 0;
		setLoading(false);
		setPlaying(true);
	});
	audio.addEventListener("waiting", () => setLoading(true));
	audio.addEventListener("pause", () => setPlaying(false));
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
	setPlaying(false);
	if (retries >= 5) {
		teardownSource();
		setLoading(false);
		showToast({
			title: "Radio",
			content: "The stream keeps dropping. Try another station or quality.",
			color: ToastColors.DANGER
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
function play(url) {
	if (!url) {
		showToast({
			title: "Radio",
			content: "That station has no stream URL.",
			color: ToastColors.DANGER
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
		setPlaying(false);
		showToast({
			title: "Radio",
			content: `Couldn't start the stream: ${err?.message ?? err}`,
			color: ToastColors.DANGER
		});
	});
}
function stop$1() {
	clearTimeout(retryTimer);
	retries = 0;
	generation++;
	setPlaying(false);
	setLoading(false);
	teardownSource();
}
function setVolume(percent) {
	const clamped = Math.max(0, Math.min(100, Math.round(percent)));
	store.volume = clamped;
	if (audio) audio.volume = clamped / 100;
}
function setMuted(muted) {
	store.muted = !!muted;
	if (audio) audio.muted = !!muted;
}
function destroy() {
	stop$1();
	if (audio) {
		audio.removeEventListener("error", recover);
		audio.removeEventListener("ended", recover);
		audio = null;
	}
}

//#endregion
//#region plugins/radio/providers/listenmoe.js
var listenmoe_exports = {};
__export(listenmoe_exports, { connect: () => connect$5 });
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
function connect$5(station, sink) {
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
__export(radio_exports, { connect: () => connect$4 });
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
function connect$4(station, sink) {
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
__export(plaza_exports, { connect: () => connect$3 });
function connect$3(station, sink) {
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
__export(somafm_exports, { connect: () => connect$2 });
function connect$2(station, sink) {
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
__export(nightride_exports, { connect: () => connect$1 });
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
function connect$1(station, sink) {
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
//#region plugins/radio/providers/index.js
const PROVIDERS = {
	listenmoe: listenmoe_exports,
	radio: radio_exports,
	plaza: plaza_exports,
	somafm: somafm_exports,
	nightride: nightride_exports
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
	event: null
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
function readCustom() {
	try {
		const parsed = JSON.parse(store.custom || "[]");
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}
function writeCustom(list) {
	store.custom = JSON.stringify(list);
}
function customStations() {
	return readCustom().map((s) => ({
		id: `custom-${s.id}`,
		name: s.name || "Custom stream",
		group: "Yours",
		accent: "#5865f2",
		logo: null,
		custom: true,
		streams: { mp3: s.url },
		provider: { type: "none" }
	}));
}
function allStations() {
	return [...BUILT_IN, ...customStations()];
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
	want(active() || panelOpen() ? currentStation() : null);
}
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
	play(streamUrl(currentStation()));
	syncMetadata();
	playbackHook();
}
function stop() {
	stop$1();
	syncMetadata();
	playbackHook();
}
function toggle() {
	if (active()) stop();
else start();
}
function selectStation(id) {
	const station = stationById(id);
	if (!station || id === store.station) return;
	const wasPlaying = active();
	store.station = id;
	if (wasPlaying) play(streamUrl(station));
	want(null);
	syncMetadata();
	playbackHook();
	showPlayer();
}
function selectQuality(quality) {
	if (quality === store.quality) return;
	store.quality = quality;
	if (active()) play(streamUrl(currentStation()));
}
function shutdown() {
	destroy();
	want(null);
	setPanelOpen(false);
	anchor = null;
}

//#endregion
//#region plugins/radio/ui/icons.jsx
var import_web$51 = __toESM(require_web(), 1);
var import_web$52 = __toESM(require_web(), 1);
var import_web$53 = __toESM(require_web(), 1);
var import_web$54 = __toESM(require_web(), 1);
var import_web$55 = __toESM(require_web(), 1);
var import_web$56 = __toESM(require_web(), 1);
const _tmpl$$6 = /*#__PURE__*/ (0, import_web$51.template)(`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="2.3" fill="currentColor"></circle><path d="M8.6 8.6a4.8 4.8 0 0 0 0 6.8M15.4 15.4a4.8 4.8 0 0 0 0-6.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path><path d="M5.7 5.7a8.9 8.9 0 0 0 0 12.6M18.3 18.3a8.9 8.9 0 0 0 0-12.6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path></svg>`, 8), _tmpl$2$6 = /*#__PURE__*/ (0, import_web$51.template)(`<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.5 5.4a1 1 0 0 1 1.52-.85l9 6.6a1 1 0 0 1 0 1.7l-9 6.6a1 1 0 0 1-1.52-.85V5.4Z" fill="currentColor"></path></svg>`, 4), _tmpl$3$3 = /*#__PURE__*/ (0, import_web$51.template)(`<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><rect x="6.5" y="5" width="4" height="14" rx="1.4" fill="currentColor"></rect><rect x="13.5" y="5" width="4" height="14" rx="1.4" fill="currentColor"></rect></svg>`, 6), _tmpl$4$3 = /*#__PURE__*/ (0, import_web$51.template)(`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 9.5h3.2L12 5.6v12.8L7.2 14.5H4a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1Z" fill="currentColor"></path><!#><!/></svg>`, 6), _tmpl$5$1 = /*#__PURE__*/ (0, import_web$51.template)(`<svg><path d="m16 9.5 4.5 5M20.5 9.5 16 14.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path></svg>`, 4, true), _tmpl$6$1 = /*#__PURE__*/ (0, import_web$51.template)(`<svg><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path></svg>`, 4, true), _tmpl$7$1 = /*#__PURE__*/ (0, import_web$51.template)(`<svg class="rad-caret" width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 9 6 6 6-6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`, 4), _tmpl$8$1 = /*#__PURE__*/ (0, import_web$51.template)(`<div class="rad-bars" aria-hidden="true"><i></i><i></i><i></i></div>`, 8);
const BroadcastIcon = () => (0, import_web$56.getNextElement)(_tmpl$$6);
const PlayIcon = () => (0, import_web$56.getNextElement)(_tmpl$2$6);
const PauseIcon = () => (0, import_web$56.getNextElement)(_tmpl$3$3);
const VolumeIcon = (props) => (() => {
	const _el$4 = (0, import_web$56.getNextElement)(_tmpl$4$3), _el$5 = _el$4.firstChild, _el$6 = _el$5.nextSibling, [_el$7, _co$] = (0, import_web$53.getNextMarker)(_el$6.nextSibling);
	(0, import_web$54.insert)(_el$4, (() => {
		const _c$ = (0, import_web$55.memo)(() => !!props.muted);
		return () => _c$() ? (0, import_web$56.getNextElement)(_tmpl$5$1) : (0, import_web$56.getNextElement)(_tmpl$6$1);
	})(), _el$7, _co$);
	return _el$4;
})();
const CaretIcon = (props) => (() => {
	const _el$0 = (0, import_web$56.getNextElement)(_tmpl$7$1);
	(0, import_web$52.effect)(() => _el$0.style.setProperty("transform", props.up ? "rotate(180deg)" : "none"));
	return _el$0;
})();
const Bars = () => (0, import_web$56.getNextElement)(_tmpl$8$1);

//#endregion
//#region plugins/radio/ui/ToolbarButton.jsx
var import_web$42 = __toESM(require_web(), 1);
var import_web$43 = __toESM(require_web(), 1);
var import_web$44 = __toESM(require_web(), 1);
var import_web$45 = __toESM(require_web(), 1);
var import_web$46 = __toESM(require_web(), 1);
var import_web$47 = __toESM(require_web(), 1);
var import_web$48 = __toESM(require_web(), 1);
var import_web$49 = __toESM(require_web(), 1);
var import_web$50 = __toESM(require_web(), 1);
const _tmpl$$5 = /*#__PURE__*/ (0, import_web$42.template)(`<div></div>`, 2), _tmpl$2$5 = /*#__PURE__*/ (0, import_web$42.template)(`<div role="button" tabindex="0" aria-label="Radio"></div>`, 2);
const { solid: { Show: Show$4 } } = shelter;
function ToolbarButton(props) {
	const activate = (e) => togglePanel(e.currentTarget);
	return (() => {
		const _el$ = (0, import_web$48.getNextElement)(_tmpl$2$5);
		_el$.$$keydown = (e) => {
			if (e.key !== "Enter" && e.key !== " ") return;
			e.preventDefault();
			activate(e);
		};
		_el$.$$click = activate;
		(0, import_web$49.insert)(_el$, (0, import_web$50.createComponent)(Show$4, {
			get when() {
				return playing();
			},
			get fallback() {
				return (0, import_web$50.createComponent)(BroadcastIcon, {});
			},
			get children() {
				const _el$2 = (0, import_web$48.getNextElement)(_tmpl$$5);
				(0, import_web$49.insert)(_el$2, (0, import_web$50.createComponent)(Bars, {}));
				(0, import_web$47.effect)(() => _el$2.style.setProperty("color", currentStation().accent));
				return _el$2;
			}
		}));
		(0, import_web$47.effect)((_p$) => {
			const _v$ = `rad-btn ${props.native ?? ""}`, _v$2 = panelOpen();
			_v$ !== _p$._v$ && (0, import_web$45.className)(_el$, _p$._v$ = _v$);
			_v$2 !== _p$._v$2 && (0, import_web$44.setAttribute)(_el$, "aria-expanded", _p$._v$2 = _v$2);
			return _p$;
		}, {
			_v$: undefined,
			_v$2: undefined
		});
		(0, import_web$46.runHydrationEvents)();
		return _el$;
	})();
}
(0, import_web$43.delegateEvents)(["click", "keydown"]);

//#endregion
//#region plugins/radio/ui/Artwork.jsx
var import_web$35 = __toESM(require_web(), 1);
var import_web$36 = __toESM(require_web(), 1);
var import_web$37 = __toESM(require_web(), 1);
var import_web$38 = __toESM(require_web(), 1);
var import_web$39 = __toESM(require_web(), 1);
var import_web$40 = __toESM(require_web(), 1);
var import_web$41 = __toESM(require_web(), 1);
const _tmpl$$4 = /*#__PURE__*/ (0, import_web$35.template)(`<img alt="" loading="lazy">`, 1), _tmpl$2$4 = /*#__PURE__*/ (0, import_web$35.template)(`<div aria-hidden="true"></div>`, 2);
const { solid: { createSignal: createSignal$2, createMemo: createMemo$1, Show: Show$3 } } = shelter;
function Artwork(props) {
	const [broken, setBroken] = createSignal$2(null);
	const src = createMemo$1(() => {
		const candidate = props.src || props.station?.logo || null;
		return candidate && candidate !== broken() ? candidate : null;
	});
	return (0, import_web$37.createComponent)(Show$3, {
		get when() {
			return src();
		},
		get fallback() {
			return (() => {
				const _el$2 = (0, import_web$41.getNextElement)(_tmpl$2$4);
				(0, import_web$36.insert)(_el$2, () => (props.station?.name ?? "?").trim().charAt(0).toUpperCase());
				(0, import_web$40.effect)((_p$) => {
					const _v$3 = `${props.class} rad-art-blank`, _v$4 = props.station?.accent ?? "#5865f2";
					_v$3 !== _p$._v$3 && (0, import_web$39.className)(_el$2, _p$._v$3 = _v$3);
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
			const _el$ = (0, import_web$41.getNextElement)(_tmpl$$4);
			_el$.addEventListener("error", () => setBroken(src()));
			(0, import_web$40.effect)((_p$) => {
				const _v$ = props.class, _v$2 = src();
				_v$ !== _p$._v$ && (0, import_web$39.className)(_el$, _p$._v$ = _v$);
				_v$2 !== _p$._v$2 && (0, import_web$38.setAttribute)(_el$, "src", _p$._v$2 = _v$2);
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
var import_web$26 = __toESM(require_web(), 1);
var import_web$27 = __toESM(require_web(), 1);
var import_web$28 = __toESM(require_web(), 1);
var import_web$29 = __toESM(require_web(), 1);
var import_web$30 = __toESM(require_web(), 1);
var import_web$31 = __toESM(require_web(), 1);
var import_web$32 = __toESM(require_web(), 1);
var import_web$33 = __toESM(require_web(), 1);
var import_web$34 = __toESM(require_web(), 1);
const _tmpl$$3 = /*#__PURE__*/ (0, import_web$26.template)(`<div class="rad-list"></div>`, 2), _tmpl$2$3 = /*#__PURE__*/ (0, import_web$26.template)(`<div class="rad-group"></div>`, 2), _tmpl$3$2 = /*#__PURE__*/ (0, import_web$26.template)(`<div class="rad-item-genre"></div>`, 2), _tmpl$4$2 = /*#__PURE__*/ (0, import_web$26.template)(`<button type="button" class="rad-item"><!#><!/><div class="rad-item-text"><div class="rad-item-name"></div><!#><!/></div></button>`, 10);
const { solid: { For: For$2, Show: Show$2 } } = shelter;
function StationList() {
	return (() => {
		const _el$ = (0, import_web$32.getNextElement)(_tmpl$$3);
		(0, import_web$33.insert)(_el$, (0, import_web$34.createComponent)(For$2, {
			get each() {
				return groupedStations();
			},
			children: (group) => [(() => {
				const _el$2 = (0, import_web$32.getNextElement)(_tmpl$2$3);
				(0, import_web$33.insert)(_el$2, () => group.name);
				return _el$2;
			})(), (0, import_web$34.createComponent)(For$2, {
				get each() {
					return group.stations;
				},
				children: (station) => (() => {
					const _el$3 = (0, import_web$32.getNextElement)(_tmpl$4$2), _el$9 = _el$3.firstChild, [_el$0, _co$2] = (0, import_web$31.getNextMarker)(_el$9.nextSibling), _el$4 = _el$0.nextSibling, _el$5 = _el$4.firstChild, _el$7 = _el$5.nextSibling, [_el$8, _co$] = (0, import_web$31.getNextMarker)(_el$7.nextSibling);
					_el$3.$$click = () => selectStation(station.id);
					(0, import_web$33.insert)(_el$3, (0, import_web$34.createComponent)(Artwork, {
						"class": "rad-item-art",
						station
					}), _el$0, _co$2);
					(0, import_web$33.insert)(_el$5, () => station.name);
					(0, import_web$33.insert)(_el$4, (0, import_web$34.createComponent)(Show$2, {
						get when() {
							return station.genre;
						},
						get children() {
							const _el$6 = (0, import_web$32.getNextElement)(_tmpl$3$2);
							(0, import_web$33.insert)(_el$6, () => station.genre);
							return _el$6;
						}
					}), _el$8, _co$);
					(0, import_web$29.effect)(() => (0, import_web$28.setAttribute)(_el$3, "aria-current", store.station === station.id));
					(0, import_web$30.runHydrationEvents)();
					return _el$3;
				})()
			})]
		}));
		return _el$;
	})();
}
(0, import_web$27.delegateEvents)(["click"]);

//#endregion
//#region plugins/radio/ui/Panel.jsx
var import_web$14 = __toESM(require_web(), 1);
var import_web$15 = __toESM(require_web(), 1);
var import_web$16 = __toESM(require_web(), 1);
var import_web$17 = __toESM(require_web(), 1);
var import_web$18 = __toESM(require_web(), 1);
var import_web$19 = __toESM(require_web(), 1);
var import_web$20 = __toESM(require_web(), 1);
var import_web$21 = __toESM(require_web(), 1);
var import_web$22 = __toESM(require_web(), 1);
var import_web$23 = __toESM(require_web(), 1);
var import_web$24 = __toESM(require_web(), 1);
var import_web$25 = __toESM(require_web(), 1);
const _tmpl$$2 = /*#__PURE__*/ (0, import_web$14.template)(`<div class="rad-sub"></div>`, 2), _tmpl$2$2 = /*#__PURE__*/ (0, import_web$14.template)(`<div class="rad-alt"></div>`, 2), _tmpl$3$1 = /*#__PURE__*/ (0, import_web$14.template)(`<div class="rad-alt">from <!#><!/></div>`, 4), _tmpl$4$1 = /*#__PURE__*/ (0, import_web$14.template)(`<div class="rad-tag"></div>`, 2), _tmpl$5 = /*#__PURE__*/ (0, import_web$14.template)(`<div class="rad-track"><!#><!/><div class="rad-meta"><div class="rad-title"></div><!#><!/><!#><!/><!#><!/><!#><!/></div></div>`, 16), _tmpl$6 = /*#__PURE__*/ (0, import_web$14.template)(`<div class="rad-progress"><div class="rad-bar"><span></span></div><div class="rad-times"><span></span><span></span></div></div>`, 12), _tmpl$7 = /*#__PURE__*/ (0, import_web$14.template)(`<div class="rad-controls"><button type="button" class="rad-play"></button><div class="rad-volume"><button type="button" class="rad-mute"></button><!#><!/></div></div>`, 10), _tmpl$8 = /*#__PURE__*/ (0, import_web$14.template)(`<div class="rad-spinner"></div>`, 2), _tmpl$9 = /*#__PURE__*/ (0, import_web$14.template)(`<div class="rad-foot"><span class="rad-dot"></span><span class="rad-foot-text"></span></div>`, 6), _tmpl$0 = /*#__PURE__*/ (0, import_web$14.template)(`<div></div>`, 2), _tmpl$1 = /*#__PURE__*/ (0, import_web$14.template)(`<div class="rad-panel" role="dialog" aria-label="Radio"><div class="rad-head"><button type="button" class="rad-station" aria-label="Choose a station"><span class="rad-station-name"></span><span class="rad-station-group"></span><!#><!/></button><!#><!/></div><!#><!/></div>`, 16), _tmpl$10 = /*#__PURE__*/ (0, import_web$14.template)(`<div><div class="rad-body"><!#><!/><!#><!/><!#><!/></div><!#><!/></div>`, 12), _tmpl$11 = /*#__PURE__*/ (0, import_web$14.template)(`<div><!#><!/><!#><!/></div>`, 6);
const { solid: { createEffect, createMemo, createSignal: createSignal$1, onCleanup, onMount, Show: Show$1 }, ui: { Slider: Slider$1 } } = shelter;
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
		const _el$ = (0, import_web$23.getNextElement)(_tmpl$5), _el$17 = _el$.firstChild, [_el$18, _co$6] = (0, import_web$22.getNextMarker)(_el$17.nextSibling), _el$2 = _el$18.nextSibling, _el$3 = _el$2.firstChild, _el$1 = _el$3.nextSibling, [_el$10, _co$2] = (0, import_web$22.getNextMarker)(_el$1.nextSibling), _el$11 = _el$10.nextSibling, [_el$12, _co$3] = (0, import_web$22.getNextMarker)(_el$11.nextSibling), _el$13 = _el$12.nextSibling, [_el$14, _co$4] = (0, import_web$22.getNextMarker)(_el$13.nextSibling), _el$15 = _el$14.nextSibling, [_el$16, _co$5] = (0, import_web$22.getNextMarker)(_el$15.nextSibling);
		(0, import_web$24.insert)(_el$, (0, import_web$25.createComponent)(Artwork, {
			"class": "rad-art",
			get src() {
				return track()?.art;
			},
			get station() {
				return station();
			}
		}), _el$18, _co$6);
		(0, import_web$24.insert)(_el$3, primary);
		(0, import_web$24.insert)(_el$2, (0, import_web$25.createComponent)(Show$1, {
			get when() {
				return secondary();
			},
			get children() {
				const _el$4 = (0, import_web$23.getNextElement)(_tmpl$$2);
				(0, import_web$24.insert)(_el$4, secondary);
				return _el$4;
			}
		}), _el$10, _co$2);
		(0, import_web$24.insert)(_el$2, (0, import_web$25.createComponent)(Show$1, {
			get when() {
				return alternate();
			},
			get children() {
				const _el$5 = (0, import_web$23.getNextElement)(_tmpl$2$2);
				(0, import_web$24.insert)(_el$5, alternate);
				return _el$5;
			}
		}), _el$12, _co$3);
		(0, import_web$24.insert)(_el$2, (0, import_web$25.createComponent)(Show$1, {
			get when() {
				return track()?.source;
			},
			get children() {
				const _el$6 = (0, import_web$23.getNextElement)(_tmpl$3$1), _el$7 = _el$6.firstChild, _el$8 = _el$7.nextSibling, [_el$9, _co$] = (0, import_web$22.getNextMarker)(_el$8.nextSibling);
				(0, import_web$24.insert)(_el$6, () => track().source, _el$9, _co$);
				return _el$6;
			}
		}), _el$14, _co$4);
		(0, import_web$24.insert)(_el$2, (0, import_web$25.createComponent)(Show$1, {
			get when() {
				return track()?.event;
			},
			get children() {
				const _el$0 = (0, import_web$23.getNextElement)(_tmpl$4$1);
				(0, import_web$24.insert)(_el$0, () => track().event);
				(0, import_web$21.effect)(() => _el$0.style.setProperty("background", station().accent));
				return _el$0;
			}
		}), _el$16, _co$5);
		return _el$;
	})();
}
function Progress() {
	const [now, setNow] = createSignal$1(Date.now());
	const duration = () => track()?.duration || 0;
	const hasBar = () => duration() > 0 && !!track()?.startedAt;
	createEffect(() => {
		if (!hasBar()) return;
		const timer = setInterval(() => setNow(Date.now()), 1e3);
		onCleanup(() => clearInterval(timer));
	});
	const elapsed = createMemo(() => {
		const started = track()?.startedAt;
		if (!started) return 0;
		return Math.max(0, Math.min(duration(), (now() - started) / 1e3));
	});
	return (0, import_web$25.createComponent)(Show$1, {
		get when() {
			return hasBar();
		},
		get children() {
			const _el$19 = (0, import_web$23.getNextElement)(_tmpl$6), _el$20 = _el$19.firstChild, _el$21 = _el$20.firstChild, _el$22 = _el$20.nextSibling, _el$23 = _el$22.firstChild, _el$24 = _el$23.nextSibling;
			(0, import_web$24.insert)(_el$23, () => clock(elapsed()));
			(0, import_web$24.insert)(_el$24, () => clock(duration()));
			(0, import_web$21.effect)((_p$) => {
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
	return (() => {
		const _el$25 = (0, import_web$23.getNextElement)(_tmpl$7), _el$26 = _el$25.firstChild, _el$27 = _el$26.nextSibling, _el$28 = _el$27.firstChild, _el$29 = _el$28.nextSibling, [_el$30, _co$7] = (0, import_web$22.getNextMarker)(_el$29.nextSibling);
		(0, import_web$20.addEventListener)(_el$26, "click", toggle, true);
		(0, import_web$24.insert)(_el$26, (0, import_web$25.createComponent)(Show$1, {
			get when() {
				return !loading();
			},
			get fallback() {
				return (0, import_web$23.getNextElement)(_tmpl$8);
			},
			get children() {
				return (0, import_web$25.createComponent)(Show$1, {
					get when() {
						return playing();
					},
					get fallback() {
						return (0, import_web$25.createComponent)(PlayIcon, {});
					},
					get children() {
						return (0, import_web$25.createComponent)(PauseIcon, {});
					}
				});
			}
		}));
		_el$28.$$click = () => setMuted(!store.muted);
		(0, import_web$24.insert)(_el$28, (0, import_web$25.createComponent)(VolumeIcon, { get muted() {
			return store.muted || store.volume === 0;
		} }));
		(0, import_web$24.insert)(_el$27, (0, import_web$25.createComponent)(Slider$1, {
			min: 0,
			max: 100,
			step: 1,
			get value() {
				return store.volume;
			},
			onInput: setVolume
		}), _el$30, _co$7);
		(0, import_web$21.effect)((_p$) => {
			const _v$3 = currentStation().accent, _v$4 = playing() ? "Pause" : "Play", _v$5 = store.muted ? "Unmute" : "Mute";
			_v$3 !== _p$._v$3 && _el$26.style.setProperty("background", _p$._v$3 = _v$3);
			_v$4 !== _p$._v$4 && (0, import_web$17.setAttribute)(_el$26, "aria-label", _p$._v$4 = _v$4);
			_v$5 !== _p$._v$5 && (0, import_web$17.setAttribute)(_el$28, "aria-label", _p$._v$5 = _v$5);
			return _p$;
		}, {
			_v$3: undefined,
			_v$4: undefined,
			_v$5: undefined
		});
		(0, import_web$18.runHydrationEvents)();
		return _el$25;
	})();
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
	return (() => {
		const _el$32 = (0, import_web$23.getNextElement)(_tmpl$9), _el$33 = _el$32.firstChild, _el$34 = _el$33.nextSibling;
		(0, import_web$24.insert)(_el$34, detail);
		(0, import_web$21.effect)(() => (0, import_web$17.setAttribute)(_el$33, "data-status", status()));
		return _el$32;
	})();
}
function Panel() {
	let panel;
	const [pos, setPos] = createSignal$1({
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
		const _el$35 = (0, import_web$23.getNextElement)(_tmpl$1), _el$36 = _el$35.firstChild, _el$37 = _el$36.firstChild, _el$38 = _el$37.firstChild, _el$39 = _el$38.nextSibling, _el$40 = _el$39.nextSibling, [_el$41, _co$8] = (0, import_web$22.getNextMarker)(_el$40.nextSibling), _el$43 = _el$37.nextSibling, [_el$44, _co$9] = (0, import_web$22.getNextMarker)(_el$43.nextSibling), _el$45 = _el$36.nextSibling, [_el$46, _co$0] = (0, import_web$22.getNextMarker)(_el$45.nextSibling);
		const _ref$ = panel;
		typeof _ref$ === "function" ? (0, import_web$16.use)(_ref$, _el$35) : panel = _el$35;
		_el$37.$$click = () => view() === "stations" ? showPlayer() : showStations();
		(0, import_web$24.insert)(_el$38, () => currentStation().name);
		(0, import_web$24.insert)(_el$39, () => currentStation().group);
		(0, import_web$24.insert)(_el$37, (0, import_web$25.createComponent)(CaretIcon, { get up() {
			return view() === "stations";
		} }), _el$41, _co$8);
		(0, import_web$24.insert)(_el$36, (0, import_web$25.createComponent)(Show$1, {
			get when() {
				return playing();
			},
			get children() {
				const _el$42 = (0, import_web$23.getNextElement)(_tmpl$0);
				(0, import_web$24.insert)(_el$42, (0, import_web$25.createComponent)(Bars, {}));
				(0, import_web$21.effect)(() => _el$42.style.setProperty("color", currentStation().accent));
				return _el$42;
			}
		}), _el$44, _co$9);
		(0, import_web$24.insert)(_el$35, (0, import_web$25.createComponent)(Show$1, {
			get when() {
				return view() === "player";
			},
			get fallback() {
				return (0, import_web$25.createComponent)(StationView, {});
			},
			get children() {
				return (0, import_web$25.createComponent)(PlayerView, {});
			}
		}), _el$46, _co$0);
		(0, import_web$21.effect)((_p$) => {
			const _v$6 = `${pos().top}px`, _v$7 = `${pos().right}px`, _v$8 = currentStation().accent;
			_v$6 !== _p$._v$6 && _el$35.style.setProperty("top", _p$._v$6 = _v$6);
			_v$7 !== _p$._v$7 && _el$35.style.setProperty("right", _p$._v$7 = _v$7);
			_v$8 !== _p$._v$8 && _el$35.style.setProperty("--rad-accent", _p$._v$8 = _v$8);
			return _p$;
		}, {
			_v$6: undefined,
			_v$7: undefined,
			_v$8: undefined
		});
		(0, import_web$18.runHydrationEvents)();
		return _el$35;
	})();
}
function PlayerView() {
	return (() => {
		const _el$47 = (0, import_web$23.getNextElement)(_tmpl$10), _el$48 = _el$47.firstChild, _el$49 = _el$48.firstChild, [_el$50, _co$1] = (0, import_web$22.getNextMarker)(_el$49.nextSibling), _el$51 = _el$50.nextSibling, [_el$52, _co$10] = (0, import_web$22.getNextMarker)(_el$51.nextSibling), _el$53 = _el$52.nextSibling, [_el$54, _co$11] = (0, import_web$22.getNextMarker)(_el$53.nextSibling), _el$55 = _el$48.nextSibling, [_el$56, _co$12] = (0, import_web$22.getNextMarker)(_el$55.nextSibling);
		(0, import_web$24.insert)(_el$48, (0, import_web$25.createComponent)(NowPlaying, {}), _el$50, _co$1);
		(0, import_web$24.insert)(_el$48, (0, import_web$25.createComponent)(Progress, {}), _el$52, _co$10);
		(0, import_web$24.insert)(_el$48, (0, import_web$25.createComponent)(Controls, {}), _el$54, _co$11);
		(0, import_web$24.insert)(_el$47, (0, import_web$25.createComponent)(Footer, {}), _el$56, _co$12);
		return _el$47;
	})();
}
function StationView() {
	return (() => {
		const _el$57 = (0, import_web$23.getNextElement)(_tmpl$11), _el$58 = _el$57.firstChild, [_el$59, _co$13] = (0, import_web$22.getNextMarker)(_el$58.nextSibling), _el$60 = _el$59.nextSibling, [_el$61, _co$14] = (0, import_web$22.getNextMarker)(_el$60.nextSibling);
		(0, import_web$24.insert)(_el$57, (0, import_web$25.createComponent)(StationList, {}), _el$59, _co$13);
		(0, import_web$24.insert)(_el$57, (0, import_web$25.createComponent)(Footer, {}), _el$61, _co$14);
		return _el$57;
	})();
}
function PanelHost() {
	return (0, import_web$25.createComponent)(Show$1, {
		get when() {
			return panelOpen();
		},
		get children() {
			return (0, import_web$25.createComponent)(Panel, {});
		}
	});
}
(0, import_web$15.delegateEvents)(["click"]);

//#endregion
//#region plugins/radio/inject.jsx
var import_web$13 = __toESM(require_web(), 1);
const { plugin: { scoped: scoped$1 }, ui: { ReactiveRoot } } = shelter;
const GROUP = "[class*=\"trailing_\"]:not([data-radio])";
const guards = new Set();
let panelRoot = null;
function isToolbarGroup(el) {
	return !!el.querySelector("[class*=\"clickable_\"][role=\"button\"], [class*=\"iconWrapper\"]");
}
/** Borrow the class off a sibling so our button matches Discord's exactly. */
function nativeClass(group) {
	return group.querySelector("[class*=\"clickable_\"][role=\"button\"]")?.getAttribute("class") ?? "";
}
function inject(group) {
	if (group.dataset.radio || !isToolbarGroup(group)) return;
	group.dataset.radio = "1";
	const mount = document.createElement("div");
	mount.className = "rad-mount";
	mount.append((0, import_web$13.createComponent)(ReactiveRoot, { get children() {
		return (0, import_web$13.createComponent)(ToolbarButton, { get native() {
			return nativeClass(group);
		} });
	} }));
	group.prepend(mount);
	const guard = new MutationObserver(() => {
		if (!group.isConnected) {
			guard.disconnect();
			guards.delete(guard);
			return;
		}
		if (!mount.isConnected) group.prepend(mount);
	});
	guard.observe(group, { childList: true });
	guards.add(guard);
}
function startInjection() {
	scoped$1.observeDom(GROUP, inject);
	panelRoot = document.createElement("div");
	panelRoot.className = "rad-root";
	panelRoot.append((0, import_web$13.createComponent)(ReactiveRoot, { get children() {
		return (0, import_web$13.createComponent)(PanelHost, {});
	} }));
	(document.querySelector("#app-mount") ?? document.body).append(panelRoot);
}
function removeInjections() {
	guards.forEach((guard) => guard.disconnect());
	guards.clear();
	panelRoot = null;
	document.querySelectorAll(".rad-root, .rad-mount").forEach((el) => el.remove());
	document.querySelectorAll("[data-radio]").forEach((el) => delete el.dataset.radio);
}

//#endregion
//#region plugins/radio/mediasession.js
function sync() {
	const ms = navigator.mediaSession;
	if (!ms) return;
	if (!store.mediaSession || !active()) return clear();
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
const ACTIONS = {
	play: () => start(),
	pause: () => stop(),
	stop: () => stop()
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
//#region plugins/radio/ui/Segmented.jsx
var import_web$5 = __toESM(require_web(), 1);
var import_web$6 = __toESM(require_web(), 1);
var import_web$7 = __toESM(require_web(), 1);
var import_web$8 = __toESM(require_web(), 1);
var import_web$9 = __toESM(require_web(), 1);
var import_web$10 = __toESM(require_web(), 1);
var import_web$11 = __toESM(require_web(), 1);
var import_web$12 = __toESM(require_web(), 1);
const _tmpl$$1 = /*#__PURE__*/ (0, import_web$5.template)(`<div class="rad-seg" role="group"></div>`, 2), _tmpl$2$1 = /*#__PURE__*/ (0, import_web$5.template)(`<button type="button"></button>`, 2);
const { solid: { For: For$1 } } = shelter;
function Segmented(props) {
	return (() => {
		const _el$ = (0, import_web$10.getNextElement)(_tmpl$$1);
		(0, import_web$11.insert)(_el$, (0, import_web$12.createComponent)(For$1, {
			get each() {
				return props.options;
			},
			children: (option) => (() => {
				const _el$2 = (0, import_web$10.getNextElement)(_tmpl$2$1);
				_el$2.$$click = () => props.onSelect(option.value);
				(0, import_web$11.insert)(_el$2, () => option.label);
				(0, import_web$8.effect)((_p$) => {
					const _v$ = props.value === option.value, _v$2 = option.hint;
					_v$ !== _p$._v$ && (0, import_web$7.setAttribute)(_el$2, "aria-pressed", _p$._v$ = _v$);
					_v$2 !== _p$._v$2 && (0, import_web$7.setAttribute)(_el$2, "title", _p$._v$2 = _v$2);
					return _p$;
				}, {
					_v$: undefined,
					_v$2: undefined
				});
				(0, import_web$9.runHydrationEvents)();
				return _el$2;
			})()
		}));
		return _el$;
	})();
}
(0, import_web$6.delegateEvents)(["click"]);

//#endregion
//#region plugins/radio/settings.jsx
var import_web = __toESM(require_web(), 1);
var import_web$1 = __toESM(require_web(), 1);
var import_web$2 = __toESM(require_web(), 1);
var import_web$3 = __toESM(require_web(), 1);
var import_web$4 = __toESM(require_web(), 1);
const _tmpl$ = /*#__PURE__*/ (0, import_web.template)(`<div class="rad-settings-row"><div class="rad-settings-label">Any direct stream URL works — an Icecast or SHOUTcast MP3, AAC or Ogg endpoint. There's no now-playing info for these; a bare stream doesn't expose it to the page.</div><!#><!/><div class="rad-custom"><!#><!/><!#><!/><!#><!/></div></div>`, 14), _tmpl$2 = /*#__PURE__*/ (0, import_web.template)(`<div class="rad-custom"><div class="rad-custom-text"><div></div><div class="rad-custom-url"></div></div><!#><!/></div>`, 10), _tmpl$3 = /*#__PURE__*/ (0, import_web.template)(`<div class="rad-settings-row"><div class="rad-settings-label">Volume</div><!#><!/></div>`, 6), _tmpl$4 = /*#__PURE__*/ (0, import_web.template)(`<div class="rad-settings-row"><div class="rad-settings-label">Stream quality — <!#><!/></div><!#><!/></div>`, 8);
const { solid: { createSignal, For, Show }, ui: { Button, ButtonColors, ButtonSizes, Divider, Header, HeaderTags, Slider, SwitchItem, TextBox } } = shelter;
const Toggle = (props) => (0, import_web$4.createComponent)(SwitchItem, {
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
function CustomStations() {
	const [name, setName] = createSignal("");
	const [url, setUrl] = createSignal("");
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
	return [(0, import_web$4.createComponent)(Header, {
		get tag() {
			return HeaderTags.H3;
		},
		children: "Your stations"
	}), (() => {
		const _el$ = (0, import_web$1.getNextElement)(_tmpl$), _el$2 = _el$.firstChild, _el$0 = _el$2.nextSibling, [_el$1, _co$4] = (0, import_web$2.getNextMarker)(_el$0.nextSibling), _el$3 = _el$1.nextSibling, _el$4 = _el$3.firstChild, [_el$5, _co$] = (0, import_web$2.getNextMarker)(_el$4.nextSibling), _el$6 = _el$5.nextSibling, [_el$7, _co$2] = (0, import_web$2.getNextMarker)(_el$6.nextSibling), _el$8 = _el$7.nextSibling, [_el$9, _co$3] = (0, import_web$2.getNextMarker)(_el$8.nextSibling);
		(0, import_web$3.insert)(_el$, (0, import_web$4.createComponent)(For, {
			get each() {
				return readCustom();
			},
			children: (station) => (() => {
				const _el$10 = (0, import_web$1.getNextElement)(_tmpl$2), _el$11 = _el$10.firstChild, _el$12 = _el$11.firstChild, _el$13 = _el$12.nextSibling, _el$14 = _el$11.nextSibling, [_el$15, _co$5] = (0, import_web$2.getNextMarker)(_el$14.nextSibling);
				(0, import_web$3.insert)(_el$12, () => station.name);
				(0, import_web$3.insert)(_el$13, () => station.url);
				(0, import_web$3.insert)(_el$10, (0, import_web$4.createComponent)(Button, {
					get size() {
						return ButtonSizes.SMALL;
					},
					get color() {
						return ButtonColors.RED;
					},
					onClick: () => remove(station.id),
					children: "Remove"
				}), _el$15, _co$5);
				return _el$10;
			})()
		}), _el$1, _co$4);
		(0, import_web$3.insert)(_el$3, (0, import_web$4.createComponent)(TextBox, {
			placeholder: "Name",
			get value() {
				return name();
			},
			onInput: setName
		}), _el$5, _co$);
		(0, import_web$3.insert)(_el$3, (0, import_web$4.createComponent)(TextBox, {
			placeholder: "https://…",
			get value() {
				return url();
			},
			onInput: setUrl
		}), _el$7, _co$2);
		(0, import_web$3.insert)(_el$3, (0, import_web$4.createComponent)(Button, {
			get size() {
				return ButtonSizes.SMALL;
			},
			onClick: add,
			children: "Add"
		}), _el$9, _co$3);
		return _el$;
	})()];
}
function Settings() {
	const qualities = () => qualitiesFor(currentStation());
	return [
		(0, import_web$4.createComponent)(Header, {
			get tag() {
				return HeaderTags.H3;
			},
			children: "Playback"
		}),
		(() => {
			const _el$16 = (0, import_web$1.getNextElement)(_tmpl$3), _el$17 = _el$16.firstChild, _el$18 = _el$17.nextSibling, [_el$19, _co$6] = (0, import_web$2.getNextMarker)(_el$18.nextSibling);
			(0, import_web$3.insert)(_el$16, (0, import_web$4.createComponent)(Slider, {
				min: 0,
				max: 100,
				step: 1,
				get value() {
					return store.volume;
				},
				onInput: setVolume
			}), _el$19, _co$6);
			return _el$16;
		})(),
		(0, import_web$4.createComponent)(Show, {
			get when() {
				return qualities().length > 1;
			},
			get children() {
				const _el$20 = (0, import_web$1.getNextElement)(_tmpl$4), _el$21 = _el$20.firstChild, _el$22 = _el$21.firstChild, _el$23 = _el$22.nextSibling, [_el$24, _co$7] = (0, import_web$2.getNextMarker)(_el$23.nextSibling), _el$25 = _el$21.nextSibling, [_el$26, _co$8] = (0, import_web$2.getNextMarker)(_el$25.nextSibling);
				(0, import_web$3.insert)(_el$21, () => currentStation().name, _el$24, _co$7);
				(0, import_web$3.insert)(_el$20, (0, import_web$4.createComponent)(Segmented, {
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
				}), _el$26, _co$8);
				return _el$20;
			}
		}),
		(0, import_web$4.createComponent)(Toggle, {
			get checked() {
				return store.romaji;
			},
			onChange: (v) => store.romaji = v,
			note: "Show romanised titles and artist names where the station provides them, instead of the original script.",
			children: "Prefer romanised names"
		}),
		(0, import_web$4.createComponent)(Toggle, {
			get checked() {
				return store.mediaSession;
			},
			onChange: (v) => store.mediaSession = v,
			note: "Show what's playing in your system's media controls, and let media keys pause it.",
			hideBorder: true,
			children: "Use system media controls"
		}),
		(0, import_web$4.createComponent)(Divider, {
			mt: true,
			mb: true
		}),
		(0, import_web$4.createComponent)(CustomStations, {})
	];
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
}
function onUnload() {
	shutdown();
	detach();
	removeInjections();
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