type ApiParamValue = boolean | number | string | undefined;

type ApiFallback<TData> = () => Promise<TData> | TData;

type ApiRequestOptions<TData> = {
  baseUrl?: string;
  fallback: ApiFallback<TData>;
  init?: RequestInit;
  params?: Record<string, ApiParamValue>;
  path: string;
};

// 获取接口基础地址；未配置时返回空字符串，让调用方走 mock fallback。
function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ?? "";
}

// 生成完整接口地址；path 为接口路径，params 为 URL 查询参数。
function buildApiUrl(
  path: string,
  params: Record<string, ApiParamValue> = {},
  baseUrl = getApiBaseUrl(),
): string {
  const trimmedBaseUrl = baseUrl.trim();

  if (!trimmedBaseUrl) {
    return "";
  }

  const url = new URL(path.startsWith("/") ? path : `/${path}`, trimmedBaseUrl);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

// 请求 JSON 数据；接口未配置或失败时返回 fallback，方便本地继续使用 mock 数据。
export async function requestApiWithFallback<TData>({
  baseUrl,
  fallback,
  init,
  params,
  path,
}: ApiRequestOptions<TData>): Promise<TData> {
  const apiUrl = buildApiUrl(path, params, baseUrl);

  if (!apiUrl) {
    return fallback();
  }

  try {
    const response = await fetch(apiUrl, {
      ...init,
      headers: {
        Accept: "application/json",
        ...init?.headers,
      },
    });

    if (!response.ok) {
      return fallback();
    }

    return (await response.json()) as TData;
  } catch {
    return fallback();
  }
}
