import { useMemo, useState, useCallback } from "react";
import { use$ } from "applesauce-react/hooks";
import { getEventPointerFromETag } from "applesauce-core/helpers";
import { getSeenRelays } from "applesauce-core/helpers/relays";
import { EventFactory } from "applesauce-core/event-factory";
import eventStore from "@/services/event-store";
import accountManager from "@/services/accounts";
import { publishEvent } from "@/services/hub";
import { useAccount } from "@/hooks/useAccount";
import { FAVORITE_SPELLS_KIND } from "@/constants/kinds";
import type { NostrEvent } from "@/types/nostr";
import type { EventPointer } from "nostr-tools/nip19";

/**
 * Extract EventPointers from "e" tags of a Nostr event.
 * Shared by the hook and renderers.
 */
export function getSpellPointers(event: NostrEvent): EventPointer[] {
  const pointers: EventPointer[] = [];
  for (const tag of event.tags) {
    if (tag[0] === "e" && tag[1]) {
      const pointer = getEventPointerFromETag(tag);
      if (pointer) pointers.push(pointer);
    }
  }
  return pointers;
}

/**
 * Hook to read and manage the logged-in user's favorite spells (kind 10777).
 *
 * The kind 10777 event is a replaceable event containing "e" tags
 * pointing to spell events (kind 777).
 */
export function useFavoriteSpells() {
  const { pubkey, canSign } = useAccount();
  const [isUpdating, setIsUpdating] = useState(false);

  // Subscribe to the user's kind 10777 replaceable event
  const event = use$(
    () =>
      pubkey
        ? eventStore.replaceable(FAVORITE_SPELLS_KIND, pubkey, "")
        : undefined,
    [pubkey],
  );

  // Extract event pointers from "e" tags
  const favorites = useMemo(
    () => (event ? getSpellPointers(event) : []),
    [event],
  );

  // Quick lookup set of favorited event IDs
  const favoriteIds = useMemo(
    () => new Set(favorites.map((p) => p.id)),
    [favorites],
  );

  const isFavorite = useCallback(
    (eventId: string) => favoriteIds.has(eventId),
    [favoriteIds],
  );

  const toggleFavorite = useCallback(
    async (spellEvent: NostrEvent) => {
      if (!canSign || isUpdating) return;

      const account = accountManager.active;
      if (!account?.signer) return;

      setIsUpdating(true);
      try {
        // Start from the full existing event tags to preserve everything
        const currentTags = event ? event.tags.map((t) => [...t]) : [];
        const currentContent = event?.content ?? "";

        const alreadyFavorited = currentTags.some(
          (t) => t[0] === "e" && t[1] === spellEvent.id,
        );

        let newTags: string[][];
        if (alreadyFavorited) {
          // Remove only the matching "e" tag
          newTags = currentTags.filter(
            (t) => !(t[0] === "e" && t[1] === spellEvent.id),
          );
        } else {
          // Add with relay hint
          const seenRelays = getSeenRelays(spellEvent);
          const relayHint = seenRelays ? Array.from(seenRelays)[0] || "" : "";
          const newTag = relayHint
            ? ["e", spellEvent.id, relayHint]
            : ["e", spellEvent.id];
          newTags = [...currentTags, newTag];
        }

        const factory = new EventFactory({ signer: account.signer });
        const built = await factory.build({
          kind: FAVORITE_SPELLS_KIND,
          content: currentContent,
          tags: newTags,
        });
        const signed = await factory.sign(built);
        await publishEvent(signed);
      } catch (err) {
        console.error("[useFavoriteSpells] Failed to toggle favorite:", err);
      } finally {
        setIsUpdating(false);
      }
    },
    [canSign, isUpdating, event],
  );

  return {
    favorites,
    favoriteIds,
    isFavorite,
    toggleFavorite,
    isUpdating,
    event,
  };
}
