// Hop limits, as multiples of his width / height.
const HOP_X = 0.75; // x width
const HOP_UP = 0.8; // x height
const HOP_COST = 120; // px-equivalent: a hop is slower than a step

export const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

// where his CENTER may stand on a platform: mostly on it, narrow ones get the middle
export const range = (p, w) => {
  const m = Math.min(w * 0.25, (p.r - p.l) / 2);
  return [p.l + m, p.r - m];
};

/** First segment of the cheapest route start -> goal, or null. c0 = his center x. */
export function plan(ps, start, c0, goal, w, h) {
  const n = ps.length;
  const dist = Array(n).fill(Infinity);
  const cen = Array(n).fill(0); // where he'd arrive on each platform
  const prev = Array(n).fill(-1);
  const seg = Array(n);
  const done = Array(n).fill(false);
  dist[start] = 0;
  cen[start] = c0;

  for (;;) {
    let a = -1;
    for (let i = 0; i < n; i++) if (!done[i] && (a < 0 || dist[i] < dist[a])) a = i;
    if (a < 0 || dist[a] === Infinity) return null;
    if (a === goal) break;
    done[a] = true;

    const A = ps[a];
    const [al, ar] = range(A, w);
    for (let b = 0; b < n; b++) {
      const B = ps[b];
      if (done[b] || B.top < A.top - HOP_UP * h) continue;
      const [bl, br] = range(B, w);
      // launch points on A from which B is within hop range
      const lo = Math.max(al, bl - HOP_X * w);
      const hi = Math.min(ar, br + HOP_X * w);
      if (lo > hi) continue;
      const ca = clamp(cen[a], lo, hi);
      const cb = clamp(ca, bl, br);
      const d = dist[a] + Math.abs(ca - cen[a]) + HOP_COST + Math.abs(B.top - A.top) * 0.5;
      if (d < dist[b]) [dist[b], cen[b], prev[b], seg[b]] = [d, cb, a, { ca, cb }];
    }
  }

  let b = goal;
  while (prev[b] !== start) b = prev[b];
  return { launch: seg[b].ca, land: seg[b].cb, to: ps[b] };
}
