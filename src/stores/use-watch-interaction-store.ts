"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  createWatchComment,
  createWatchDanmaku,
  limitWatchDanmakuItems,
  sortWatchComments,
  type WatchCommentItem,
  type WatchDanmakuItem,
} from "@/lib/watch-interactions";

type WatchInteractionInput = {
  videoId: string;
  content: string;
};

type WatchInteractionStore = {
  commentsByVideoId: Record<string, WatchCommentItem[]>;
  danmakuByVideoId: Record<string, WatchDanmakuItem[]>;
  addComment: (input: WatchInteractionInput) => void;
  addDanmaku: (input: WatchInteractionInput) => void;
};

const MAX_COMMENT_COUNT = 50;
const MAX_DANMAKU_COUNT = 20;

export const useWatchInteractionStore = create<WatchInteractionStore>()(
  persist(
    (set) => ({
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
          const danmaku = createWatchDanmaku({
            ...input,
            createdAt: Date.now(),
          });

          if (!danmaku) {
            return state;
          }

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
    }),
    {
      name: "next-video-watch-interactions",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
