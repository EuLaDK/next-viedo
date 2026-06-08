import { Crown, Search, UserRound } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { WatchHistoryButton } from "@/components/home/watch-history-button";
import { primaryChannels } from "@/lib/mock-videos";

const actionItems = [
  { label: "VIP会员", icon: Crown, href: "/profile/vip" },
  { label: "用户中心", icon: UserRound, href: "/profile" },
];

// 渲染视频网站首页顶部导航；当前无参数，后续接入接口时可改为从 props 注入导航和用户状态。
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080b10]/95 text-white backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-lg font-bold"
          aria-label="Next Video 首页"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-400 text-sm font-black text-[#07110c]">
            N
          </span>
          <span>Next Video</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="主导航">
          {primaryChannels.map((item) => (
            <Link
              key={item.slug}
              href={item.slug === "featured" ? "/" : `/channel/${item.slug}`}
              className="rounded-md px-3 py-2 text-sm text-white/72 transition-colors hover:bg-white/8 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <form
          action="/search"
          method="GET"
          className="relative ml-auto hidden min-w-0 flex-1 max-w-md md:block"
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/45" />
          <input
            type="search"
            name="q"
            aria-label="搜索视频"
            placeholder="搜索电影、剧集、综艺"
            className="h-9 w-full rounded-full border border-white/10 bg-white/8 pl-9 pr-4 text-sm text-white outline-none transition-colors placeholder:text-white/38 focus:border-emerald-300/70 focus:bg-white/12"
          />
          <button type="submit" className="sr-only">
            搜索
          </button>
        </form>

        <div className="flex shrink-0 items-center gap-1">
          <WatchHistoryButton />
          {actionItems.map(({ label, icon: Icon, href }) => (
            <Button
              key={label}
              asChild={Boolean(href)}
              variant="ghost"
              size="icon"
              className="text-white/70 hover:bg-white/10 hover:text-white"
              aria-label={label}
              title={label}
            >
              {href ? (
                <Link href={href}>
                  <Icon className="size-4" />
                </Link>
              ) : (
                <Icon className="size-4" />
              )}
            </Button>
          ))}
        </div>
      </div>
    </header>
  );
}
