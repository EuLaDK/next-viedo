"use client";

import {
  Crown,
  Download,
  Heart,
  History,
  LogIn,
  LogOut,
  Menu,
  Search,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { LoginDialog } from "@/components/auth/login-dialog";
import { WatchHistoryButton } from "@/components/home/watch-history-button";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  createHeaderNavItems,
  headerUserMenuItems,
  isSiteHeaderLinkActive,
} from "@/lib/site-header-links";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { getHydrationSafeValue } from "@/lib/hydration-state";
import { cn } from "@/lib/utils";
import { createUserDisplayState } from "@/lib/user-profile";
import { primaryChannels } from "@/lib/mock-videos";
import {
  formatWatchProgressLabel,
  getWatchHistoryHref,
  sortWatchHistoryItems,
} from "@/lib/watch-history";
import { useAuthDialogStore } from "@/stores/use-auth-dialog-store";
import { useUserStore } from "@/stores/use-user-store";
import { useWatchHistoryStore } from "@/stores/use-watch-history-store";

const userMenuIcons = [UserRound, History, Heart, Download, Crown];
const headerNavItems = createHeaderNavItems(primaryChannels);

/* 渲染搜索表单；className 用于区分桌面搜索框和移动端下拉搜索框。 */
function HeaderSearchForm({ className }: { className?: string }) {
  return (
    <form action="/search" method="GET" className={className}>
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
  );
}

