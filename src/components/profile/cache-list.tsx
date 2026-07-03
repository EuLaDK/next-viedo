"use client";

import { Download, Play, Trash2 } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { getHydrationSafeValue } from "@/lib/hydration-state";
import { videoLibrary } from "@/lib/mock-videos";
import { getVideoWatchHref } from "@/lib/video-card-url";
import { getCachedVideoIds } from "@/lib/watch-actions";
import { useWatchActionStore } from "@/stores/use-watch-action-store";

// 渲染离线缓存列表；缓存状态来自播放页操作区的 Zustand store。
export function CacheList() {
  const hasMounted = useHasMounted();
  const storedCachedByKey = useWatchActionStore((state) => state.cachedByKey);
  const removeCached = useWatchActionStore((state) => state.removeCached);
  const cachedByKey = getHydrationSafeValue<Record<string, boolean>>(
    hasMounted,
    storedCachedByKey,
    {},
  );
  const cachedVideoIds = getCachedVideoIds(cachedByKey);
  const cachedVideos = videoLibrary.filter((video) =>
    cachedVideoIds.includes(video.id),
  );

  return (
    <section aria-labelledby="cache-title" className="text-white">
      <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-medium text-emerald-300">
              <Download className="size-4" />
              离线观看
            </p>
            <h1
              id="cache-title"
              className="mt-2 text-3xl font-bold tracking-normal"
            >
              缓存中心
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/58">
              这里展示你在播放详情页点击“缓存”的内容，当前为本地模拟缓存状态。
            </p>
          </div>
          <span className="w-fit rounded-full bg-white/8 px-3 py-1 text-sm text-white/60">
            {cachedVideos.length} 部内容
          </span>
        </div>
      </div>

      {cachedVideos.length > 0 ? (
        <div className="mt-6 grid gap-3">
          {cachedVideos.map((video) => (
            <article
              key={video.id}
              className="grid gap-4 rounded-lg border border-white/10 bg-white/[0.04] p-3 transition-colors hover:border-emerald-300/35 sm:grid-cols-[13rem_1fr_auto] sm:items-center"
            >
              <Link
                href={getVideoWatchHref(video.id, { from: "/profile/cache" })}
                className="group block overflow-hidden rounded-lg border border-white/10"
              >
                <div
                  className="relative aspect-video"
                  style={{ background: video.coverGradient }}
                >
                  <span className="absolute left-3 top-3 rounded bg-black/35 px-2 py-1 text-xs font-medium text-white/78">
                    {video.quality}
                  </span>
                </div>
              </Link>

              <div className="min-w-0">
                <Link
                  href={getVideoWatchHref(video.id, { from: "/profile/cache" })}
                  className="group"
                >
                  <h2 className="truncate text-lg font-semibold text-white transition-colors group-hover:text-emerald-200">
                    {video.title}
                  </h2>
                  <p className="mt-2 truncate text-sm text-white/52">
                    {video.category} · {video.duration}
                  </p>
                </Link>
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/48">
                  {video.description}
                </p>
              </div>

              <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                <Button
                  asChild
                  className="bg-emerald-400 text-[#06130d] hover:bg-emerald-300"
                >
                  <Link
                    href={getVideoWatchHref(video.id, {
                      from: "/profile/cache",
                    })}
                  >
                    <Play className="size-4 fill-current" />
                    继续播放
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-white/50 hover:bg-white/10 hover:text-white"
                  aria-label={`移除 ${video.title} 的缓存`}
                  title="移除缓存"
                  onClick={() => removeCached(video.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          action={
            <Button
              asChild
              className="bg-emerald-400 text-[#06130d] hover:bg-emerald-300"
            >
              <Link href="/">返回首页发现内容</Link>
            </Button>
          }
          className="mt-6"
          preset="cache-empty"
        />
      )}
    </section>
  );
}
