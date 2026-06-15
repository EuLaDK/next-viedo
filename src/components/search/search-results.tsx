import { Search, SlidersHorizontal, TrendingUp, X } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/common/empty-state";
import { SearchHistoryPanel } from "@/components/search/search-history-panel";
import { VideoPosterCard } from "@/components/video/video-card";
import { channelItems } from "@/lib/mock-videos";
import type {
  SearchFilterState,
  SearchSort,
  VideoItem,
} from "@/lib/mock-videos";
import {
  getSearchClearHref,
  getSearchFilterHref,
} from "@/lib/search-filter-url";

type FilterOption<TValue extends string = string> = {
  label: string;
  value?: TValue;
};

const typeItems: FilterOption[] = [
  { label: "全部类型" },
  { label: "电影", value: "电影" },
  { label: "剧集", value: "剧集" },
  { label: "悬疑", value: "悬疑" },
  { label: "科幻", value: "科幻" },
  { label: "纪录片", value: "纪录片" },
  { label: "综艺", value: "综艺" },
  { label: "少儿", value: "少儿" },
];
const sortItems: FilterOption<SearchSort>[] = [
  { label: "相关度", value: "relevance" },
  { label: "最新上线", value: "new" },
  { label: "最高热度", value: "hot" },
  { label: "高分优先", value: "score" },
];
const channelFilterItems: FilterOption[] = [
  { label: "全部频道" },
  ...channelItems
    .filter((channel) => channel.slug !== "featured")
    .slice(0, 8)
    .map((channel) => ({
      label: channel.label,
      value: channel.slug,
    })),
];
const yearItems: FilterOption[] = [
  { label: "全部年份" },
  { label: "2026", value: "2026" },
  { label: "2025", value: "2025" },
  { label: "2024", value: "2024" },
];
const qualityItems: FilterOption[] = [
  { label: "全部清晰度" },
  { label: "4K HDR", value: "4K HDR" },
  { label: "4K", value: "4K" },
  { label: "1080P", value: "1080P" },
];
type SearchResultsProps = {
  filters: SearchFilterState;
  hotSearchKeywords: string[];
  query: string;
  recommendationVideos: VideoItem[];
  returnHref: string;
  videos: VideoItem[];
};

