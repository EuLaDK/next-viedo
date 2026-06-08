import { ChannelNav } from "@/components/home/channel-nav";
import { SiteHeader } from "@/components/home/site-header";
import { SearchResults } from "@/components/search/search-results";
import { searchVideosWithFilters } from "@/lib/mock-videos";
import type { SearchFilterState } from "@/lib/mock-videos";
import { getSearchParamValue, getSearchSort } from "@/lib/search-filter-url";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string | string[];
    sort?: string | string[];
    type?: string | string[];
  }>;
};

// 渲染搜索页入口；searchParams 包含当前关键词、类型筛选和排序状态。
export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, sort, type } = await searchParams;
  const query = getSearchParamValue(q).trim();
  const filters: SearchFilterState = {
    sort: getSearchSort(sort),
    type: getSearchParamValue(type).trim() || undefined,
  };
  const videos = searchVideosWithFilters(query, filters);

  return (
    <div className="min-h-screen bg-[#080b10] text-white">
      <SiteHeader />
      <ChannelNav />
      <main className="bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_28%),linear-gradient(180deg,#080b10_0%,#0d1117_100%)]">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
          <SearchResults query={query} videos={videos} filters={filters} />
        </div>
      </main>
    </div>
  );
}
