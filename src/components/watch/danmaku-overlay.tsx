"use client";

import { createDanmakuOverlayItems } from "@/lib/watch-interactions";
import type { WatchDanmakuItem } from "@/lib/watch-interactions";
import { useWatchInteractionStore } from "@/stores/use-watch-interaction-store";

type DanmakuOverlayProps = {
  duration?: number;
  enabled?: boolean;
  opacity?: number;
  videoId: string;
};

const emptyDanmakuItems: WatchDanmakuItem[] = [];

// 渲染播放器画面上的弹幕浮层；videoId 用于读取当前视频和集数对应的弹幕。
export function DanmakuOverlay({
  duration,
  enabled = true,
  opacity = 0.9,
  videoId,
}: DanmakuOverlayProps) {
  const danmakuItems = useWatchInteractionStore(
    (state) => state.danmakuByVideoId[videoId] ?? emptyDanmakuItems,
  );
  const overlayItems = createDanmakuOverlayItems(danmakuItems, { duration });

  if (!enabled || overlayItems.length === 0) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
      style={{ opacity }}
    >
      {overlayItems.map((item) => (
        <span
          key={item.id}
          className="danmaku-fly absolute left-full whitespace-nowrap rounded-full bg-black/28 px-3 py-1 text-sm font-semibold text-white shadow-[0_1px_5px_rgba(0,0,0,0.45)] [text-shadow:0_1px_3px_rgba(0,0,0,0.75)]"
          style={{
            animationDelay: `${item.delay}s`,
            animationDuration: `${item.duration}s`,
            top: `${item.topPercent}%`,
          }}
        >
          {item.content}
        </span>
      ))}
    </div>
  );
}
