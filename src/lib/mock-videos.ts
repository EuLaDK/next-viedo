export type VideoEpisode = {
  episode: number;
  title: string;
  duration: string;
  status?: string;
};

export type VideoCalendarItem = {
  time: string;
  detail: string;
  active?: boolean;
};

export type VideoItem = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  score: string;
  heat: string;
  update: string;
  category: string;
  year: string;
  region: string;
  episodeCount: number;
  quality: string;
  badge: string;
  progress: string;
  duration: string;
  source: string;
  background: string;
  tags: string[];
  casts: string[];
  calendar: VideoCalendarItem[];
  episodes: VideoEpisode[];
  relatedIds: string[];
};

export type ChannelItem = {
  slug: string;
  label: string;
  description: string;
  keywords: string[];
  accent: string;
};

export const channelSortValues = ["default", "new", "hot", "score"] as const;

export type ChannelSort = (typeof channelSortValues)[number];
export const searchSortValues = ["relevance", "new", "hot", "score"] as const;
export const rankSortValues = ["hot", "score", "new"] as const;

export type SearchSort = (typeof searchSortValues)[number];
export type RankSort = (typeof rankSortValues)[number];

export type ChannelFilterState = {
  type?: string;
  year?: string;
  sort?: ChannelSort;
};

export type SearchFilterState = {
  type?: string;
  sort?: SearchSort;
};

export const STATIC_VIDEO_SRC = "/assets/video/staticTest.mp4";

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

// 生成演示选集；count 为总集数，activeEpisode 为默认播放的集数。
function createEpisodes(count: number, activeEpisode = 1): VideoEpisode[] {
  return Array.from({ length: count }, (_, index) => {
    const episode = index + 1;

    return {
      episode,
      title: `第 ${episode} 集`,
      duration: episode === activeEpisode ? "正在播放" : "45 分钟",
      status: episode === activeEpisode ? "active" : undefined,
    };
  });
}

