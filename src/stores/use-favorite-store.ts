"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  deleteAccountFavorite,
  getAccountFavorites,
  saveAccountFavorite,
} from "@/lib/account-api";

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
  syncFromApi: () => Promise<void>;
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
            void deleteAccountFavorite(video.id);

            return {
              items: state.items.filter((item) => item.id !== video.id),
            };
          }

          const nextItem = { ...video, addedAt: Date.now() };
          void saveAccountFavorite(video, { fallback: nextItem }).then((item) =>
            set((currentState) => ({
              items: [
                item,
                ...currentState.items.filter(
                  (currentItem) => currentItem.id !== item.id,
                ),
              ],
            })),
          );

          return {
            items: [nextItem, ...state.items],
          };
        }),
      // 移除单条追剧内容；id 为视频唯一标识。
      removeFavorite: (id) => {
        void deleteAccountFavorite(id);
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },
      // 清空全部追剧内容；用于追剧列表页的批量清理。
      clearFavorites: () => {
        const items = get().items;

        set({ items: [] });
        void Promise.all(items.map((item) => deleteAccountFavorite(item.id)));
      },
      // 判断指定视频是否已追剧；id 为视频唯一标识。
      isFavorite: (id) => get().items.some((item) => item.id === id),
      // 从后端同步追剧列表；接口不可用时保留当前本地列表。
      syncFromApi: async () => {
        const items = await getAccountFavorites({ fallback: get().items });

        set({ items });
      },
    }),
    {
      name: "next-video-favorites",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
