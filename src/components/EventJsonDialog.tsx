import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCopy } from "@/hooks/useCopy";
import { useProfile } from "@/hooks/useProfile";
import { getDisplayName } from "@/lib/nostr-utils";
import { getKindName } from "@/constants/kinds";
import { Copy, CopyCheck } from "lucide-react";
import { CodeCopyButton } from "@/components/CodeCopyButton";
import { SyntaxHighlight } from "@/components/SyntaxHighlight";
import { isAddressableKind } from "@/lib/nostr-kinds";
import { getSeenRelays } from "applesauce-core/helpers/relays";
import { getTagValue } from "applesauce-core/helpers";
import { nip19 } from "nostr-tools";
import type { NostrEvent } from "@/types/nostr";

interface EventJsonDialogProps {
  event: NostrEvent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EventJsonDialog({
  event,
  open,
  onOpenChange,
}: EventJsonDialogProps) {
  const profile = useProfile(event.pubkey);
  const { copy: copyBech32, copied: copiedBech32 } = useCopy();
  const { copy: copyJson, copied: copiedJson } = useCopy();

  const displayName = getDisplayName(event.pubkey, profile);
  const kindName = getKindName(event.kind);

  const bech32Id = useMemo(() => {
    const seenRelaysSet = getSeenRelays(event);
    const relays = seenRelaysSet ? Array.from(seenRelaysSet) : [];

    return isAddressableKind(event.kind)
      ? nip19.naddrEncode({
          kind: event.kind,
          pubkey: event.pubkey,
          identifier: getTagValue(event, "d") || "",
          relays,
        })
      : nip19.neventEncode({
          id: event.id,
          author: event.pubkey,
          kind: event.kind,
          relays,
        });
  }, [event]);

  const jsonString = useMemo(() => JSON.stringify(event, null, 2), [event]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col rounded-none">
        <DialogHeader>
          <DialogTitle>
            {displayName} - {kindName} (kind {event.kind})
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 flex-1 overflow-hidden">
          {/* Nostr ID */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">
              Nostr ID
            </span>
            <div className="flex items-center gap-2 bg-muted p-2 rounded-sm">
              <code className="font-mono text-xs truncate flex-1 min-w-0">
                {bech32Id}
              </code>
              <button
                onClick={() => copyBech32(bech32Id)}
                className="flex-shrink-0 p-1 hover:bg-background/50 rounded transition-colors"
                aria-label="Copy Nostr ID"
              >
                {copiedBech32 ? (
                  <CopyCheck className="size-4 text-muted-foreground" />
                ) : (
                  <Copy className="size-4 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>

          {/* JSON */}
          <div className="flex flex-col gap-1 flex-1 overflow-hidden">
            <span className="text-xs font-medium text-muted-foreground">
              JSON
            </span>
            <div className="flex-1 overflow-auto relative">
              <SyntaxHighlight
                code={jsonString}
                language="json"
                className="bg-muted p-4 pr-10 overflow-scroll"
              />
              <CodeCopyButton
                onCopy={() => copyJson(jsonString)}
                copied={copiedJson}
                label="Copy JSON"
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
