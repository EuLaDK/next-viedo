"use client";

import { LogIn, X } from "lucide-react";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { createLoginRequiredPrompt } from "@/lib/user-profile";
import { useAuthDialogStore } from "@/stores/use-auth-dialog-store";
import { useUserStore } from "@/stores/use-user-store";

const defaultLoginValues = {
  email: "next-user@example.com",
  nickname: "Next Video 用户",
  password: "password123",
};

// 渲染登录/注册弹窗；成功后写入账户状态，失败时展示认证错误。
export function LoginDialog() {
  const actionLabel = useAuthDialogStore((state) => state.actionLabel);
  const isOpen = useAuthDialogStore((state) => state.isOpen);
  const closeAuthDialog = useAuthDialogStore((state) => state.closeAuthDialog);
  const authError = useUserStore((state) => state.authError);
  const authPending = useUserStore((state) => state.authPending);
  const clearAuthError = useUserStore((state) => state.clearAuthError);
  const loginWithProfile = useUserStore((state) => state.loginWithProfile);
  const registerWithProfile = useUserStore((state) => state.registerWithProfile);
  const [email, setEmail] = useState(defaultLoginValues.email);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [nickname, setNickname] = useState(defaultLoginValues.nickname);
  const [password, setPassword] = useState(defaultLoginValues.password);
  const prompt = createLoginRequiredPrompt(actionLabel);

  if (!isOpen) {
    return null;
  }

  // 提交登录表单；登录模式校验已有账号，注册模式创建新账号。
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = {
      email,
      nickname,
      password,
    };

    const isSuccess =
      mode === "register"
        ? await registerWithProfile(input)
        : await loginWithProfile(input);

    if (isSuccess) {
      closeAuthDialog();
    }
  }

  // 关闭弹窗并清理错误提示；避免下一次打开时看到上一次失败消息。
  function handleClose() {
    clearAuthError();
    closeAuthDialog();
  }

  // 切换登录/注册模式；nextMode 为用户选择的认证表单类型。
  function handleModeChange(nextMode: "login" | "register") {
    setMode(nextMode);
    clearAuthError();
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
            onClick={handleClose}
          >
            <X className="size-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-2 rounded-md border border-white/10 bg-white/[0.03] p-1">
            {(["login", "register"] as const).map((item) => (
              <button
                key={item}
                type="button"
                className={
                  mode === item
                    ? "rounded bg-emerald-400 px-3 py-2 text-sm font-semibold text-[#06130d]"
                    : "rounded px-3 py-2 text-sm font-medium text-white/58 transition-colors hover:bg-white/8 hover:text-white"
                }
                disabled={authPending}
                onClick={() => handleModeChange(item)}
              >
                {item === "login" ? "登录" : "注册"}
              </button>
            ))}
          </div>

          {mode === "register" ? (
            <label className="block">
              <span className="text-xs font-medium text-white/52">昵称</span>
              <input
                value={nickname}
                name="nickname"
                className="mt-2 h-10 w-full rounded-md border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-emerald-300/60 focus:bg-white/[0.06]"
                disabled={authPending}
                onChange={(event) => {
                  setNickname(event.target.value);
                  clearAuthError();
                }}
              />
            </label>
          ) : null}

          <label className="block">
            <span className="text-xs font-medium text-white/52">邮箱</span>
            <input
              value={email}
              name="email"
              type="email"
              className="mt-2 h-10 w-full rounded-md border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-emerald-300/60 focus:bg-white/[0.06]"
              disabled={authPending}
              onChange={(event) => {
                setEmail(event.target.value);
                clearAuthError();
              }}
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-white/52">密码</span>
            <input
              value={password}
              name="password"
              type="password"
              className="mt-2 h-10 w-full rounded-md border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-emerald-300/60 focus:bg-white/[0.06]"
              disabled={authPending}
              onChange={(event) => {
                setPassword(event.target.value);
                clearAuthError();
              }}
            />
          </label>

          {authError ? (
            <p
              role="alert"
              className="rounded-md border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-100"
            >
              {authError}
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              className="border border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.08] hover:text-white"
              disabled={authPending}
              onClick={handleClose}
            >
              稍后再说
            </Button>
            <Button
              type="submit"
              className="bg-emerald-400 text-[#06130d] hover:bg-emerald-300"
              disabled={authPending}
            >
              <LogIn className="size-4" />
              {authPending
                ? mode === "login"
                  ? "登录中..."
                  : "注册中..."
                : mode === "login"
                  ? "登录"
                  : "注册并登录"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
