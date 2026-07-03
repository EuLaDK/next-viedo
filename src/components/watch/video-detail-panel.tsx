"use client";

import { CalendarDays, Crown, Star } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { WatchActionBar } from "@/components/watch/watch-action-bar";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { getHydrationSafeValue } from "@/lib/hydration-state";
import type { VideoItem } from "@/lib/mock-videos";
import {
  createVipPlaybackState,
  isVipVideoContent,
} from "@/lib/vip-membership";
import { useUserStore } from "@/stores/use-user-store";

type VideoDetailPanelProps = {
  activeEpisode: number;
  video: VideoItem;
};

// 渲染播放页视频详情、操作入口和主创信息；video 为当前播放页展示的视频详情。
export function VideoDetailPanel({
  activeEpisode,
  video,
}: VideoDetailPanelProps) {
  const hasMounted = useHasMounted();
  const storedIsVip = useUserStore((state) => state.isVip);
  const isVip = getHydrationSafeValue(hasMounted, storedIsVip, false);
  const requiresVip = isVipVideoContent(video);
  const vipPlaybackState = createVipPlaybackState({
    isVip,
    requiresVip,
  });
  const meta = [
    video.year,
    video.region,
    `全 ${video.totalEpisodes} 集`,
    video.quality,
  ];
  const favoriteVideo = {
    id: video.id,
    title: video.title,
    category: video.category,
    progress: video.progress,
    coverGradient: video.coverGradient,
    description: video.description,
  };

  return (
    <section
      aria-labelledby="video-detail-title"
      className="grid gap-5 text-white lg:grid-cols-[minmax(0,1fr)_20rem]"
    >
      <article className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-white/55">
          {meta.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>

        <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <h2 id="video-detail-title" className="text-2xl font-bold">
              {video.title}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-white/62">
              {video.description}
            </p>
          </div>

          <div className="flex shrink-0 items-end gap-2 md:flex-col md:items-center">
            <div className="flex items-center gap-1 text-3xl font-bold text-emerald-300">
              <Star className="size-6 fill-emerald-300" />
              {video.score}
            </div>
            <span className="text-xs text-white/45">用户评分</span>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {video.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-emerald-300/22 bg-emerald-300/10 px-3 py-1 text-xs font-medium text-emerald-100"
            >
              {tag}
            </span>
          ))}
        </div>

        {vipPlaybackState.shouldShowPrompt ? (
          <div className="mt-5 rounded-lg border border-amber-300/24 bg-amber-300/[0.08] p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold text-amber-200">
                  <Crown className="size-4" />
                  {vipPlaybackState.title}
                </p>
                <p className="mt-2 text-sm leading-6 text-white/58">
                  {vipPlaybackState.description}
                </p>
              </div>
              <Button
                asChild
                className="w-fit bg-amber-300 text-[#211504] hover:bg-amber-200"
              >
                <Link href="/profile/vip">开通会员</Link>
              </Button>
            </div>
          </div>
        ) : null}

        <div className="mt-5 grid gap-4 border-y border-white/10 py-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-white/42">当前热度</p>
            <p className="mt-1 text-sm font-semibold text-white/82">
              {video.heat}
            </p>
          </div>
          <div>
            <p className="text-xs text-white/42">更新节奏</p>
            <p className="mt-1 text-sm font-semibold text-white/82">
              {video.update}
            </p>
          </div>
          <div>
            <p className="text-xs text-white/42">主创阵容</p>
            <p className="mt-1 truncate text-sm font-semibold text-white/82">
              {video.castNames.join(" / ")}
            </p>
          </div>
        </div>

        <WatchActionBar
          activeEpisode={activeEpisode}
          totalEpisodes={video.totalEpisodes}
          video={favoriteVideo}
        />
      </article>

      <aside className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
        <div className="flex items-center gap-2 text-emerald-300">
          <CalendarDays className="size-5" />
          <h3 className="font-semibold">追剧日历</h3>
        </div>

        <div className="mt-5 space-y-4">
          {video.releaseCalendar.map((item) => (
            <div
              key={`${item.time}-${item.detail}`}
              className={
                item.active
                  ? "border-l border-emerald-300/45 pl-4"
                  : "border-l border-white/14 pl-4"
              }
            >
              <p
                className={
                  item.active
                    ? "text-sm font-semibold text-white"
                    : "text-sm font-semibold text-white/78"
                }
              >
                {item.time}
              </p>
              <p
                className={
                  item.active
                    ? "mt-1 text-xs text-white/48"
                    : "mt-1 text-xs text-white/45"
                }
              >
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </aside>
    </section>
  );
}
