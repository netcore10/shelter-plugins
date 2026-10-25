import { start, stop, ping, pick } from "./buddy";
import { startMenu, stopMenu } from "./menu";
import { startEvents, stopEvents } from "./events";

const {
  plugin: { store },
  flux: {
    dispatcher,
    storesFlat: { UserStore, ChannelStore, RelationshipStore },
  },
} = shelter;

const DEFAULTS = { sam: true, samVoice: "Adult Male #2, American English (TruVoice)", samPitch: 130, samSpeed: 150, wander: true, dodge: true, watch: true, antics: true, hue: 0, hat: "", blockExtra: "", speak: true, mentions: true, chatter: 15, scale: 2, voice: "", rate: 1, pitch: 1, volume: 80 };

let lastReact = 0;

function onMessage({ message, optimistic }) {
  if (optimistic || !store.mentions || !message?.author) return;

  const me = UserStore.getCurrentUser();
  if (!me || message.author.id === me.id) return;

  // Friends only: nobody else gets to interrupt him.
  if (!RelationshipStore?.isFriend(message.author.id)) return;

  const channel = ChannelStore.getChannel(message.channelId);
  const dm = channel?.type === 1;
  const mentioned = message.mentions?.some((m) => m.id === me.id);
  if (!dm && !mentioned) return;

  // one interruption per 15s, however busy the channel is
  if (Date.now() - lastReact < 15_000) return;
  lastReact = Date.now();

  const name = message.author.global_name ?? message.author.username;

  // Point at where it came from. Both selectors are guesses at Discord's markup;
  // if either misses, ping() just talks.
  const target = dm
    ? document.querySelector(`a[href="/channels/@me/${message.channelId}"]`)
    : document.querySelector(`[data-list-item-id="guildsnav___${channel?.guild_id}"]`);

  ping(dm ? `${name} sent you a message!` : `${name} mentioned you!`, target);
}

export function onLoad() {
  if (!RelationshipStore) console.warn("[buddy] RelationshipStore not found; friend pings are off");
  for (const [k, v] of Object.entries(DEFAULTS)) store[k] ??= v;
  // the default voice changed from plain "Sam"; move existing installs over once
  if (store.samRev !== 2) {
    store.samVoice = DEFAULTS.samVoice;
    store.samPitch = DEFAULTS.samPitch;
    store.samSpeed = DEFAULTS.samSpeed;
    store.samRev = 2;
  }
  dispatcher.subscribe("MESSAGE_CREATE", onMessage);
  start();
  startEvents();
  startMenu(pick);
}

export function onUnload() {
  dispatcher.unsubscribe("MESSAGE_CREATE", onMessage);
  stopEvents();
  stopMenu();
  stop();
}

export { default as settings } from "./settings";
