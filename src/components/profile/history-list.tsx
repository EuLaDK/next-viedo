"use client";

import { Clock3, Play, Trash2 } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import {
  formatWatchProgressLabel,
  getWatchHistoryHref,
  sortWatchHistoryItems,
} from "@/lib/watch-history";
import { useWatchHistoryStore } from "@/stores/use-watch-history-store";

// 格式化观看时间；timestamp 为记录写入时的毫秒时间戳。
function formatWatchedAt(timestamp: number): string {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(timestamp);
}

// 渲染播放历史页内容；列表数据来自 Zustand 持久化 store。
export function HistoryList() {
  const items = useWatchHistoryStore((state) => state.items);
  const removeHistory = useWatchHistoryStore((state) => state.removeHistory);
  const clearHistory = useWatchHistoryStore((state) => state.clearHistory);
  const historyItems = sortWatchHistoryItems(items);

  return (
    <section aria-labelledby="history-title" className="text-white">
      <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-medium text-emerald-300">
              <Clock3 className="size-4" />
              继续观看
            </p>
            <h1
              id="history-title"
              className="mt-2 text-3xl font-bold tracking-normal"
            >
              观看历史
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/58">
              最近观看的视频会按时间排列，保留集数进度，方便回到刚才的位置继续看。
            </p>
          </div>

          {historyItems.length > 0 ? (
            <Button
              variant="ghost"
              className="w-fit border border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.08] hover:text-white"
              onClick={clearHistory}
            >
              <Trash2 className="size-4" />
              清空历史
            </Button>
          ) : null}
        </div>
      </div>

      {historyItems.length > 0 ? (
        <div className="mt-6 grid gap-3">
          {historyItems.map((item) => (
            <article
              key={`${item.id}-${item.episode ?? "latest"}`}
              className="grid gap-4 rounded-lg border border-white/10 bg-white/[0.04] p-3 transition-colors hover:border-emerald-300/35 sm:grid-cols-[13rem_1fr_auto] sm:items-center"
            >
              <Link
                href={getWatchHistoryHref(item)}
                className="group block overflow-hidden rounded-lg border border-white/10"
              >
                <div
                  className="relative aspect-video"
                  style={{ background: item.coverGradient }}
                >
                  <span className="absolute left-3 top-3 rounded bg-black/35 px-2 py-1 text-xs font-medium text-white/78">
                    {item.progress}
                  </span>
                  <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-opacity group-hover:bg-black/20 group-hover:opacity-100">
                    <span className="flex size-11 items-center justify-center rounded-full bg-emerald-300 text-[#06130d]">
                      <Play className="size-5 fill-current" />
                    </span>
                  </span>
                </div>
              </Link>

              <div className="min-w-0">
                <Link href={getWatchHistoryHref(item)} className="group">
                  <h2 className="truncate text-lg font-semibold text-white transition-colors group-hover:text-emerald-200">
                    {item.title}
                  </h2>
                  <p className="mt-2 truncate text-sm text-white/52">
                    {item.category}
                  </p>
                </Link>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-white/45">
                  <span>{formatWatchProgressLabel(item)}</span>
                  <span>观看于 {formatWatchedAt(item.watchedAt)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                <Button
                  asChild
                  className="bg-emerald-400 text-[#06130d] hover:bg-emerald-300"
                >
                  <Link href={getWatchHistoryHref(item)}>
                    <Play className="size-4 fill-current" />
                    继续播放
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-white/50 hover:bg-white/10 hover:text-white"
                  aria-label={`删除 ${item.title} 的观看历史`}
                  title="删除记录"
                  onClick={() => removeHistory(item)}
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
          preset="history-empty"
        />
      )}
    </section>
  );
}
