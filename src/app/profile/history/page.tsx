import { HistoryList } from "@/components/profile/history-list";

// 渲染观看历史页入口；历史数据由客户端 Zustand store 读取。
export default function HistoryPage() {
  return <HistoryList />;
}
