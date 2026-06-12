import { Flame } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/common/empty-state";
import { VideoPosterCard } from "@/components/video/video-card";
import type { VideoItem } from "@/lib/mock-videos";
import { getVideoWatchHref } from "@/lib/video-card-url";

type ChannelVideoGridProps = {
  returnHref: string;
  videos: VideoItem[];
};

// 渲染频道页视频网格和热度榜；videos 为当前频道筛选后的视频列表。
export function ChannelVideoGrid({ returnHref, videos }: ChannelVideoGridProps) {
  const hasVideos = videos.length > 0;
  const rankingVideos = videos.slice(0, 6);

  return (
    <section
      id="channel-list"
      aria-labelledby="channel-list-title"
      className="grid gap-5 text-white lg:grid-cols-[minmax(0,1fr)_20rem]"
    >
      <div>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-emerald-300">频道片库</p>
            <h2 id="channel-list-title" className="mt-1 text-2xl font-bold">
              正在热播
            </h2>
          </div>
          <span className="text-sm text-white/45">{videos.length} 部内容</span>
        </div>

        {hasVideos ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {videos.map((video) => (
              <VideoPosterCard
                key={video.id}
                returnHref={returnHref}
                video={video}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            className="border-dashed border-white/12 bg-white/[0.03] px-5 py-12"
            preset="channel-empty"
          />
        )}
      </div>

      <aside className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
        <div className="mb-4 flex items-center gap-2">
          <Flame className="size-5 text-amber-300" />
          <h2 className="text-lg font-semibold">频道热榜</h2>
        </div>

        <div className="space-y-2">
          {rankingVideos.length > 0 ? (
            rankingVideos.map((video, index) => (
              <Link
                key={video.id}
                href={getVideoWatchHref(video.id, { from: returnHref })}
                className="group flex items-center gap-3 rounded-md border border-white/8 bg-white/[0.03] p-3 transition-colors hover:bg-white/[0.07]"
              >
                <span
                  className={
                    index < 3
                      ? "flex size-7 shrink-0 items-center justify-center rounded bg-emerald-400 text-xs font-bold text-[#06130d]"
                      : "flex size-7 shrink-0 items-center justify-center rounded bg-white/10 text-xs font-bold text-white/60"
                  }
                >
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white transition-colors group-hover:text-emerald-200">
                    {video.title}
                  </p>
                  <p className="mt-1 truncate text-xs text-white/45">
                    {video.heat}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <EmptyState
              compact
              className="rounded-md border-white/8 bg-white/[0.03] p-4"
              preset="channel-rank-empty"
            />
          )}
        </div>
      </aside>
    </section>
  );
}
