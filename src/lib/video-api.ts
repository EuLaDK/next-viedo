import { requestApiWithFallback } from "./api-client";
import {
  featuredVideo,
  getChannelBySlug,
  getFilteredChannelVideos,
  getRankedVideos,
  getRelatedVideos,
  getVideoById,
  getVideosByChannel,
  hotSearchKeywords,
  hotVideos,
  recommendationVideos,
  searchVideosWithFilters,
  videoLibrary,
  type ChannelFilterState,
  type ChannelItem,
  type RankFilterState,
  type RankSort,
  type SearchFilterState,
  type VideoItem,
} from "./mock-videos";

type HomePageData = {
  featuredVideo: VideoItem;
  hotVideos: VideoItem[];
  rankVideos: VideoItem[];
  recommendationVideos: VideoItem[];
};

type RankVideosDataParams = RankFilterState & {
  sort?: RankSort;
};

type ChannelPageDataParams = {
  filters?: ChannelFilterState;
  slug: string;
};

type ChannelPageData = {
  channel: ChannelItem;
  heroVideo: VideoItem;
  videos: VideoItem[];
};

type SearchPageDataParams = {
  filters?: SearchFilterState;
  query: string;
};

type SearchPageData = {
  hotSearchKeywords: string[];
  recommendationVideos: VideoItem[];
  videos: VideoItem[];
};

type WatchPageData = {
  relatedVideos: VideoItem[];
  video: VideoItem;
};

// 获取首页聚合数据；接口不可用时使用当前首页 mock 数据作为兜底。
export function getHomePageData(): Promise<HomePageData> {
  return requestApiWithFallback<HomePageData>({
    fallback: () => ({
      featuredVideo,
      hotVideos,
      rankVideos: getRankedVideos("hot").slice(0, 3),
      recommendationVideos,
    }),
    path: "/videos/home",
  });
}

// 获取排行榜视频数据；params 直接对应后端查询字段，接口不可用时回退到 mock 查询。
export function getRankedVideosData({
  channel,
  sort = "hot",
}: RankVideosDataParams): Promise<VideoItem[]> {
  return requestApiWithFallback<VideoItem[]>({
    fallback: () => getRankedVideos(sort, { channel }),
    params: {
      channel: channel === "all" ? undefined : channel,
      sort,
    },
    path: "/videos/rank",
  });
}

// 获取频道页数据；slug 为频道标识，filters 直接对应频道页查询参数。
export function getChannelPageData({
  filters = {},
  slug,
}: ChannelPageDataParams): Promise<ChannelPageData> {
  return requestApiWithFallback<ChannelPageData>({
    fallback: () => {
      const channel = getChannelBySlug(slug);
      const videos = getFilteredChannelVideos(channel.slug, filters);
      const fallbackVideos = getVideosByChannel(channel.slug);

      return {
        channel,
        heroVideo: videos[0] ?? fallbackVideos[0] ?? featuredVideo,
        videos,
      };
    },
    params: filters,
    path: `/videos/channel/${encodeURIComponent(slug)}`,
  });
}

// 获取搜索页数据；query 为搜索词，filters 直接对应搜索页筛选参数。
export function getSearchPageData({
  filters = {},
  query,
}: SearchPageDataParams): Promise<SearchPageData> {
  return requestApiWithFallback<SearchPageData>({
    fallback: () => ({
      hotSearchKeywords,
      recommendationVideos,
      videos: searchVideosWithFilters(query, filters),
    }),
    params: {
      ...filters,
      q: query,
    },
    path: "/videos/search",
  });
}

// 获取播放详情页数据；videoId 为路由视频 id，接口不可用时使用详情和相关推荐 mock。
export function getWatchPageData(videoId: string): Promise<WatchPageData> {
  return requestApiWithFallback<WatchPageData>({
    fallback: () => {
      const video = getVideoById(videoId);

      return {
        relatedVideos: getRelatedVideos(video.id),
        video,
      };
    },
    path: `/videos/${encodeURIComponent(videoId)}`,
  });
}

// 获取静态视频 id 列表；用于生成播放详情页静态路由参数。
export function getVideoIdsData(): Promise<string[]> {
  return requestApiWithFallback<string[]>({
    fallback: () => videoLibrary.map((video) => video.id),
    path: "/videos/ids",
  });
}
