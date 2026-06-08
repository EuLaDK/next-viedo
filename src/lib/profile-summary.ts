export type ProfileSummaryInput = {
  cacheCount: number;
  favoriteCount: number;
  historyCount: number;
};

export type ProfileSummaryCard = {
  label: string;
  value: string;
  href: string;
  description: string;
};

// 创建个人中心概览卡片数据；input 提供当前本地 store 中的历史和追剧数量。
export function createProfileSummaryCards(
  input: ProfileSummaryInput,
): ProfileSummaryCard[] {
  return [
    {
      label: "观看历史",
      value: String(input.historyCount),
      href: "/profile/history",
      description: "最近看过的内容",
    },
    {
      label: "追剧收藏",
      value: String(input.favoriteCount),
      href: "/profile/favorites",
      description: "已加入片单的内容",
    },
    {
      label: "离线缓存",
      value: String(input.cacheCount),
      href: "/profile/cache",
      description: "已加入缓存的内容",
    },
    {
      label: "VIP会员",
      value: "未开通",
      href: "/profile/vip",
      description: "会员权益入口",
    },
  ];
}
