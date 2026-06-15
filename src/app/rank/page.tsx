import { Flame, Star, TrendingUp } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/common/empty-state";
import { ChannelNav } from "@/components/home/channel-nav";
import { SiteHeader } from "@/components/home/site-header";
import { VideoPosterCard } from "@/components/video/video-card";
import {
  channelItems,
  type RankSort,
} from "@/lib/mock-videos";
import {
  getRankChannel,
  getRankFilterHref,
  getRankSort,
} from "@/lib/rank-filter-url";
import { getRankedVideosData } from "@/lib/video-api";
import { getVideoWatchHref } from "@/lib/video-card-url";

type RankPageProps = {
  searchParams: Promise<{
    channel?: string | string[];
    sort?: string | string[];
  }>;
};

const rankTabs: {
  description: string;
  label: string;
  value: RankSort;
}[] = [
  { label: "热度榜", value: "hot", description: "按全站播放热度排序" },
  { label: "高分榜", value: "score", description: "优先展示高评分内容" },
  { label: "新片榜", value: "new", description: "按上线年份和热度排序" },
  { label: "飙升榜", value: "rising", description: "按新近上线内容和热度排序" },
  { label: "口碑榜", value: "reputation", description: "按评分优先，热度作为同分参考" },
  { label: "VIP榜", value: "vip", description: "聚合会员抢先看、独播和高清权益内容" },
];

const rankChannelItems = [
  { slug: "all", label: "全部" },
  ...channelItems
    .filter((channel) =>
      ["tv", "movie", "variety", "anime", "documentary", "kids", "vip"].includes(
        channel.slug,
      ),
    )
    .map((channel) => ({ slug: channel.slug, label: channel.label })),
];

// 渲染全站排行榜页；searchParams 包含当前榜单排序方式。
export default async function RankPage({ searchParams }: RankPageProps) {
  const { channel, sort } = await searchParams;
  const activeSort = getRankSort(sort);
  const activeChannel = getRankChannel(channel);
  const videos = await getRankedVideosData({
    channel: activeChannel,
    sort: activeSort,
  });
  const championVideo = videos[0];
  const activeTab = rankTabs.find((tab) => tab.value === activeSort);
  const activeChannelItem = rankChannelItems.find(
    (item) => item.slug === activeChannel,
  );
  const returnHref = getRankFilterHref(
    { sort: activeSort, channel: activeChannel },
    {},
  );

  return (
    <div className="min-h-screen bg-[#080b10] text-white">
      <SiteHeader />
      <ChannelNav activeSlug="rank" />
      <main className="bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_30%),linear-gradient(180deg,#080b10_0%,#0d1117_100%)]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:py-8">
          <section className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]">
            <div
              className="relative min-h-72 p-5 sm:p-7 lg:p-8"
              style={{
                background:
                  championVideo?.coverGradient ??
                  "linear-gradient(135deg,#0f766e,#111827 58%,#020617)",
              }}
            >
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,11,16,0.94)_0%,rgba(8,11,16,0.72)_48%,rgba(8,11,16,0.36)_100%)]" />
              <div className="relative z-10 max-w-3xl">
                <p className="flex items-center gap-2 text-sm font-medium text-emerald-300">
                  <Flame className="size-4" />
                  全站排行榜
                </p>
                <h1 className="mt-3 text-4xl font-bold tracking-normal">
                  {activeTab?.label ?? "热度榜"}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/64">
                  {activeTab?.description}
                  {championVideo
                    ? `，当前${activeChannelItem?.label ?? "全部"}冠军是《${championVideo.title}》，可以直接进入播放页查看详情。`
                    : "，当前筛选暂无内容，可以切换频道或榜单继续查看。"}
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {rankTabs.map((tab) => {
                    const isActive = activeSort === tab.value;

                    return (
                      <Link
                        key={tab.value}
                        href={getRankFilterHref(
                          { sort: activeSort, channel: activeChannel },
                          { sort: tab.value },
                        )}
                        aria-current={isActive ? "page" : undefined}
                        className={
                          isActive
                            ? "rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-[#06130d]"
                            : "rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm font-medium text-white/70 transition-colors hover:border-emerald-300/35 hover:bg-white/10 hover:text-white"
                        }
                      >
                        {tab.label}
                      </Link>
                    );
                  })}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {rankChannelItems.map((item) => {
                    const isActive = activeChannel === item.slug;

                    return (
                      <Link
                        key={item.slug}
                        href={getRankFilterHref(
                          { sort: activeSort, channel: activeChannel },
                          { channel: item.slug },
                        )}
                        aria-current={isActive ? "page" : undefined}
                        className={
                          isActive
                            ? "rounded-full border border-emerald-300/45 bg-emerald-300/15 px-3 py-1.5 text-xs font-semibold text-emerald-100"
                            : "rounded-full border border-white/10 bg-black/18 px-3 py-1.5 text-xs font-medium text-white/58 transition-colors hover:border-emerald-300/35 hover:bg-white/10 hover:text-white"
                        }
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div>
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-emerald-300">
                    榜单片库
                  </p>
                  <h2 className="mt-1 text-2xl font-bold">上榜内容</h2>
                </div>
                <span className="text-sm text-white/45">
                  {videos.length} 部内容
                </span>
              </div>

              {videos.length > 0 ? (
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
                  description="当前榜单和频道组合暂时没有内容，可以切换到全部频道或其他榜单。"
                  title="暂无上榜内容"
                />
              )}
            </div>

            <aside className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-4 flex items-center gap-2">
                <TrendingUp className="size-5 text-emerald-300" />
                <h2 className="text-lg font-semibold">Top 10</h2>
              </div>

              <div className="space-y-2">
                {videos.slice(0, 10).map((video, index) => (
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
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white transition-colors group-hover:text-emerald-200">
                        {video.title}
                      </p>
                      <p className="mt-1 flex items-center gap-1 truncate text-xs text-white/45">
                        <Star className="size-3 text-amber-300" />
                        {activeSort === "score" || activeSort === "reputation"
                          ? video.score
                          : video.heat}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </aside>
          </section>
        </div>
      </main>
    </div>
  );
}