export const videoLibrary: VideoItem[] = [
  {
    id: "xinghe",
    title: "星河回响",
    subtitle: "全网热播 · 科幻悬疑 · 会员抢先看",
    description:
      "近未来的深空勘探计划突然收到来自失联星舰的回声信号，一支临时调查小队被迫进入未知航线，在记忆、谎言与时间错位之间寻找真相。",
    score: "9.3",
    heat: "热度 10026",
    update: "更新至 18 集 / 每周五 20:00 更新",
    category: "科幻 / 悬疑",
    year: "2026",
    region: "中国大陆",
    episodeCount: 24,
    quality: "4K HDR",
    badge: "独播",
    progress: "会员抢先看",
    duration: "45:00",
    source: STATIC_VIDEO_SRC,
    background:
      "linear-gradient(135deg,#0f766e,#111827 50%,#be123c),radial-gradient(circle_at_72%_28%,rgba(125,211,252,0.55),transparent_25%)",
    tags: ["科幻", "悬疑", "冒险", "会员抢先看"],
    casts: ["林舟", "许念", "周砚", "陈白"],
    calendar: [
      { time: "今天 20:00", detail: "第 1-2 集 已上线", active: true },
      { time: "周五 20:00", detail: "第 3-4 集 即将更新" },
      { time: "下周五", detail: "会员抢先看 4 集" },
    ],
    episodes: createEpisodes(12),
    relatedIds: ["shen-kong", "lingdian", "jiyi", "bianjing"],
  },
  {
    id: "anye",
    title: "暗夜追光",
    subtitle: "犯罪悬疑 · 迷雾追凶 · 高能反转",
    description:
      "一桩旧案在城市停电夜重新浮出水面，刑警与记者沿着光源消失的方向追查，逐步逼近被刻意掩埋的真相。",
    score: "8.9",
    heat: "热度 9821",
    update: "全 16 集已完结",
    category: "犯罪 / 悬疑",
    year: "2026",
    region: "中国大陆",
    episodeCount: 16,
    quality: "1080P",
    badge: "高分完结",
    progress: "全季可看",
    duration: "42:18",
    source: STATIC_VIDEO_SRC,
    background: "linear-gradient(135deg,#1d4ed8,#111827 58%,#0f172a)",
    tags: ["犯罪", "悬疑", "反转", "完结"],
    casts: ["秦越", "唐棠", "陆衡", "宋知"],
    calendar: [
      { time: "已完结", detail: "全 16 集一次看完", active: true },
      { time: "番外", detail: "幕后特辑同步上线" },
      { time: "会员", detail: "支持 1080P 高清播放" },
    ],
    episodes: createEpisodes(16),
    relatedIds: ["jiyi", "xinghe", "lingdian", "hai-an"],
  },
  {
    id: "yunduan",
    title: "云端餐厅",
    subtitle: "都市治愈 · 深夜食堂 · 温暖群像",
    description:
      "一间开在高楼天台的餐厅，只在雨夜营业。不同来客把没说出口的遗憾交给一道菜，也在烟火气里重新出发。",
    score: "8.5",
    heat: "热度 8742",
    update: "更新至 10 集 / 每周三更新",
    category: "都市 / 治愈",
    year: "2026",
    region: "中国大陆",
    episodeCount: 20,
    quality: "4K",
    badge: "温暖新剧",
    progress: "更新至 10 集",
    duration: "39:46",
    source: STATIC_VIDEO_SRC,
    background: "linear-gradient(135deg,#c2410c,#27272a 55%,#111827)",
    tags: ["都市", "治愈", "美食", "群像"],
    casts: ["沈安", "叶晴", "乔木", "罗一"],
    calendar: [
      { time: "今天", detail: "第 9-10 集 已上线", active: true },
      { time: "周三", detail: "第 11-12 集 更新" },
      { time: "会员", detail: "抢先看 2 集" },
    ],
    episodes: createEpisodes(10),
    relatedIds: ["chunri", "guitu", "xingqiu", "hai-an"],
  },
  {
    id: "shaonian",
    title: "少年棋局",
    subtitle: "青春竞技 · 热血成长 · 棋逢对手",
    description:
      "少年棋手从街边棋摊走向全国赛场，在一次次胜负之间学会面对天赋、压力与友情。",
    score: "8.3",
    heat: "热度 8016",
    update: "更新至 8 集 / 周末连更",
    category: "青春 / 竞技",
    year: "2026",
    region: "中国大陆",
    episodeCount: 18,
    quality: "1080P",
    badge: "热血成长",
    progress: "更新至 8 集",
    duration: "41:20",
    source: STATIC_VIDEO_SRC,
    background: "linear-gradient(135deg,#7c3aed,#1f2937 58%,#0f172a)",
    tags: ["青春", "竞技", "成长", "热血"],
    casts: ["祁远", "江夏", "孟宁", "白辰"],
    calendar: [
      { time: "周六", detail: "第 7-8 集 已上线", active: true },
      { time: "周日", detail: "加更训练赛特辑" },
      { time: "下周", detail: "全国赛篇开启" },
    ],
    episodes: createEpisodes(8),
    relatedIds: ["jixian", "xingqiu", "chunri", "yunduan"],
  },
  {
    id: "hai-an",
    title: "海岸来信",
    subtitle: "纪录片 · 海岛人文 · 慢节奏治愈",
    description:
      "镜头沿着漫长海岸线记录渔村、灯塔与迁徙的人们，在潮汐更替中寻找普通生活里的辽阔。",
    score: "8.8",
    heat: "热度 7388",
    update: "全 6 集已上线",
    category: "纪录片",
    year: "2026",
    region: "中国大陆",
    episodeCount: 6,
    quality: "4K HDR",
    badge: "口碑纪录",
    progress: "4K HDR",
    duration: "48:08",
    source: STATIC_VIDEO_SRC,
    background: "linear-gradient(135deg,#0f766e,#172554 56%,#111827)",
    tags: ["纪录片", "自然", "人文", "4K"],
    casts: ["旁白：周闻"],
    calendar: [
      { time: "已上线", detail: "全 6 集可看", active: true },
      { time: "幕后", detail: "海岸拍摄日志上线" },
      { time: "会员", detail: "支持 4K HDR" },
    ],
    episodes: createEpisodes(6),
    relatedIds: ["xuexian", "guitu", "xingqiu", "shen-kong"],
  },
  {
    id: "guitu",
    title: "归途列车",
    subtitle: "电影 · 冒险 · 归途重逢",
    description:
      "暴雪封路后，一列夜行列车被迫停在无人山谷，陌生乘客在共同求生中拼出一段迟到多年的回家路。",
    score: "8.1",
    heat: "热度 6920",
    update: "本周新片",
    category: "电影 / 冒险",
    year: "2026",
    region: "中国大陆",
    episodeCount: 1,
    quality: "4K",
    badge: "本周新片",
    progress: "本周新片",
    duration: "01:48:20",
    source: STATIC_VIDEO_SRC,
    background: "linear-gradient(135deg,#be123c,#312e81 55%,#111827)",
    tags: ["电影", "冒险", "公路", "亲情"],
    casts: ["梁舟", "何曼", "苏临"],
    calendar: [
      { time: "今日上线", detail: "正片可看", active: true },
      { time: "会员", detail: "支持 4K 清晰度" },
      { time: "花絮", detail: "导演解说同步上线" },
    ],
    episodes: createEpisodes(1),
    relatedIds: ["lingdian", "hai-an", "yunduan", "jixian"],
  },
  {
    id: "chunri",
    title: "春日事务所",
    subtitle: "剧集 · 都市 · 轻喜治愈",
    description:
      "三位年轻人在旧街区开了一间万能事务所，从修理小物件开始，也慢慢修补人与人之间的关系。",
    score: "8.2",
    heat: "热度 6638",
    update: "更新至 12 集",
    category: "剧集 / 都市",
    year: "2026",
    region: "中国大陆",
    episodeCount: 24,
    quality: "1080P",
    badge: "轻喜热播",
    progress: "更新至 12 集",
    duration: "40:10",
    source: STATIC_VIDEO_SRC,
    background: "linear-gradient(135deg,#15803d,#0f172a 58%,#1f2937)",
    tags: ["都市", "轻喜", "治愈", "友情"],
    casts: ["唐青", "顾南", "齐愿", "米兰"],
    calendar: [
      { time: "今天", detail: "第 11-12 集 已上线", active: true },
      { time: "周四", detail: "第 13-14 集 更新" },
      { time: "会员", detail: "抢先看 2 集" },
    ],
    episodes: createEpisodes(12),
    relatedIds: ["yunduan", "shaonian", "xingqiu", "guitu"],
  },
  {
    id: "jixian",
    title: "极限搭档",
    subtitle: "综艺 · 真人秀 · 高能挑战",
    description:
      "六位嘉宾组成临时搭档，在城市与荒野之间完成连续挑战，默契、体力和临场判断都被推到极限。",
    score: "8.0",
    heat: "热度 6501",
    update: "第 6 期上线",
    category: "综艺 / 真人秀",
    year: "2026",
    region: "中国大陆",
    episodeCount: 12,
    quality: "1080P",
    badge: "高能综艺",
    progress: "第 6 期上线",
    duration: "01:12:06",
    source: STATIC_VIDEO_SRC,
    background: "linear-gradient(135deg,#ca8a04,#1e293b 55%,#111827)",
    tags: ["综艺", "真人秀", "挑战", "搞笑"],
    casts: ["常驻嘉宾团"],
    calendar: [
      { time: "周五", detail: "第 6 期 已上线", active: true },
      { time: "周六", detail: "会员加更版" },
      { time: "下周五", detail: "第 7 期 更新" },
    ],
    episodes: createEpisodes(6),
    relatedIds: ["shaonian", "guitu", "chunri", "xingqiu"],
  },
  {
    id: "xingqiu",
    title: "星球课堂",
    subtitle: "少儿 · 科普 · 趣味探索",
    description:
      "用轻松动画和真实实验讲解宇宙、海洋与日常科学，让孩子在故事里理解世界如何运转。",
    score: "8.6",
    heat: "热度 6122",
    update: "适合 7+",
    category: "少儿 / 科普",
    year: "2026",
    region: "中国大陆",
    episodeCount: 30,
    quality: "1080P",
    badge: "适合 7+",
    progress: "适合 7+",
    duration: "24:30",
    source: STATIC_VIDEO_SRC,
    background: "linear-gradient(135deg,#2563eb,#0f766e 56%,#0f172a)",
    tags: ["少儿", "科普", "动画", "亲子"],
    casts: ["小宇宙讲解团"],
    calendar: [
      { time: "每日", detail: "趣味知识短片更新", active: true },
      { time: "周末", detail: "亲子实验课上线" },
      { time: "会员", detail: "无广告连续播放" },
    ],
    episodes: createEpisodes(10),
    relatedIds: ["shen-kong", "hai-an", "shaonian", "chunri"],
  },
  {
    id: "xuexian",
    title: "雪线之上",
    subtitle: "纪录片 · 自然 · 雪山生态",
    description:
      "摄制组穿越高海拔雪线，记录极端气候下的动物迁徙、冰川变化与守护者的日常。",
    score: "8.9",
    heat: "热度 5988",
    update: "4K HDR",
    category: "纪录片 / 自然",
    year: "2026",
    region: "中国大陆",
    episodeCount: 5,
    quality: "4K HDR",
    badge: "自然纪录",
    progress: "4K HDR",
    duration: "50:18",
    source: STATIC_VIDEO_SRC,
    background: "linear-gradient(135deg,#0369a1,#334155 56%,#020617)",
    tags: ["纪录片", "自然", "雪山", "4K"],
    casts: ["旁白：林默"],
    calendar: [
      { time: "已上线", detail: "全 5 集可看", active: true },
      { time: "幕后", detail: "高海拔拍摄花絮" },
      { time: "会员", detail: "支持 4K HDR" },
    ],
    episodes: createEpisodes(5),
    relatedIds: ["hai-an", "xingqiu", "shen-kong", "guitu"],
  },
  {
    id: "shen-kong",
    title: "深空来客",
    subtitle: "科幻 · 悬疑 · 未知信号",
    description:
      "一颗来自太阳系边缘的探测器突然回传陌生影像，科学团队在解析数据时发现它并不孤单。",
    score: "8.4",
    heat: "热度 5772",
    update: "同类型热播",
    category: "科幻 / 悬疑",
    year: "2026",
    region: "中国大陆",
    episodeCount: 12,
    quality: "4K",
    badge: "同类型热播",
    progress: "同类型热播",
    duration: "42:18",
    source: STATIC_VIDEO_SRC,
    background: "linear-gradient(135deg,#1d4ed8,#111827 58%,#0f172a)",
    tags: ["科幻", "悬疑", "太空", "探索"],
    casts: ["郑原", "叶知", "罗森"],
    calendar: [
      { time: "今天", detail: "第 1 集 已上线", active: true },
      { time: "周五", detail: "第 2 集 更新" },
      { time: "会员", detail: "抢先看 1 集" },
    ],
    episodes: createEpisodes(6),
    relatedIds: ["xinghe", "lingdian", "jiyi", "xingqiu"],
  },
  {
    id: "lingdian",
    title: "零点航线",
    subtitle: "冒险 · 灾难 · 极限救援",
    description:
      "跨海航班在零点穿越风暴区，机组和乘客必须在有限时间内完成一场不可能的迫降。",
    score: "8.0",
    heat: "热度 5569",
    update: "会员抢先看",
    category: "冒险 / 灾难",
    year: "2026",
    region: "中国大陆",
    episodeCount: 1,
    quality: "1080P",
    badge: "会员抢先看",
    progress: "会员抢先看",
    duration: "39:46",
    source: STATIC_VIDEO_SRC,
    background: "linear-gradient(135deg,#be123c,#312e81 55%,#111827)",
    tags: ["冒险", "灾难", "救援", "电影"],
    casts: ["江川", "宁栀", "贺言"],
    calendar: [
      { time: "今日", detail: "正片已上线", active: true },
      { time: "会员", detail: "幕后特辑开放" },
      { time: "周末", detail: "主创直播回看" },
    ],
    episodes: createEpisodes(1),
    relatedIds: ["guitu", "xinghe", "shen-kong", "jixian"],
  },
  {
    id: "jiyi",
    title: "记忆穹顶",
    subtitle: "悬疑 · 剧情 · 记忆迷局",
    description:
      "一座能储存记忆的城市突然出现集体失忆事件，修复师必须进入别人的过去寻找缺失的一小时。",
    score: "8.7",
    heat: "热度 5420",
    update: "高分剧集",
    category: "悬疑 / 剧情",
    year: "2026",
    region: "中国大陆",
    episodeCount: 18,
    quality: "4K",
    badge: "高分剧集",
    progress: "高分剧集",
    duration: "45:02",
    source: STATIC_VIDEO_SRC,
    background: "linear-gradient(135deg,#0f766e,#172554 56%,#111827)",
    tags: ["悬疑", "剧情", "记忆", "反转"],
    casts: ["程望", "许岚", "顾醒"],
    calendar: [
      { time: "今天", detail: "第 1-2 集 已上线", active: true },
      { time: "周三", detail: "第 3 集 更新" },
      { time: "会员", detail: "抢先看 2 集" },
    ],
    episodes: createEpisodes(8),
    relatedIds: ["anye", "xinghe", "shen-kong", "lingdian"],
  },
  {
    id: "bianjing",
    title: "边境星门",
    subtitle: "科幻 · 动作 · 星际防线",
    description:
      "边境星门意外开启，守备队在未知文明与人类命令之间做出选择，战斗由此改变两个世界的命运。",
    score: "8.2",
    heat: "热度 5304",
    update: "正在热播",
    category: "科幻 / 动作",
    year: "2026",
    region: "中国大陆",
    episodeCount: 20,
    quality: "4K HDR",
    badge: "正在热播",
    progress: "正在热播",
    duration: "47:31",
    source: STATIC_VIDEO_SRC,
    background: "linear-gradient(135deg,#ca8a04,#1e293b 55%,#111827)",
    tags: ["科幻", "动作", "星际", "热血"],
    casts: ["陆行", "白鹿", "韩野"],
    calendar: [
      { time: "今天", detail: "第 5-6 集 已上线", active: true },
      { time: "周五", detail: "第 7-8 集 更新" },
      { time: "会员", detail: "抢先看 2 集" },
    ],
    episodes: createEpisodes(6),
    relatedIds: ["xinghe", "shen-kong", "lingdian", "shaonian"],
  },
];

