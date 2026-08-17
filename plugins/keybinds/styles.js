// Rendered inside Discord's settings, so the variables resolve directly. Each
// still ends in a hard-coded fallback, newest name first, since Discord has
// renamed these across builds.

export default `
.mkb-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin: 14px 0;
}

.mkb-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-default, var(--text-normal, #f2f3f5));
}

.mkb-seg {
  display: flex;
  gap: 4px;
  padding: 3px;
  border-radius: 7px;
  background: var(--background-modifier-hover, rgba(255, 255, 255, .06));
}

.mkb-seg button {
  padding: 5px 10px;
  border: 0;
  border-radius: 5px;
  background: none;
  color: var(--text-secondary, var(--interactive-normal, #b5bac1));
  font: inherit;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
}

.mkb-seg button:hover { color: var(--text-default, var(--text-normal, #f2f3f5)); }

.mkb-seg button[aria-pressed="true"] {
  background: var(--background-modifier-selected, rgba(255, 255, 255, .1));
  color: var(--text-default, var(--text-normal, #f2f3f5));
}

.mkb-note {
  margin: 8px 0 4px;
  font-size: 12px;
  line-height: 1.4;
  color: var(--text-muted, #949ba4);
}
`;
