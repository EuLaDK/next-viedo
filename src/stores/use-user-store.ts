"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  activateAccountVip,
  getAccountProfile,
  loginAccount,
  logoutAccount,
} from "@/lib/account-api";
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
  syncFromApi: () => Promise<void>;
  toggleLogin: () => void;
  toggleVip: () => void;
};

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      ...defaultUserProfile,
      /* 开通本地 VIP 演示态；vipUntil 为套餐计算出的有效期。 */
      activateVip: (vipUntil) => {
        const state = get();
        const fallbackProfile: UserProfileState = {
          ...getActivatedVipState(vipUntil),
          avatarUrl: state.avatarUrl,
          id: state.id,
          email: state.email,
          nickname: state.nickname,
          phone: state.phone,
        };

        set(() => ({
          ...fallbackProfile,
        }));
        void activateAccountVip(vipUntil, { fallback: fallbackProfile }).then(
          (profile) =>
            set(() => ({
              ...profile,
            })),
        );
      },
      /* 写入本地登录资料；input 为登录弹窗提交的昵称和联系方式。 */
      loginWithProfile: (input) => {
        const fallbackProfile = createLoginProfile(input);

        set(() => ({
          ...fallbackProfile,
        }));
        void loginAccount(input, { fallback: fallbackProfile }).then((profile) =>
          set(() => ({
            ...profile,
          })),
        );
      },
      /* 退出本地登录态；退出后同步清空 VIP 和联系方式。 */
      logout: () => {
        set(() => ({
          ...defaultUserProfile,
        }));
        void logoutAccount({ fallback: defaultUserProfile }).then((profile) =>
          set(() => ({
            ...profile,
          })),
        );
      },
      /* 从后端同步用户资料；接口不可用时保留当前本地资料。 */
      syncFromApi: async () => {
        const profile = await getAccountProfile({ fallback: get() });

        set(() => ({
          ...profile,
        }));
      },
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