export const featuredVideo = videoLibrary[0];
export const recommendationVideos = videoLibrary.slice(1, 5);
export const hotVideos = videoLibrary.slice(5, 10);
export const hotSearchKeywords = [
  "星河回响",
  "电影",
  "悬疑",
  "纪录片",
  "会员",
  "科幻",
];

// 根据频道 slug 获取频道配置；slug 为 URL 中的频道标识，未命中时返回精选频道。
export function getChannelBySlug(slug: string): ChannelItem {
  return (
    channelItems.find((channel) => channel.slug === slug) ?? channelItems[0]
  );
}

// 判断视频是否匹配频道关键词；video 为候选视频，keywords 为频道关键词列表。
function matchesChannelKeywords(video: VideoItem, keywords: string[]): boolean {
  const searchableText = [
    video.title,
    video.subtitle,
    video.category,
    video.badge,
    video.progress,
    ...video.tags,
  ].join(" ");

  return keywords.some((keyword) => searchableText.includes(keyword));
}

// 判断视频是否命中单个筛选词；keyword 为空时默认不过滤。
function matchesVideoFilterKeyword(video: VideoItem, keyword?: string): boolean {
  const normalizedKeyword = keyword?.trim().toLowerCase();

  if (!normalizedKeyword) {
    return true;
  }

  const searchableText = [
    video.title,
    video.subtitle,
    video.category,
    video.badge,
    video.progress,
    ...video.tags,
  ]
    .join(" ")
    .toLowerCase();

  return searchableText.includes(normalizedKeyword);
}

