import { expect, test, type Page } from "@playwright/test";

// 收集页面未捕获异常；page 为当前 Playwright 页面。
function collectPageErrors(page: Page): string[] {
  const pageErrors: string[] = [];

  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

  return pageErrors;
}

// 断言页面没有未捕获异常；pageErrors 为 collectPageErrors 收集到的错误信息。
function expectNoPageErrors(pageErrors: string[]) {
  expect(pageErrors).toEqual([]);
}

// 等待客户端组件完成基础水合；page 为需要触发 React 点击交互的页面。
async function waitForClientReady(page: Page) {
  await page.waitForLoadState("networkidle");
}

test("home page exposes primary content, history popover, and user menu", async ({
  page,
}) => {
  const pageErrors = collectPageErrors(page);

  await page.goto("/");
  await waitForClientReady(page);

  await expect(
    page.getByRole("link", { name: "Next Video 首页" }),
  ).toBeVisible();
  await expect(page.locator("#hero-feature-title")).toBeVisible();
  await expect(page.getByRole("heading", { name: "排行榜" })).toBeVisible();

  const historyButton = page.getByRole("button", { name: "观看历史" });
  await historyButton.click();
  await expect(historyButton).toHaveAttribute("aria-expanded", "true");
  await expect(
    page.getByRole("link", { name: "查看全部历史" }),
  ).toBeVisible();
  await historyButton.click();
  await expect(historyButton).toHaveAttribute("aria-expanded", "false");
  await expect(page.getByText("查看全部历史")).toBeHidden();

  await page.getByRole("button", { name: "打开用户菜单" }).click();
  await expect(page.getByText("最近观看")).toBeVisible();
  await expect(
    page.getByRole("menuitem", { name: /登录账号|退出登录/ }),
  ).toBeVisible();

  expectNoPageErrors(pageErrors);
});

test("header search submits to the search results page", async ({ page }) => {
  const pageErrors = collectPageErrors(page);

  await page.goto("/");

  const searchInput = page.getByRole("searchbox", { name: "搜索视频" }).first();
  await searchInput.fill("科幻");
  await searchInput.press("Enter");

  await expect(page.getByRole("heading", { name: "搜索“科幻”" })).toBeVisible();
  await expect(page).toHaveURL(/\/search\?q=/);

  expectNoPageErrors(pageErrors);
});

test("search page shows active filters and clears back to recommendations", async ({
  page,
}) => {
  const pageErrors = collectPageErrors(page);

  await page.goto("/search?q=科幻&type=科幻&sort=hot");

  await expect(page.getByRole("heading", { name: "搜索“科幻”" })).toBeVisible();

  const filters = page.getByLabel("搜索筛选");
  await expect(filters).toBeVisible();
  await expect(filters.getByRole("link", { name: "科幻" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(filters.getByRole("link", { name: "最高热度" })).toHaveAttribute(
    "aria-current",
    "page",
  );

  await page.getByRole("link", { name: "清空搜索" }).click();

  await expect(
    page.getByRole("heading", { name: "搜索你想看的内容" }),
  ).toBeVisible();

  expectNoPageErrors(pageErrors);
});

test("rank page renders selected board and switches ranking tab", async ({
  page,
}) => {
  const pageErrors = collectPageErrors(page);

  await page.goto("/rank?sort=vip&channel=vip");

  await expect(page.getByRole("heading", { name: "VIP榜" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "上榜内容" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Top 10" })).toBeVisible();

  await page.getByRole("link", { name: "高分榜" }).click();

  await expect(page.getByRole("heading", { name: "高分榜" })).toBeVisible();

  expectNoPageErrors(pageErrors);
});

test("profile navigation opens VIP and history sections", async ({ page }) => {
  const pageErrors = collectPageErrors(page);

  await page.goto("/profile");
  await waitForClientReady(page);

  const profileNav = page.getByRole("navigation", { name: "个人中心导航" });
  await expect(profileNav).toBeVisible();
  await expect(page.getByRole("heading", { name: /Next Video/ })).toBeVisible();
  await expect(page.getByText("管理你的观看历史和追剧收藏")).toBeVisible();

  await profileNav.getByRole("link", { name: "VIP会员" }).click();

  await expect(
    page.getByRole("heading", { name: "Next Video VIP" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "权益对比" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "精选内容" })).toBeVisible();

  await profileNav.getByRole("link", { name: "观看历史" }).click();

  await expect(page.getByRole("heading", { name: "观看历史" })).toBeVisible();

  expectNoPageErrors(pageErrors);
});
