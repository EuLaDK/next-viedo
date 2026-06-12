"use client";

import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getVipUntilByPlanId,
  type VipPlan,
} from "@/lib/vip-membership";
import { useUserStore } from "@/stores/use-user-store";

type VipPlanCardProps = {
  isSelected: boolean;
  plan: VipPlan;
};

// 渲染会员套餐卡片；plan 为套餐配置，点击开通会写入本地 VIP 演示态。
export function VipPlanCard({ isSelected, plan }: VipPlanCardProps) {
  const activateVip = useUserStore((state) => state.activateVip);

  // 开通当前套餐；本地演示直接按套餐计算有效期。
  function handleActivateVip() {
    activateVip(getVipUntilByPlanId(plan.id));
  }

  return (
    <article
      className={cn(
        "group rounded-lg border bg-white/[0.04] p-4 transition-colors",
        isSelected
          ? "border-emerald-300/60 bg-emerald-300/[0.08]"
          : "border-white/10 hover:border-emerald-300/35 hover:bg-white/[0.06]",
      )}
    >
      <Link
        href={`/profile/vip?plan=${plan.id}#vip-plans`}
        aria-current={isSelected ? "page" : undefined}
        className="block"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-emerald-300">
              {plan.badge}
            </p>
            <h2 className="mt-2 text-xl font-bold">{plan.name}</h2>
          </div>
          {plan.recommended ? (
            <span className="rounded-full bg-amber-300 px-3 py-1 text-xs font-bold text-[#201404]">
              推荐
            </span>
          ) : null}
        </div>

        <div className="mt-5 flex items-end gap-2">
          <span className="text-4xl font-black">{plan.price}</span>
          <span className="pb-1 text-sm text-white/50">/ {plan.period}</span>
        </div>
        <p className="mt-3 text-sm leading-6 text-white/55">
          {plan.description}
        </p>

        <div className="mt-5 space-y-2">
          {plan.highlights.map((highlight) => (
            <p
              key={highlight}
              className="flex items-center gap-2 text-sm text-white/70"
            >
              <CheckCircle2 className="size-4 text-emerald-300" />
              {highlight}
            </p>
          ))}
        </div>
      </Link>

      <Button
        className={cn(
          "mt-5 w-full",
          isSelected
            ? "bg-emerald-400 text-[#06130d] hover:bg-emerald-300"
            : "bg-white/8 text-white/70 hover:bg-white/12 hover:text-white",
        )}
        onClick={handleActivateVip}
      >
        {isSelected ? "开通当前套餐" : "开通此套餐"}
      </Button>
    </article>
  );
}
