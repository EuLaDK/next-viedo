export type VipPlanId = "monthly" | "quarterly" | "yearly";

export type VipPlan = {
  id: VipPlanId;
  name: string;
  price: string;
  period: string;
  badge: string;
  description: string;
  highlights: string[];
  recommended?: boolean;
};

export type VipBenefitGroup = {
  title: string;
  description: string;
  items: string[];
};

export const vipPlans: VipPlan[] = [
  {
    id: "monthly",
    name: "连续包月",
    price: "¥19",
    period: "月",
    badge: "灵活体验",
    description: "适合短期追剧和临时观影。",
    highlights: ["会员抢先看", "1080P 高清", "专属片库"],
  },
  {
    id: "quarterly",
    name: "季卡会员",
    price: "¥49",
    period: "季",
    badge: "人气选择",
    description: "覆盖一整季更新周期。",
    highlights: ["会员抢先看", "4K 片源", "多端观看"],
  },
  {
    id: "yearly",
    name: "年卡会员",
    price: "¥168",
    period: "年",
    badge: "推荐",
    description: "适合长期追剧和家庭观影。",
    highlights: ["全年片库", "4K HDR", "专属推荐"],
    recommended: true,
  },
];

export const vipBenefitGroups: VipBenefitGroup[] = [
  {
    title: "抢先观看",
    description: "热播剧集提前解锁。",
    items: ["会员抢先看 2 集", "独播内容优先上线", "更新提醒"],
  },
  {
    title: "高清体验",
    description: "提升播放清晰度和观影稳定性。",
    items: ["4K HDR", "1080P 高清", "多端同步"],
  },
  {
    title: "专属片库",
    description: "聚合会员内容入口。",
    items: ["会员电影", "精品剧集", "纪录片精选"],
  },
  {
    title: "观影权益",
    description: "减少观看干扰。",
    items: ["跳过贴片", "片单收藏", "历史同步"],
  },
];

// 根据套餐 id 获取套餐；planId 未命中时返回推荐套餐。
export function getVipPlanById(planId: string | undefined): VipPlan {
  const recommendedPlan =
    vipPlans.find((plan) => plan.recommended) ?? vipPlans[0];

  return vipPlans.find((plan) => plan.id === planId) ?? recommendedPlan;
}
