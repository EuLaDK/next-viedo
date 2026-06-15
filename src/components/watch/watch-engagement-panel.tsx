"use client";

import { MessageCircle, Radio, Send, ThumbsUp, Trash2 } from "lucide-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import {
  getWatchDanmakuSendState,
  sortWatchComments,
  watchDanmakuColorHexByValue,
  watchDanmakuColorValues,
  type WatchCommentSort,
  type WatchCommentItem,
  type WatchDanmakuColor,
  type WatchDanmakuItem,
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
const danmakuColorLabels: Record<WatchDanmakuColor, string> = {
  white: "白",
  green: "绿",
  yellow: "黄",
  pink: "粉",
};

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
  const [commentSort, setCommentSort] = useState<WatchCommentSort>("latest");
  const [danmakuColor, setDanmakuColor] =
    useState<WatchDanmakuColor>("white");
  const [danmakuNow, setDanmakuNow] = useState(() => Date.now());
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
  const deleteComment = useWatchInteractionStore((state) => state.deleteComment);
  const toggleCommentLike = useWatchInteractionStore(
    (state) => state.toggleCommentLike,
  );
  const sortedComments = useMemo(
    () => sortWatchComments(comments, commentSort),
    [commentSort, comments],
  );
  const danmakuSendState = useMemo(
    () => getWatchDanmakuSendState(danmakuItems, danmakuNow),
    [danmakuItems, danmakuNow],
  );
  const canSubmitComment = isLoggedIn && commentText.trim().length > 0;
  const canSubmitDanmaku =
    isLoggedIn && danmakuText.trim().length > 0 && danmakuSendState.canSend;

  useEffect(() => {
    if (danmakuSendState.canSend) {
      return;
    }

    const timerId = window.setInterval(() => setDanmakuNow(Date.now()), 1000);

    return () => window.clearInterval(timerId);
  }, [danmakuSendState.canSend]);

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
      setDanmakuNow(Date.now());
      return;
    }

    addDanmaku({ videoId, content: danmakuText, color: danmakuColor });
    setDanmakuText("");
    setDanmakuNow(Date.now());
  }

  // 切换评论点赞；commentId 为目标评论 id，未登录时先提示登录。
  function handleCommentLike(commentId: string) {
    if (!isLoggedIn) {
      openAuthDialog("点赞评论");
      return;
    }

    toggleCommentLike(videoId, commentId);
  }

  // 删除自己的评论；commentId 为目标评论 id，未登录时先提示登录。
  function handleCommentDelete(commentId: string) {
    if (!isLoggedIn) {
      openAuthDialog("删除评论");
      return;
    }

    deleteComment(videoId, commentId);
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

        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-white/72">评论列表</p>
          <div className="flex rounded-full border border-white/10 bg-black/18 p-1">
            {[
              { label: "最新", value: "latest" },
              { label: "最热", value: "hot" },
            ].map((item) => {
              const isActive = commentSort === item.value;

              return (
                <button
                  key={item.value}
                  type="button"
                  aria-pressed={isActive}
                  className={
                    isActive
                      ? "rounded-full bg-emerald-400 px-3 py-1 text-xs font-semibold text-[#06130d]"
                      : "rounded-full px-3 py-1 text-xs font-medium text-white/55 transition-colors hover:text-white"
                  }
                  onClick={() => setCommentSort(item.value as WatchCommentSort)}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-3 space-y-3">
          {comments.length > 0 ? (
            sortedComments.map((comment) => (
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
                <div className="mt-3 flex items-center justify-between gap-3">
                  <Button
                    type="button"
                    size="xs"
                    variant="ghost"
                    aria-pressed={comment.likedByMe}
                    className={
                      comment.likedByMe
                        ? "text-emerald-300 hover:bg-emerald-300/10 hover:text-emerald-200"
                        : "text-white/52 hover:bg-white/8 hover:text-white"
                    }
                    onClick={() => handleCommentLike(comment.id)}
                  >
                    <ThumbsUp className="size-3.5" />
                    {comment.likes ?? 0}
                  </Button>

                  {comment.author === "我" ? (
                    <Button
                      type="button"
                      size="xs"
                      variant="ghost"
                      className="text-white/42 hover:bg-white/8 hover:text-red-200"
                      onClick={() => handleCommentDelete(comment.id)}
                    >
                      <Trash2 className="size-3.5" />
                      删除
                    </Button>
                  ) : null}
                </div>
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
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {watchDanmakuColorValues.map((color) => {
                const isActive = danmakuColor === color;

                return (
                  <button
                    key={color}
                    type="button"
                    aria-label={`${danmakuColorLabels[color]}色弹幕`}
                    aria-pressed={isActive}
                    className={
                      isActive
                        ? "flex size-7 items-center justify-center rounded-full border border-emerald-300 bg-white/12"
                        : "flex size-7 items-center justify-center rounded-full border border-white/12 bg-white/6 transition-colors hover:border-white/28"
                    }
                    onClick={() => setDanmakuColor(color)}
                  >
                    <span
                      className="size-3 rounded-full"
                      style={{
                        backgroundColor: watchDanmakuColorHexByValue[color],
                      }}
                    />
                  </button>
                );
              })}
            </div>
            {!danmakuSendState.canSend ? (
              <span className="text-xs text-white/42">
                {danmakuSendState.remainingSeconds}s 后可发送
              </span>
            ) : null}
          </div>
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
              {isLoggedIn
                ? danmakuSendState.canSend
                  ? "发送"
                  : `${danmakuSendState.remainingSeconds}s`
                : "登录"}
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
                  style={{
                    color: watchDanmakuColorHexByValue[item.color ?? "white"],
                  }}
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
