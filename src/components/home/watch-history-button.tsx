"use client";

import { Clock3, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

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

// 渲染顶部观看历史按钮和浮层；历史数据来自 Zustand 持久化 store。
export function WatchHistoryButton() {
  const [isOpen, setIsOpen] = useState(false);
  const items = useWatchHistoryStore((state) => state.items);
  const clearHistory = useWatchHistoryStore((state) => state.clearHistory);
  const visibleItems = sortWatchHistoryItems(items).slice(0, 8);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="text-white/70 hover:bg-white/10 hover:text-white"
        aria-label="观看历史"
        title="观看历史"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((value) => !value)}
      >
        <Clock3 className="size-4" />
      </Button>

      {isOpen ? (
        <div className="absolute right-0 top-11 z-50 w-[20rem] overflow-hidden rounded-lg border border-white/10 bg-[#0b0f16] text-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div>
              <p className="text-sm font-semibold">观看历史</p>
              <p className="mt-1 text-xs text-white/42">
                最近 {items.length} 条记录
              </p>
            </div>
            {items.length > 0 ? (
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-white/52 hover:bg-white/10 hover:text-white"
                aria-label="清空观看历史"
                title="清空观看历史"
                onClick={clearHistory}
              >
                <Trash2 className="size-4" />
              </Button>
            ) : null}
          </div>

          {items.length > 0 ? (
            <div className="max-h-[24rem] overflow-y-auto p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {visibleItems.map((item) => (
                <Link
                  key={`${item.id}-${item.episode ?? "latest"}`}
                  href={getWatchHistoryHref(item)}
                  className="group grid grid-cols-[4.5rem_1fr] gap-3 rounded-md p-2 transition-colors hover:bg-white/[0.06]"
                  onClick={() => setIsOpen(false)}
                >
                  <div
                    className="relative aspect-video overflow-hidden rounded border border-white/10"
                    style={{ background: item.coverGradient }}
                  >
                    <span className="absolute left-1.5 top-1.5 rounded bg-black/35 px-1.5 py-0.5 text-[0.65rem] font-medium text-white/78">
                      {item.progress}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white transition-colors group-hover:text-emerald-200">
                      {item.title}
                    </p>
                    <p className="mt-1 truncate text-xs text-white/48">
                      {item.category}
                    </p>
                    <p className="mt-1 truncate text-xs text-emerald-200/70">
                      {formatWatchProgressLabel(item)}
                    </p>
                    <p className="mt-2 text-xs text-white/38">
                      {formatWatchedAt(item.watchedAt)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              compact
              className="border-0 bg-transparent px-4 py-8 shadow-none"
              preset="header-history-empty"
            />
          )}

          <div className="border-t border-white/10 p-2">
            <Button
              asChild
              variant="ghost"
              className="w-full justify-center text-white/64 hover:bg-white/10 hover:text-white"
            >
              <Link href="/profile/history" onClick={() => setIsOpen(false)}>
                查看全部历史
              </Link>
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
