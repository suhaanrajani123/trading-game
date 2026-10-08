"use client";
import { useState } from "react";
import { Play } from "lucide-react";
import type { CuratedVideo } from "@/lib/videos";

export default function VideoCard({ video }: { video: CuratedVideo }) {
  const [playing, setPlaying] = useState(false);

  return (
    <article className="panel overflow-hidden">
      <div className="relative aspect-video bg-black">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        ) : (
          <button onClick={() => setPlaying(true)} className="group absolute inset-0" aria-label={`Play ${video.title}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`} alt="" loading="lazy" className="w-full h-full object-cover" />
            <span className="absolute inset-0 grid place-items-center bg-black/20 group-hover:bg-black/35 transition-colors">
              <span className="grid place-items-center w-14 h-14 rounded-full bg-white/95 text-[#14213D] group-hover:scale-105 transition-transform">
                <Play size={22} fill="currentColor" className="ml-1" />
              </span>
            </span>
          </button>
        )}
      </div>
      <div className="p-5">
        <p className="text-[13px] text-inksoft">{video.channel}</p>
        <h3 className="mt-1 text-[17px] leading-snug font-semibold">{video.title}</h3>
        <p className="mt-2 text-sm text-inksoft">{video.description}</p>
      </div>
    </article>
  );
}
