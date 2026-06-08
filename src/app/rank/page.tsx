import { Flame, Star, TrendingUp } from "lucide-react";
import Link from "next/link";

import { ChannelNav } from "@/components/home/channel-nav";
import { SiteHeader } from "@/components/home/site-header";
import { VideoPosterCard } from "@/components/video/video-card";
import {
  getRankedVideos,
  rankSortValues,
  type RankSort,
} from "@/lib/mock-videos";
import { getVideoWatchHref } from "@/lib/video-card-url";

type RankPageProps = {
  searchParams: Promise<{
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
];

// 读取 URL 查询参数；value 为字符串数组时取第一项，缺失时返回空字符串。
function getSearchParamValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

// 规范化排行榜排序参数；sortValue 非法时回落到热度榜。
function getRankSort(sortValue: string): RankSort {
  return rankSortValues.includes(sortValue as RankSort)
    ? (sortValue as RankSort)
    : "hot";
}

// 生成排行榜切换链接；默认热度榜不写入 query，保持 URL 简洁。
function getRankHref(sort: RankSort): string {
  return sort === "hot" ? "/rank" : `/rank?sort=${sort}`;
}

// 渲染全站排行榜页；searchParams 包含当前榜单排序方式。
export default async function RankPage({ searchParams }: RankPageProps) {
  const { sort } = await searchParams;
  const activeSort = getRankSort(getSearchParamValue(sort));
  const videos = getRankedVideos(activeSort);
  const championVideo = videos[0];
  const activeTab = rankTabs.find((tab) => tab.value === activeSort);

  return (
    <div className="min-h-screen bg-[#080b10] text-white">
      <SiteHeader />
      <ChannelNav activeSlug="rank" />
      <main className="bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_30%),linear-gradient(180deg,#080b10_0%,#0d1117_100%)]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:py-8">
          <section className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]">
            <div
              className="relative min-h-72 p-5 sm:p-7 lg:p-8"
              style={{ background: championVideo.background }}
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
                  ，当前冠军是《{championVideo.title}》，可以直接进入播放页查看详情。
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {rankTabs.map((tab) => {
                    const isActive = activeSort === tab.value;

                    return (
                      <Link
                        key={tab.value}
                        href={getRankHref(tab.value)}
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

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                {videos.map((video) => (
                  <VideoPosterCard key={video.id} video={video} />
                ))}
              </div>
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
                    href={getVideoWatchHref(video.id)}
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
                        {activeSort === "score" ? video.score : video.heat}
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
