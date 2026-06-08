"use client";

import { Heart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useFavoriteStore } from "@/stores/use-favorite-store";
import type { FavoriteItem } from "@/stores/use-favorite-store";

type FavoriteActionButtonProps = {
  video: Omit<FavoriteItem, "addedAt">;
};

// 渲染播放页追剧按钮；video 为当前视频的收藏摘要。
export function FavoriteActionButton({ video }: FavoriteActionButtonProps) {
  const isFavorite = useFavoriteStore((state) => state.isFavorite(video.id));
  const toggleFavorite = useFavoriteStore((state) => state.toggleFavorite);

  return (
    <Button
      variant="ghost"
      className={
        isFavorite
          ? "border border-emerald-300/40 bg-emerald-400/14 text-emerald-100 hover:bg-emerald-400/20 hover:text-emerald-50"
          : "border border-white/10 bg-white/[0.03] text-white/76 hover:bg-white/[0.08] hover:text-white"
      }
      aria-pressed={isFavorite}
      onClick={() => toggleFavorite(video)}
    >
      <Heart className={isFavorite ? "size-4 fill-current" : "size-4"} />
      <span>{isFavorite ? "已追剧" : "追剧"}</span>
      <span className={isFavorite ? "text-xs text-emerald-100/70" : "text-xs text-white/42"}>
        {isFavorite ? "已加入" : "加入片单"}
      </span>
    </Button>
  );
}
