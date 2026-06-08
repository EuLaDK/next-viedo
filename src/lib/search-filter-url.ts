import type { SearchFilterState, SearchSort } from "./mock-videos";

const validSearchSorts: SearchSort[] = ["relevance", "new", "hot", "score"];

// 读取 URL 查询参数；value 为字符串数组时取第一项，缺失时返回空字符串。
export function getSearchParamValue(
  value: string | string[] | undefined,
): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

// 规范化搜索排序参数；sortValue 非法时回落到相关度排序。
export function getSearchSort(
  sortValue: string | string[] | undefined,
): SearchSort {
  const sort = getSearchParamValue(sortValue);

  return validSearchSorts.includes(sort as SearchSort)
    ? (sort as SearchSort)
    : "relevance";
}

// 生成搜索筛选链接；默认排序和空筛选不写入 URL，保持地址简洁。
export function getSearchFilterHref(
  query: string,
  filters: SearchFilterState,
  nextFilters: SearchFilterState,
): string {
  const mergedFilters = {
    ...filters,
    ...nextFilters,
  };
  const searchParams = new URLSearchParams();
  const keyword = query.trim();

  if (keyword) {
    searchParams.set("q", keyword);
  }

  if (mergedFilters.type) {
    searchParams.set("type", mergedFilters.type);
  }

  if (mergedFilters.sort && mergedFilters.sort !== "relevance") {
    searchParams.set("sort", mergedFilters.sort);
  }

  const queryString = searchParams.toString();

  return queryString ? `/search?${queryString}` : "/search";
}
