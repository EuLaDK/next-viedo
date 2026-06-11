export type UserProfileState = {
  isLoggedIn: boolean;
  isVip: boolean;
  nickname: string;
  vipUntil: string;
};

export type UserDisplayState = {
  avatarInitial: string;
  badgeLabel: string;
  subtitle: string;
  title: string;
};

export const defaultUserProfile: UserProfileState = {
  isLoggedIn: true,
  isVip: true,
  nickname: "Next Video 用户",
  vipUntil: "2026-12-31",
};

/* 生成用户展示状态；profile 为当前本地用户状态。 */
export function createUserDisplayState(
  profile: UserProfileState,
): UserDisplayState {
  if (!profile.isLoggedIn) {
    return {
      avatarInitial: "N",
      badgeLabel: "未登录",
      subtitle: "登录后同步观看记录和会员权益",
      title: "未登录用户",
    };
  }

  const nickname = profile.nickname.trim() || defaultUserProfile.nickname;

  if (profile.isVip) {
    return {
      avatarInitial: nickname.slice(0, 1),
      badgeLabel: "VIP会员",
      subtitle: `VIP 有效期至 ${profile.vipUntil}`,
      title: nickname,
    };
  }

  return {
    avatarInitial: nickname.slice(0, 1),
    badgeLabel: "普通用户",
    subtitle: "可开通 VIP 解锁高清和抢先看",
    title: nickname,
  };
}

/* 切换登录状态；退出登录时同步关闭 VIP 演示态。 */
export function getNextLoginState(
  profile: Pick<UserProfileState, "isLoggedIn" | "isVip">,
): Pick<UserProfileState, "isLoggedIn" | "isVip"> {
  if (profile.isLoggedIn) {
    return {
      isLoggedIn: false,
      isVip: false,
    };
  }

  return {
    isLoggedIn: true,
    isVip: false,
  };
}

/* 切换 VIP 状态；未登录时不允许直接开启 VIP。 */
export function getNextVipState(
  profile: Pick<UserProfileState, "isLoggedIn" | "isVip">,
): Pick<UserProfileState, "isVip"> {
  if (!profile.isLoggedIn) {
    return {
      isVip: false,
    };
  }

  return {
    isVip: !profile.isVip,
  };
}
