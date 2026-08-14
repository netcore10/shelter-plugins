// These buttons sit inside Discord's own themed subtree, so the variables
// resolve without any of the copying the radio panel needs. Each still ends in
// a hard-coded fallback, newest name first, since Discord has renamed them
// across builds and both generations are still in the wild.

export default `
.nav-btns {
  display: flex;
  align-items: center;
  gap: 2px;
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
`;
