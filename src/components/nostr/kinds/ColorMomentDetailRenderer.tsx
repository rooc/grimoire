import type { NostrEvent } from "@/types/nostr";
import {
  getColorMomentColors,
  getColorMomentLayout,
  getColorMomentName,
  getColorMomentEmoji,
  safeHex,
} from "@/lib/color-moment-helpers";
import { ColorPaletteDisplay } from "@/components/nostr/ColorPaletteDisplay";
import { useCopy } from "@/hooks/useCopy";

/**
 * Kind 3367 Detail Renderer - Color Moment (Detail View)
 * Full-size palette with copyable color swatches below
 */
export function ColorMomentDetailRenderer({ event }: { event: NostrEvent }) {
  const colors = getColorMomentColors(event);
  const layout = getColorMomentLayout(event) || "horizontal";
  const name = getColorMomentName(event);
  const emoji = getColorMomentEmoji(event);
  const { copy } = useCopy();

  if (colors.length < 3) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Invalid color moment (fewer than 3 colors)
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {name && <h1 className="text-2xl font-bold">{name}</h1>}

      <ColorPaletteDisplay
        colors={colors}
        layout={layout}
        emoji={emoji}
        emojiSize="lg"
        className="h-72"
      />

      <div className="grid grid-cols-3 gap-2">
        {colors.map((color, i) => {
          const hex = safeHex(color);
          return (
            <button
              key={i}
              className="flex items-center gap-2 rounded-md border border-border p-2 hover:bg-muted/50 transition-colors"
              onClick={() => copy(hex)}
              title={`Copy ${hex}`}
            >
              <div
                className="size-6 rounded shrink-0"
                style={{ backgroundColor: hex }}
              />
              <span className="text-xs font-mono text-muted-foreground">
                {hex}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
