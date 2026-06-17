import { requestApiWithFallback } from "./api-client";
import {
  createWatchComment,
  createWatchDanmaku,
  type WatchCommentItem,
  type WatchCommentSort,
  type WatchDanmakuColor,
  type WatchDanmakuItem,
} from "./watch-interactions";

type InteractionApiOptions<TData> = {
  baseUrl?: string;
  fallback?: TData;
};

type CommentListOptions = InteractionApiOptions<WatchCommentItem[]> & {
  sort?: WatchCommentSort;
};

type CommentInput = {
  content: string;
};

type DanmakuInput = {
  color?: WatchDanmakuColor;
  content: string;
};

// 获取指定视频评论；videoId 为视频唯一标识，options.sort 控制最新或最热排序。
export function getWatchComments(
  videoId: string,
  options: CommentListOptions = {},
): Promise<WatchCommentItem[]> {
  return requestApiWithFallback<WatchCommentItem[]>({
    baseUrl: options.baseUrl,
    fallback: () => options.fallback ?? [],
    params: {
      sort: options.sort,
    },
    path: `/videos/${encodeURIComponent(videoId)}/comments`,
  });
}

// 发送指定视频评论；videoId 为视频唯一标识，input.content 为评论内容。
export function addWatchComment(
  videoId: string,
  input: CommentInput,
  options: InteractionApiOptions<WatchCommentItem> = {},
): Promise<WatchCommentItem> {
  return requestApiWithFallback<WatchCommentItem>({
    baseUrl: options.baseUrl,
    fallback: () =>
      options.fallback ??
      createWatchComment({
        videoId,
        content: input.content,
        createdAt: Date.now(),
      })!,
    init: {
      body: JSON.stringify(input),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    },
    path: `/videos/${encodeURIComponent(videoId)}/comments`,
  });
}

// 切换指定评论点赞；videoId 和 commentId 分别定位视频和评论。
export function toggleWatchCommentLike(
  videoId: string,
  commentId: string,
  options: InteractionApiOptions<WatchCommentItem> = {},
): Promise<WatchCommentItem> {
  return requestApiWithFallback<WatchCommentItem>({
    baseUrl: options.baseUrl,
    fallback: () => options.fallback as WatchCommentItem,
    init: {
      method: "POST",
    },
    path: `/videos/${encodeURIComponent(videoId)}/comments/${encodeURIComponent(
      commentId,
    )}/like`,
  });
}

// 删除指定评论；videoId 和 commentId 分别定位视频和评论。
export function deleteWatchComment(
  videoId: string,
  commentId: string,
  options: InteractionApiOptions<void> = {},
): Promise<void> {
  return requestApiWithFallback<void>({
    baseUrl: options.baseUrl,
    fallback: () => options.fallback,
    init: {
      method: "DELETE",
    },
    path: `/videos/${encodeURIComponent(videoId)}/comments/${encodeURIComponent(
      commentId,
    )}`,
  });
}

// 获取指定视频弹幕；videoId 为视频唯一标识。
export function getWatchDanmaku(
  videoId: string,
  options: InteractionApiOptions<WatchDanmakuItem[]> = {},
): Promise<WatchDanmakuItem[]> {
  return requestApiWithFallback<WatchDanmakuItem[]>({
    baseUrl: options.baseUrl,
    fallback: () => options.fallback ?? [],
    path: `/videos/${encodeURIComponent(videoId)}/danmaku`,
  });
}

// 发送指定视频弹幕；videoId 为视频唯一标识，input 包含弹幕内容和颜色。
export function addWatchDanmaku(
  videoId: string,
  input: DanmakuInput,
  options: InteractionApiOptions<WatchDanmakuItem> = {},
): Promise<WatchDanmakuItem> {
  return requestApiWithFallback<WatchDanmakuItem>({
    baseUrl: options.baseUrl,
    fallback: () =>
      options.fallback ??
      createWatchDanmaku({
        videoId,
        content: input.content,
        color: input.color,
        createdAt: Date.now(),
      })!,
    init: {
      body: JSON.stringify(input),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    },
    path: `/videos/${encodeURIComponent(videoId)}/danmaku`,
  });
}
