// getHydrationSafeValue 在浏览器挂载前返回稳定兜底值；hasMounted 表示组件是否已完成客户端挂载。
export function getHydrationSafeValue<T>(
  hasMounted: boolean,
  value: T,
  fallback: T,
): T {
  return hasMounted ? value : fallback;
}
