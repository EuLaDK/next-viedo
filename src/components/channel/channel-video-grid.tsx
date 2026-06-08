import { Flame } from "lucide-react";
import Link from "next/link";

import { VideoPosterCard } from "@/components/video/video-card";
import type { VideoItem } from "@/lib/mock-videos";

type ChannelVideoGridProps = {
  videos: VideoItem[];
};

// 渲染频道页视频网格和热度榜；videos 为当前频道筛选后的视频列表。
export function ChannelVideoGrid({ videos }: ChannelVideoGridProps) {
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
              <VideoPosterCard key={video.id} video={video} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-white/12 bg-white/[0.03] px-5 py-12 text-center">
            <p className="text-base font-semibold text-white">暂无匹配内容</p>
            <p className="mt-2 text-sm text-white/50">
              换个类型或年份试试，后续接入真实片库后这里会更丰富。
            </p>
          </div>
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
                href={`/watch/${video.id}`}
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
            <div className="rounded-md border border-white/8 bg-white/[0.03] p-4">
              <p className="text-sm font-medium text-white/68">
                当前筛选暂无热榜内容
              </p>
              <p className="mt-1 text-xs text-white/42">
                清空类型或年份后可以查看完整榜单。
              </p>
            </div>
          )}
        </div>
      </aside>
    </section>
  );
}
