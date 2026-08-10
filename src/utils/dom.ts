export function isEditableTarget(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  return target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
}

type HotkeyEvent = Pick<
  KeyboardEvent,
  "key" | "code" | "ctrlKey" | "metaKey" | "altKey" | "shiftKey" | "isComposing"
>;

const LATIN_LETTER = /^[a-z]$/i;

const CODE_BY_CHARACTER = new Map<string, string>([
  ...Array.from("abcdefghijklmnopqrstuvwxyz", (c): [string, string] => [
    c,
    `Key${c.toUpperCase()}`,
  ]),
  ...Array.from("0123456789", (c): [string, string] => [c, `Digit${c}`]),
  ["`", "Backquote"],
  ["-", "Minus"],
  ["=", "Equal"],
  ["[", "BracketLeft"],
  ["]", "BracketRight"],
  ["\\", "Backslash"],
  [";", "Semicolon"],
  ["'", "Quote"],
  [",", "Comma"],
  [".", "Period"],
  ["/", "Slash"],
]);

/**
 * Matches a printable hotkey on any keyboard layout. The character branch covers layouts that
 * reach the character directly, with or without Shift (German `/` is Shift+7). The physical-key
 * branch covers layouts where that key prints something else (Russian Slash prints `.`); its
 * position comes from the US QWERTY layout, which is what `KeyboardEvent.code` describes.
 *
 * The physical-key branch skips Latin letters: a letter there means a Latin layout, which can
 * always type the character somewhere, so the character branch already covers it and the fallback
 * would only add false matches (Dvorak prints `z` on Slash). It also skips Shift, to leave the
 * shifted character of that key (ANSI `?`) free.
 */
export function matchesHotkey(event: HotkeyEvent, hotkey: string): boolean {
  if (event.isComposing || event.ctrlKey || event.metaKey || event.altKey) return false;
  if (event.key === hotkey) return true;

  const code = CODE_BY_CHARACTER.get(hotkey);
  return (
    code !== undefined && event.code === code && !event.shiftKey && !LATIN_LETTER.test(event.key)
  );
}
