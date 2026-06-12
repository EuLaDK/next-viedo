"use client";

import { LogIn, X } from "lucide-react";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { createLoginRequiredPrompt } from "@/lib/user-profile";
import { useAuthDialogStore } from "@/stores/use-auth-dialog-store";
import { useUserStore } from "@/stores/use-user-store";

const defaultLoginValues = {
  contact: "next-user@example.com",
  nickname: "Next Video 用户",
};

// 渲染本地登录弹窗；当前仅写入 Zustand 演示态，不请求真实后端。
export function LoginDialog() {
  const actionLabel = useAuthDialogStore((state) => state.actionLabel);
  const isOpen = useAuthDialogStore((state) => state.isOpen);
  const closeAuthDialog = useAuthDialogStore((state) => state.closeAuthDialog);
  const loginWithProfile = useUserStore((state) => state.loginWithProfile);
  const [contact, setContact] = useState(defaultLoginValues.contact);
  const [nickname, setNickname] = useState(defaultLoginValues.nickname);
  const prompt = createLoginRequiredPrompt(actionLabel);

  if (!isOpen) {
    return null;
  }

  // 提交登录表单；当前使用本地资料模拟已登录用户。
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    loginWithProfile({
      contact,
      nickname,
    });
    closeAuthDialog();
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/68 px-4 py-6 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-dialog-title"
        className="w-full max-w-md rounded-lg border border-white/10 bg-[#0b0f16] p-5 text-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-sm font-medium text-emerald-300">
              <LogIn className="size-4" />
              登录 Next Video
            </p>
            <h2 id="login-dialog-title" className="mt-2 text-2xl font-bold">
              {prompt.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/56">
              {prompt.description}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-white/52 hover:bg-white/10 hover:text-white"
            aria-label="关闭登录弹窗"
            onClick={closeAuthDialog}
          >
            <X className="size-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <label className="block">
            <span className="text-xs font-medium text-white/52">昵称</span>
            <input
              value={nickname}
              name="nickname"
              className="mt-2 h-10 w-full rounded-md border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-emerald-300/60 focus:bg-white/[0.06]"
              onChange={(event) => setNickname(event.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-white/52">
              手机号 / 邮箱
            </span>
            <input
              value={contact}
              name="contact"
              className="mt-2 h-10 w-full rounded-md border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-emerald-300/60 focus:bg-white/[0.06]"
              onChange={(event) => setContact(event.target.value)}
            />
          </label>

          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              className="border border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.08] hover:text-white"
              onClick={closeAuthDialog}
            >
              稍后再说
            </Button>
            <Button
              type="submit"
              className="bg-emerald-400 text-[#06130d] hover:bg-emerald-300"
            >
              <LogIn className="size-4" />
              登录
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
