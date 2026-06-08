// 生成视频播放页链接；videoId 为 mock 视频或后端视频的唯一标识。
export function getVideoWatchHref(videoId: string): string {
  return `/watch/${videoId}`;
}
