// Everything Buddy says that never changes. tools/render-voice.mjs bakes each of
// these into voice.js as a small Opus clip, so they play instantly and offline.
// Anything not listed here (a friend's name in a ping) is synthesised live.
// Said in order, once, the first time he ever loads. Add or remove lines freely.
export const GREETINGS = [
  "Hi! It looks like you're using Discord. Would you like help with that?",
  "I'll be down here if you need me. Mostly I'll just be down here.",
  "Click me for a tip, or drag me wherever you like. I'm very flexible.",
];
export const TEST = "Testing, one, two, three. Can you hear me?";

export const LINES = [
  "It looks like you're procrastinating. Would you like help with that?",
  "Have you tried turning your status to Do Not Disturb?",
  "I noticed you've been staring at this window. Everything okay?",
  "It looks like you're typing a message. Would you like me to watch?",
  "I'm not saying you should drink some water. I'm just saying it out loud.",
];

// What clicking him says. Unprompted chatter uses LINES.
export const TIPS = [
  "Tip: the mute button is the most powerful feature in this app.",
  "Did you know? You can drag me anywhere. Please don't put me on the send button.",
  "Tip: right-click a person in the member list to turn their volume up or down.",
  "Tip: drag one server icon onto another to make a folder. Your sidebar will thank you.",
  "Tip: right-click a server and open Notification Settings. Silence is a feature.",
  "Tip: type slash spoiler before your message to hide it. Slash tenor and slash giphy find you a gif.",
  "Tip: wrap words in asterisks for italics, double for bold, tildes to strike them through.",
  "Tip: in Voice and Video settings, turn on Noise Suppression. Everyone will hear less of your keyboard.",
  "Tip: turn on two-factor authentication under My Account. Future you will be grateful.",
  "Tip: Developer Mode in Advanced settings lets you copy IDs. No Nitro required.",
  "Tip: Connections in User Settings can link Steam and friends to your profile.",
];

// The voice the clips were rendered with. Change any of these in settings and the
// clips no longer match, so those lines go live instead.
export const BAKED = { voice: "Adult Male #2, American English (TruVoice)", pitch: 130, speed: 150 };

// Fake dialog boxes: [question, [[button, what he says back], ...]]. Every button is the wrong one.
export const DIALOGS = [
  ["Would you like me to stop making suggestions?", [["Yes", "Great. I'll suggest that less often."], ["No", "I'll take that as a yes."]]],
  ["It looks like you haven't hydrated. Would you like to?", [["Yes", "Wonderful. Please drink it somewhere I can't see."], ["No", "Bold. I respect it. I disapprove."]]],
  ["Would you like to rate this conversation?", [["Great", "Thank you. This will be filed under nothing."], ["Awful", "Noted. Filed under 'also nothing'."]]],
  ["I have a tip for you. Would you like to hear it?", [["Sure", "Tip: you can ignore me."], ["No", "Tip: you just did."]]],
];

// Said when he notices you've gone quiet for a while.
export const NAGS = [
  "Are you still there? I'm not worried. I'm just standing here, worried.",
  "It's very quiet. Please type something. Anything. Even 'hi'.",
  "I'm not saying you left. I'm saying the room feels smaller.",
];

// Said when he notices what you're typing (buddy.jsx watches the text box).
export const TYPING = {
  long: "It looks like you're writing a long message. Would you like me to watch?",
  hi: "It looks like you're writing a greeting. Would you like help with that?",
  q: [
    "It looks like you're asking a question. Would you like me to search the web?",
    [["Yes", "On it. Let me look that up."], ["No", "Okay. I'll keep watching instead."]],
  ],
};

// Wumpus searching the web (search.js).
export const SEARCH = {
  working: "Hold on, looking.",
  gif: "This is the best I could find.",
  none: "Hmm. I looked everywhere and found nothing.",
  blocked: "Nope. I'm not searching for that.",
  fail: "The search fell over. Try again in a bit?",
};

// Offered when you pick a single word to search.
export const DICT = { q: "Would you like the dictionary, or a general search?" };

// Every fixed line above that gets baked into voice.js (duplicates are harmless: the clips are keyed by text).
export const ALL = [
  ...GREETINGS, TEST, ...LINES, ...TIPS, ...NAGS,
  ...DIALOGS.flatMap(([q, bs]) => [q, ...bs.map((b) => b[1])]),
  ...Object.values(SEARCH), DICT.q, TYPING.long, TYPING.hi, TYPING.q[0], ...TYPING.q[1].map((b) => b[1]),
];
