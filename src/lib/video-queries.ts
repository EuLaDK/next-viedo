import { channelItems, type ChannelItem } from "./channel-data";
import { featuredVideo, videoLibrary, type VideoItem } from "./video-data";
import { isVipVideoContent } from "./vip-membership";

export const channelSortValues = ["default", "new", "hot", "score"] as const;

export type ChannelSort = (typeof channelSortValues)[number];
export const searchSortValues = ["relevance", "new", "hot", "score"] as const;
export const rankSortValues = [
  "hot",
  "score",
  "new",
  "rising",
  "reputation",
  "vip",
] as const;

export type SearchSort = (typeof searchSortValues)[number];
export type RankSort = (typeof rankSortValues)[number];

export type ChannelFilterState = {
  type?: string;
  year?: string;
  sort?: ChannelSort;
};

export type SearchFilterState = {
  channel?: string;
  quality?: string;
  type?: string;
  year?: string;
  sort?: SearchSort;
};

export type RankFilterState = {
  channel?: string;
};

export function getChannelBySlug(slug: string): ChannelItem {
  return (
    channelItems.find((channel) => channel.slug === slug) ?? channelItems[0]
  );
}

// 判断视频是否匹配频道关键词；video 为候选视频，keywords 为频道关键词列表。
function matchesChannelKeywords(video: VideoItem, keywords: string[]): boolean {
  const searchableText = [
    video.title,
    video.subtitle,
    video.category,
    video.badge,
    video.progress,
    ...video.tags,
  ].join(" ");

  return keywords.some((keyword) => searchableText.includes(keyword));
}

// 判断视频是否命中单个筛选词；keyword 为空时默认不过滤。
function matchesVideoFilterKeyword(video: VideoItem, keyword?: string): boolean {
  const normalizedKeyword = keyword?.trim().toLowerCase();

  if (!normalizedKeyword) {
    return true;
  }

  const searchableText = [
    video.title,
    video.subtitle,
    video.category,
    video.badge,
    video.progress,
    ...video.tags,
  ]
    .join(" ")
    .toLowerCase();

  return searchableText.includes(normalizedKeyword);
}

// 判断视频是否匹配频道筛选；channelSlug 为空、全部或精选频道时不过滤。
function matchesVideoChannel(video: VideoItem, channelSlug?: string): boolean {
  if (!channelSlug || channelSlug === "all" || channelSlug === "featured") {
    return true;
  }

  const channel = channelItems.find((item) => item.slug === channelSlug);

  if (!channel) {
    return true;
  }

  return matchesChannelKeywords(video, channel.keywords);
}

// 判断视频是否可进入 VIP 榜；video 为候选视频，复用会员权益内容识别规则。
function matchesVipRank(video: VideoItem): boolean {
  return isVipVideoContent(video);
}

// 提取热度数值；mock 字符串里没有数字时按 0 处理，避免排序异常。
function getHeatValue(video: VideoItem): number {
  return Number(video.heat.replace(/\D/g, "")) || 0;
}

// 按频道排序选项返回新数组，避免修改原始 mock 数据顺序。
function sortChannelVideos(
  videos: VideoItem[],
  sort: ChannelSort = "default",
): VideoItem[] {
  const sortedVideos = [...videos];

  if (sort === "new") {
    return sortedVideos.sort(
      (firstVideo, secondVideo) =>
        Number(secondVideo.year) - Number(firstVideo.year) ||
        getHeatValue(secondVideo) - getHeatValue(firstVideo),
    );
  }

  if (sort === "hot") {
    return sortedVideos.sort(
      (firstVideo, secondVideo) =>
        getHeatValue(secondVideo) - getHeatValue(firstVideo),
    );
  }

  if (sort === "score") {
    return sortedVideos.sort(
      (firstVideo, secondVideo) =>
        Number(secondVideo.score) - Number(firstVideo.score),
    );
  }

  return sortedVideos;
}

