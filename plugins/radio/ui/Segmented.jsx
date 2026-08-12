const {
  solid: { For },
} = shelter;

/**
 * A small segmented control. shelter-ui has no select, and a row of two or
 * three buttons beats a dropdown for this many options anyway.
 *
 * options: [{ value, label }]
 */
export default function Segmented(props) {
  return (
    <div class="rad-seg" role="group">
      <For each={props.options}>
        {(option) => (
          <button
            type="button"
            aria-pressed={props.value === option.value}
            title={option.hint}
            onClick={() => props.onSelect(option.value)}
          >
            {option.label}
          </button>
        )}
      </For>
    </div>
  );
}
