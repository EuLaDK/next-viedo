"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  addWatchComment,
  addWatchDanmaku,
  deleteWatchComment,
  getWatchComments,
  getWatchDanmaku,
  toggleWatchCommentLike as toggleWatchCommentLikeApi,
} from "@/lib/interaction-api";
import {
  createWatchComment,
  createWatchDanmaku,
  deleteOwnWatchComment,
  getWatchDanmakuSendState,
  limitWatchDanmakuItems,
  sortWatchComments,
  toggleWatchCommentLike,
  type WatchDanmakuColor,
  type WatchCommentItem,
  type WatchCommentSort,
  type WatchDanmakuItem,
} from "@/lib/watch-interactions";

type WatchInteractionInput = {
  videoId: string;
  content: string;
  color?: WatchDanmakuColor;
};

type WatchInteractionStore = {
  commentsByVideoId: Record<string, WatchCommentItem[]>;
  danmakuByVideoId: Record<string, WatchDanmakuItem[]>;
  addComment: (input: WatchInteractionInput) => void;
  addDanmaku: (input: WatchInteractionInput) => void;
  deleteComment: (videoId: string, commentId: string) => void;
  syncCommentsFromApi: (videoId: string, sort?: WatchCommentSort) => Promise<void>;
  syncDanmakuFromApi: (videoId: string) => Promise<void>;
  toggleCommentLike: (videoId: string, commentId: string) => void;
};

const MAX_COMMENT_COUNT = 50;
const MAX_DANMAKU_COUNT = 20;

export const useWatchInteractionStore = create<WatchInteractionStore>()(
  persist(
    (set, get) => ({
      commentsByVideoId: {},
      danmakuByVideoId: {},
      // 添加评论；input 包含视频 id 和用户输入内容。
      addComment: (input) =>
        set((state) => {
          const comment = createWatchComment({
            ...input,
            createdAt: Date.now(),
          });

          if (!comment) {
            return state;
          }

          void addWatchComment(
            input.videoId,
            { content: comment.content },
            { fallback: comment },
          ).then((savedComment) =>
            set((currentState) => ({
              commentsByVideoId: {
                ...currentState.commentsByVideoId,
                [input.videoId]: sortWatchComments([
                  savedComment,
                  ...(currentState.commentsByVideoId[input.videoId] ?? []).filter(
                    (item) =>
                      item.id !== comment.id && item.id !== savedComment.id,
                  ),
                ]).slice(0, MAX_COMMENT_COUNT),
              },
            })),
          );

          return {
            commentsByVideoId: {
              ...state.commentsByVideoId,
              [input.videoId]: sortWatchComments([
                comment,
                ...(state.commentsByVideoId[input.videoId] ?? []),
              ]).slice(0, MAX_COMMENT_COUNT),
            },
          };
        }),
      // 添加弹幕；input 包含视频 id 和用户输入内容。
      addDanmaku: (input) =>
        set((state) => {
          const currentDanmakuItems = state.danmakuByVideoId[input.videoId] ?? [];
          const createdAt = Date.now();
          const sendState = getWatchDanmakuSendState(
            currentDanmakuItems,
            createdAt,
          );

          if (!sendState.canSend) {
            return state;
          }

          const danmaku = createWatchDanmaku({
            ...input,
            createdAt,
          });

          if (!danmaku) {
            return state;
          }

          void addWatchDanmaku(
            input.videoId,
            { content: danmaku.content, color: danmaku.color },
            { fallback: danmaku },
          ).then((savedDanmaku) =>
            set((currentState) => ({
              danmakuByVideoId: {
                ...currentState.danmakuByVideoId,
                [input.videoId]: limitWatchDanmakuItems(
                  [
                    savedDanmaku,
                    ...(currentState.danmakuByVideoId[input.videoId] ?? []).filter(
                      (item) =>
                        item.id !== danmaku.id && item.id !== savedDanmaku.id,
                    ),
                  ],
                  MAX_DANMAKU_COUNT,
                ),
              },
            })),
          );

          return {
            danmakuByVideoId: {
              ...state.danmakuByVideoId,
              [input.videoId]: limitWatchDanmakuItems(
                [danmaku, ...(state.danmakuByVideoId[input.videoId] ?? [])],
                MAX_DANMAKU_COUNT,
              ),
            },
          };
        }),
      // 删除自己的评论；videoId 为视频 id，commentId 为目标评论 id。
      deleteComment: (videoId, commentId) => {
        void deleteWatchComment(videoId, commentId);
        set((state) => ({
          commentsByVideoId: {
            ...state.commentsByVideoId,
            [videoId]: deleteOwnWatchComment(
              state.commentsByVideoId[videoId] ?? [],
              commentId,
            ),
          },
        }));
      },
      // 从后端同步评论；videoId 为视频 id，sort 为后端排序方式。
      syncCommentsFromApi: async (videoId, sort = "latest") => {
        const items = await getWatchComments(videoId, {
          fallback: get().commentsByVideoId[videoId] ?? [],
          sort,
        });

        set((state) => ({
          commentsByVideoId: {
            ...state.commentsByVideoId,
            [videoId]: items,
          },
        }));
      },
      // 从后端同步弹幕；videoId 为视频 id。
      syncDanmakuFromApi: async (videoId) => {
        const items = await getWatchDanmaku(videoId, {
          fallback: get().danmakuByVideoId[videoId] ?? [],
        });

        set((state) => ({
          danmakuByVideoId: {
            ...state.danmakuByVideoId,
            [videoId]: items,
          },
        }));
      },
      // 切换评论点赞；videoId 为视频 id，commentId 为目标评论 id。
      toggleCommentLike: (videoId, commentId) =>
        set((state) => {
          const optimisticItems = toggleWatchCommentLike(
            state.commentsByVideoId[videoId] ?? [],
            commentId,
          );
          const fallback = optimisticItems.find((item) => item.id === commentId);

          if (fallback) {
            void toggleWatchCommentLikeApi(videoId, commentId, {
              fallback,
            }).then((savedComment) =>
              set((currentState) => ({
                commentsByVideoId: {
                  ...currentState.commentsByVideoId,
                  [videoId]: (currentState.commentsByVideoId[videoId] ?? []).map(
                    (item) =>
                      item.id === savedComment.id ? savedComment : item,
                  ),
                },
              })),
            );
          }

          return {
            commentsByVideoId: {
              ...state.commentsByVideoId,
              [videoId]: optimisticItems,
            },
          };
        }),
    }),
    {
      name: "next-video-watch-interactions",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
