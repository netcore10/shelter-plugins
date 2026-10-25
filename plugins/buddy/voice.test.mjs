// Run: node plugins/buddy/voice.test.mjs — fails if a fixed line has no baked clip
// (i.e. lines.js changed and tools/render-voice.mjs wasn't rerun).
import assert from "node:assert";
import CLIPS from "./voice.js";
import { GREETINGS, LINES, TIPS, TEST } from "./lines.js";

for (const text of [...GREETINGS, TEST, ...LINES, ...TIPS]) assert(CLIPS[text]?.startsWith("data:audio/ogg;base64,"), `no clip: ${text}`);
console.log("voice ok:", Object.keys(CLIPS).length, "clips");
