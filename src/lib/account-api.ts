import { requestApiWithFallback } from "./api-client";
import {
  createLoginProfile,
  defaultUserProfile,
  getActivatedVipState,
  type UserLoginInput,
  type UserProfileState,
} from "./user-profile";
import type { FavoriteItem } from "@/stores/use-favorite-store";
import type { WatchHistoryItem } from "@/stores/use-watch-history-store";

type AccountApiOptions<TData> = {
  baseUrl?: string;
  fallback?: TData;
};

type DeleteAccountWatchHistoryOptions = AccountApiOptions<void> & {
  episode?: number;
};

type FavoriteInput = Omit<FavoriteItem, "addedAt">;
type WatchHistoryInput = Omit<WatchHistoryItem, "watchedAt">;

// 获取当前用户资料；options 可在测试中覆盖基础地址和兜底数据。
export function getAccountProfile(
  options: AccountApiOptions<UserProfileState> = {},
): Promise<UserProfileState> {
  return requestApiWithFallback<UserProfileState>({
    baseUrl: options.baseUrl,
    fallback: () => options.fallback ?? defaultUserProfile,
    path: "/me",
  });
}

// 登录当前开发态用户；input 为登录弹窗提交的昵称和联系方式。
export function loginAccount(
  input: UserLoginInput,
  options: AccountApiOptions<UserProfileState> = {},
): Promise<UserProfileState> {
  return requestApiWithFallback<UserProfileState>({
    baseUrl: options.baseUrl,
    fallback: () => options.fallback ?? createLoginProfile(input),
    init: {
      body: JSON.stringify(input),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    },
    path: "/me/login",
  });
}

// 退出当前开发态用户；options 可在测试中覆盖基础地址和兜底数据。
export function logoutAccount(
  options: AccountApiOptions<UserProfileState> = {},
): Promise<UserProfileState> {
  return requestApiWithFallback<UserProfileState>({
    baseUrl: options.baseUrl,
    fallback: () => options.fallback ?? defaultUserProfile,
    init: {
      method: "POST",
    },
    path: "/me/logout",
  });
}

// 开通当前用户 VIP；vipUntil 为套餐计算出的会员到期日。
export function activateAccountVip(
  vipUntil: string,
  options: AccountApiOptions<UserProfileState> = {},
): Promise<UserProfileState> {
  return requestApiWithFallback<UserProfileState>({
    baseUrl: options.baseUrl,
    fallback: () =>
      options.fallback ?? {
        ...defaultUserProfile,
        ...getActivatedVipState(vipUntil),
      },
    init: {
      body: JSON.stringify({ vipUntil }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    },
    path: "/me/vip",
  });
}

// 获取当前用户收藏；options 可在测试中覆盖基础地址和兜底数据。
export function getAccountFavorites(
  options: AccountApiOptions<FavoriteItem[]> = {},
): Promise<FavoriteItem[]> {
  return requestApiWithFallback<FavoriteItem[]>({
    baseUrl: options.baseUrl,
    fallback: () => options.fallback ?? [],
    path: "/me/favorites",
  });
}

// 保存当前用户收藏；favorite 为播放页收藏摘要。
export function saveAccountFavorite(
  favorite: FavoriteInput,
  options: AccountApiOptions<FavoriteItem> = {},
): Promise<FavoriteItem> {
  return requestApiWithFallback<FavoriteItem>({
    baseUrl: options.baseUrl,
    fallback: () => options.fallback ?? { ...favorite, addedAt: Date.now() },
    init: {
      body: JSON.stringify(favorite),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    },
    path: "/me/favorites",
  });
}

// 删除当前用户收藏；videoId 为视频唯一标识。
export function deleteAccountFavorite(
  videoId: string,
  options: AccountApiOptions<void> = {},
): Promise<void> {
  return requestApiWithFallback<void>({
    baseUrl: options.baseUrl,
    fallback: () => options.fallback,
    init: {
      method: "DELETE",
    },
    path: `/me/favorites/${encodeURIComponent(videoId)}`,
  });
}

// 获取当前用户观看历史；options 可在测试中覆盖基础地址和兜底数据。
export function getAccountWatchHistory(
  options: AccountApiOptions<WatchHistoryItem[]> = {},
): Promise<WatchHistoryItem[]> {
  return requestApiWithFallback<WatchHistoryItem[]>({
    baseUrl: options.baseUrl,
    fallback: () => options.fallback ?? [],
    path: "/me/watch-history",
  });
}

// 保存当前用户观看历史；item 为播放页历史摘要。
export function saveAccountWatchHistory(
  item: WatchHistoryInput,
  options: AccountApiOptions<WatchHistoryItem> = {},
): Promise<WatchHistoryItem> {
  return requestApiWithFallback<WatchHistoryItem>({
    baseUrl: options.baseUrl,
    fallback: () => options.fallback ?? { ...item, watchedAt: Date.now() },
    init: {
      body: JSON.stringify(item),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    },
    path: "/me/watch-history",
  });
}

// 删除当前用户单条观看历史；videoId 为视频唯一标识，options.episode 可定位集数。
export function deleteAccountWatchHistory(
  videoId: string,
  options: DeleteAccountWatchHistoryOptions = {},
): Promise<void> {
  return requestApiWithFallback<void>({
    baseUrl: options.baseUrl,
    fallback: () => options.fallback,
    init: {
      method: "DELETE",
    },
    params: {
      episode: options.episode,
    },
    path: `/me/watch-history/${encodeURIComponent(videoId)}`,
  });
}

// 清空当前用户观看历史；options 可在测试中覆盖基础地址。
export function clearAccountWatchHistory(
  options: AccountApiOptions<void> = {},
): Promise<void> {
  return requestApiWithFallback<void>({
    baseUrl: options.baseUrl,
    fallback: () => options.fallback,
    init: {
      method: "DELETE",
    },
    path: "/me/watch-history",
  });
}
