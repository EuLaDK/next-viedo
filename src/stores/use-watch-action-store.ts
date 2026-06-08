"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { getWatchActionKey } from "@/lib/watch-actions";

type WatchActionStore = {
  cachedByKey: Record<string, boolean>;
  likedByKey: Record<string, boolean>;
  isCached: (videoId: string) => boolean;
  isLiked: (videoId: string) => boolean;
  removeCached: (videoId: string) => void;
  toggleCached: (videoId: string) => void;
  toggleLiked: (videoId: string) => void;
};

export const useWatchActionStore = create<WatchActionStore>()(
  persist(
    (set, get) => ({
      cachedByKey: {},
      likedByKey: {},
      // 判断视频是否已加入缓存；videoId 为视频唯一标识。
      isCached: (videoId) => Boolean(get().cachedByKey[getWatchActionKey(videoId)]),
      // 判断视频是否已点赞；videoId 为视频唯一标识。
      isLiked: (videoId) => Boolean(get().likedByKey[getWatchActionKey(videoId)]),
      // 移除缓存状态；videoId 为视频唯一标识。
      removeCached: (videoId) =>
        set((state) => {
          const key = getWatchActionKey(videoId);

          return {
            cachedByKey: {
              ...state.cachedByKey,
              [key]: false,
            },
          };
        }),
      // 切换缓存状态；videoId 为视频唯一标识。
      toggleCached: (videoId) =>
        set((state) => {
          const key = getWatchActionKey(videoId);

          return {
            cachedByKey: {
              ...state.cachedByKey,
              [key]: !state.cachedByKey[key],
            },
          };
        }),
      // 切换点赞状态；videoId 为视频唯一标识。
      toggleLiked: (videoId) =>
        set((state) => {
          const key = getWatchActionKey(videoId);

          return {
            likedByKey: {
              ...state.likedByKey,
              [key]: !state.likedByKey[key],
            },
          };
        }),
    }),
    {
      name: "next-video-watch-actions",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
