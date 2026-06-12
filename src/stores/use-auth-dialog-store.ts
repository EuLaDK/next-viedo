"use client";

import { create } from "zustand";

type AuthDialogStore = {
  actionLabel: string;
  isOpen: boolean;
  closeAuthDialog: () => void;
  openAuthDialog: (actionLabel?: string) => void;
};

export const useAuthDialogStore = create<AuthDialogStore>()((set) => ({
  actionLabel: "继续操作",
  isOpen: false,
  // 关闭登录弹窗；用于弹窗取消按钮和登录成功后收起。
  closeAuthDialog: () => set({ isOpen: false }),
  // 打开登录弹窗；actionLabel 用于说明用户刚才尝试的受保护操作。
  openAuthDialog: (actionLabel = "继续操作") =>
    set({
      actionLabel,
      isOpen: true,
    }),
}));
