import { WandSparkles, Play, Star } from "lucide-react";
import { useAccount } from "@/hooks/useAccount";
import { useFavoriteSpells } from "@/hooks/useFavoriteSpells";
import { useNostrEvent } from "@/hooks/useNostrEvent";
import { useAddWindow } from "@/core/state";
import { decodeSpell } from "@/lib/spell-conversion";
import { parseSpellCommand } from "@/lib/spell-cast";
import type { SpellEvent } from "@/types/spell";
import type { EventPointer } from "nostr-tools/nip19";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { FAVORITE_SPELLS_KIND } from "@/constants/kinds";

/**
 * A single spell item in the dropdown
 */
function FavoriteSpellItem({ pointer }: { pointer: EventPointer }) {
  const spellEvent = useNostrEvent(pointer);
  const addWindow = useAddWindow();

  if (!spellEvent) {
    return (
      <DropdownMenuItem disabled className="opacity-50">
        <WandSparkles className="size-3.5 mr-2 text-muted-foreground" />
        <span className="text-sm truncate">Loading...</span>
      </DropdownMenuItem>
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

  if (!decoded) {
    return (
      <DropdownMenuItem disabled className="opacity-50">
        <WandSparkles className="size-3.5 mr-2 text-muted-foreground" />
        <span className="text-sm truncate">Invalid spell</span>
      </DropdownMenuItem>
    );
  }

  return (
    <DropdownMenuItem
      onClick={handleCast}
      className="cursor-pointer py-2 hover:bg-muted focus:bg-muted transition-colors"
    >
      <Play className="size-3.5 mr-2 text-muted-foreground" />
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-sm truncate">
          {decoded.name || "Unnamed Spell"}
        </span>
        <span className="text-[10px] font-mono text-muted-foreground truncate">
          {decoded.command}
        </span>
      </div>
    </DropdownMenuItem>
  );
}

/**
 * Wand dropdown in the header showing favorite spells for quick casting.
 * Only visible when the user is logged in.
 */
export function FavoriteSpellsDropdown() {
  const { isLoggedIn, pubkey } = useAccount();
  const { favorites, event } = useFavoriteSpells();
  const addWindow = useAddWindow();

  if (!isLoggedIn) return null;

  const handleManageFavorites = () => {
    if (event) {
      // Open the user's kind 10777 event in detail view
      addWindow("open", {
        pointer: {
          kind: FAVORITE_SPELLS_KIND,
          pubkey: pubkey!,
          identifier: "",
        },
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="p-1.5 text-muted-foreground hover:text-accent transition-colors cursor-crosshair flex items-center gap-1"
          title="Favorite Spells"
          aria-label="Favorite spells"
        >
          <WandSparkles className="size-4" />
          {favorites.length > 0 && (
            <span className="text-[10px] tabular-nums">{favorites.length}</span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-64 max-h-[70vh] overflow-y-auto"
      >
        <DropdownMenuLabel className="py-1 px-3 text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
          Favorite Spells
        </DropdownMenuLabel>

        {favorites.length === 0 ? (
          <div className="px-3 py-4 text-center text-xs text-muted-foreground italic">
            Star a spell to add it here.
          </div>
        ) : (
          favorites.map((pointer) => (
            <FavoriteSpellItem key={pointer.id} pointer={pointer} />
          ))
        )}

        {event && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleManageFavorites}
              className="cursor-pointer text-muted-foreground"
            >
              <Star className="size-3.5 mr-2" />
              <span className="text-sm">Manage Favorites</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
