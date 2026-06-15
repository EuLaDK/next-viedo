import type { RankSort } from "./mock-videos";

type RankFilterUrlState = {
  channel?: string;
  sort?: RankSort;
};

const validRankSorts: RankSort[] = [
  "hot",
  "score",
  "new",
  "rising",
  "reputation",
  "vip",
];

const validRankChannels = [
  "all",
  "tv",
  "movie",
  "variety",
  "anime",
  "documentary",
  "kids",
  "vip",
];

// 读取 URL 查询参数；value 为字符串数组时取第一项，缺失时返回空字符串。
function getRankParamValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

// 规范化排行榜排序参数；sortValue 非法时回落到热度榜。
export function getRankSort(
  sortValue: string | string[] | undefined,
): RankSort {
  const sort = getRankParamValue(sortValue);

  return validRankSorts.includes(sort as RankSort)
    ? (sort as RankSort)
    : "hot";
}

// 规范化排行榜频道参数；channelValue 非法时回落到全部频道。
export function getRankChannel(
  channelValue: string | string[] | undefined,
): string {
  const channel = getRankParamValue(channelValue);

  return validRankChannels.includes(channel) ? channel : "all";
}

// 生成排行榜筛选链接；默认热度榜和全部频道不写入 URL，保持地址简洁。
export function getRankFilterHref(
  filters: RankFilterUrlState,
  nextFilters: RankFilterUrlState,
): string {
  const mergedFilters = {
    ...filters,
    ...nextFilters,
  };
  const searchParams = new URLSearchParams();

  if (mergedFilters.sort && mergedFilters.sort !== "hot") {
    searchParams.set("sort", mergedFilters.sort);
  }

  if (mergedFilters.channel && mergedFilters.channel !== "all") {
    searchParams.set("channel", mergedFilters.channel);
  }

  const queryString = searchParams.toString();

  return queryString ? `/rank?${queryString}` : "/rank";
}
