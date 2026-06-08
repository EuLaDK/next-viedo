export type WatchInteractionInput = {
  videoId: string;
  content: string;
  createdAt: number;
};

export type WatchCommentItem = WatchInteractionInput & {
  id: string;
  author: string;
  likes: number;
};

export type WatchDanmakuItem = WatchInteractionInput & {
  id: string;
};

export type DanmakuOverlayOptions = {
  delayStep?: number;
  duration?: number;
  limit?: number;
  trackCount?: number;
};

export type DanmakuOverlayItem<TItem> = TItem & {
  delay: number;
  duration: number;
  topPercent: number;
  trackIndex: number;
};

const DEFAULT_DANMAKU_OVERLAY_LIMIT = 8;
const DEFAULT_DANMAKU_TRACK_COUNT = 4;
const DEFAULT_DANMAKU_DURATION = 12;
const DEFAULT_DANMAKU_DELAY_STEP = 1.4;
const DANMAKU_TOP_START = 12;
const DANMAKU_TRACK_GAP = 16;

// 创建互动 id；videoId、createdAt 和内容长度共同组成，避免常规输入下重复。
function createInteractionId(
  videoId: string,
  content: string,
  createdAt: number,
): string {
  return `${videoId}-${createdAt}-${content.length}`;
}

// 创建评论数据；content 为空时返回 null，避免写入无效评论。
export function createWatchComment(
  input: WatchInteractionInput,
): WatchCommentItem | null {
  const content = input.content.trim();

  if (!content) {
    return null;
  }

  return {
    id: createInteractionId(input.videoId, content, input.createdAt),
    videoId: input.videoId,
    content,
    createdAt: input.createdAt,
    author: "我",
    likes: 0,
  };
}

// 创建弹幕数据；content 为空时返回 null，避免写入无效弹幕。
export function createWatchDanmaku(
  input: WatchInteractionInput,
): WatchDanmakuItem | null {
  const content = input.content.trim();

  if (!content) {
    return null;
  }

  return {
    id: createInteractionId(input.videoId, content, input.createdAt),
    videoId: input.videoId,
    content,
    createdAt: input.createdAt,
  };
}

// 按创建时间倒序排序评论；返回新数组，避免修改原列表。
export function sortWatchComments<TItem extends { createdAt: number }>(
  comments: TItem[],
): TItem[] {
  return [...comments].sort(
    (firstComment, secondComment) =>
      secondComment.createdAt - firstComment.createdAt,
  );
}

// 限制弹幕数量；先按最新排序，再保留指定数量。
export function limitWatchDanmakuItems<TItem extends { createdAt: number }>(
  items: TItem[],
  limit: number,
): TItem[] {
  return sortWatchComments(items).slice(0, limit);
}

// 生成播放器弹幕浮层数据；items 为原始弹幕，options 控制轨道数、数量和动画节奏。
export function createDanmakuOverlayItems<
  TItem extends { createdAt: number },
>(
  items: TItem[],
  options: DanmakuOverlayOptions = {},
): DanmakuOverlayItem<TItem>[] {
  const trackCount = Math.max(
    1,
    options.trackCount ?? DEFAULT_DANMAKU_TRACK_COUNT,
  );
  const delayStep = options.delayStep ?? DEFAULT_DANMAKU_DELAY_STEP;
  const duration = options.duration ?? DEFAULT_DANMAKU_DURATION;
  const visibleItems = limitWatchDanmakuItems(
    items,
    options.limit ?? DEFAULT_DANMAKU_OVERLAY_LIMIT,
  );

  return visibleItems.map((item, index) => {
    const trackIndex = index % trackCount;

    return {
      ...item,
      delay: Number((index * delayStep).toFixed(2)),
      duration,
      topPercent: DANMAKU_TOP_START + trackIndex * DANMAKU_TRACK_GAP,
      trackIndex,
    };
  });
}
