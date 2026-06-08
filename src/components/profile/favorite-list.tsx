"use client";

import { Heart, Trash2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useFavoriteStore } from "@/stores/use-favorite-store";

// 格式化追剧加入时间；timestamp 为加入追剧列表时的毫秒时间戳。
function formatAddedAt(timestamp: number): string {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(timestamp);
}

// 渲染追剧列表页内容；列表数据来自 Zustand 持久化 store。
export function FavoriteList() {
  const items = useFavoriteStore((state) => state.items);
  const removeFavorite = useFavoriteStore((state) => state.removeFavorite);
  const clearFavorites = useFavoriteStore((state) => state.clearFavorites);

  return (
    <section aria-labelledby="favorite-title" className="text-white">
      <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-medium text-emerald-300">
              <Heart className="size-4 fill-current" />
              我的片单
            </p>
            <h1
              id="favorite-title"
              className="mt-2 text-3xl font-bold tracking-normal"
            >
              追剧收藏
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/58">
              这里会保存你在播放详情页点击“追剧”的内容，方便下次继续观看。
            </p>
          </div>

          {items.length > 0 ? (
            <Button
              variant="ghost"
              className="w-fit border border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.08] hover:text-white"
              onClick={clearFavorites}
            >
              <Trash2 className="size-4" />
              清空片单
            </Button>
          ) : null}
        </div>
      </div>

      {items.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.04] transition-colors hover:border-emerald-300/35"
            >
              <Link href={`/watch/${item.id}`} className="group block">
                <div
                  className="relative aspect-video"
                  style={{ background: item.background }}
                >
                  <span className="absolute left-3 top-3 rounded bg-black/35 px-2 py-1 text-xs font-medium text-white/78">
                    {item.progress}
                  </span>
                </div>
                <div className="p-4">
                  <h2 className="truncate text-base font-semibold text-white transition-colors group-hover:text-emerald-200">
                    {item.title}
                  </h2>
                  <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-white/52">
                    {item.description}
                  </p>
                </div>
              </Link>

              <div className="flex items-center justify-between border-t border-white/10 px-4 py-3">
                <div>
                  <p className="text-xs text-white/42">加入时间</p>
                  <p className="mt-1 text-xs font-medium text-white/68">
                    {formatAddedAt(item.addedAt)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-white/50 hover:bg-white/10 hover:text-white"
                  aria-label={`移除 ${item.title}`}
                  title="移除追剧"
                  onClick={() => removeFavorite(item.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.04] p-8 text-center">
          <p className="text-lg font-semibold">还没有追剧内容</p>
          <p className="mt-2 text-sm text-white/52">
            去播放详情页点击“追剧”，这里就会出现你的片单。
          </p>
          <Button
            asChild
            className="mt-5 bg-emerald-400 text-[#06130d] hover:bg-emerald-300"
          >
            <Link href="/">返回首页发现内容</Link>
          </Button>
        </div>
      )}
    </section>
  );
}
