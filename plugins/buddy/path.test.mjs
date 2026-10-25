// Run: node plugins/buddy/path.test.mjs
import assert from "node:assert";
import { plan } from "./path.js";

const w = 128;
const h = 128;

// ground, a 50px-high panel on the left, and a column of DM rows (44px apart) above it
const ps = [{ top: 900, l: 0, r: 1600 }, { top: 850, l: 0, r: 240 }];
for (let i = 0; i < 6; i++) ps.push({ top: 800 - i * 44, l: 0, r: 240 });
const goal = ps.length - 1; // the topmost row

// start on the ground, far to the right of the list
let at = 0;
let c = 1400;
const hops = [];
for (let n = 0; n < 40 && at !== goal; n++) {
  const step = plan(ps, at, c, goal, w, h);
  assert(step, "route exists");
  // every segment is a walk then a SHORT hop: nothing may leap across the screen
  assert(Math.abs(step.land - step.launch) <= 0.75 * w + 1, "hop is short");
  assert(step.to.top >= ps[at].top - 0.8 * h, "hop is not too high");
  hops.push(step.to.top);
  at = ps.indexOf(step.to);
  c = step.land;
}
assert.equal(at, goal, "reached the top row");
assert(hops.length >= 4, "climbed in several hops, not one leap");

// unreachable: a platform 500px straight up has no route
assert.equal(plan([ps[0], { top: 300, l: 0, r: 240 }], 0, 100, 1, w, h), null);
console.log("path ok:", hops.length, "hops");
