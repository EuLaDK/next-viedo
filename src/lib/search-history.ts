const DEFAULT_SEARCH_HISTORY_LIMIT = 8;

// 添加搜索历史关键词；query 为空时返回原列表，重复项会移动到最前。
export function addSearchHistoryQuery(
  items: string[],
  query: string,
  limit = DEFAULT_SEARCH_HISTORY_LIMIT,
): string[] {
  const keyword = query.trim();

  if (!keyword) {
    return items;
  }

  return [keyword, ...items.filter((item) => item !== keyword)].slice(0, limit);
}
