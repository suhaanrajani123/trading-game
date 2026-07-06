"use client";
import { useState } from "react";
import { Play } from "lucide-react";
import { CuratedVideo } from "@/lib/videos";

export default function VideoCard({ video }: { video: CuratedVideo }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="glass rounded-2xl shadow-glass overflow-hidden glass-hover">
      <div className="relative aspect-video bg-black">
        {playing ? (
          <iframe
            src={`https://www.youtube.com/embed/${video.id}?autoplay=1`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        ) : (
          <button
            onClick={() => setPlaying(true)}
            className="group w-full h-full relative"
            aria-label={`Play ${video.title}`}
          >
            <img
              src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
              alt={video.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/45 transition-colors flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand to-brand2 flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
                <Play size={18} className="text-white ml-0.5" fill="white" />
              </div>
            </div>
          </button>
        )}
      </div>
      <div className="p-4">
        <p className="text-[10px] uppercase tracking-wide text-brand2 font-medium mb-1">{video.channel}</p>
        <h4 className="font-display font-medium text-sm mb-1.5 leading-snug">{video.title}</h4>
        <p className="text-xs text-muted leading-relaxed">{video.description}</p>
      </div>
    </div>
  );
}
