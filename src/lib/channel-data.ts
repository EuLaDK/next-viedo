export type ChannelItem = {
  slug: string;
  label: string;
  description: string;
  keywords: string[];
  accent: string;
};

export const channelItems: ChannelItem[] = [
  {
    slug: "featured",
    label: "精选",
    description: "聚合全站热播内容，覆盖剧集、电影、综艺、纪录片与少儿科普。",
    keywords: [],
    accent: "from-emerald-400/28 via-sky-400/18 to-rose-400/18",
  },
  {
    slug: "tv",
    label: "电视剧",
    description: "追新剧、看完结，高热度剧集和口碑长剧都集中在这里。",
    keywords: ["剧集", "都市", "悬疑", "青春"],
    accent: "from-emerald-400/26 via-teal-400/16 to-slate-900/20",
  },
  {
    slug: "movie",
    label: "电影",
    description: "本周新片、冒险大片和高分电影，适合快速进入沉浸观影。",
    keywords: ["电影"],
    accent: "from-rose-500/24 via-indigo-500/18 to-slate-900/20",
  },
  {
    slug: "variety",
    label: "综艺",
    description: "真人秀、挑战企划和轻松陪伴内容，适合碎片时间连续观看。",
    keywords: ["综艺", "真人秀", "挑战"],
    accent: "from-amber-400/26 via-orange-500/16 to-slate-900/20",
  },
  {
    slug: "anime",
    label: "动漫",
    description: "动画、科幻和亲子向内容，先用现有片库撑起频道形态。",
    keywords: ["动画", "少儿", "科幻"],
    accent: "from-sky-400/24 via-emerald-400/16 to-slate-900/20",
  },
  {
    slug: "documentary",
    label: "纪录片",
    description: "自然、人文与探索类内容，突出 4K、慢节奏和真实质感。",
    keywords: ["纪录片", "自然", "人文"],
    accent: "from-cyan-400/22 via-blue-500/16 to-slate-900/20",
  },
  {
    slug: "kids",
    label: "少儿",
    description: "适合家庭和亲子场景的科普、动画与轻松成长内容。",
    keywords: ["少儿", "亲子", "科普", "动画"],
    accent: "from-blue-400/24 via-teal-400/16 to-slate-900/20",
  },
  {
    slug: "vip",
    label: "VIP",
    description: "会员抢先看、高清片源和独播内容，突出付费权益入口。",
    keywords: ["会员", "独播", "会员抢先看"],
    accent: "from-emerald-300/26 via-yellow-300/14 to-slate-900/20",
  },
  {
    slug: "sports",
    label: "体育",
    description: "先用竞技、挑战类内容占位，后续可接赛事直播和赛程数据。",
    keywords: ["竞技", "挑战", "热血"],
    accent: "from-lime-400/22 via-emerald-400/16 to-slate-900/20",
  },
  {
    slug: "game",
    label: "游戏",
    description: "先展示竞技、科幻和热血内容，后续可扩展游戏赛事与直播。",
    keywords: ["竞技", "科幻", "动作"],
    accent: "from-violet-400/22 via-blue-500/16 to-slate-900/20",
  },
];

export const primaryChannels = channelItems.slice(0, 6);
