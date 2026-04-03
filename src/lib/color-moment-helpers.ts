import { getOrComputeCachedValue, getTagValue } from "applesauce-core/helpers";
import type { NostrEvent } from "nostr-tools";

export type LayoutMode =
  | "horizontal"
  | "vertical"
  | "grid"
  | "star"
  | "checkerboard"
  | "diagonalStripes";

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

/** Validate hex color, fallback to black */
export function safeHex(color: string): string {
  return HEX_RE.test(color) ? color : "#000000";
}

const ColorMomentColorsSymbol = Symbol("colorMomentColors");

/** Extract validated hex colors from `c` tags */
export function getColorMomentColors(event: NostrEvent): string[] {
  return getOrComputeCachedValue(event, ColorMomentColorsSymbol, () =>
    event.tags
      .filter((t) => t[0] === "c" && t[1] && HEX_RE.test(t[1]))
      .map((t) => t[1]),
  );
}

/** Get layout mode from `layout` tag */
export function getColorMomentLayout(
  event: NostrEvent,
): LayoutMode | undefined {
  const value = getTagValue(event, "layout");
  if (!value) return undefined;
  const valid: LayoutMode[] = [
    "horizontal",
    "vertical",
    "grid",
    "star",
    "checkerboard",
    "diagonalStripes",
  ];
  return valid.includes(value as LayoutMode)
    ? (value as LayoutMode)
    : undefined;
}

/** Get optional name from `name` tag */
export function getColorMomentName(event: NostrEvent): string | undefined {
  return getTagValue(event, "name") || undefined;
}

/** Get single emoji from content (if present) */
export function getColorMomentEmoji(event: NostrEvent): string | undefined {
  const content = event.content?.trim();
  if (!content) return undefined;
  // Match a single emoji (including compound emoji with ZWJ, skin tones, etc.)
  const emojiRegex =
    /^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)(\u200D(\p{Emoji_Presentation}|\p{Emoji}\uFE0F))*$/u;
  return emojiRegex.test(content) ? content : undefined;
}
