"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  activateAccountVip,
  AccountApiError,
  getAccountProfile,
  loginAccount,
  logoutAccount,
  registerAccount,
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
  authError: string;
  authPending: boolean;
  clearAuthError: () => void;
  loginWithProfile: (input: UserLoginInput) => Promise<boolean>;
  logout: () => void;
  registerWithProfile: (input: UserLoginInput) => Promise<boolean>;
  syncFromApi: () => Promise<void>;
  toggleLogin: () => void;
  toggleVip: () => void;
};

// 转换认证错误文案；error 为账户接口或网络请求抛出的异常。
function getAuthErrorMessage(error: unknown): string {
  if (error instanceof AccountApiError) {
    switch (error.code) {
      case "invalid credentials":
        return "邮箱或密码不正确";
      case "email already registered":
        return "这个邮箱已经注册，可以直接登录";
      case "invalid auth input":
        return "请填写有效邮箱，密码至少 8 位";
      default:
        return "登录服务暂时不可用，请稍后再试";
    }
  }

  return "登录服务暂时不可用，请稍后再试";
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      ...defaultUserProfile,
      authError: "",
      authPending: false,
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
      // 清空认证错误提示；用于切换模式、重新输入和关闭弹窗。
      clearAuthError: () =>
        set(() => ({
          authError: "",
        })),
      /* 登录邮箱密码账号；input 为登录弹窗提交的邮箱和密码。 */
      loginWithProfile: async (input) => {
        const fallbackProfile = createLoginProfile(input);

        set(() => ({
          authError: "",
          authPending: true,
        }));

        try {
          const profile = await loginAccount(input, {
            fallback: fallbackProfile,
          });

          set(() => ({
            ...profile,
            authError: "",
            authPending: false,
          }));

          return true;
        } catch (error) {
          set(() => ({
            authError: getAuthErrorMessage(error),
            authPending: false,
          }));

          return false;
        }
      },
      /* 退出本地登录态；退出后同步清空 VIP 和联系方式。 */
      logout: () => {
        const logoutPromise = logoutAccount({ fallback: defaultUserProfile });

        set(() => ({
          ...defaultUserProfile,
          authError: "",
          authPending: false,
        }));
        void logoutPromise.then((profile) =>
          set(() => ({
            ...profile,
            authError: "",
            authPending: false,
          })),
        );
      },
      /* 注册邮箱密码账号；input 为注册弹窗提交的新账号资料。 */
      registerWithProfile: async (input) => {
        const fallbackProfile = createLoginProfile(input);

        set(() => ({
          authError: "",
          authPending: true,
        }));

        try {
          const profile = await registerAccount(input, {
            fallback: fallbackProfile,
          });

          set(() => ({
            ...profile,
            authError: "",
            authPending: false,
          }));

          return true;
        } catch (error) {
          set(() => ({
            authError: getAuthErrorMessage(error),
            authPending: false,
          }));

          return false;
        }
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
