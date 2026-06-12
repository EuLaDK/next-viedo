"use client";

import { Crown, Sparkles } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { createUserDisplayState } from "@/lib/user-profile";
import type { VipPlan } from "@/lib/vip-membership";
import { getVipUntilByPlanId } from "@/lib/vip-membership";
import { useAuthDialogStore } from "@/stores/use-auth-dialog-store";
import { useUserStore } from "@/stores/use-user-store";

type VipStatusPanelProps = {
  selectedPlan: VipPlan;
};

/* 渲染会员页的本地用户状态面板；selectedPlan 为服务端根据 URL 选中的套餐。 */
export function VipStatusPanel({ selectedPlan }: VipStatusPanelProps) {
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);
  const isVip = useUserStore((state) => state.isVip);
  const email = useUserStore((state) => state.email);
  const nickname = useUserStore((state) => state.nickname);
  const phone = useUserStore((state) => state.phone);
  const vipUntil = useUserStore((state) => state.vipUntil);
  const activateVip = useUserStore((state) => state.activateVip);
  const openAuthDialog = useAuthDialogStore((state) => state.openAuthDialog);
  const userDisplay = createUserDisplayState({
    isLoggedIn,
    isVip,
    email,
    nickname,
    phone,
    vipUntil,
  });

  /* 处理会员页主按钮；未登录时先模拟登录，已登录时开通当前套餐。 */
  function handlePrimaryAction() {
    if (!isLoggedIn) {
      openAuthDialog("开通会员");
      return;
    }

    activateVip(getVipUntilByPlanId(selectedPlan.id));
  }

  return (
    <div className="rounded-lg border border-emerald-300/24 bg-emerald-300/[0.08] p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-emerald-200">当前选择</p>
          <h2 className="mt-2 text-2xl font-bold">{selectedPlan.name}</h2>
        </div>
        <span className="rounded-full bg-emerald-300 px-3 py-1 text-xs font-bold text-[#06130d]">
          {selectedPlan.badge}
        </span>
      </div>
      <div className="mt-5 flex items-end gap-2">
        <span className="text-4xl font-black">{selectedPlan.price}</span>
        <span className="pb-1 text-sm text-white/55">
          / {selectedPlan.period}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-white/60">
        {selectedPlan.description}
      </p>

      <div className="mt-4 rounded-md border border-white/10 bg-black/15 p-3">
        <p className="flex items-center gap-2 text-sm font-semibold text-white">
          <Crown className="size-4 text-emerald-300" />
          {userDisplay.badgeLabel}
        </p>
        <p className="mt-1 text-xs leading-5 text-white/52">
          {userDisplay.title} · {userDisplay.subtitle}
        </p>
      </div>

      <div className="mt-5 grid gap-2">
        <Button
          className="w-full bg-emerald-400 text-[#06130d] hover:bg-emerald-300"
          onClick={handlePrimaryAction}
        >
          <Sparkles className="size-4" />
          {!isLoggedIn
            ? "登录后开通"
            : isVip
              ? "续费当前套餐"
              : "开通当前套餐"}
        </Button>
        <Button
          asChild
          variant="outline"
          className="w-full border-white/15 bg-white/8 text-white hover:bg-white/14 hover:text-white"
        >
          <Link href="#vip-plans">查看套餐</Link>
        </Button>
      </div>
    </div>
  );
}
