export type UserProfileState = {
  id?: string;
  avatarUrl: string;
  email: string;
  isLoggedIn: boolean;
  isVip: boolean;
  nickname: string;
  phone: string;
  vipUntil: string;
};

export type UserLoginInput = {
  avatarUrl?: string;
  contact?: string;
  email?: string;
  nickname?: string;
  password?: string;
};

export type UserDisplayState = {
  avatarInitial: string;
  badgeLabel: string;
  subtitle: string;
  title: string;
};

export type UserDisplayInput = Pick<
  UserProfileState,
  "isLoggedIn" | "isVip" | "nickname" | "vipUntil"
> &
  Partial<Pick<UserProfileState, "email" | "phone">>;

export type LoginRequiredPrompt = {
  actionLabel: string;
  description: string;
  title: string;
};

export const defaultUserProfile: UserProfileState = {
  avatarUrl: "",
  email: "",
  isLoggedIn: false,
  isVip: false,
  nickname: "Next Video 用户",
  phone: "",
  vipUntil: "",
};

// 判断联系方式是否为邮箱；contact 为登录弹窗输入的手机号或邮箱。
function isEmailContact(contact: string): boolean {
  return contact.includes("@");
}

// 生成登录后的本地用户资料；input 来自登录弹窗表单。
export function createLoginProfile(input: UserLoginInput): UserProfileState {
  const contact = input.email?.trim() || input.contact?.trim() || "";
  const nickname = input.nickname?.trim() || defaultUserProfile.nickname;

  return {
    avatarUrl: input.avatarUrl?.trim() ?? "",
    email: isEmailContact(contact) ? contact : "",
    isLoggedIn: true,
    isVip: false,
    nickname,
    phone: contact && !isEmailContact(contact) ? contact : "",
    vipUntil: "",
  };
}

// 生成受保护操作的登录提示；actionLabel 为用户尝试执行的动作名称。
export function createLoginRequiredPrompt(
  actionLabel: string,
): LoginRequiredPrompt {
  return {
    actionLabel,
    description: "登录后可以同步追剧、缓存和评论记录。",
    title: `登录后可${actionLabel}`,
  };
}

/* 生成用户展示状态；profile 为当前本地用户状态。 */
export function createUserDisplayState(
  profile: UserDisplayInput,
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
  const contact = profile.email || profile.phone;

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
    subtitle: contact || "可开通 VIP 解锁高清和抢先看",
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

/* 开通 VIP 状态；vipUntil 为本地演示有效期日期。 */
export function getActivatedVipState(
  vipUntil: string,
): Pick<
  UserProfileState,
  "avatarUrl" | "email" | "isLoggedIn" | "isVip" | "phone" | "vipUntil"
> {
  return {
    avatarUrl: "",
    email: "",
    isLoggedIn: true,
    isVip: true,
    phone: "",
    vipUntil,
  };
}
