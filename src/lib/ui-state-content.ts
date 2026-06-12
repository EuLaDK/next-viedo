export type UiStateContent = {
  title: string;
  description: string;
};

const defaultEmptyContent: UiStateContent = {
  title: "暂无内容",
  description: "稍后再来看看，或返回首页发现更多内容。",
};

const uiStateContentMap = {
  "search-empty": {
    title: "没有找到相关内容",
    description: "换个关键词试试，比如“科幻”“电影”“纪录片”。",
  },
  "channel-empty": {
    title: "暂无匹配内容",
    description: "换个类型或年份试试，后续接入真实片库后这里会更丰富。",
  },
  "channel-rank-empty": {
    title: "当前筛选暂无热榜内容",
    description: "清空类型或年份后可以查看完整榜单。",
  },
  "history-empty": {
    title: "还没有观看历史",
    description: "进入任意播放页后，这里会自动保存你最近看过的内容。",
  },
  "favorites-empty": {
    title: "还没有追剧内容",
    description: "去播放详情页点击“追剧”，这里就会出现你的片单。",
  },
  "cache-empty": {
    title: "还没有缓存内容",
    description: "去播放详情页点击“缓存”，这里就会出现离线观看列表。",
  },
  "overview-history-empty": {
    title: "暂无观看历史",
    description: "去播放页看一段视频后，这里会出现继续观看入口。",
  },
  "overview-favorites-empty": {
    title: "暂无追剧收藏",
    description: "在播放详情页点击追剧后，这里会展示最近收藏。",
  },
  "header-history-empty": {
    title: "还没有观看记录",
    description: "进入任意播放页后，这里会自动保存最近观看内容。",
  },
  "comments-empty": {
    title: "还没有评论",
    description: "写下第一条评论，让这个播放页更有现场感。",
  },
  "danmaku-empty": {
    title: "暂无弹幕",
    description: "发送后会在这里显示最近弹幕。",
  },
  loading: {
    title: "内容加载中",
    description: "正在准备页面内容，请稍等片刻。",
  },
  error: {
    title: "内容暂时不可用",
    description: "页面加载遇到问题，可以稍后刷新重试。",
  },
} satisfies Record<string, UiStateContent>;

export type UiStateContentPreset = keyof typeof uiStateContentMap;

// 获取通用页面状态文案；preset 为业务场景 key，未知 key 会回退到默认空状态。
export function getUiStateContent(preset?: string): UiStateContent {
  if (!preset) {
    return defaultEmptyContent;
  }

  return (
    uiStateContentMap[preset as UiStateContentPreset] ?? defaultEmptyContent
  );
}
