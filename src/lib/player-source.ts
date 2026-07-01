export type PlaybackEngine = "native" | "hls" | "dash";

type PlaybackSourceMetadata = {
  mimeType?: string;
  sourceUrl?: string;
};

type DirectVideoSourceInput = {
  engine: PlaybackEngine;
  sourceUrl: string;
  supportsNativeHls: boolean;
};

type PlaybackMediaKeyInput = {
  playerKey: string;
  sourceUrl: string;
};

const hlsMimeTypes = new Set([
  "application/vnd.apple.mpegurl",
  "application/x-mpegurl",
  "audio/mpegurl",
  "audio/x-mpegurl",
]);

const dashMimeTypes = new Set(["application/dash+xml"]);

/* 规范化 MIME 类型；mimeType 可带 charset 等参数。 */
function normalizeMimeType(mimeType = ""): string {
  return mimeType.split(";")[0]?.trim().toLowerCase() ?? "";
}

/* 读取 URL 路径后缀；sourceUrl 可包含 query/hash。 */
function getSourcePath(sourceUrl = ""): string {
  return sourceUrl.split(/[?#]/, 1)[0]?.trim().toLowerCase() ?? "";
}

/* 根据播放源元信息选择浏览器播放引擎；未知类型保守走原生 video。 */
export function getPlaybackEngine(source: PlaybackSourceMetadata): PlaybackEngine {
  const mimeType = normalizeMimeType(source.mimeType);
  const sourcePath = getSourcePath(source.sourceUrl);

  if (hlsMimeTypes.has(mimeType) || sourcePath.endsWith(".m3u8")) {
    return "hls";
  }

  if (dashMimeTypes.has(mimeType) || sourcePath.endsWith(".mpd")) {
    return "dash";
  }

  return "native";
}

/* 判断是否可以直接给 video.src；HLS 仅在浏览器原生支持时直连。 */
export function getDirectVideoSourceUrl({
  engine,
  sourceUrl,
  supportsNativeHls,
}: DirectVideoSourceInput): string | null {
  if (engine === "native" || (engine === "hls" && supportsNativeHls)) {
    return sourceUrl;
  }

  return null;
}

/* 生成 video 节点 key；同一集同一播放地址不因清晰度标签变化而重建节点。 */
export function getPlaybackMediaKey({
  playerKey,
  sourceUrl,
}: PlaybackMediaKeyInput): string {
  return `${playerKey}-${sourceUrl || "empty"}`;
}