// 提取热度数值；mock 字符串里没有数字时按 0 处理，避免排序异常。
function getHeatValue(video: VideoItem): number {
  return Number(video.heat.replace(/\D/g, "")) || 0;
}

// 按频道排序选项返回新数组，避免修改原始 mock 数据顺序。
function sortChannelVideos(
  videos: VideoItem[],
  sort: ChannelSort = "default",
): VideoItem[] {
  const sortedVideos = [...videos];

  if (sort === "new") {
    return sortedVideos.sort(
      (firstVideo, secondVideo) =>
        Number(secondVideo.year) - Number(firstVideo.year) ||
        getHeatValue(secondVideo) - getHeatValue(firstVideo),
    );
  }

  if (sort === "hot") {
    return sortedVideos.sort(
      (firstVideo, secondVideo) =>
        getHeatValue(secondVideo) - getHeatValue(firstVideo),
    );
  }

  if (sort === "score") {
    return sortedVideos.sort(
      (firstVideo, secondVideo) =>
        Number(secondVideo.score) - Number(firstVideo.score),
    );
  }

  return sortedVideos;
}

// 根据频道 slug 获取频道视频；slug 为 URL 中的频道标识，未命中或无结果时回退到精选内容。
export function getVideosByChannel(slug: string): VideoItem[] {
  const channel = getChannelBySlug(slug);

  if (channel.slug === "featured") {
    return videoLibrary;
  }

  const videos = videoLibrary.filter((video) =>
    matchesChannelKeywords(video, channel.keywords),
  );

  return videos.length > 0 ? videos : videoLibrary;
}

