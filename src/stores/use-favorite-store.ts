"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type FavoriteItem = {
  id: string;
  title: string;
  category: string;
  progress: string;
  coverGradient: string;
  description: string;
  addedAt: number;
};

type FavoriteInput = Omit<FavoriteItem, "addedAt">;

type FavoriteStore = {
  items: FavoriteItem[];
  toggleFavorite: (video: FavoriteInput) => void;
  removeFavorite: (id: string) => void;
  clearFavorites: () => void;
  isFavorite: (id: string) => boolean;
};

export const useFavoriteStore = create<FavoriteStore>()(
  persist(
    (set, get) => ({
      items: [],
      // 切换追剧状态；video 为当前视频的收藏摘要。
      toggleFavorite: (video) =>
        set((state) => {
          const isFavorite = state.items.some((item) => item.id === video.id);

          if (isFavorite) {
            return {
              items: state.items.filter((item) => item.id !== video.id),
            };
          }

          return {
            items: [{ ...video, addedAt: Date.now() }, ...state.items],
          };
        }),
      // 移除单条追剧内容；id 为视频唯一标识。
      removeFavorite: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
      // 清空全部追剧内容；用于追剧列表页的批量清理。
      clearFavorites: () => set({ items: [] }),
      // 判断指定视频是否已追剧；id 为视频唯一标识。
      isFavorite: (id) => get().items.some((item) => item.id === id),
    }),
    {
      name: "next-video-favorites",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
