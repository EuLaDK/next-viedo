"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { addSearchHistoryQuery } from "@/lib/search-history";

type SearchHistoryStore = {
  items: string[];
  addQuery: (query: string) => void;
  clearHistory: () => void;
};

export const useSearchHistoryStore = create<SearchHistoryStore>()(
  persist(
    (set) => ({
      items: [],
      // 添加搜索关键词；query 为搜索页当前关键词。
      addQuery: (query) =>
        set((state) => ({
          items: addSearchHistoryQuery(state.items, query),
        })),
      // 清空搜索历史；用于搜索页历史区域。
      clearHistory: () => set({ items: [] }),
    }),
    {
      name: "next-video-search-history",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
