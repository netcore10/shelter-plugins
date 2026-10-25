// Things Buddy notices about you and Discord and comments on, unprompted. Everything goes through
// antic(), so it's all off with the "Commentary" setting and (except reactions to what you just did) never more than one a minute.
import { say, antic, goCenter } from "./buddy";
import { NAGS } from "./lines";

const {
  plugin: { store },
  flux: {
    dispatcher,
    storesFlat: { UserStore, PresenceStore, SelfPresenceStore },
  },
} = shelter;

const rand = (a) => a[(Math.random() * a.length) | 0];

const MILESTONES = {
  25: "That's 25 messages today. I'm not counting. I'm absolutely counting.",
  100: "One hundred messages today. Have you considered a hobby? I'm joking. Please keep talking.",
  250: "Two hundred and fifty messages. You are the main character of this server.",
  500: "Five hundred messages today. I'm worried and also very impressed.",
};

const STATUS = {
  dnd: "Do Not Disturb. So I'll just stand here quietly. Judging.",
  invisible: "Invisible, huh? I can still see you.",
  idle: "Gone idle. I'll keep your spot warm.",
};

let myVC; // the voice channel you're in, learned from your own voice-state updates
let lastInput = performance.now();
let nagged = false;
let lastHour = new Date().getHours();
let lastStatus;
let tick, statusTick;

// Your own messages, counted per calendar day.
function onMessage({ message, optimistic }) {
  const me = UserStore.getCurrentUser();
  if (optimistic || !me || message?.author?.id !== me.id) return;
  const day = new Date().toDateString();
  const n = (store.sent?.day === day ? store.sent.n : 0) + 1;
  store.sent = { day, n }; // top-level write, or it doesn't persist
  if (MILESTONES[n] && antic()) say(MILESTONES[n]);
}

// ponytail: assumes VOICE_STATE_UPDATES carries { voiceStates: [{ userId, channelId, oldChannelId }] }; if it doesn't, this is just silent
function onVoice({ voiceStates }) {
  const me = UserStore.getCurrentUser();
  for (const v of voiceStates ?? []) {
    if (v.userId === me?.id) {
      myVC = v.channelId;
      continue;
    }
    const joined = myVC && v.channelId === myVC && v.oldChannelId !== myVC;
    const left = myVC && v.oldChannelId === myVC && v.channelId !== myVC;
    if (!joined && !left) continue;
    const u = UserStore.getUser(v.userId);
    const name = u?.globalName ?? u?.global_name ?? u?.username ?? "Someone";
    if (antic()) say(joined ? `${name} joined the call! I was not scared while it was quiet.` : `${name} left. It's just us now.`);
  }
}

const onInput = () => {
  lastInput = performance.now();
  nagged = false;
};

// Every 2 s, cheaply: did you just change your status? That's something you did, so he answers at once.
function checkStatus() {
  const me = UserStore.getCurrentUser();
  // ponytail: two stores, because I can't see which one this Discord build exposes
  const st = SelfPresenceStore?.getStatus?.() ?? (me && PresenceStore?.getStatus?.(me.id));
  if (st && lastStatus && st !== lastStatus) {
    console.log("[buddy] status:", lastStatus, "->", st);
    if (STATUS[st] && antic(true)) say(STATUS[st]);
  }
  if (st) lastStatus = st;
}

// Every 30 s: gone quiet, the hour turned over.
function onTick() {
  const me = UserStore.getCurrentUser();
  const now = performance.now();

  if (!nagged && now - lastInput > 5 * 60_000 && antic()) {
    nagged = true;
    goCenter(() => say(rand(NAGS)));
    return;
  }

  const h = new Date().getHours();
  if (h !== lastHour) {
    lastHour = h;
    const t = new Date().toLocaleTimeString([], { hour: "numeric" });
    const up = Math.floor(now / 3.6e6); // the page's age is how long Discord has been open
    const line =
      h < 5
        ? `It's ${t}. Have you considered sleeping? I have. I'm doing it right now, spiritually.`
        : up >= 1
          ? `It's ${t}. Discord has been open for ${up} hour${up > 1 ? "s" : ""}. Just so you know.`
          : null;
    if (line && antic()) say(line);
  }
}

export function startEvents() {
  dispatcher.subscribe("MESSAGE_CREATE", onMessage);
  dispatcher.subscribe("VOICE_STATE_UPDATES", onVoice);
  for (const e of ["keydown", "pointerdown", "mousemove"]) addEventListener(e, onInput, { capture: true, passive: true });
  if (!SelfPresenceStore && !PresenceStore) console.warn("[buddy] no presence store found; status comments are off");
  checkStatus();
  tick = setInterval(onTick, 30_000);
  statusTick = setInterval(checkStatus, 2000);
}

export function stopEvents() {
  dispatcher.unsubscribe("MESSAGE_CREATE", onMessage);
  dispatcher.unsubscribe("VOICE_STATE_UPDATES", onVoice);
  for (const e of ["keydown", "pointerdown", "mousemove"]) removeEventListener(e, onInput, { capture: true });
  clearInterval(tick);
  clearInterval(statusTick);
}
