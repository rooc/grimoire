import { WandSparkles, Play, Star } from "lucide-react";
import {
  BaseEventProps,
  BaseEventContainer,
  ClickableEventTitle,
} from "./BaseEventRenderer";
import { useNostrEvent } from "@/hooks/useNostrEvent";
import { useFavoriteSpells, getSpellPointers } from "@/hooks/useFavoriteSpells";
import { useAccount } from "@/hooks/useAccount";
import { useAddWindow } from "@/core/state";
import { decodeSpell } from "@/lib/spell-conversion";
import { parseSpellCommand } from "@/lib/spell-cast";
import type { NostrEvent } from "@/types/nostr";
import type { SpellEvent } from "@/types/spell";
import type { EventPointer } from "nostr-tools/nip19";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Kind 10777 Renderer - Favorite Spells (Feed View)
 */
export function FavoriteSpellsRenderer({ event }: BaseEventProps) {
  const pointers = getSpellPointers(event);

  return (
    <BaseEventContainer event={event}>
      <div className="flex flex-col gap-2">
        <ClickableEventTitle
          event={event}
          className="flex items-center gap-1.5 text-sm font-medium"
        >
          <WandSparkles className="size-4 text-muted-foreground" />
          <span>Favorite Spells</span>
        </ClickableEventTitle>

        <div className="text-xs text-muted-foreground">
          {pointers.length === 0
            ? "No favorite spells"
            : `${pointers.length} favorite spell${pointers.length !== 1 ? "s" : ""}`}
        </div>
      </div>
    </BaseEventContainer>
  );
}

/**
 * Individual spell reference item for the detail view
 */
function SpellRefItem({
  pointer,
  onUnfavorite,
  canModify,
}: {
  pointer: EventPointer;
  onUnfavorite?: (event: NostrEvent) => void;
  canModify: boolean;
}) {
  const spellEvent = useNostrEvent(pointer);
  const addWindow = useAddWindow();

  if (!spellEvent) {
    return (
      <div className="flex items-center gap-3 p-3 border border-border/50 rounded">
        <Skeleton className="h-4 w-4 rounded" />
        <div className="flex-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48 mt-1" />
        </div>
      </div>
    );
  }

  let decoded: ReturnType<typeof decodeSpell> | null = null;
  try {
    decoded = decodeSpell(spellEvent as SpellEvent);
  } catch {
    // spell couldn't be decoded
  }

  const handleCast = async () => {
    if (!decoded) return;
    const result = await parseSpellCommand(decoded.command);
    if (result) {
      addWindow(result.appId, result.props, result.commandString);
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 border border-border/50 rounded group hover:bg-muted/30 transition-colors">
      <WandSparkles className="size-4 text-muted-foreground flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">
          {decoded?.name || "Unnamed Spell"}
        </div>
        {decoded && (
          <div className="text-xs font-mono text-muted-foreground truncate mt-0.5">
            {decoded.command}
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        {decoded && (
          <button
            onClick={handleCast}
            className="p-1.5 text-muted-foreground hover:text-accent transition-colors"
            title="Cast spell"
          >
            <Play className="size-3.5" />
          </button>
        )}
        {canModify && onUnfavorite && (
          <button
            onClick={() => onUnfavorite(spellEvent)}
            className="p-1.5 text-muted-foreground hover:text-yellow-500 transition-colors"
            title="Remove from favorites"
          >
            <Star className="size-3.5 fill-current" />
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Kind 10777 Detail Renderer - Favorite Spells (Full View)
 */
export function FavoriteSpellsDetailRenderer({ event }: { event: NostrEvent }) {
  const { canSign } = useAccount();
  const { toggleFavorite } = useFavoriteSpells();

  const pointers = getSpellPointers(event);

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex items-center gap-2">
        <WandSparkles className="size-6 text-muted-foreground" />
        <span className="text-lg font-semibold">Favorite Spells</span>
        <span className="text-sm text-muted-foreground">
          ({pointers.length})
        </span>
      </div>

      {pointers.length === 0 ? (
        <div className="text-sm text-muted-foreground italic">
          No favorite spells yet. Star a spell to add it here.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {pointers.map((pointer) => (
            <SpellRefItem
              key={pointer.id}
              pointer={pointer}
              onUnfavorite={canSign ? toggleFavorite : undefined}
              canModify={canSign}
            />
          ))}
        </div>
      )}
    </div>
  );
}
