"use client";

import { Heart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuthDialogStore } from "@/stores/use-auth-dialog-store";
import { useFavoriteStore } from "@/stores/use-favorite-store";
import type { FavoriteItem } from "@/stores/use-favorite-store";
import { useUserStore } from "@/stores/use-user-store";

type FavoriteActionButtonProps = {
  video: Omit<FavoriteItem, "addedAt">;
};

// 渲染播放页追剧按钮；video 为当前视频的收藏摘要。
export function FavoriteActionButton({ video }: FavoriteActionButtonProps) {
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);
  const openAuthDialog = useAuthDialogStore((state) => state.openAuthDialog);
  const isFavorite = useFavoriteStore((state) => state.isFavorite(video.id));
  const toggleFavorite = useFavoriteStore((state) => state.toggleFavorite);

  // 切换追剧状态；未登录时打开登录弹窗，不写入收藏列表。
  function handleToggleFavorite() {
    if (!isLoggedIn) {
      openAuthDialog("追剧");
      return;
    }

    toggleFavorite(video);
  }

  return (
    <Button
      variant="ghost"
      className={
        isFavorite
          ? "border border-emerald-300/40 bg-emerald-400/14 text-emerald-100 hover:bg-emerald-400/20 hover:text-emerald-50"
          : "border border-white/10 bg-white/[0.03] text-white/76 hover:bg-white/[0.08] hover:text-white"
      }
      aria-pressed={isFavorite}
      onClick={handleToggleFavorite}
    >
      <Heart className={isFavorite ? "size-4 fill-current" : "size-4"} />
      <span>{isFavorite ? "已追剧" : "追剧"}</span>
      <span className={isFavorite ? "text-xs text-emerald-100/70" : "text-xs text-white/42"}>
        {isFavorite ? "已加入" : isLoggedIn ? "加入片单" : "登录后同步"}
      </span>
    </Button>
  );
}
