// "Search with Wumpus": a small chip that appears next to any text you highlight. (A right-click
// entry doesn't work here: the webview's native menu is drawn over Discord's own.)
let off;
let chip;

const hide = () => (chip?.remove(), (chip = null));

export function startMenu(onSearch) {
  const show = () => {
    const sel = getSelection();
    const q = sel?.toString().replace(/\s+/g, " ").trim();
    if (!q || q.length < 2 || q.length > 200 || !sel.rangeCount) return hide();
    if (sel.anchorNode?.parentElement?.closest(".bd-root")) return; // his own bubble
    const r = sel.getRangeAt(0).getBoundingClientRect();
    if (!r.width && !r.height) return hide();
    hide();
    chip = document.createElement("button");
    chip.textContent = "Search with Wumpus";
    // Above the selection by default. In the message box Discord's own bold/italic toolbar sits there, so
    // go beside the end of the selection instead (the toolbar is above it, never level with it).
    const inBox = !!sel.anchorNode?.parentElement?.closest('[role="textbox"]');
    const top = inBox ? r.top + r.height / 2 - 16 : r.top - 40 < 8 ? r.bottom + 8 : r.top - 40;
    const left = inBox ? r.right + 10 : r.left;
    chip.style.cssText = `position:fixed;z-index:2147483647;left:${Math.max(8, Math.min(left, innerWidth - 180))}px;top:${top}px;padding:6px 10px;border:0;border-radius:6px;background:#5865f2;color:#fff;font:600 13px sans-serif;cursor:pointer;box-shadow:0 2px 8px #0008`;
    chip.onmousedown = (e) => e.preventDefault(); // keep the selection until the click lands
    chip.onclick = () => (hide(), getSelection()?.removeAllRanges(), onSearch(q));
    document.body.append(chip);
  };
  const onUp = (e) => e.target !== chip && setTimeout(show, 0); // after the browser settles the selection
  const onDown = (e) => e.target !== chip && hide();
  document.addEventListener("mouseup", onUp, true);
  document.addEventListener("mousedown", onDown, true);
  off = () => {
    document.removeEventListener("mouseup", onUp, true);
    document.removeEventListener("mousedown", onDown, true);
    hide();
  };
}

export const stopMenu = () => off?.();
