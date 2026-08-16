// These buttons sit inside Discord's own themed subtree, so the variables
// resolve without any of the copying the radio panel needs. Each still ends in
// a hard-coded fallback, newest name first, since Discord has renamed them
// across builds and both generations are still in the wild.

export default `
.nav-btns {
  display: flex;
  align-items: center;
  gap: 2px;
  /* Never grow or shrink the bar. As a foreign child in a flex row written for
     a fixed set of children, anything else lets us push Discord's own layout
     around — which is what collapsed the window. */
  flex: 0 0 auto;
  /* The top bar is a window drag region in desktop clients. Without this a
     click reads as the start of a window drag and never reaches the button. */
  -webkit-app-region: no-drag;
}

.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  color: var(--interactive-normal, var(--text-secondary, #b5bac1));
  cursor: pointer;
  -webkit-app-region: no-drag;
}

.nav-btn:hover {
  color: var(--interactive-hover, var(--text-default, #f2f3f5));
  background: var(--background-modifier-hover, rgba(255, 255, 255, .06));
}

/* Matches how Discord dims its own pair at the ends of the history stack. */
.nav-btn[aria-disabled="true"] {
  opacity: .35;
  cursor: default;
}

.nav-btn[aria-disabled="true"]:hover {
  background: none;
  color: var(--interactive-normal, var(--text-secondary, #b5bac1));
}

/* Some clients leave --custom-app-top-bar-height at 0px, collapsing the top bar
   so its children centre on a zero-height line and hang above the top of the
   window. Discord both sizes the bar and reserves its space from this variable,
   so setting it is what moves the content below down — a min-height on the bar
   grows the element over the top of everything instead.

   !important is the whole trick. The 0px is an inline style on <html>, and a
   normal stylesheet declaration loses to that; an important author declaration
   outranks a normal inline one. It also survives whatever rewrites that inline
   style a few seconds after load, which a JS-set value did not.

   The attribute is set only when the bar actually measures collapsed, so a
   healthy client keeps its own value. */
html[data-navbtns-topbar] {
  --custom-app-top-bar-height: 32px !important;
}
`;
