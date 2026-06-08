export type WatchSharePathInput = {
  videoId: string;
  episode: number;
  episodeCount: number;
};

const WATCH_ACTION_KEY_PREFIX = "watch-action:";

// 生成播放操作状态 key；videoId 为视频唯一标识。
export function getWatchActionKey(videoId: string): string {
  return `${WATCH_ACTION_KEY_PREFIX}${videoId}`;
}

// 生成当前播放分享路径；多集内容仅在非第一集时携带 episode 参数。
export function getWatchSharePath(input: WatchSharePathInput): string {
  if (input.episodeCount > 1 && input.episode > 1) {
    return `/watch/${input.videoId}?episode=${input.episode}`;
  }

  return `/watch/${input.videoId}`;
}

// 格式化点赞数；isLiked 为本地点赞状态，展示时追加本地点赞增量。
export function getDisplayLikeCount(
  baseCount: number,
  isLiked: boolean,
): string {
  const count = baseCount + (isLiked ? 1 : 0);

  if (count >= 10000) {
    const value = count / 10000;
    return `${Number.isInteger(value) ? value : value.toFixed(1)}万`;
  }

  return String(count);
}

// 从缓存状态表中提取已缓存的视频 id；cachedByKey 为 Zustand store 中的缓存映射。
export function getCachedVideoIds(
  cachedByKey: Record<string, boolean>,
): string[] {
  return Object.entries(cachedByKey)
    .filter(
      ([key, isCached]) =>
        isCached && key.startsWith(WATCH_ACTION_KEY_PREFIX),
    )
    .map(([key]) => key.slice(WATCH_ACTION_KEY_PREFIX.length))
    .sort();
}
