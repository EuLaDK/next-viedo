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
  updateAccountProfile,
} from "@/lib/account-api";
import {
  defaultUserProfile,
  createLoginProfile,
  getActivatedVipState,
  getNextLoginState,
  getNextVipState,
} from "@/lib/user-profile";
import type { UserLoginInput, UserProfileState } from "@/lib/user-profile";
import type { UserProfileInput } from "@/lib/user-profile";
import { useFavoriteStore } from "@/stores/use-favorite-store";
import { useWatchHistoryStore } from "@/stores/use-watch-history-store";

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
  updateProfile: (input: UserProfileInput) => Promise<void>;
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

// 读取账号缓存隔离键；profile 为当前或服务端返回的用户资料。
function getAccountCacheKey(profile: Pick<UserProfileState, "email" | "id">) {
  return profile.id?.trim() || profile.email.trim();
}

// 判断账号缓存是否需要重置；current 为当前本地资料，next 为即将写入的资料。
function shouldResetAccountStores(
  current: UserProfileState,
  next: UserProfileState,
): boolean {
  if (!next.isLoggedIn) {
    return current.isLoggedIn;
  }

  return getAccountCacheKey(current) !== getAccountCacheKey(next);
}

// 判断是否需要使用本地持久化账号兜底；current 为当前本地资料，next 为 Cookie-only 查询结果。
function shouldRetryWithPersistedAccount(
  current: UserProfileState,
  next: UserProfileState,
): boolean {
  return current.isLoggedIn && !next.isLoggedIn && getAccountCacheKey(current) !== "";
}

// 读取当前账号资料；current 为本地资料，优先 Cookie 会话，缺失时用开发态账号头兜底。
async function loadCurrentProfile(current: UserProfileState) {
  const cookieProfile = await getAccountProfile({
    fallback: current,
    includeAccountHeader: false,
  });

  if (!shouldRetryWithPersistedAccount(current, cookieProfile)) {
    return cookieProfile;
  }

  return getAccountProfile({
    fallback: current,
    includeAccountHeader: true,
  });
}

// 清空账号相关本地列表；用于切换账号或退出登录时隔离收藏和观看历史缓存。
function resetLocalAccountStores() {
  useFavoriteStore.getState().resetLocalFavorites();
  useWatchHistoryStore.getState().resetLocalHistory();
}

// 重拉当前账号的收藏和观看历史；调用前会先清空旧账号本地列表，避免接口失败时展示旧数据。
async function reloadAccountStores() {
  resetLocalAccountStores();

  await Promise.all([
    useFavoriteStore.getState().syncFromApi(),
    useWatchHistoryStore.getState().syncFromApi(),
  ]);
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
          await reloadAccountStores();

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

        resetLocalAccountStores();
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
          await reloadAccountStores();

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
        const currentProfile = get();
        const profile = await loadCurrentProfile(currentProfile);

        set(() => ({
          ...profile,
        }));
        if (shouldResetAccountStores(currentProfile, profile)) {
          if (profile.isLoggedIn) {
            await reloadAccountStores();
            return;
          }

          resetLocalAccountStores();
        }
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
      /* 更新用户展示资料；input 为昵称、头像和手机号等可编辑字段。 */
      updateProfile: async (input) => {
        const fallbackProfile: UserProfileState = {
          ...get(),
          ...input,
          nickname: input.nickname.trim() || defaultUserProfile.nickname,
        };

        set(() => ({
          ...fallbackProfile,
        }));

        const profile = await updateAccountProfile(input, {
          fallback: fallbackProfile,
        });

        set(() => ({
          ...profile,
        }));
      },
    }),
    {
      name: "next-video-user",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
