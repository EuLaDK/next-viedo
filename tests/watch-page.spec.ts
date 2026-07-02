import { expect, test, type Locator, type Page } from "@playwright/test";

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

// 等待客户端组件完成基础水合；page 为需要触发 React/Radix 控件的页面。
async function waitForClientReady(page: Page) {
  await page.waitForLoadState("networkidle");
}

// 断言播放器下拉菜单不是白底；menu 为当前打开的 Radix 菜单内容。
async function expectDarkPlayerMenu(menu: Locator) {
  const backgroundColor = await menu.evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  );

  expect(backgroundColor).not.toBe("rgb(255, 255, 255)");
  expect(backgroundColor).not.toBe("rgba(255, 255, 255, 1)");
}

// 打开播放器下拉菜单；trigger 为 Radix 菜单触发按钮。
async function openPlayerMenu(page: Page, trigger: Locator): Promise<Locator> {
  await trigger.click();
  await expect(trigger).toHaveAttribute("data-state", "open");

  const menu = page.locator('[data-slot="dropdown-menu-content"]').last();
  await expect(menu).toBeVisible();

  return menu;
}

test("watch page loads player and switches available quality", async ({ page }) => {
  const pageErrors = collectPageErrors(page);

  await page.goto("/watch/xinghe?episode=2&t=45&from=%2Frank");
  await waitForClientReady(page);

  await expect(page.getByRole("link", { name: "返回上一页" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "星河回响 第 2 集" }),
  ).toBeVisible();
  await expect(page.getByLabel("星河回响 第 2 集 播放器")).toBeVisible();

  const qualityMenu = page.getByRole("button", { name: /清晰度/ });
  await expect(qualityMenu).toBeVisible();

  const qualityContent = await openPlayerMenu(page, qualityMenu);
  const qualityOptions = qualityContent.getByRole("menuitemradio");
  await expect(qualityOptions.first()).toBeVisible();

  const targetQuality = qualityOptions.last();
  const targetQualityName = await targetQuality.textContent();

  await targetQuality.click();

  if (targetQualityName) {
    await expect(qualityMenu).toContainText(targetQualityName.trim());
  }

  await expect(page.getByLabel("星河回响 第 2 集 播放器")).toBeVisible();

  expectNoPageErrors(pageErrors);
});

test("watch page opens player option menus with readable dark surfaces", async ({
  page,
}) => {
  const pageErrors = collectPageErrors(page);

  await page.goto("/watch/xinghe?episode=5&from=%2F");
  await waitForClientReady(page);

  await expect(
    page.getByRole("heading", { name: "星河回响 第 5 集" }),
  ).toBeVisible();

  for (const menuName of ["清晰度", "倍速", "弹幕速度"]) {
    const menuButton = page.getByRole("button", { name: new RegExp(menuName) });
    const menu = await openPlayerMenu(page, menuButton);

    await expect(menu.getByRole("menuitemradio").first()).toBeVisible();
    await expectDarkPlayerMenu(menu);

    await page.keyboard.press("Escape");
    await expect(menuButton).toHaveAttribute("data-state", "closed");
    await expect(menu).toBeHidden();
  }

  expectNoPageErrors(pageErrors);
});

test("watch page can navigate to the next episode from player controls", async ({
  page,
}) => {
  const pageErrors = collectPageErrors(page);

  await page.goto("/watch/xinghe?episode=5&from=%2F");
  await waitForClientReady(page);

  await expect(
    page.getByRole("heading", { name: "星河回响 第 5 集" }),
  ).toBeVisible();

  await page.getByRole("link", { name: "下一集" }).click();

  await expect(page).toHaveURL(/\/watch\/xinghe\?episode=6/);
  await expect(
    page.getByRole("heading", { name: "星河回响 第 6 集" }),
  ).toBeVisible();
  await expect(page.getByLabel("星河回响 第 6 集 播放器")).toBeVisible();

  expectNoPageErrors(pageErrors);
});
