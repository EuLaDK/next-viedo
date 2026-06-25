export type VideoEpisode = {
  episode: number;
  title: string;
  duration: string;
  status?: string;
};

export type VideoReleaseCalendarItem = {
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
  totalEpisodes: number;
  quality: string;
  badge: string;
  progress: string;
  duration: string;
  sourceUrl: string;
  coverGradient: string;
  tags: string[];
  castNames: string[];
  releaseCalendar: VideoReleaseCalendarItem[];
  episodes: VideoEpisode[];
  relatedVideoIds: string[];
};

export type PlaybackSource = {
  quality: string;
  label: string;
  sourceUrl: string;
  mimeType: string;
};

export type PlaybackResume = {
  canResume: boolean;
  episode?: number;
  watchSeconds?: number;
  durationSeconds?: number;
};

export type PlaybackConfig = {
  sources: PlaybackSource[];
  defaultQuality: string;
  requiresVip: boolean;
  canPlay: boolean;
  trialSeconds: number;
  message: string;
  resume: PlaybackResume;
};

export const STATIC_VIDEO_SRC = "/assets/video/staticTest.mp4";

// 生成剧集列表；count 为总集数，activeEpisode 为默认标记正在播放的集数。
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
    totalEpisodes: 24,
    quality: "4K HDR",
    badge: "独播",
    progress: "会员抢先看",
    duration: "45:00",
    sourceUrl: STATIC_VIDEO_SRC,
    coverGradient:
      "linear-gradient(135deg,#0f766e,#111827 50%,#be123c),radial-gradient(circle_at_72%_28%,rgba(125,211,252,0.55),transparent_25%)",
    tags: ["科幻", "悬疑", "冒险", "会员抢先看"],
    castNames: ["林舟", "许念", "周砚", "陈白"],
    releaseCalendar: [
      { time: "今天 20:00", detail: "第 1-2 集 已上线", active: true },
      { time: "周五 20:00", detail: "第 3-4 集 即将更新" },
      { time: "下周五", detail: "会员抢先看 4 集" },
    ],
    episodes: createEpisodes(12),
    relatedVideoIds: ["shen-kong", "lingdian", "jiyi", "bianjing"],
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
    totalEpisodes: 16,
    quality: "1080P",
    badge: "高分完结",
    progress: "全季可看",
    duration: "42:18",
    sourceUrl: STATIC_VIDEO_SRC,
    coverGradient: "linear-gradient(135deg,#1d4ed8,#111827 58%,#0f172a)",
    tags: ["犯罪", "悬疑", "反转", "完结"],
    castNames: ["秦越", "唐棠", "陆衡", "宋知"],
    releaseCalendar: [
      { time: "已完结", detail: "全 16 集一次看完", active: true },
      { time: "番外", detail: "幕后特辑同步上线" },
      { time: "会员", detail: "支持 1080P 高清播放" },
    ],
    episodes: createEpisodes(16),
    relatedVideoIds: ["jiyi", "xinghe", "lingdian", "hai-an"],
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
    totalEpisodes: 20,
    quality: "4K",
    badge: "温暖新剧",
    progress: "更新至 10 集",
    duration: "39:46",
    sourceUrl: STATIC_VIDEO_SRC,
    coverGradient: "linear-gradient(135deg,#c2410c,#27272a 55%,#111827)",
    tags: ["都市", "治愈", "美食", "群像"],
    castNames: ["沈安", "叶晴", "乔木", "罗一"],
    releaseCalendar: [
      { time: "今天", detail: "第 9-10 集 已上线", active: true },
      { time: "周三", detail: "第 11-12 集 更新" },
      { time: "会员", detail: "抢先看 2 集" },
    ],
    episodes: createEpisodes(10),
    relatedVideoIds: ["chunri", "guitu", "xingqiu", "hai-an"],
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
    totalEpisodes: 18,
    quality: "1080P",
    badge: "热血成长",
    progress: "更新至 8 集",
    duration: "41:20",
    sourceUrl: STATIC_VIDEO_SRC,
    coverGradient: "linear-gradient(135deg,#7c3aed,#1f2937 58%,#0f172a)",
    tags: ["青春", "竞技", "成长", "热血"],
    castNames: ["祁远", "江夏", "孟宁", "白辰"],
    releaseCalendar: [
      { time: "周六", detail: "第 7-8 集 已上线", active: true },
      { time: "周日", detail: "加更训练赛特辑" },
      { time: "下周", detail: "全国赛篇开启" },
    ],
    episodes: createEpisodes(8),
    relatedVideoIds: ["jixian", "xingqiu", "chunri", "yunduan"],
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
    totalEpisodes: 6,
    quality: "4K HDR",
    badge: "口碑纪录",
    progress: "4K HDR",
    duration: "48:08",
    sourceUrl: STATIC_VIDEO_SRC,
    coverGradient: "linear-gradient(135deg,#0f766e,#172554 56%,#111827)",
    tags: ["纪录片", "自然", "人文", "4K"],
    castNames: ["旁白：周闻"],
    releaseCalendar: [
      { time: "已上线", detail: "全 6 集可看", active: true },
      { time: "幕后", detail: "海岸拍摄日志上线" },
      { time: "会员", detail: "支持 4K HDR" },
    ],
    episodes: createEpisodes(6),
    relatedVideoIds: ["xuexian", "guitu", "xingqiu", "shen-kong"],
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
    totalEpisodes: 1,
    quality: "4K",
    badge: "本周新片",
    progress: "本周新片",
    duration: "01:48:20",
    sourceUrl: STATIC_VIDEO_SRC,
    coverGradient: "linear-gradient(135deg,#be123c,#312e81 55%,#111827)",
    tags: ["电影", "冒险", "公路", "亲情"],
    castNames: ["梁舟", "何曼", "苏临"],
    releaseCalendar: [
      { time: "今日上线", detail: "正片可看", active: true },
      { time: "会员", detail: "支持 4K 清晰度" },
      { time: "花絮", detail: "导演解说同步上线" },
    ],
    episodes: createEpisodes(1),
    relatedVideoIds: ["lingdian", "hai-an", "yunduan", "jixian"],
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
    totalEpisodes: 24,
    quality: "1080P",
    badge: "轻喜热播",
    progress: "更新至 12 集",
    duration: "40:10",
    sourceUrl: STATIC_VIDEO_SRC,
    coverGradient: "linear-gradient(135deg,#15803d,#0f172a 58%,#1f2937)",
    tags: ["都市", "轻喜", "治愈", "友情"],
    castNames: ["唐青", "顾南", "齐愿", "米兰"],
    releaseCalendar: [
      { time: "今天", detail: "第 11-12 集 已上线", active: true },
      { time: "周四", detail: "第 13-14 集 更新" },
      { time: "会员", detail: "抢先看 2 集" },
    ],
    episodes: createEpisodes(12),
    relatedVideoIds: ["yunduan", "shaonian", "xingqiu", "guitu"],
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
    totalEpisodes: 12,
    quality: "1080P",
    badge: "高能综艺",
    progress: "第 6 期上线",
    duration: "01:12:06",
    sourceUrl: STATIC_VIDEO_SRC,
    coverGradient: "linear-gradient(135deg,#ca8a04,#1e293b 55%,#111827)",
    tags: ["综艺", "真人秀", "挑战", "搞笑"],
    castNames: ["常驻嘉宾团"],
    releaseCalendar: [
      { time: "周五", detail: "第 6 期 已上线", active: true },
      { time: "周六", detail: "会员加更版" },
      { time: "下周五", detail: "第 7 期 更新" },
    ],
    episodes: createEpisodes(6),
    relatedVideoIds: ["shaonian", "guitu", "chunri", "xingqiu"],
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
    totalEpisodes: 30,
    quality: "1080P",
    badge: "适合 7+",
    progress: "适合 7+",
    duration: "24:30",
    sourceUrl: STATIC_VIDEO_SRC,
    coverGradient: "linear-gradient(135deg,#2563eb,#0f766e 56%,#0f172a)",
    tags: ["少儿", "科普", "动画", "亲子"],
    castNames: ["小宇宙讲解团"],
    releaseCalendar: [
      { time: "每日", detail: "趣味知识短片更新", active: true },
      { time: "周末", detail: "亲子实验课上线" },
      { time: "会员", detail: "无广告连续播放" },
    ],
    episodes: createEpisodes(10),
    relatedVideoIds: ["shen-kong", "hai-an", "shaonian", "chunri"],
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
    totalEpisodes: 5,
    quality: "4K HDR",
    badge: "自然纪录",
    progress: "4K HDR",
    duration: "50:18",
    sourceUrl: STATIC_VIDEO_SRC,
    coverGradient: "linear-gradient(135deg,#0369a1,#334155 56%,#020617)",
    tags: ["纪录片", "自然", "雪山", "4K"],
    castNames: ["旁白：林默"],
    releaseCalendar: [
      { time: "已上线", detail: "全 5 集可看", active: true },
      { time: "幕后", detail: "高海拔拍摄花絮" },
      { time: "会员", detail: "支持 4K HDR" },
    ],
    episodes: createEpisodes(5),
    relatedVideoIds: ["hai-an", "xingqiu", "shen-kong", "guitu"],
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
    totalEpisodes: 12,
    quality: "4K",
    badge: "同类型热播",
    progress: "同类型热播",
    duration: "42:18",
    sourceUrl: STATIC_VIDEO_SRC,
    coverGradient: "linear-gradient(135deg,#1d4ed8,#111827 58%,#0f172a)",
    tags: ["科幻", "悬疑", "太空", "探索"],
    castNames: ["郑原", "叶知", "罗森"],
    releaseCalendar: [
      { time: "今天", detail: "第 1 集 已上线", active: true },
      { time: "周五", detail: "第 2 集 更新" },
      { time: "会员", detail: "抢先看 1 集" },
    ],
    episodes: createEpisodes(6),
    relatedVideoIds: ["xinghe", "lingdian", "jiyi", "xingqiu"],
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
    totalEpisodes: 1,
    quality: "1080P",
    badge: "会员抢先看",
    progress: "会员抢先看",
    duration: "39:46",
    sourceUrl: STATIC_VIDEO_SRC,
    coverGradient: "linear-gradient(135deg,#be123c,#312e81 55%,#111827)",
    tags: ["冒险", "灾难", "救援", "电影"],
    castNames: ["江川", "宁栀", "贺言"],
    releaseCalendar: [
      { time: "今日", detail: "正片已上线", active: true },
      { time: "会员", detail: "幕后特辑开放" },
      { time: "周末", detail: "主创直播回看" },
    ],
    episodes: createEpisodes(1),
    relatedVideoIds: ["guitu", "xinghe", "shen-kong", "jixian"],
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
    totalEpisodes: 18,
    quality: "4K",
    badge: "高分剧集",
    progress: "高分剧集",
    duration: "45:02",
    sourceUrl: STATIC_VIDEO_SRC,
    coverGradient: "linear-gradient(135deg,#0f766e,#172554 56%,#111827)",
    tags: ["悬疑", "剧情", "记忆", "反转"],
    castNames: ["程望", "许岚", "顾醒"],
    releaseCalendar: [
      { time: "今天", detail: "第 1-2 集 已上线", active: true },
      { time: "周三", detail: "第 3 集 更新" },
      { time: "会员", detail: "抢先看 2 集" },
    ],
    episodes: createEpisodes(8),
    relatedVideoIds: ["anye", "xinghe", "shen-kong", "lingdian"],
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
    totalEpisodes: 20,
    quality: "4K HDR",
    badge: "正在热播",
    progress: "正在热播",
    duration: "47:31",
    sourceUrl: STATIC_VIDEO_SRC,
    coverGradient: "linear-gradient(135deg,#ca8a04,#1e293b 55%,#111827)",
    tags: ["科幻", "动作", "星际", "热血"],
    castNames: ["陆行", "白鹿", "韩野"],
    releaseCalendar: [
      { time: "今天", detail: "第 5-6 集 已上线", active: true },
      { time: "周五", detail: "第 7-8 集 更新" },
      { time: "会员", detail: "抢先看 2 集" },
    ],
    episodes: createEpisodes(6),
    relatedVideoIds: ["xinghe", "shen-kong", "lingdian", "shaonian"],
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
