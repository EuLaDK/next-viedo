import { CacheList } from "@/components/profile/cache-list";

// 渲染缓存中心页入口；缓存数据由客户端 Zustand store 读取。
export default function CachePage() {
  return <CacheList />;
}
