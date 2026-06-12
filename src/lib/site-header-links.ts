type HeaderChannel = {
  label: string;
  slug: string;
};

export type SiteHeaderLink = {
  label: string;
  href: string;
};

export const headerUserMenuItems: SiteHeaderLink[] = [
  { label: "用户中心", href: "/profile" },
  { label: "观看历史", href: "/profile/history" },
  { label: "我的收藏", href: "/profile/favorites" },
  { label: "缓存中心", href: "/profile/cache" },
  { label: "VIP 会员", href: "/profile/vip" },
];

/* 生成顶部主导航链接；channels 为 mock 频道列表，最后固定追加排行榜入口。 */
export function createHeaderNavItems(
  channels: HeaderChannel[],
): SiteHeaderLink[] {
  return [
    ...channels.map((channel) => ({
      label: channel.label,
      href:
        channel.slug === "featured" ? "/" : `/channel/${channel.slug}`,
    })),
    { label: "排行榜", href: "/rank" },
  ];
}

/* 判断 Header 链接是否处于当前路径；href 为导航链接，pathname 为 Next 当前路径。 */
export function isSiteHeaderLinkActive(
  href: string,
  pathname: string,
): boolean {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
