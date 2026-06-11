"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  defaultUserProfile,
  getNextLoginState,
  getNextVipState,
} from "@/lib/user-profile";
import type { UserProfileState } from "@/lib/user-profile";

type UserStore = UserProfileState & {
  toggleLogin: () => void;
  toggleVip: () => void;
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      ...defaultUserProfile,
      /* 切换本地登录演示态；退出时会同步关闭 VIP。 */
      toggleLogin: () =>
        set((state) => ({
          ...getNextLoginState(state),
        })),
      /* 切换本地 VIP 演示态；未登录时保持非 VIP。 */
      toggleVip: () =>
        set((state) => ({
          ...getNextVipState(state),
        })),
    }),
    {
      name: "next-video-user",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