/* 渲染移动端搜索入口；小屏点击图标后展开搜索表单。 */
function MobileSearchMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-white/70 hover:bg-white/10 hover:text-white md:hidden"
          aria-label="打开搜索"
          title="搜索"
        >
          <Search className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[min(calc(100vw-2rem),22rem)] border border-white/10 bg-[#0b0f16] p-3 text-white"
      >
        <DropdownMenuLabel className="px-1 text-white/58">
          搜索内容
        </DropdownMenuLabel>
        <HeaderSearchForm className="relative mt-2" />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* 渲染移动端更多导航；pathname 用于高亮当前频道或页面。 */
function MobileNavMenu({ pathname }: { pathname: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-white/70 hover:bg-white/10 hover:text-white lg:hidden"
          aria-label="打开频道导航"
          title="频道"
        >
          <Menu className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 border border-white/10 bg-[#0b0f16] p-2 text-white"
      >
        <DropdownMenuLabel className="px-2 text-white/58">
          频道导航
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />
        <div className="grid grid-cols-2 gap-1">
          {headerNavItems.map((item) => {
            const isActive = isSiteHeaderLinkActive(item.href, pathname);

            return (
              <DropdownMenuItem
                key={item.href}
                asChild
                className={cn(
                  "cursor-pointer px-2 py-2 text-white/72 focus:bg-white/10 focus:text-white",
                  isActive &&
                    "bg-emerald-400 text-[#06130d] focus:bg-emerald-300 focus:text-[#06130d]",
                )}
              >
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </DropdownMenuItem>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* 渲染用户菜单；当前使用演示态用户，后续接入登录接口时可从 store 注入。 */
function UserMenu({ pathname }: { pathname: string }) {
  const hasMounted = useHasMounted();
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);
  const isVip = useUserStore((state) => state.isVip);
  const email = useUserStore((state) => state.email);
  const nickname = useUserStore((state) => state.nickname);
  const phone = useUserStore((state) => state.phone);
  const vipUntil = useUserStore((state) => state.vipUntil);
  const openAuthDialog = useAuthDialogStore((state) => state.openAuthDialog);
  const logout = useUserStore((state) => state.logout);
  const toggleVip = useUserStore((state) => state.toggleVip);
  const historyItems = useWatchHistoryStore((state) => state.items);
  const safeHistoryItems = getHydrationSafeValue(hasMounted, historyItems, []);
  const safeIsLoggedIn = getHydrationSafeValue(hasMounted, isLoggedIn, false);
  const safeIsVip = getHydrationSafeValue(hasMounted, isVip, false);
  const recentHistoryItems = sortWatchHistoryItems(safeHistoryItems).slice(0, 3);
  const userDisplay = createUserDisplayState({
    isLoggedIn: safeIsLoggedIn,
    isVip: safeIsVip,
    email: getHydrationSafeValue(hasMounted, email, ""),
    nickname: getHydrationSafeValue(hasMounted, nickname, ""),
    phone: getHydrationSafeValue(hasMounted, phone, ""),
    vipUntil: getHydrationSafeValue(hasMounted, vipUntil, ""),
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-white/70 hover:bg-white/10 hover:text-white"
          aria-label="打开用户菜单"
          title="用户中心"
        >
          <UserRound className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-64 border border-white/10 bg-[#0b0f16] p-2 text-white"
      >
        <DropdownMenuLabel className="px-2 py-2">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-emerald-400 text-sm font-black text-[#07110c]">
              {userDisplay.avatarInitial}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-white">
                {userDisplay.title}
              </span>
              <span className="mt-0.5 block truncate text-xs text-emerald-200/70">
                {userDisplay.subtitle}
              </span>
            </span>
            <span className="ml-auto shrink-0 rounded-full bg-white/10 px-2 py-1 text-[0.65rem] font-semibold text-white/64">
              {userDisplay.badgeLabel}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />
        {headerUserMenuItems.map((item, index) => {
          const Icon = userMenuIcons[index] ?? UserRound;
          const isActive = isSiteHeaderLinkActive(item.href, pathname);

          return (
            <DropdownMenuItem
              key={item.href}
              asChild
              className={cn(
                "cursor-pointer px-2 py-2 text-white/72 focus:bg-white/10 focus:text-white",
                isActive &&
                  "bg-white/10 text-white [&_svg]:text-emerald-200",
              )}
            >
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="size-4 text-emerald-300" />
                <span>{item.label}</span>
              </Link>
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuLabel className="px-2 text-white/58">
          最近观看
        </DropdownMenuLabel>
        {recentHistoryItems.length > 0 ? (
          recentHistoryItems.map((item) => (
            <DropdownMenuItem
              key={`${item.id}-${item.episode ?? "latest"}`}
              asChild
              className="cursor-pointer px-2 py-2 text-white/72 focus:bg-white/10 focus:text-white"
            >
              <Link href={getWatchHistoryHref(item)} className="min-w-0">
                <History className="size-4 shrink-0 text-emerald-300" />
                <span className="min-w-0">
                  <span className="block truncate text-sm">{item.title}</span>
                  <span className="mt-0.5 block truncate text-xs text-white/42">
                    {formatWatchProgressLabel(item)}
                  </span>
                </span>
              </Link>
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem
            asChild
            className="cursor-pointer px-2 py-2 text-white/52 focus:bg-white/10 focus:text-white"
          >
            <Link href="/profile/history">
              <History className="size-4 text-emerald-300" />
              <span>暂无记录，去看看历史页</span>
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem
          className="cursor-pointer px-2 py-2 text-white/72 focus:bg-white/10 focus:text-white"
          onSelect={() => {
            if (safeIsLoggedIn) {
              logout();
              return;
            }

            openAuthDialog("登录");
          }}
        >
          {safeIsLoggedIn ? (
            <LogOut className="size-4 text-emerald-300" />
          ) : (
            <LogIn className="size-4 text-emerald-300" />
          )}
          <span>{safeIsLoggedIn ? "退出登录" : "登录账号"}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={!safeIsLoggedIn}
          className="cursor-pointer px-2 py-2 text-white/72 focus:bg-white/10 focus:text-white data-disabled:cursor-not-allowed data-disabled:text-white/30"
          onSelect={toggleVip}
        >
          <Crown className="size-4 text-emerald-300" />
          <span>{safeIsVip ? "关闭 VIP 演示" : "开通 VIP 演示"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* 渲染视频网站首页顶部导航；包含频道入口、搜索、历史和用户菜单。 */
export function SiteHeader() {
  const hasMounted = useHasMounted();
  const isVip = useUserStore((state) => state.isVip);
  const syncUserFromApi = useUserStore((state) => state.syncFromApi);
  const syncHistoryFromApi = useWatchHistoryStore((state) => state.syncFromApi);
  const pathname = usePathname();
  const isVipPage = isSiteHeaderLinkActive("/profile/vip", pathname);
  const safeIsVip = getHydrationSafeValue(hasMounted, isVip, false);

  useEffect(() => {
    void syncUserFromApi();
    void syncHistoryFromApi();
  }, [syncHistoryFromApi, syncUserFromApi]);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080b10]/95 text-white backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6 lg:gap-4">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-lg font-bold"
          aria-label="Next Video 首页"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-400 text-sm font-black text-[#07110c]">
            N
          </span>
          <span className="hidden sm:inline">Next Video</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="主导航">
          {headerNavItems.map((item) => {
            const isActive = isSiteHeaderLinkActive(item.href, pathname);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-2 text-sm transition-colors hover:bg-white/8 hover:text-white",
                  isActive
                    ? "bg-emerald-400 text-[#06130d] hover:bg-emerald-300 hover:text-[#06130d]"
                    : "text-white/72",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <HeaderSearchForm className="relative ml-auto hidden min-w-0 flex-1 max-w-md md:block" />

        <div className="ml-auto flex shrink-0 items-center gap-1 md:ml-0">
          <MobileNavMenu pathname={pathname} />
          <MobileSearchMenu />
          <WatchHistoryButton />
          <Button
            asChild
            variant="ghost"
            size="icon"
            className={
              safeIsVip || isVipPage
                ? "text-emerald-300 hover:bg-white/10 hover:text-emerald-200"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            }
            aria-label={safeIsVip ? "VIP 已开通" : "VIP 会员"}
            title={safeIsVip ? "VIP 已开通" : "VIP 会员"}
          >
            <Link href="/profile/vip">
              <Crown className="size-4" />
            </Link>
          </Button>
          <UserMenu pathname={pathname} />
        </div>
        </div>
      </header>
      <LoginDialog />
    </>
  );
}