// 根据频道筛选状态获取视频；filters 对应频道页 URL 查询参数。
export function getFilteredChannelVideos(
  slug: string,
  filters: ChannelFilterState = {},
): VideoItem[] {
  const videos = getVideosByChannel(slug).filter(
    (video) =>
      matchesVideoFilterKeyword(video, filters.type) &&
      (!filters.year || video.year === filters.year),
  );

  return sortChannelVideos(videos, filters.sort);
}

// 获取全站排行榜视频；sort 控制热度、高分或最新排序，返回新数组避免改动原始片库。
export function getRankedVideos(sort: RankSort = "hot"): VideoItem[] {
  return sortChannelVideos(videoLibrary, sort);
}

// 根据关键词搜索视频；query 为用户输入的搜索词，空关键词时返回空数组。
export function searchVideos(query: string): VideoItem[] {
  const keyword = query.trim().toLowerCase();

  if (!keyword) {
    return [];
  }

  return videoLibrary.filter((video) => {
    const searchableText = [
      video.title,
      video.subtitle,
      video.description,
      video.category,
      video.badge,
      video.progress,
      video.year,
      video.region,
      ...video.tags,
      ...video.casts,
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(keyword);
  });
}

// 根据关键词和筛选状态搜索视频；filters 对应搜索页 URL 查询参数。
export function searchVideosWithFilters(
  query: string,
  filters: SearchFilterState = {},
): VideoItem[] {
  const videos = searchVideos(query).filter((video) =>
    matchesVideoFilterKeyword(video, filters.type),
  );
  const sort = filters.sort === "relevance" ? "default" : filters.sort;

  return sortChannelVideos(videos, sort);
}

// 根据路由 id 获取视频详情；id 为 URL 中的视频标识，未命中时返回首页主推视频。
export function getVideoById(id: string): VideoItem {
  return videoLibrary.find((video) => video.id === id) ?? featuredVideo;
}

// 根据当前视频获取相关推荐；videoId 为当前视频标识，limit 控制最多返回数量。
export function getRelatedVideos(videoId: string, limit = 4): VideoItem[] {
  const currentVideo = getVideoById(videoId);
  const relatedVideos = currentVideo.relatedIds
    .map((id) => videoLibrary.find((video) => video.id === id))
    .filter((video): video is VideoItem => Boolean(video));

  if (relatedVideos.length >= limit) {
    return relatedVideos.slice(0, limit);
  }

  const fallbackVideos = videoLibrary.filter(
    (video) =>
      video.id !== currentVideo.id &&
      !relatedVideos.some((relatedVideo) => relatedVideo.id === video.id),
  );

  return [...relatedVideos, ...fallbackVideos].slice(0, limit);
}
