import { ChevronLeft } from "lucide-react";
import Link from "next/link";

import { SiteHeader } from "@/components/home/site-header";
import { Button } from "@/components/ui/button";
import { PlayerShell } from "@/components/watch/player-shell";
import { RelatedVideos } from "@/components/watch/related-videos";
import { VideoDetailPanel } from "@/components/watch/video-detail-panel";
import { WatchEngagementPanel } from "@/components/watch/watch-engagement-panel";
import {
  getRelatedVideos,
  getVideoById,
  videoLibrary,
} from "@/lib/mock-videos";
import { getSafeWatchReturnHref } from "@/lib/video-card-url";

type WatchPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    episode?: string | string[];
    from?: string | string[];
    t?: string | string[];
  }>;
};

/* 读取 URL 查询参数；value 为 query 中的单个字段，数组时取第一项。 */
function getSearchParamValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

/* 解析当前播放集数；episodeValue 为 URL 中的 episode 参数，maxEpisode 为当前可选集数。 */
function getActiveEpisode(episodeValue: string, maxEpisode: number): number {
  const episode = Number.parseInt(episodeValue, 10);

  if (Number.isNaN(episode)) {
    return 1;
  }

  return Math.min(Math.max(episode, 1), maxEpisode);
}

/* 解析历史回看秒数；timeValue 来自 URL 的 t 参数，非法时回落到 0。 */
function getInitialTime(timeValue: string): number {
  const time = Number.parseInt(timeValue, 10);

  if (Number.isNaN(time)) {
    return 0;
  }

  return Math.max(0, time);
}

/* 生成带集数的视频标题；totalEpisodes 为 1 时保留原片名。 */
function getEpisodeTitle(title: string, episode: number, totalEpisodes: number) {
  return totalEpisodes > 1 ? `${title} 第 ${episode} 集` : title;
}

/* 生成静态视频详情页路径；让 mock 数据里的视频 id 都能直接访问。 */
export function generateStaticParams() {
  return videoLibrary.map((video) => ({
    id: video.id,
  }));
}

/* 渲染视频播放页入口；params 包含当前路由的视频 id。 */
export default async function WatchPage({
  params,
  searchParams,
}: WatchPageProps) {
  const { id } = await params;
  const { episode, from, t } = await searchParams;
  const video = getVideoById(id);
  const returnHref = getSafeWatchReturnHref(getSearchParamValue(from));
  const returnLabel = returnHref === "/" ? "返回首页" : "返回上一页";
  const activeEpisode = getActiveEpisode(
    getSearchParamValue(episode),
    video.episodes.length,
  );
  const initialTime = getInitialTime(getSearchParamValue(t));
  const episodeTitle = getEpisodeTitle(
    video.title,
    activeEpisode,
    video.totalEpisodes,
  );
  const relatedVideos = getRelatedVideos(video.id);

  return (
    <div className="min-h-screen bg-[#080b10] text-white">
      <SiteHeader />
      <main className="bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_28%),linear-gradient(180deg,#080b10_0%,#0d1117_100%)]">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
          <Button
            asChild
            variant="ghost"
            className="-ml-2 mb-4 text-white/72 hover:bg-white/10 hover:text-white"
          >
            <Link href={returnHref} aria-label={returnLabel}>
              <ChevronLeft className="size-4" />
              {returnLabel}
            </Link>
          </Button>
          <div className="flex flex-col gap-6">
            <PlayerShell
              video={video}
              activeEpisode={activeEpisode}
              initialTime={initialTime}
              returnHref={returnHref}
            />
            <VideoDetailPanel video={video} activeEpisode={activeEpisode} />
            <WatchEngagementPanel
              videoId={`${video.id}-${activeEpisode}`}
              title={episodeTitle}
            />
            <RelatedVideos returnHref={returnHref} videos={relatedVideos} />
          </div>
        </div>
      </main>
    </div>
  );
}
