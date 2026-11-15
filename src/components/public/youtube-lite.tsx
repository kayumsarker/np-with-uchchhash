"use client";

import Image from "next/image";
import { useState } from "react";
import { youtubeThumbnailUrl } from "@/lib/youtube";

type Props = {
  videoId: string;
  title: string;
  /** Above-the-fold player: load the thumbnail eagerly. */
  priority?: boolean;
};

/**
 * Lite YouTube embed: shows only a thumbnail until clicked, then loads the
 * privacy-enhanced (youtube-nocookie.com) player. No YouTube JS on page load.
 */
export function YouTubeLite({ videoId, title, priority }: Props) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-black">
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="absolute inset-0 size-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Play video: ${title}`}
          className="group absolute inset-0 size-full cursor-pointer"
        >
          <Image
            src={youtubeThumbnailUrl(videoId)}
            alt=""
            fill
            priority={priority}
            sizes="(min-width: 1024px) 768px, 100vw"
            className="object-cover opacity-80 transition group-hover:opacity-100"
          />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-primary/90 shadow-[0_0_40px_rgba(47,128,255,0.6)] transition group-hover:scale-110 group-hover:bg-primary sm:size-20">
              <svg viewBox="0 0 24 24" className="ml-1 size-7 fill-white sm:size-9" aria-hidden>
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
