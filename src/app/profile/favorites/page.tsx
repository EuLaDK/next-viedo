import { FavoriteList } from "@/components/profile/favorite-list";

// 渲染追剧收藏页入口；收藏数据由客户端 Zustand store 读取。
export default function FavoritesPage() {
  return <FavoriteList />;
}
