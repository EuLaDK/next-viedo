import { ChannelFilterBar } from "@/components/channel/channel-filter-bar";
import { ChannelHero } from "@/components/channel/channel-hero";
import { ChannelVideoGrid } from "@/components/channel/channel-video-grid";
import { ChannelNav } from "@/components/home/channel-nav";
import { SiteHeader } from "@/components/home/site-header";
import {
  channelSortValues,
  type ChannelFilterState,
  channelItems,
  featuredVideo,
  getChannelBySlug,
  getFilteredChannelVideos,
  getVideosByChannel,
  type ChannelSort,
} from "@/lib/mock-videos";

type ChannelPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    type?: string | string[];
    year?: string | string[];
    sort?: string | string[];
  }>;
};

// 读取 URL 查询参数；数组时取第一个值，空值统一返回空字符串。
function getSearchParamValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

// 解析频道排序参数；未知值回退为综合排序。
function getChannelSort(sortValue: string): ChannelSort {
  return channelSortValues.includes(sortValue as ChannelSort)
    ? (sortValue as ChannelSort)
    : "default";
}

// 生成静态频道路径；让 mock 频道都能直接访问。
export function generateStaticParams() {
  return channelItems.map((channel) => ({
    slug: channel.slug,
  }));
}

// 渲染频道页入口；params 包含当前频道 slug。
export default async function ChannelPage({
  params,
  searchParams,
}: ChannelPageProps) {
  const { slug } = await params;
  const { type, year, sort } = await searchParams;
  const channel = getChannelBySlug(slug);
  const filters: ChannelFilterState = {
    type: getSearchParamValue(type).trim() || undefined,
    year: getSearchParamValue(year).trim() || undefined,
    sort: getChannelSort(getSearchParamValue(sort)),
  };
  const videos = getFilteredChannelVideos(channel.slug, filters);
  const fallbackVideos = getVideosByChannel(channel.slug);
  const heroVideo = videos[0] ?? fallbackVideos[0] ?? featuredVideo;

  return (
    <div className="min-h-screen bg-[#080b10] text-white">
      <SiteHeader />
      <ChannelNav activeSlug={channel.slug} />
      <main className="bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.14),transparent_30%),linear-gradient(180deg,#080b10_0%,#0d1117_100%)]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:py-8">
          <ChannelHero channel={channel} video={heroVideo} />
          <ChannelFilterBar channel={channel} filters={filters} />
          <ChannelVideoGrid videos={videos} />
        </div>
      </main>
    </div>
  );
}
