"use client";

import { MessageCircle, Radio, Send } from "lucide-react";
import { type FormEvent, useState } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import type {
  WatchCommentItem,
  WatchDanmakuItem,
} from "@/lib/watch-interactions";
import { useAuthDialogStore } from "@/stores/use-auth-dialog-store";
import { useUserStore } from "@/stores/use-user-store";
import { useWatchInteractionStore } from "@/stores/use-watch-interaction-store";

type WatchEngagementPanelProps = {
  videoId: string;
  title: string;
};

const emptyComments: WatchCommentItem[] = [];
const emptyDanmakuItems: WatchDanmakuItem[] = [];

// 格式化互动时间；timestamp 为评论或弹幕创建时的毫秒时间戳。
function formatInteractionTime(timestamp: number): string {
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(timestamp);
}

// 渲染播放页评论和弹幕互动区；videoId 用于按视频持久化本地互动数据。
export function WatchEngagementPanel({
  videoId,
  title,
}: WatchEngagementPanelProps) {
  const [commentText, setCommentText] = useState("");
  const [danmakuText, setDanmakuText] = useState("");
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);
  const openAuthDialog = useAuthDialogStore((state) => state.openAuthDialog);
  const comments = useWatchInteractionStore(
    (state) => state.commentsByVideoId[videoId] ?? emptyComments,
  );
  const danmakuItems = useWatchInteractionStore(
    (state) => state.danmakuByVideoId[videoId] ?? emptyDanmakuItems,
  );
  const addComment = useWatchInteractionStore((state) => state.addComment);
  const addDanmaku = useWatchInteractionStore((state) => state.addDanmaku);
  const canSubmitComment = isLoggedIn && commentText.trim().length > 0;
  const canSubmitDanmaku = isLoggedIn && danmakuText.trim().length > 0;

  // 提交评论；未登录时打开登录弹窗，空内容由按钮禁用和 store 工具函数双重过滤。
  function handleCommentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isLoggedIn) {
      openAuthDialog("评论");
      return;
    }

    if (!canSubmitComment) {
      return;
    }

    addComment({ videoId, content: commentText });
    setCommentText("");
  }

  // 提交弹幕；未登录时打开登录弹窗，空内容由按钮禁用和 store 工具函数双重过滤。
  function handleDanmakuSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isLoggedIn) {
      openAuthDialog("发送弹幕");
      return;
    }

    if (!canSubmitDanmaku) {
      return;
    }

    addDanmaku({ videoId, content: danmakuText });
    setDanmakuText("");
  }

  return (
    <section
      aria-labelledby="watch-engagement-title"
      className="grid gap-5 text-white lg:grid-cols-[minmax(0,1fr)_22rem]"
    >
      <article className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-sm font-medium text-emerald-300">
              <MessageCircle className="size-4" />
              评论
            </p>
            <h2
              id="watch-engagement-title"
              className="mt-2 text-2xl font-bold"
            >
              参与讨论
            </h2>
            <p className="mt-2 text-sm text-white/52">
              关于《{title}》的想法会保存在本地，方便继续完善互动体验。
            </p>
          </div>
          <span className="rounded-full bg-white/8 px-3 py-1 text-xs text-white/55">
            {comments.length} 条
          </span>
        </div>

        <form onSubmit={handleCommentSubmit} className="mt-5">
          <textarea
            value={commentText}
            aria-label="发表评论"
            disabled={!isLoggedIn}
            placeholder={isLoggedIn ? "说说这一集哪里打动你" : "登录后参与评论"}
            className="min-h-24 w-full resize-none rounded-lg border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-emerald-300/60 focus:bg-white/[0.06]"
            onChange={(event) => setCommentText(event.target.value)}
          />
          <div className="mt-3 flex justify-end">
            <Button
              type={isLoggedIn ? "submit" : "button"}
              disabled={isLoggedIn && !canSubmitComment}
              className="bg-emerald-400 text-[#06130d] hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-45"
              onClick={
                isLoggedIn ? undefined : () => openAuthDialog("评论")
              }
            >
              <Send className="size-4" />
              {isLoggedIn ? "发表评论" : "登录后评论"}
            </Button>
          </div>
        </form>

        <div className="mt-5 space-y-3">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <article
                key={comment.id}
                className="rounded-lg border border-white/8 bg-white/[0.03] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-white">
                    {comment.author}
                  </p>
                  <p className="text-xs text-white/38">
                    {formatInteractionTime(comment.createdAt)}
                  </p>
                </div>
                <p className="mt-3 text-sm leading-6 text-white/68">
                  {comment.content}
                </p>
              </article>
            ))
          ) : (
            <EmptyState
              compact
              className="border-dashed border-white/12 bg-white/[0.03] p-6"
              preset="comments-empty"
            />
          )}
        </div>
      </article>

      <aside className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-emerald-300">
            <Radio className="size-4" />
            弹幕
          </p>
          <h2 className="mt-2 text-2xl font-bold">弹幕预览</h2>
          <p className="mt-2 text-sm text-white/52">
            先做静态弹幕列表，后续可以再接到播放器画面上滚动展示。
          </p>
        </div>

        <form onSubmit={handleDanmakuSubmit} className="mt-5">
          <div className="flex gap-2">
            <input
              value={danmakuText}
              aria-label="发送弹幕"
              disabled={!isLoggedIn}
              placeholder={isLoggedIn ? "发一条弹幕" : "登录后发送弹幕"}
              className="h-10 min-w-0 flex-1 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-emerald-300/60 focus:bg-white/[0.06]"
              onChange={(event) => setDanmakuText(event.target.value)}
            />
            <Button
              type={isLoggedIn ? "submit" : "button"}
              disabled={isLoggedIn && !canSubmitDanmaku}
              className="bg-emerald-400 text-[#06130d] hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-45"
              onClick={
                isLoggedIn ? undefined : () => openAuthDialog("发送弹幕")
              }
            >
              <Send className="size-4" />
              {isLoggedIn ? "发送" : "登录"}
            </Button>
          </div>
        </form>

        <div className="mt-5 min-h-40 rounded-lg border border-white/8 bg-black/20 p-3">
          {danmakuItems.length > 0 ? (
            <div className="space-y-2">
              {danmakuItems.map((item) => (
                <div
                  key={item.id}
                  className="w-fit max-w-full rounded-full border border-emerald-300/18 bg-emerald-300/10 px-3 py-1.5 text-sm text-emerald-50"
                >
                  <span className="mr-2 text-xs text-white/38">
                    {formatInteractionTime(item.createdAt)}
                  </span>
                  {item.content}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              compact
              className="h-32 border-0 bg-transparent p-3"
              preset="danmaku-empty"
            />
          )}
        </div>
      </aside>
    </section>
  );
}
