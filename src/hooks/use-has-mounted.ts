"use client";

import { useSyncExternalStore } from "react";

let hasMountedSnapshot = false;
const listeners = new Set<() => void>();

// notifyMounted 异步通知浏览器挂载完成；避免在 effect 中同步 setState。
function notifyMounted() {
  if (hasMountedSnapshot) {
    return;
  }

  hasMountedSnapshot = true;
  listeners.forEach((listener) => listener());
}

// subscribeMounted 订阅挂载状态变化；listener 为 React 外部 store 更新回调。
function subscribeMounted(listener: () => void) {
  listeners.add(listener);
  window.setTimeout(notifyMounted, 0);

  return () => {
    listeners.delete(listener);
  };
}

// getMountedSnapshot 返回客户端挂载状态；供 useSyncExternalStore 读取。
function getMountedSnapshot() {
  return hasMountedSnapshot;
}

// getServerSnapshot 返回服务端固定快照；保证 SSR 首帧和客户端 hydration 首帧一致。
function getServerSnapshot() {
  return false;
}

// useHasMounted 返回组件是否已在浏览器端挂载；用于避免 SSR 与客户端首帧状态不一致。
export function useHasMounted(): boolean {
  return useSyncExternalStore(
    subscribeMounted,
    getMountedSnapshot,
    getServerSnapshot,
  );
}
