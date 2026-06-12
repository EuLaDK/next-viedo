"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { isSameWatchHistoryItem } from "@/lib/watch-history";

export type WatchHistoryItem = {
  id: string;
  title: string;
  category: string;
  progress: string;
  coverGradient: string;
  episode?: number;
  watchSeconds?: number;
  durationSeconds?: number;
  watchedAt: number;
};

type WatchHistoryInput = Omit<WatchHistoryItem, "watchedAt">;

type WatchHistoryStore = {
  items: WatchHistoryItem[];
  addHistory: (video: WatchHistoryInput) => void;
  removeHistory: (video: Pick<WatchHistoryItem, "id" | "episode">) => void;
  clearHistory: () => void;
};

const MAX_HISTORY_COUNT = 50;

export const useWatchHistoryStore = create<WatchHistoryStore>()(
  persist(
    (set) => ({
      items: [],
      /* 添加观看历史；video 为当前播放页的视频摘要信息。 */
      addHistory: (video) =>
        set((state) => {
          const nextItem = {
            ...video,
            watchedAt: Date.now(),
          };
          const nextItems = [
            nextItem,
            ...state.items.filter(
              (item) => !isSameWatchHistoryItem(item, video),
            ),
          ].slice(0, MAX_HISTORY_COUNT);

          return { items: nextItems };
        }),
      /* 移除单条观看历史；video 用于定位视频 id 和集数。 */
      removeHistory: (video) =>
        set((state) => ({
          items: state.items.filter(
            (item) => !isSameWatchHistoryItem(item, video),
          ),
        })),
      /* 清空观看历史；用于顶部历史浮层和历史页面里的清空操作。 */
      clearHistory: () => set({ items: [] }),
    }),
    {
      name: "next-video-watch-history",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
