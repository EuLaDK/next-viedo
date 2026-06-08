export type WatchHistoryIdentity = {
  id: string;
  episode?: number;
  watchSeconds?: number;
};

export type WatchHistoryTimestamped = WatchHistoryIdentity & {
  watchedAt: number;
};

type WatchHistoryProgressInput = {
  progress: string;
  durationSeconds?: number;
  watchSeconds?: number;
};

/* 生成观看历史跳转地址；item 包含视频 id、可选集数和可选回看秒数。 */
export function getWatchHistoryHref(item: WatchHistoryIdentity): string {
  const searchParams = new URLSearchParams();
  const watchSeconds = Math.floor(item.watchSeconds ?? 0);

  if (item.episode) {
    searchParams.set("episode", String(item.episode));
  }

  if (watchSeconds > 0) {
    searchParams.set("t", String(watchSeconds));
  }

  const queryString = searchParams.toString();

  return queryString ? `/watch/${item.id}?${queryString}` : `/watch/${item.id}`;
}

/* 格式化观看进度文案；durationSeconds 无效时仅返回原始进度标签。 */
export function formatWatchProgressLabel(
  item: WatchHistoryProgressInput,
): string {
  const watchSeconds = item.watchSeconds ?? 0;
  const durationSeconds = item.durationSeconds ?? 0;

  if (watchSeconds <= 0 || durationSeconds <= 0) {
    return item.progress;
  }

  const percent = Math.min(
    100,
    Math.max(1, Math.round((watchSeconds / durationSeconds) * 100)),
  );

  return `${item.progress} · 看到 ${percent}%`;
}

/* 判断两条历史是否指向同一视频同一集；未传 episode 时按第 1 集处理。 */
export function isSameWatchHistoryItem(
  firstItem: WatchHistoryIdentity,
  secondItem: WatchHistoryIdentity,
): boolean {
  return (
    firstItem.id === secondItem.id &&
    (firstItem.episode ?? 1) === (secondItem.episode ?? 1)
  );
}

/* 按最近观看时间排序历史列表；返回新数组，避免修改 store 中的原列表。 */
export function sortWatchHistoryItems<TItem extends WatchHistoryTimestamped>(
  items: TItem[],
): TItem[] {
  return [...items].sort(
    (firstItem, secondItem) => secondItem.watchedAt - firstItem.watchedAt,
  );
}
