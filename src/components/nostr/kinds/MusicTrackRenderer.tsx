import type { NostrEvent } from "@/types/nostr";
import {
  getTrackTitle,
  getTrackUrl,
  getTrackArtist,
  getTrackImage,
  getTrackMetadata,
  getTrackHashtags,
} from "@/lib/music-helpers";
import { BaseEventContainer, ClickableEventTitle } from "./BaseEventRenderer";
import type { BaseEventProps } from "./BaseEventRenderer";
import { MediaEmbed } from "../MediaEmbed";
import { Label } from "@/components/ui/label";
import { UserName } from "../UserName";
import { Music, Bot } from "lucide-react";

export function MusicTrackRenderer({ event }: BaseEventProps) {
  const title = getTrackTitle(event);
  const artist = getTrackArtist(event);
  const trackUrl = getTrackUrl(event);
  const metadata = getTrackMetadata(event);
  const hashtags = getTrackHashtags(event);

  return (
    <BaseEventContainer event={event}>
      <div className="flex flex-col gap-1">
        {/* Title */}
        <ClickableEventTitle
          event={event}
          className="text-base font-semibold flex items-center gap-1.5"
        >
          <Music className="size-4 text-muted-foreground flex-shrink-0" />
          {title || "Untitled Track"}
        </ClickableEventTitle>

        {/* Artist */}
        {artist && (
          <div className="text-sm text-muted-foreground">{artist}</div>
        )}

        {/* Tags */}
        {(hashtags.length > 0 || metadata.aiGenerated) && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {hashtags.map((tag) => (
              <Label key={tag} size="sm">
                {tag}
              </Label>
            ))}
            {metadata.aiGenerated && (
              <Label size="sm">
                <span className="inline-flex items-center gap-1">
                  <Bot className="size-3" />
                  ai
                </span>
              </Label>
            )}
          </div>
        )}
      </div>

      {/* Audio player */}
      {trackUrl && (
        <div className="mt-2">
          <MediaEmbed url={trackUrl} type="audio" showControls />
        </div>
      )}
    </BaseEventContainer>
  );
}

export function MusicTrackDetailRenderer({ event }: { event: NostrEvent }) {
  const title = getTrackTitle(event);
  const artist = getTrackArtist(event);
  const trackUrl = getTrackUrl(event);
  const image = getTrackImage(event);
  const metadata = getTrackMetadata(event);

  const hasLyrics = event.content && event.content.trim().length > 0;

  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto">
      {/* Cover art */}
      {image && (
        <div className="flex-shrink-0">
          <MediaEmbed url={image} type="image" preset="preview" enableZoom />
        </div>
      )}

      <div className="flex-1 p-3 space-y-4">
        {/* Title */}
        <h1 className="text-2xl font-bold text-balance">
          {title || "Untitled Track"}
        </h1>

        {/* Artist */}
        {artist && <p className="text-base text-muted-foreground">{artist}</p>}

        {/* Author */}
        <UserName pubkey={event.pubkey} className="text-sm text-accent" />

        {/* Audio player */}
        {trackUrl && <MediaEmbed url={trackUrl} type="audio" showControls />}

        {/* Metadata grid */}
        <div className="flex items-center gap-2 flex-wrap text-sm">
          {metadata.album && <Label size="md">{metadata.album}</Label>}
          {metadata.trackNumber && (
            <Label size="sm">Track {metadata.trackNumber}</Label>
          )}
          {metadata.released && <Label size="sm">{metadata.released}</Label>}
          {metadata.language && <Label size="sm">{metadata.language}</Label>}
          {metadata.aiGenerated && (
            <Label size="sm">
              <span className="inline-flex items-center gap-1">
                <Bot className="size-3" />
                ai generated
              </span>
            </Label>
          )}
          {metadata.license && <Label size="sm">{metadata.license}</Label>}
        </div>

        {/* Lyrics / Content */}
        {hasLyrics && (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-muted-foreground">
              Lyrics
            </h2>
            <pre className="text-sm whitespace-pre-wrap break-words">
              {event.content}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