// 渲染搜索页结果区；query 为当前搜索词，videos 为按筛选条件匹配到的视频列表。
export function SearchResults({
  filters,
  hotSearchKeywords,
  query,
  recommendationVideos,
  returnHref,
  videos,
}: SearchResultsProps) {
  const hasQuery = query.trim().length > 0;
  const displayVideos = hasQuery ? videos : recommendationVideos;
  const hasResults = displayVideos.length > 0;
  const activeSort = filters.sort ?? "relevance";
  const hotSearchItems = hotSearchKeywords.map((keyword, index) => ({
    heat: `${98 - index * 7}.${index + 1}万`,
    keyword,
  }));
  const hasSearchValue =
    hasQuery ||
    Boolean(filters.channel) ||
    Boolean(filters.quality) ||
    Boolean(filters.type) ||
    Boolean(filters.year) ||
    activeSort !== "relevance";

  // 生成筛选项样式；isActive 表示当前 URL 是否命中该筛选值。
  function getFilterLinkClass(isActive: boolean, tone: "green" | "white") {
    if (isActive && tone === "green") {
      return "rounded-full bg-emerald-400 px-3 py-1.5 text-xs font-semibold text-[#06130d]";
    }

    if (isActive) {
      return "rounded-full bg-white/14 px-3 py-1.5 text-xs font-semibold text-white";
    }

    return "rounded-full px-3 py-1.5 text-xs font-medium text-white/55 transition-colors hover:bg-white/8 hover:text-white";
  }

  return (
    <section className="text-white" aria-labelledby="search-results-title">
      <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-medium text-emerald-300">
              <Search className="size-4" />
              全站搜索
            </p>
            <h1
              id="search-results-title"
              className="mt-2 text-3xl font-bold tracking-normal"
            >
              {hasQuery ? `搜索“${query}”` : "搜索你想看的内容"}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/58">
              {hasQuery
                ? `找到 ${videos.length} 个相关内容，可按类型和排序继续收窄结果。`
                : "输入片名、类型、主创或关键词，快速找到电影、剧集、综艺和纪录片。"}
            </p>
          </div>

          <form
            action="/search"
            method="GET"
            className="relative w-full max-w-xl lg:max-w-md"
          >
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/45" />
            <input
              type="search"
              name="q"
              defaultValue={query}
              aria-label="搜索视频"
              placeholder="搜索电影、剧集、综艺"
              className="h-11 w-full rounded-full border border-white/10 bg-white/8 pl-9 pr-12 text-sm text-white outline-none transition-colors placeholder:text-white/38 focus:border-emerald-300/70 focus:bg-white/12"
            />
            {hasSearchValue ? (
              <Link
                href={getSearchClearHref()}
                aria-label="清空搜索"
                title="清空搜索"
                className="absolute right-3 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-white/45 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="size-4" />
              </Link>
            ) : null}
            {filters.channel ? (
              <input type="hidden" name="channel" value={filters.channel} />
            ) : null}
            {filters.type ? (
              <input type="hidden" name="type" value={filters.type} />
            ) : null}
            {filters.year ? (
              <input type="hidden" name="year" value={filters.year} />
            ) : null}
            {filters.quality ? (
              <input type="hidden" name="quality" value={filters.quality} />
            ) : null}
            {activeSort !== "relevance" ? (
              <input type="hidden" name="sort" value={activeSort} />
            ) : null}
            <button type="submit" className="sr-only">
              搜索
            </button>
          </form>
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {hotSearchItems.map((item, index) => (
            <Link
              key={item.keyword}
              href={getSearchFilterHref(item.keyword, {}, {})}
              className="group flex items-center gap-3 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 transition-colors hover:border-emerald-300/30 hover:bg-white/[0.08]"
            >
              <span
                className={
                  index < 3
                    ? "flex size-6 shrink-0 items-center justify-center rounded bg-emerald-400 text-xs font-bold text-[#06130d]"
                    : "flex size-6 shrink-0 items-center justify-center rounded bg-white/10 text-xs font-bold text-white/58"
                }
              >
                {index + 1}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-white/72 transition-colors group-hover:text-white">
                {item.keyword}
              </span>
              <span className="flex items-center gap-1 text-xs text-emerald-200/72">
                <TrendingUp className="size-3" />
                {item.heat}
              </span>
            </Link>
          ))}
        </div>

        <SearchHistoryPanel query={query} />

        {hasQuery ? (
          <div
            className="mt-4 rounded-lg border border-white/10 bg-black/15 p-3"
            aria-label="搜索筛选"
          >
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white/78">
              <SlidersHorizontal className="size-4 text-emerald-300" />
              筛选
            </div>
            <div className="space-y-3">
              <div className="grid gap-2 lg:grid-cols-[44px_1fr] lg:items-center">
                <p className="text-xs font-medium text-white/45">类型</p>
                <div className="flex flex-wrap gap-2">
                  {typeItems.map((item) => {
                    const isActive = (filters.type ?? "") === (item.value ?? "");

                    return (
                      <Link
                        key={item.label}
                        href={getSearchFilterHref(query, filters, {
                          type: item.value,
                        })}
                        aria-current={isActive ? "page" : undefined}
                        className={getFilterLinkClass(isActive, "green")}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-2 lg:grid-cols-[44px_1fr] lg:items-center">
                <p className="text-xs font-medium text-white/45">频道</p>
                <div className="flex flex-wrap gap-2">
                  {channelFilterItems.map((item) => {
                    const isActive =
                      (filters.channel ?? "") === (item.value ?? "");

                    return (
                      <Link
                        key={item.label}
                        href={getSearchFilterHref(query, filters, {
                          channel: item.value,
                        })}
                        aria-current={isActive ? "page" : undefined}
                        className={getFilterLinkClass(isActive, "white")}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-2 lg:grid-cols-[44px_1fr] lg:items-center">
                <p className="text-xs font-medium text-white/45">年份</p>
                <div className="flex flex-wrap gap-2">
                  {yearItems.map((item) => {
                    const isActive = (filters.year ?? "") === (item.value ?? "");

                    return (
                      <Link
                        key={item.label}
                        href={getSearchFilterHref(query, filters, {
                          year: item.value,
                        })}
                        aria-current={isActive ? "page" : undefined}
                        className={getFilterLinkClass(isActive, "white")}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-2 lg:grid-cols-[44px_1fr] lg:items-center">
                <p className="text-xs font-medium text-white/45">清晰度</p>
                <div className="flex flex-wrap gap-2">
                  {qualityItems.map((item) => {
                    const isActive =
                      (filters.quality ?? "") === (item.value ?? "");

                    return (
                      <Link
                        key={item.label}
                        href={getSearchFilterHref(query, filters, {
                          quality: item.value,
                        })}
                        aria-current={isActive ? "page" : undefined}
                        className={getFilterLinkClass(isActive, "white")}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-2 lg:grid-cols-[44px_1fr] lg:items-center">
                <p className="text-xs font-medium text-white/45">排序</p>
                <div className="flex flex-wrap gap-2">
                  {sortItems.map((item) => {
                    const isActive = activeSort === item.value;

                    return (
                      <Link
                        key={item.label}
                        href={getSearchFilterHref(query, filters, {
                          sort: item.value,
                        })}
                        aria-current={isActive ? "page" : undefined}
                        className={getFilterLinkClass(isActive, "white")}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {hasResults ? (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {displayVideos.map((video) => (
            <VideoPosterCard
              key={video.id}
              highlightQuery={query}
              returnHref={returnHref}
              video={video}
              titleAs="h2"
            />
          ))}
        </div>
      ) : (
        <EmptyState className="mt-6" preset="search-empty" />
      )}
    </section>
  );
}
