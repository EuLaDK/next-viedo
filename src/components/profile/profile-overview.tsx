"use client";

import { useState, type FormEvent } from "react";

import { Clock3, Crown, Download, Heart, Pencil, Play, Save, X } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { createProfileSummaryCards } from "@/lib/profile-summary";
import { createUserDisplayState } from "@/lib/user-profile";
import { getVideoWatchHref } from "@/lib/video-card-url";
import {
  formatWatchProgressLabel,
  getWatchHistoryHref,
  sortWatchHistoryItems,
} from "@/lib/watch-history";
import { useFavoriteStore } from "@/stores/use-favorite-store";
import { useUserStore } from "@/stores/use-user-store";
import { useWatchActionStore } from "@/stores/use-watch-action-store";
import { useWatchHistoryStore } from "@/stores/use-watch-history-store";

const summaryIcons = [Clock3, Heart, Download, Crown];

// 渲染个人中心总览；数据来自本地 Zustand store，先作为未登录演示态使用。
export function ProfileOverview() {
  const avatarUrl = useUserStore((state) => state.avatarUrl);
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);
  const isVip = useUserStore((state) => state.isVip);
  const email = useUserStore((state) => state.email);
  const nickname = useUserStore((state) => state.nickname);
  const phone = useUserStore((state) => state.phone);
  const vipUntil = useUserStore((state) => state.vipUntil);
  const updateProfile = useUserStore((state) => state.updateProfile);
  const historyItems = useWatchHistoryStore((state) => state.items);
  const favoriteItems = useFavoriteStore((state) => state.items);
  const cachedByKey = useWatchActionStore((state) => state.cachedByKey);
  const userDisplay = createUserDisplayState({
    isLoggedIn,
    isVip,
    email,
    nickname,
    phone,
    vipUntil,
  });
  const recentHistoryItems = sortWatchHistoryItems(historyItems).slice(0, 3);
  const recentFavoriteItems = favoriteItems.slice(0, 3);
  const summaryCards = createProfileSummaryCards({
    cacheCount: Object.values(cachedByKey).filter(Boolean).length,
    favoriteCount: favoriteItems.length,
    historyCount: historyItems.length,
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileDraft, setProfileDraft] = useState({
    avatarUrl,
    nickname,
    phone,
  });

  // 打开资料编辑表单；使用当前账号状态初始化草稿。
  function openProfileEditor() {
    setProfileDraft({
      avatarUrl,
      nickname,
      phone,
    });
    setIsEditingProfile(true);
  }

  // 保存资料编辑表单；event 为表单提交事件。
  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSavingProfile(true);

    try {
      await updateProfile(profileDraft);
      setIsEditingProfile(false);
    } finally {
      setIsSavingProfile(false);
    }
  }

  return (
    <section aria-labelledby="profile-title" className="text-white">
      <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-300">
              {userDisplay.badgeLabel}
            </p>
            <h1
              id="profile-title"
              className="mt-2 text-3xl font-bold tracking-normal"
            >
              {isLoggedIn ? `${userDisplay.title}的 Next Video` : "我的 Next Video"}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/58">
              {userDisplay.subtitle}。管理你的观看历史和追剧收藏，会员权益、账号信息也会从这里进入。
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {isLoggedIn ? (
              <Button
                type="button"
                variant="outline"
                className="border-white/15 bg-white/8 text-white hover:bg-white/14 hover:text-white"
                onClick={openProfileEditor}
              >
                <Pencil className="size-4" />
                编辑资料
              </Button>
            ) : null}
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

        {isEditingProfile ? (
          <form
            className="mt-5 grid gap-4 border-t border-white/10 pt-5 md:grid-cols-3"
            onSubmit={handleProfileSubmit}
          >
            <label className="grid gap-2 text-sm text-white/70">
              昵称
              <input
                className="h-10 rounded-md border border-white/12 bg-black/20 px-3 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-emerald-300/70"
                value={profileDraft.nickname}
                onChange={(event) =>
                  setProfileDraft((draft) => ({
                    ...draft,
                    nickname: event.target.value,
                  }))
                }
                placeholder="Next Video 用户"
              />
            </label>
            <label className="grid gap-2 text-sm text-white/70">
              头像地址
              <input
                className="h-10 rounded-md border border-white/12 bg-black/20 px-3 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-emerald-300/70"
                value={profileDraft.avatarUrl}
                onChange={(event) =>
                  setProfileDraft((draft) => ({
                    ...draft,
                    avatarUrl: event.target.value,
                  }))
                }
                placeholder="/avatar.png"
              />
            </label>
            <label className="grid gap-2 text-sm text-white/70">
              手机号
              <input
                className="h-10 rounded-md border border-white/12 bg-black/20 px-3 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-emerald-300/70"
                value={profileDraft.phone}
                onChange={(event) =>
                  setProfileDraft((draft) => ({
                    ...draft,
                    phone: event.target.value,
                  }))
                }
                placeholder="13800000000"
              />
            </label>
            <div className="flex flex-wrap gap-2 md:col-span-3">
              <Button
                type="submit"
                disabled={isSavingProfile}
                className="bg-emerald-400 text-[#06130d] hover:bg-emerald-300"
              >
                <Save className="size-4" />
                {isSavingProfile ? "保存中" : "保存资料"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="text-white/60 hover:bg-white/10 hover:text-white"
                onClick={() => setIsEditingProfile(false)}
              >
                <X className="size-4" />
                取消
              </Button>
            </div>
          </form>
        ) : null}
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
                    style={{ background: item.coverGradient }}
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
            <EmptyState
              compact
              className="rounded-md border-dashed border-white/12 bg-white/[0.03] p-6"
              preset="overview-history-empty"
            />
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
                  href={getVideoWatchHref(item.id, { from: "/profile" })}
                  className="group grid grid-cols-[7rem_1fr] gap-3 rounded-md border border-white/8 bg-white/[0.03] p-2 transition-colors hover:bg-white/[0.07]"
                >
                  <div
                    className="relative aspect-video overflow-hidden rounded border border-white/10"
                    style={{ background: item.coverGradient }}
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
            <EmptyState
              compact
              className="rounded-md border-dashed border-white/12 bg-white/[0.03] p-6"
              preset="overview-favorites-empty"
            />
          )}
        </div>
      </div>
    </section>
  );
}
