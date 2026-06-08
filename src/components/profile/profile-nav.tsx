"use client";

import { Clock3, Crown, Download, Heart, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const navItems = [
  { label: "我的首页", href: "/profile", icon: UserRound },
  { label: "观看历史", href: "/profile/history", icon: Clock3 },
  { label: "追剧收藏", href: "/profile/favorites", icon: Heart },
  { label: "离线缓存", href: "/profile/cache", icon: Download },
  { label: "VIP会员", href: "/profile/vip", icon: Crown },
];

// 渲染个人中心导航；根据当前 pathname 高亮对应入口。
export function ProfileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="个人中心导航"
      className="flex gap-2 overflow-x-auto rounded-lg border border-white/10 bg-white/[0.04] p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {navItems.map(({ label, href, icon: Icon }) => {
        const isActive =
          pathname === href || (href !== "/profile" && pathname.startsWith(href));

        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-emerald-400 text-[#06130d]"
                : "text-white/62 hover:bg-white/8 hover:text-white",
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
