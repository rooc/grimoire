import { memo, useMemo } from "react";
import { cn } from "@/lib/utils";
import { safeHex, type LayoutMode } from "@/lib/color-moment-helpers";

interface ColorPaletteDisplayProps {
  colors: string[];
  layout?: LayoutMode;
  emoji?: string;
  emojiSize?: "md" | "lg";
  className?: string;
}

/** Shared color palette renderer supporting all 6 layout modes */
export const ColorPaletteDisplay = memo(function ColorPaletteDisplay({
  colors,
  layout = "horizontal",
  emoji,
  emojiSize = "md",
  className,
}: ColorPaletteDisplayProps) {
  if (colors.length === 0) return null;

  return (
    <div
      className={cn(
        "color-palette-display relative overflow-hidden rounded-xl",
        className,
      )}
    >
      <LayoutRenderer colors={colors} layout={layout} />
      {emoji && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span
            className={cn(
              "drop-shadow-lg",
              emojiSize === "lg" ? "text-8xl" : "text-6xl",
            )}
          >
            {emoji}
          </span>
        </div>
      )}
    </div>
  );
});

function LayoutRenderer({
  colors,
  layout,
}: {
  colors: string[];
  layout: LayoutMode;
}) {
  switch (layout) {
    case "horizontal":
      return (
        <div className="flex flex-col w-full h-full">
          {colors.map((color, i) => (
            <div
              key={i}
              className="flex-1"
              style={{ backgroundColor: safeHex(color) }}
            />
          ))}
        </div>
      );

    case "vertical":
      return (
        <div className="flex flex-row w-full h-full">
          {colors.map((color, i) => (
            <div
              key={i}
              className="flex-1"
              style={{ backgroundColor: safeHex(color) }}
            />
          ))}
        </div>
      );

    case "grid":
      return (
        <div
          className={cn(
            "grid w-full h-full",
            colors.length === 6
              ? "grid-cols-3 grid-rows-2"
              : "grid-cols-2 grid-rows-2",
          )}
        >
          {colors.map((color, i) => (
            <div key={i} style={{ backgroundColor: safeHex(color) }} />
          ))}
        </div>
      );

    case "star":
      return <StarLayout colors={colors} />;

    case "checkerboard":
      return <CheckerboardLayout colors={colors} />;

    case "diagonalStripes":
      return <DiagonalStripesLayout colors={colors} />;

    default:
      return (
        <div className="flex flex-col w-full h-full">
          {colors.map((color, i) => (
            <div
              key={i}
              className="flex-1"
              style={{ backgroundColor: safeHex(color) }}
            />
          ))}
        </div>
      );
  }
}

/** Radial pie slices from center using clip-path */
function StarLayout({ colors }: { colors: string[] }) {
  const total = colors.length;

  return (
    <div className="relative w-full h-full">
      {/* Background fill to cover center gap */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: safeHex(colors[0]) }}
      />
      {colors.map((color, index) => {
        const angle = 360 / total;
        const startAngle = index * angle - 90;
        const scale = 1.5;
        const overlap = 0.5;
        const adjustedStartAngle = startAngle - overlap;
        const adjustedAngle = angle + overlap * 2;

        const points: string[] = ["50% 50%"];
        const steps = 12;
        for (let i = 0; i <= steps; i++) {
          const currentAngle = adjustedStartAngle + (adjustedAngle * i) / steps;
          const rad = (currentAngle * Math.PI) / 180;
          const x = 50 + 50 * scale * Math.cos(rad);
          const y = 50 + 50 * scale * Math.sin(rad);
          points.push(`${x}% ${y}%`);
        }

        return (
          <div
            key={index}
            className="absolute inset-0"
            style={{
              backgroundColor: safeHex(color),
              clipPath: `polygon(${points.join(", ")})`,
            }}
          />
        );
      })}
    </div>
  );
}

/** SVG data URI tiled checkerboard pattern */
function CheckerboardLayout({ colors }: { colors: string[] }) {
  const backgroundImage = useMemo(() => {
    const n = colors.length;
    const cellSize = 1;
    const svgSize = n * cellSize;

    let rects = "";
    for (let row = 0; row < n; row++) {
      for (let col = 0; col < n; col++) {
        const color = safeHex(colors[(row + col) % n]);
        rects += `<rect x="${col * cellSize}" y="${row * cellSize}" width="${cellSize}" height="${cellSize}" fill="${color}"/>`;
      }
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgSize}" height="${svgSize}" shape-rendering="crispEdges">${rects}</svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  }, [colors]);

  return (
    <div
      className="absolute inset-0"
      style={{
        backgroundImage,
        backgroundSize: "50% 50%",
        backgroundRepeat: "repeat",
        imageRendering: "pixelated",
      }}
    />
  );
}

/** Diagonal stripes via CSS linear-gradient */
function DiagonalStripesLayout({ colors }: { colors: string[] }) {
  const background = useMemo(() => {
    const n = colors.length;
    const stripePercent = 100 / n;

    const stops = colors
      .map((color, i) => {
        const start = i * stripePercent;
        const end = (i + 1) * stripePercent;
        const hex = safeHex(color);
        return `${hex} ${start}%, ${hex} ${end}%`;
      })
      .join(", ");

    return `linear-gradient(135deg, ${stops})`;
  }, [colors]);

  return <div className="absolute inset-0" style={{ background }} />;
}
