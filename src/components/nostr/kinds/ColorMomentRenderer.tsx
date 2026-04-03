import {
  getColorMomentColors,
  getColorMomentLayout,
  getColorMomentName,
  getColorMomentEmoji,
} from "@/lib/color-moment-helpers";
import { ColorPaletteDisplay } from "@/components/nostr/ColorPaletteDisplay";
import {
  BaseEventProps,
  BaseEventContainer,
  ClickableEventTitle,
} from "./BaseEventRenderer";
import { useAddWindow } from "@/core/state";

/**
 * Kind 3367 Renderer - Color Moment (Feed View)
 * Shows a color palette with optional emoji overlay and name
 */
export function ColorMomentRenderer({ event }: BaseEventProps) {
  const colors = getColorMomentColors(event);
  const layout = getColorMomentLayout(event);
  const name = getColorMomentName(event);
  const emoji = getColorMomentEmoji(event);
  const addWindow = useAddWindow();

  if (colors.length < 3) {
    return (
      <BaseEventContainer event={event}>
        <div className="text-xs text-muted-foreground italic">
          Invalid color moment (fewer than 3 colors)
        </div>
      </BaseEventContainer>
    );
  }

  const openDetail = () => {
    addWindow("open", { pointer: { id: event.id } });
  };

  return (
    <BaseEventContainer event={event}>
      <div className="flex flex-col gap-2">
        {name && (
          <ClickableEventTitle
            event={event}
            className="text-sm font-medium text-foreground"
          >
            {name}
          </ClickableEventTitle>
        )}

        <div onClick={openDetail} className="cursor-crosshair">
          <ColorPaletteDisplay
            colors={colors}
            layout={layout}
            emoji={emoji}
            className="h-52"
          />
        </div>
      </div>
    </BaseEventContainer>
  );
}
