"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  defaultUserProfile,
  createLoginProfile,
  getActivatedVipState,
  getNextLoginState,
  getNextVipState,
} from "@/lib/user-profile";
import type { UserLoginInput, UserProfileState } from "@/lib/user-profile";

type UserStore = UserProfileState & {
  activateVip: (vipUntil: string) => void;
  loginWithProfile: (input: UserLoginInput) => void;
  logout: () => void;
  toggleLogin: () => void;
  toggleVip: () => void;
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      ...defaultUserProfile,
      /* 开通本地 VIP 演示态；vipUntil 为套餐计算出的有效期。 */
      activateVip: (vipUntil) =>
        set((state) => ({
          ...state,
          ...getActivatedVipState(vipUntil),
          avatarUrl: state.avatarUrl,
          email: state.email,
          phone: state.phone,
        })),
      /* 写入本地登录资料；input 为登录弹窗提交的昵称和联系方式。 */
      loginWithProfile: (input) =>
        set(() => ({
          ...createLoginProfile(input),
        })),
      /* 退出本地登录态；退出后同步清空 VIP 和联系方式。 */
      logout: () =>
        set(() => ({
          ...defaultUserProfile,
        })),
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
