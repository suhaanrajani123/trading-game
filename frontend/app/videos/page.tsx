import { CURATED_VIDEOS, type CuratedVideo } from "@/lib/videos";
import VideoCard from "@/components/VideoCard";

export const metadata = { title: "Videos" };

const CATEGORY_ORDER: CuratedVideo["category"][] = ["Absolute Basics", "Full Courses", "Trusted Educators", "Real Investor Talk"];
const CATEGORY_LABEL: Record<CuratedVideo["category"], string> = {
  "Absolute Basics": "Start here",
  "Full Courses": "Full courses",
  "Trusted Educators": "Trusted educators",
  "Real Investor Talk": "From real investors",
};

export default function VideosPage() {
  return (
    <div className="animate-rise">
      <h1 className="text-[30px] font-semibold">Videos</h1>
      <p className="mt-1 text-inksoft max-w-prose">
        Hand-picked free videos for when you&apos;d rather watch than read. They play right here and are hosted on YouTube.
      </p>

      {CATEGORY_ORDER.map((category) => {
        const videos = CURATED_VIDEOS.filter((v) => v.category === category);
        if (!videos.length) return null;
        return (
          <section key={category} className="mt-9" aria-labelledby={`cat-${category}`}>
            <h2 id={`cat-${category}`} className="text-[19px] font-semibold mb-4">{CATEGORY_LABEL[category]}</h2>
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {videos.map((video) => <VideoCard key={video.id} video={video} />)}
            </div>
          </section>
        );
      })}

      <p className="mt-10 text-[13px] text-muted">Third-party videos. Tradepath isn&apos;t affiliated with these creators.</p>
    </div>
  );
}
