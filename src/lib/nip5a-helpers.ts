import type { NostrEvent } from "@/types/nostr";
import { getTagValue, getOrComputeCachedValue } from "applesauce-core/helpers";
import { nip19 } from "nostr-tools";

/**
 * NIP-5A Helper Functions
 * Utility functions for parsing NIP-5A pubkey static website events
 *
 * All helper functions use applesauce's getOrComputeCachedValue to cache
 * computed values on the event object itself. This means you don't need
 * useMemo when calling these functions.
 */

export const DEFAULT_NSITE_GATEWAY = "nsite.lol";

// Cache symbols
const NsitePathsSymbol = Symbol("nsitePaths");
const NsiteServersSymbol = Symbol("nsiteServers");
const NsiteRelaysSymbol = Symbol("nsiteRelays");
const NsiteGatewayUrlSymbol = Symbol("nsiteGatewayUrl");

export interface NsitePath {
  path: string;
  hash: string;
}

/**
 * Get the site title from a site manifest event
 */
export function getNsiteTitle(event: NostrEvent): string | undefined {
  return getTagValue(event, "title");
}

/**
 * Get the site description from a site manifest event
 */
export function getNsiteDescription(event: NostrEvent): string | undefined {
  return getTagValue(event, "description");
}

/**
 * Get the source code URL from a site manifest event
 */
export function getNsiteSource(event: NostrEvent): string | undefined {
  return getTagValue(event, "source");
}

/**
 * Get all path-to-hash mappings from a site manifest event
 */
export function getNsitePaths(event: NostrEvent): NsitePath[] {
  return getOrComputeCachedValue(event, NsitePathsSymbol, () =>
    event.tags
      .filter((t) => t[0] === "path" && t[1] && t[2])
      .map((t) => ({ path: t[1], hash: t[2] })),
  );
}

/**
 * Get all blossom server hints from a site manifest event
 */
export function getNsiteServers(event: NostrEvent): string[] {
  return getOrComputeCachedValue(event, NsiteServersSymbol, () => [
    ...new Set(
      event.tags.filter((t) => t[0] === "server" && t[1]).map((t) => t[1]),
    ),
  ]);
}

/**
 * Get relay hints from a site manifest event
 */
export function getNsiteRelays(event: NostrEvent): string[] {
  return getOrComputeCachedValue(event, NsiteRelaysSymbol, () => [
    ...new Set(
      event.tags.filter((t) => t[0] === "relay" && t[1]).map((t) => t[1]),
    ),
  ]);
}

/**
 * Get the sha256 hash for /index.html from the site manifest
 */
export function getNsiteIndexHash(event: NostrEvent): string | undefined {
  const paths = getNsitePaths(event);
  return paths.find((p) => p.path === "/index.html")?.hash;
}

/**
 * Get the sha256 hash for /favicon.ico from the site manifest
 */
export function getNsiteFaviconHash(event: NostrEvent): string | undefined {
  const paths = getNsitePaths(event);
  return paths.find((p) => p.path === "/favicon.ico")?.hash;
}

/**
 * Get the site identifier (d tag) for named sites (kind 35128)
 */
export function getNsiteIdentifier(event: NostrEvent): string | undefined {
  return getTagValue(event, "d");
}

/**
 * Convert a hex pubkey to base36 (50 chars, zero-padded)
 * Used for named site subdomain construction per NIP-5A spec
 */
function hexToBase36(hex: string): string {
  const num = BigInt("0x" + hex);
  return num.toString(36).padStart(50, "0");
}

/**
 * Get the gateway URL to view this site
 * Root sites (15128): https://<npub>.nsite.lol
 * Named sites (35128): https://<pubkeyB36><dTag>.nsite.lol
 */
export function getNsiteGatewayUrl(
  event: NostrEvent,
  gateway: string = DEFAULT_NSITE_GATEWAY,
): string {
  return getOrComputeCachedValue(event, NsiteGatewayUrlSymbol, () => {
    if (event.kind === 35128) {
      const dTag = getNsiteIdentifier(event);
      if (dTag) {
        const pubkeyB36 = hexToBase36(event.pubkey);
        return `https://${pubkeyB36}${dTag}.${gateway}`;
      }
    }
    const npub = nip19.npubEncode(event.pubkey);
    return `https://${npub}.${gateway}`;
  });
}
