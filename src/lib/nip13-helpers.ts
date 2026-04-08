import type { NostrEvent } from "@/types/nostr";
import { getOrComputeCachedValue } from "applesauce-core/helpers";

const PowDifficultySymbol = Symbol("powDifficulty");

/**
 * Count leading zero bits in a hex string (NIP-13 difficulty).
 */
function countLeadingZeroBits(hex: string): number {
  let count = 0;
  for (let i = 0; i < hex.length; i++) {
    const nibble = parseInt(hex[i], 16);
    if (nibble === 0) {
      count += 4;
    } else {
      count += Math.clz32(nibble) - 28;
      break;
    }
  }
  return count;
}

/**
 * Get the PoW difficulty of an event, or undefined if it has no nonce tag.
 * Cached on the event object via applesauce helpers.
 */
export function getPowDifficulty(event: NostrEvent): number | undefined {
  return getOrComputeCachedValue(event, PowDifficultySymbol, () => {
    const nonceTag = event.tags.find((t) => t[0] === "nonce");
    if (!nonceTag) return undefined;
    return countLeadingZeroBits(event.id);
  });
}
