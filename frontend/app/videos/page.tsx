"use client";
import { CURATED_VIDEOS, CuratedVideo } from "@/lib/videos";
import VideoCard from "@/components/VideoCard";
import { Youtube } from "lucide-react";

const CATEGORY_ORDER: CuratedVideo["category"][] = [
  "Absolute Basics",
  "Full Courses",
  "Trusted Educators",
  "Real Investor Talk",
];

export default function VideosPage() {
  return (
    <div className="max-w-6xl animate-fade-up">
      <div className="flex items-center gap-3 mb-1.5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-loss to-rose-400 flex items-center justify-center shrink-0">
          <Youtube size={18} className="text-white" />
        </div>
        <h1 className="font-display font-bold text-3xl tracking-tight">Videos</h1>
      </div>
      <p className="text-muted text-sm mb-8">
        10 hand-picked videos for learning the stock market from zero — free, real, and outside this app.
      </p>

      {CATEGORY_ORDER.map((category) => {
        const videos = CURATED_VIDEOS.filter((v) => v.category === category);
        if (videos.length === 0) return null;
        return (
          <div key={category} className="mb-9">
            <h2 className="font-display font-semibold text-sm text-muted uppercase tracking-wide mb-3">
              {category}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {videos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </div>
        );
      })}

      <p className="text-xs text-muted">
        These are third-party videos hosted on YouTube — not affiliated with or endorsed by Tradepath.
      </p>
    </div>
  );
}