// 按排行榜类型返回新数组；sort 控制热度、高分、新片、飙升、口碑或 VIP 榜。
function sortRankVideos(
  videos: VideoItem[],
  sort: RankSort = "hot",
): VideoItem[] {
  const sortedVideos = sort === "vip" ? videos.filter(matchesVipRank) : [...videos];

  if (sort === "score") {
    return sortedVideos.sort(
      (firstVideo, secondVideo) =>
        Number(secondVideo.score) - Number(firstVideo.score),
    );
  }

  if (sort === "new" || sort === "rising") {
    return sortedVideos.sort(
      (firstVideo, secondVideo) =>
        Number(secondVideo.year) - Number(firstVideo.year) ||
        getHeatValue(secondVideo) - getHeatValue(firstVideo),
    );
  }

  if (sort === "reputation") {
    return sortedVideos.sort(
      (firstVideo, secondVideo) =>
        Number(secondVideo.score) - Number(firstVideo.score) ||
        getHeatValue(secondVideo) - getHeatValue(firstVideo),
    );
  }

  return sortedVideos.sort(
    (firstVideo, secondVideo) =>
      getHeatValue(secondVideo) - getHeatValue(firstVideo),
  );
}

// 根据频道 slug 获取频道视频；slug 为 URL 中的频道标识，未命中或无结果时回退到精选内容。
export function getVideosByChannel(slug: string): VideoItem[] {
  const channel = getChannelBySlug(slug);

  if (channel.slug === "featured") {
    return videoLibrary;
  }

  const videos = videoLibrary.filter((video) =>
    matchesChannelKeywords(video, channel.keywords),
  );

  return videos.length > 0 ? videos : videoLibrary;
}

// 根据频道筛选状态获取视频；filters 对应频道页 URL 查询参数。
export function getFilteredChannelVideos(
  slug: string,
  filters: ChannelFilterState = {},
): VideoItem[] {
  const videos = getVideosByChannel(slug).filter(
    (video) =>
      matchesVideoFilterKeyword(video, filters.type) &&
      (!filters.year || video.year === filters.year),
  );

  return sortChannelVideos(videos, filters.sort);
}

// 获取全站排行榜视频；sort 控制榜单类型，filters 用于按频道收窄结果。
export function getRankedVideos(
  sort: RankSort = "hot",
  filters: RankFilterState = {},
): VideoItem[] {
  const videos = videoLibrary.filter((video) =>
    matchesVideoChannel(video, filters.channel),
  );

  return sortRankVideos(videos, sort);
}

// 根据关键词搜索视频；query 为用户输入的搜索词，空关键词时返回空数组。
export function searchVideos(query: string): VideoItem[] {
  const keyword = query.trim().toLowerCase();

  if (!keyword) {
    return [];
  }

  return videoLibrary.filter((video) => {
    const searchableText = [
      video.title,
      video.subtitle,
      video.description,
      video.category,
      video.badge,
      video.progress,
      video.year,
      video.region,
      ...video.tags,
      ...video.castNames,
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(keyword);
  });
}

// 根据关键词和筛选状态搜索视频；filters 对应搜索页 URL 查询参数。
export function searchVideosWithFilters(
  query: string,
  filters: SearchFilterState = {},
): VideoItem[] {
  const videos = searchVideos(query).filter(
    (video) =>
      matchesVideoFilterKeyword(video, filters.type) &&
      matchesVideoChannel(video, filters.channel) &&
      (!filters.year || video.year === filters.year) &&
      (!filters.quality || video.quality === filters.quality),
  );
  const sort = filters.sort === "relevance" ? "default" : filters.sort;

  return sortChannelVideos(videos, sort);
}

// 根据路由 id 获取视频详情；id 为 URL 中的视频标识，未命中时返回首页主推视频。
export function getVideoById(id: string): VideoItem {
  return videoLibrary.find((video) => video.id === id) ?? featuredVideo;
}

// 根据当前视频获取相关推荐；videoId 为当前视频标识，limit 控制最多返回数量。
export function getRelatedVideos(videoId: string, limit = 4): VideoItem[] {
  const currentVideo = getVideoById(videoId);
  const relatedVideos = currentVideo.relatedVideoIds
    .map((id) => videoLibrary.find((video) => video.id === id))
    .filter((video): video is VideoItem => Boolean(video));

  if (relatedVideos.length >= limit) {
    return relatedVideos.slice(0, limit);
  }

  const fallbackVideos = videoLibrary.filter(
    (video) =>
      video.id !== currentVideo.id &&
      !relatedVideos.some((relatedVideo) => relatedVideo.id === video.id),
  );

  return [...relatedVideos, ...fallbackVideos].slice(0, limit);
}
