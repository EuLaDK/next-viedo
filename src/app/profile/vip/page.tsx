import {
  BadgeCheck,
  CheckCircle2,
  Crown,
  Gem,
  Play,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

import { VipPlanCard } from "@/components/profile/vip-plan-card";
import { VipStatusPanel } from "@/components/profile/vip-status-panel";
import { Button } from "@/components/ui/button";
import { videoLibrary } from "@/lib/mock-videos";
import { getVideoWatchHref } from "@/lib/video-card-url";
import {
  getVipPlanById,
  isVipVideoContent,
  vipBenefitGroups,
  vipPlans,
} from "@/lib/vip-membership";

type ProfileVipPageProps = {
  searchParams: Promise<{
    plan?: string | string[];
  }>;
};

const vipVideos = videoLibrary
  .filter(isVipVideoContent)
  .slice(0, 4);

/* 读取 URL 查询参数；数组时取第一项。 */
function getSearchParamValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

/* 渲染个人中心会员页；searchParams 中的 plan 用于高亮当前套餐。 */
export default async function ProfileVipPage({
  searchParams,
}: ProfileVipPageProps) {
  const { plan } = await searchParams;
  const selectedPlan = getVipPlanById(getSearchParamValue(plan));

  return (
    <section aria-labelledby="profile-vip-title" className="text-white">
      <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]">
        <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:p-6">
          <div>
            <p className="flex items-center gap-2 text-sm font-medium text-emerald-300">
              <Crown className="size-4" />
              VIP会员
            </p>
            <h1
              id="profile-vip-title"
              className="mt-2 text-3xl font-bold tracking-normal sm:text-4xl"
            >
              Next Video VIP
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">
              抢先看热播内容，解锁高清片源和会员专属片库，把追剧节奏交给你自己。
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {["抢先看", "4K HDR", "专属片库"].map((item) => (
                <div
                  key={item}
                  className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm font-medium text-white/76"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <VipStatusPanel selectedPlan={selectedPlan} />
        </div>
      </div>

      <div id="vip-plans" className="mt-6 grid gap-3 lg:grid-cols-3">
        {vipPlans.map((vipPlan) => {
          const isSelected = vipPlan.id === selectedPlan.id;

          return (
            <VipPlanCard
              key={vipPlan.id}
              isSelected={isSelected}
              plan={vipPlan}
            />
          );
        })}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <div className="mb-4">
            <p className="flex items-center gap-2 text-sm font-medium text-emerald-300">
              <ShieldCheck className="size-4" />
              会员权益
            </p>
            <h2 className="mt-2 text-2xl font-bold">权益对比</h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {vipBenefitGroups.map((group) => (
              <article
                key={group.title}
                className="rounded-lg border border-white/10 bg-white/[0.03] p-4"
              >
                <div className="flex items-center gap-2">
                  <BadgeCheck className="size-5 text-emerald-300" />
                  <h3 className="font-semibold">{group.title}</h3>
                </div>
                <p className="mt-2 text-sm leading-6 text-white/50">
                  {group.description}
                </p>
                <div className="mt-4 space-y-2">
                  {group.items.map((item) => (
                    <p
                      key={item}
                      className="flex items-center gap-2 text-sm text-white/68"
                    >
                      <CheckCircle2 className="size-4 text-emerald-300" />
                      {item}
                    </p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <p className="flex items-center gap-2 text-sm font-medium text-emerald-300">
            <Gem className="size-4" />
            会员专属
          </p>
          <h2 className="mt-2 text-2xl font-bold">精选内容</h2>
          <div className="mt-4 space-y-3">
            {vipVideos.map((video) => (
              <Link
                key={video.id}
                href={getVideoWatchHref(video.id, { from: "/profile/vip" })}
                className="group grid grid-cols-[6.5rem_1fr] gap-3 rounded-md border border-white/8 bg-white/[0.03] p-2 transition-colors hover:bg-white/[0.07]"
              >
                <div
                  className="relative aspect-video overflow-hidden rounded border border-white/10"
                  style={{ background: video.coverGradient }}
                >
                  <span className="absolute left-2 top-2 rounded bg-black/35 px-2 py-0.5 text-[0.65rem] font-medium text-white/78">
                    {video.quality}
                  </span>
                </div>
                <div className="min-w-0 self-center">
                  <p className="truncate text-sm font-semibold text-white transition-colors group-hover:text-emerald-200">
                    {video.title}
                  </p>
                  <p className="mt-1 truncate text-xs text-white/48">
                    {video.badge}
                  </p>
                </div>
              </Link>
            ))}
          </div>
          <Button
            asChild
            variant="outline"
            className="mt-5 w-full border-white/15 bg-white/8 text-white hover:bg-white/14 hover:text-white"
          >
            <Link href="/channel/vip">
              <Play className="size-4 fill-current" />
              浏览会员频道
            </Link>
          </Button>
        </aside>
      </div>
    </section>
  );
}
