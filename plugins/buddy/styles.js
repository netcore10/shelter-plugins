// Hard-coded bubble colours on purpose: it must never go see-through or invert with the theme.
export default `
.bd-root { position: fixed; inset: auto; left: 0; top: 0; margin: 0; padding: 0; border: 0; background: none; color: inherit; overflow: visible; width: auto; height: auto; z-index: 2147483647; user-select: none; touch-action: none; will-change: transform; visibility: hidden; }
.bd-root.ready { visibility: visible; }

.bd-sprite {
  width: var(--w); height: var(--h);
  background-repeat: no-repeat;
  background-position-y: calc(var(--h) * var(--row) * -1);
  cursor: grab; position: relative;
  transform: scaleX(var(--flip, 1));
  animation: bd-play calc(var(--n) / var(--fps) * 1s) steps(var(--n)) var(--iter);
}
.bd-sprite:active { cursor: grabbing; }
@keyframes bd-play { from { background-position-x: 0; } to { background-position-x: calc(var(--w) * var(--n) * -1); } }
.bd-sprite.hold { animation: none; background-position-x: 0; }
.bd-eyes {
  display: none; position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none;
  transform: translate(var(--lx, 0px), var(--ly, 0px)); transition: transform .12s ease-out;
}
.bd-sprite.looking .bd-eyes { display: block; }
@media (prefers-reduced-motion: reduce) { .bd-sprite { animation: none; } }

.bd-bubble {
  position: absolute; bottom: 100%; left: 50%; margin-bottom: 8px;
  transform: translateX(calc(-50% + var(--dx, 0px)));
  width: max-content; max-width: 220px; padding: 8px 10px;
  background: #ffffe1; color: #111; border: 1px solid #111; border-radius: 6px;
  font: 13px/1.35 var(--font-primary, sans-serif);
  opacity: 0; transition: opacity .15s; pointer-events: none;
}
.bd-bubble.on { opacity: 1; }
.bd-dots { position: absolute; left: 55%; top: 85%; transform: translate(-50%, -50%); display: flex; gap: calc(var(--w) * 0.02); pointer-events: none; }
.bd-dots i { width: calc(var(--w) * 0.04); height: calc(var(--w) * 0.04); border-radius: 50%; background: #fff; box-shadow: 0 0 0 1px #000; animation: bd-dot 1s infinite; }
.bd-dots i:nth-child(2) { animation-delay: .15s; }
.bd-dots i:nth-child(3) { animation-delay: .3s; }
@keyframes bd-dot { 0%, 60%, 100% { opacity: .3; transform: translateY(0); } 30% { opacity: 1; transform: translateY(-20%); } }
.bd-img { display: block; max-width: 200px; max-height: 160px; margin-top: 6px; border-radius: 4px; }
.bd-bubble.ask { pointer-events: auto; }
.bd-opts { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
.bd-opts button { font: inherit; background: #fff; color: #111; border: 1px solid #111; border-radius: 4px; padding: 1px 10px; cursor: pointer; }
.bd-opts button:hover { background: #ddd; }
.bd-hat { position: absolute; left: 50%; top: calc(var(--h) * 0.34); transform: translate(-50%, -100%); font-size: calc(var(--w) * 0.3); line-height: 1; pointer-events: none; }
.bd-bubble::after {
  content: ""; position: absolute; top: 100%; left: calc(50% - var(--dx, 0px));
  margin-left: -6px; border: 6px solid transparent; border-top-color: #111;
}
.bd-bubble.below { bottom: auto; top: 100%; margin: 8px 0 0; }
.bd-bubble.below::after { top: auto; bottom: 100%; border-top-color: transparent; border-bottom-color: #111; }

.bd-debug { position: fixed; inset: 0; z-index: 1000; pointer-events: none; }
.bd-plat { position: absolute; height: 0; border-top: 2px solid #f0f; }
.bd-plat.me { border-color: #0f0; }

.bd-select { background: var(--input-background-default, #1e1f22); color: var(--text-default, #fff); border: 1px solid var(--border-subtle, #444); border-radius: 4px; padding: 6px 8px; max-width: 100%; }
.bd-row { margin: 14px 0; }
.bd-label { margin-bottom: 6px; color: var(--header-secondary, #b5bac1); font-size: 12px; font-weight: 600; text-transform: uppercase; }
.bd-btns { display: flex; gap: 8px; margin-top: 14px; }
`;
