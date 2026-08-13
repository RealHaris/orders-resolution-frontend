/**
 * Shared helpers for numeric-only text inputs (line items and the
 * record-payment amount). Inputs stay `type="text"` so users can fully
 * clear them; typing and pasting are filtered to digits plus a single
 * decimal point when `allowDecimal` is true.
 */

const NAVIGATION_KEYS = new Set([
  "Backspace",
  "Delete",
  "Tab",
  "Enter",
  "Escape",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Home",
  "End",
]);

/**
 * Blocks any key that is not a digit (or a single decimal point when
 * `allowDecimal`). Prevents `-`, `e`, letters, and other non-numeric input.
 */
export const blockNonNumericKey = (
  event: React.KeyboardEvent<HTMLInputElement>,
  allowDecimal = false,
) => {
  if (
    NAVIGATION_KEYS.has(event.key) ||
    event.ctrlKey ||
    event.metaKey ||
    event.altKey
  ) {
    return;
  }
  if (event.key.length > 1) {
    return;
  }
  if (/[0-9]/.test(event.key)) {
    return;
  }
  if (allowDecimal && event.key === ".") {
    if (event.currentTarget.value.includes(".")) {
      event.preventDefault();
    }
    return;
  }
  event.preventDefault();
};

/**
 * Sanitizes pasted text to digits only (plus one decimal point when
 * `allowDecimal`) and inserts it at the caret.
 */
export const insertNumericPaste = (
  event: React.ClipboardEvent<HTMLInputElement>,
  onChange: (value: string) => void,
  allowDecimal = false,
) => {
  event.preventDefault();
  const pasted = event.clipboardData.getData("text");
  const digitsOnly = pasted.replace(/[^0-9]/g, "");
  const cleaned = allowDecimal
    ? (() => {
        const dotIndex = pasted.indexOf(".");
        if (dotIndex === -1) {
          return digitsOnly;
        }
        const whole = pasted.slice(0, dotIndex).replace(/[^0-9]/g, "");
        const fraction = pasted.slice(dotIndex + 1).replace(/[^0-9]/g, "");
        return `${whole}.${fraction}`;
      })()
    : digitsOnly;
  if (!cleaned) {
    return;
  }
  const input = event.currentTarget;
  const start = input.selectionStart ?? input.value.length;
  const end = input.selectionEnd ?? input.value.length;
  onChange(input.value.slice(0, start) + cleaned + input.value.slice(end));
};
