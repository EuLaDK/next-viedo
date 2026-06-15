import Link from "next/link";

import type { VideoItem } from "@/lib/mock-videos";
import { getVideoWatchHref } from "@/lib/video-card-url";

type RecommendationGridProps = {
  videos: VideoItem[];
};

// 渲染首页右侧推荐卡片；videos 为 API facade 返回的推荐列表。
export function RecommendationGrid({ videos }: RecommendationGridProps) {
  return (
    <section aria-labelledby="recommendation-title" className="text-white">
      <div className="mb-4 flex items-center justify-between">
        <h2 id="recommendation-title" className="text-lg font-semibold">
          今日推荐
        </h2>
        <Link
          href="#"
          className="text-sm font-medium text-white/50 transition-colors hover:text-emerald-300"
        >
          换一批
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:max-h-[23.5rem] lg:grid-cols-1 lg:overflow-y-auto lg:pr-1">
        {videos.map((item, index) => (
          <Link
            key={item.id}
            href={getVideoWatchHref(item.id, { from: "/" })}
            className="group grid min-h-32 grid-cols-[5.5rem_1fr] gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-2 transition-colors hover:border-emerald-300/35 hover:bg-white/[0.07] sm:grid-cols-[6.5rem_1fr] lg:min-h-24 lg:grid-cols-[4.75rem_1fr] lg:gap-2"
          >
            <div
              className="relative aspect-[4/5] overflow-hidden rounded-md"
              style={{ background: item.coverGradient }}
            >
              <span className="absolute left-2 top-2 rounded bg-black/35 px-1.5 py-0.5 text-xs font-semibold text-white/86">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="absolute inset-x-2 bottom-2 h-7 rounded bg-white/16" />
            </div>

            <div className="flex min-w-0 flex-col justify-center">
              <p className="truncate text-sm font-semibold text-white transition-colors group-hover:text-emerald-200">
                {item.title}
              </p>
              <p className="mt-2 text-xs text-white/48">{item.category}</p>
              <p className="mt-3 text-xs font-medium text-emerald-300/80">
                {item.heat}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
