"use client";

import { Clock3, Crown, Download, Heart, Play } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { createProfileSummaryCards } from "@/lib/profile-summary";
import {
  formatWatchProgressLabel,
  getWatchHistoryHref,
  sortWatchHistoryItems,
} from "@/lib/watch-history";
import { useFavoriteStore } from "@/stores/use-favorite-store";
import { useWatchActionStore } from "@/stores/use-watch-action-store";
import { useWatchHistoryStore } from "@/stores/use-watch-history-store";

const summaryIcons = [Clock3, Heart, Download, Crown];

// 渲染个人中心总览；数据来自本地 Zustand store，先作为未登录演示态使用。
export function ProfileOverview() {
  const historyItems = useWatchHistoryStore((state) => state.items);
  const favoriteItems = useFavoriteStore((state) => state.items);
  const cachedByKey = useWatchActionStore((state) => state.cachedByKey);
  const recentHistoryItems = sortWatchHistoryItems(historyItems).slice(0, 3);
  const recentFavoriteItems = favoriteItems.slice(0, 3);
  const summaryCards = createProfileSummaryCards({
    cacheCount: Object.values(cachedByKey).filter(Boolean).length,
    favoriteCount: favoriteItems.length,
    historyCount: historyItems.length,
  });

  return (
    <section aria-labelledby="profile-title" className="text-white">
      <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-300">个人中心</p>
            <h1
              id="profile-title"
              className="mt-2 text-3xl font-bold tracking-normal"
            >
              我的 Next Video
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/58">
              管理你的观看历史和追剧收藏，之后会员权益、账号信息也会从这里进入。
            </p>
          </div>

          <Button
            asChild
            className="w-fit bg-emerald-400 text-[#06130d] hover:bg-emerald-300"
          >
            <Link href="/profile/history">
              <Play className="size-4 fill-current" />
              继续观看
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card, index) => {
          const Icon = summaryIcons[index] ?? Clock3;

          return (
            <Link
              key={card.href}
              href={card.href}
              className="group rounded-lg border border-white/10 bg-white/[0.04] p-4 transition-colors hover:border-emerald-300/35 hover:bg-white/[0.06]"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="flex size-10 items-center justify-center rounded-lg bg-white/8 text-emerald-300">
                  <Icon className="size-5" />
                </span>
                <span className="text-2xl font-bold text-white">
                  {card.value}
                </span>
              </div>
              <h2 className="mt-4 text-base font-semibold text-white transition-colors group-hover:text-emerald-200">
                {card.label}
              </h2>
              <p className="mt-1 text-sm text-white/48">{card.description}</p>
            </Link>
          );
        })}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="flex items-center gap-2 text-sm font-medium text-emerald-300">
                <Clock3 className="size-4" />
                最近观看
              </p>
              <h2 className="mt-1 text-xl font-semibold">继续上次进度</h2>
            </div>
            <Button
              asChild
              variant="ghost"
              className="text-white/60 hover:bg-white/10 hover:text-white"
            >
              <Link href="/profile/history">全部</Link>
            </Button>
          </div>

          {recentHistoryItems.length > 0 ? (
            <div className="space-y-3">
              {recentHistoryItems.map((item) => (
                <Link
                  key={`${item.id}-${item.episode ?? "latest"}`}
                  href={getWatchHistoryHref(item)}
                  className="group grid grid-cols-[7rem_1fr] gap-3 rounded-md border border-white/8 bg-white/[0.03] p-2 transition-colors hover:bg-white/[0.07]"
                >
                  <div
                    className="relative aspect-video overflow-hidden rounded border border-white/10"
                    style={{ background: item.background }}
                  >
                    <span className="absolute left-2 top-2 rounded bg-black/35 px-2 py-0.5 text-[0.7rem] font-medium text-white/78">
                      {item.progress}
                    </span>
                  </div>
                  <div className="min-w-0 self-center">
                    <p className="truncate text-sm font-semibold text-white transition-colors group-hover:text-emerald-200">
                      {item.title}
                    </p>
                    <p className="mt-1 truncate text-xs text-white/48">
                      {item.category}
                    </p>
                    <p className="mt-1 truncate text-xs text-emerald-200/70">
                      {formatWatchProgressLabel(item)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-white/12 bg-white/[0.03] p-6 text-center">
              <p className="text-sm font-semibold">暂无观看历史</p>
              <p className="mt-2 text-xs text-white/48">
                去播放页看一段视频后，这里会出现继续观看入口。
              </p>
            </div>
          )}
        </div>

        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="flex items-center gap-2 text-sm font-medium text-emerald-300">
                <Heart className="size-4 fill-current" />
                最近追剧
              </p>
              <h2 className="mt-1 text-xl font-semibold">收藏中的内容</h2>
            </div>
            <Button
              asChild
              variant="ghost"
              className="text-white/60 hover:bg-white/10 hover:text-white"
            >
              <Link href="/profile/favorites">全部</Link>
            </Button>
          </div>

          {recentFavoriteItems.length > 0 ? (
            <div className="space-y-3">
              {recentFavoriteItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/watch/${item.id}`}
                  className="group grid grid-cols-[7rem_1fr] gap-3 rounded-md border border-white/8 bg-white/[0.03] p-2 transition-colors hover:bg-white/[0.07]"
                >
                  <div
                    className="relative aspect-video overflow-hidden rounded border border-white/10"
                    style={{ background: item.background }}
                  >
                    <span className="absolute left-2 top-2 rounded bg-black/35 px-2 py-0.5 text-[0.7rem] font-medium text-white/78">
                      {item.progress}
                    </span>
                  </div>
                  <div className="min-w-0 self-center">
                    <p className="truncate text-sm font-semibold text-white transition-colors group-hover:text-emerald-200">
                      {item.title}
                    </p>
                    <p className="mt-1 truncate text-xs text-white/48">
                      {item.category}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-white/12 bg-white/[0.03] p-6 text-center">
              <p className="text-sm font-semibold">暂无追剧收藏</p>
              <p className="mt-2 text-xs text-white/48">
                在播放详情页点击追剧后，这里会展示最近收藏。
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
