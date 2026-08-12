// 18px to match the icons Discord already has in the toolbar; the rest are
// sized to their surroundings. All use currentColor so they inherit whatever
// state the parent is in.

export const BroadcastIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="2.3" fill="currentColor" />
    <path
      d="M8.6 8.6a4.8 4.8 0 0 0 0 6.8M15.4 15.4a4.8 4.8 0 0 0 0-6.8"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
    />
    <path
      d="M5.7 5.7a8.9 8.9 0 0 0 0 12.6M18.3 18.3a8.9 8.9 0 0 0 0-12.6"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
    />
  </svg>
);

export const PlayIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
    {/* Nudged right: a triangle in a circle reads as off-centre when it isn't. */}
    <path d="M8.5 5.4a1 1 0 0 1 1.52-.85l9 6.6a1 1 0 0 1 0 1.7l-9 6.6a1 1 0 0 1-1.52-.85V5.4Z" fill="currentColor" />
  </svg>
);

export const PauseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
    <rect x="6.5" y="5" width="4" height="14" rx="1.4" fill="currentColor" />
    <rect x="13.5" y="5" width="4" height="14" rx="1.4" fill="currentColor" />
  </svg>
);

export const VolumeIcon = (props) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4 9.5h3.2L12 5.6v12.8L7.2 14.5H4a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1Z" fill="currentColor" />
    {props.muted ? (
      <path d="m16 9.5 4.5 5M20.5 9.5 16 14.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
    ) : (
      <path
        d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
      />
    )}
  </svg>
);

export const CaretIcon = (props) => (
  <svg
    class="rad-caret"
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    style={{ transform: props.up ? "rotate(180deg)" : "none" }}
  >
    <path d="m6 9 6 6 6-6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
);

export const Bars = () => (
  <div class="rad-bars" aria-hidden="true">
    <i />
    <i />
    <i />
  </div>
);
