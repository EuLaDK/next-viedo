import { ChevronRight, Flame, Trophy } from "lucide-react";
import Link from "next/link";

import type { VideoItem } from "@/lib/mock-videos";
import { getVideoWatchHref } from "@/lib/video-card-url";

type RankSectionPreviewProps = {
  videos: VideoItem[];
};

// 渲染首页排行榜入口；videos 为 API facade 返回的热度榜前三内容。
export function RankSectionPreview({ videos }: RankSectionPreviewProps) {
  return (
    <section
      aria-labelledby="home-rank-title"
      className="rounded-lg border border-white/10 bg-white/[0.04] p-4 text-white sm:p-5"
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-emerald-300">
            <Trophy className="size-4" />
            全站热榜
          </p>
          <h2 id="home-rank-title" className="mt-1 text-2xl font-bold">
            排行榜
          </h2>
        </div>
        <Link
          href="/rank"
          className="flex shrink-0 items-center gap-1 text-sm font-medium text-white/52 transition-colors hover:text-emerald-300"
        >
          查看更多
          <ChevronRight className="size-4" />
        </Link>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        {videos.map((video, index) => (
          <Link
            key={video.id}
            href={getVideoWatchHref(video.id, { from: "/" })}
            className="group flex min-w-0 items-center gap-3 rounded-md border border-white/8 bg-black/18 p-3 transition-colors hover:border-emerald-300/35 hover:bg-white/[0.07]"
          >
            <span
              className={
                index === 0
                  ? "flex size-9 shrink-0 items-center justify-center rounded bg-emerald-400 text-sm font-bold text-[#06130d]"
                  : "flex size-9 shrink-0 items-center justify-center rounded bg-white/10 text-sm font-bold text-white/62"
              }
            >
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-semibold text-white transition-colors group-hover:text-emerald-200">
                {video.title}
              </h3>
              <p className="mt-1 flex items-center gap-1 truncate text-xs text-white/48">
                <Flame className="size-3 text-emerald-300" />
                {video.heat}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
