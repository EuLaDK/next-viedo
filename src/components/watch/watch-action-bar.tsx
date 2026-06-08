"use client";

import { Check, Copy, Download, Share2, ThumbsUp } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { FavoriteActionButton } from "@/components/watch/favorite-action-button";
import {
  getDisplayLikeCount,
  getWatchSharePath,
} from "@/lib/watch-actions";
import { useWatchActionStore } from "@/stores/use-watch-action-store";
import type { FavoriteItem } from "@/stores/use-favorite-store";

type WatchActionBarProps = {
  activeEpisode: number;
  episodeCount: number;
  video: Omit<FavoriteItem, "addedAt">;
};

const BASE_LIKE_COUNT = 128000;

// 渲染播放页操作按钮；video 为当前视频摘要，activeEpisode 用于生成分享链接。
export function WatchActionBar({
  activeEpisode,
  episodeCount,
  video,
}: WatchActionBarProps) {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const isCached = useWatchActionStore((state) => state.isCached(video.id));
  const isLiked = useWatchActionStore((state) => state.isLiked(video.id));
  const toggleCached = useWatchActionStore((state) => state.toggleCached);
  const toggleLiked = useWatchActionStore((state) => state.toggleLiked);
  const sharePath = getWatchSharePath({
    episode: activeEpisode,
    episodeCount,
    videoId: video.id,
  });
  const likeCount = getDisplayLikeCount(BASE_LIKE_COUNT, isLiked);

  // 复制分享链接；剪贴板不可用时保留链接文本供用户手动选择。
  async function handleCopyShareUrl() {
    if (!navigator.clipboard) {
      return;
    }

    await navigator.clipboard.writeText(`${window.location.origin}${sharePath}`);
    setHasCopied(true);
    window.setTimeout(() => setHasCopied(false), 1600);
  }

  return (
    <div className="mt-5 flex flex-wrap gap-2">
      <Button
        variant="ghost"
        className={
          isLiked
            ? "border border-emerald-300/40 bg-emerald-400/14 text-emerald-100 hover:bg-emerald-400/20 hover:text-emerald-50"
            : "border border-white/10 bg-white/[0.03] text-white/76 hover:bg-white/[0.08] hover:text-white"
        }
        aria-pressed={isLiked}
        onClick={() => toggleLiked(video.id)}
      >
        <ThumbsUp className={isLiked ? "size-4 fill-current" : "size-4"} />
        <span>{isLiked ? "已点赞" : "点赞"}</span>
        <span className={isLiked ? "text-xs text-emerald-100/70" : "text-xs text-white/42"}>
          {likeCount}
        </span>
      </Button>

      <FavoriteActionButton video={video} />

      <div className="relative">
        <Button
          variant="ghost"
          className="border border-white/10 bg-white/[0.03] text-white/76 hover:bg-white/[0.08] hover:text-white"
          aria-expanded={isShareOpen}
          onClick={() => setIsShareOpen((value) => !value)}
        >
          <Share2 className="size-4" />
          <span>分享</span>
          <span className="text-xs text-white/42">给朋友</span>
        </Button>

        {isShareOpen ? (
          <div className="absolute left-0 top-10 z-40 w-[min(22rem,calc(100vw-2rem))] rounded-lg border border-white/10 bg-[#0b0f16] p-3 shadow-2xl">
            <p className="text-sm font-semibold text-white">分享链接</p>
            <div className="mt-3 flex gap-2">
              <input
                readOnly
                aria-label="分享链接"
                value={sharePath}
                className="h-9 min-w-0 flex-1 rounded-md border border-white/10 bg-white/[0.04] px-3 text-xs text-white/72 outline-none"
              />
              <Button
                type="button"
                size="sm"
                className="bg-emerald-400 text-[#06130d] hover:bg-emerald-300"
                onClick={handleCopyShareUrl}
              >
                {hasCopied ? (
                  <Check className="size-4" />
                ) : (
                  <Copy className="size-4" />
                )}
                {hasCopied ? "已复制" : "复制"}
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      <Button
        variant="ghost"
        className={
          isCached
            ? "border border-emerald-300/40 bg-emerald-400/14 text-emerald-100 hover:bg-emerald-400/20 hover:text-emerald-50"
            : "border border-white/10 bg-white/[0.03] text-white/76 hover:bg-white/[0.08] hover:text-white"
        }
        aria-pressed={isCached}
        onClick={() => toggleCached(video.id)}
      >
        <Download className={isCached ? "size-4 text-emerald-200" : "size-4"} />
        <span>{isCached ? "已缓存" : "缓存"}</span>
        <span className={isCached ? "text-xs text-emerald-100/70" : "text-xs text-white/42"}>
          {isCached ? "已加入" : "离线观看"}
        </span>
      </Button>
    </div>
  );
}
