import { expect, test } from "@playwright/test";

test("watch page loads player and switches available quality", async ({ page }) => {
  const pageErrors: string[] = [];

  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

  await page.goto("/watch/xinghe?episode=2&t=45&from=%2Frank");

  await expect(page.getByRole("link", { name: "返回上一页" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "星河回响 第 2 集" }),
  ).toBeVisible();
  await expect(page.getByLabel("星河回响 第 2 集 播放器")).toBeVisible();

  const qualityMenu = page.getByRole("button", { name: /清晰度/ });
  await expect(qualityMenu).toBeVisible();
  await qualityMenu.click();

  const qualityOptions = page.getByRole("menuitemradio");
  await expect(qualityOptions.first()).toBeVisible();

  const targetQuality = qualityOptions.last();
  const targetQualityName = await targetQuality.textContent();

  await targetQuality.click();

  if (targetQualityName) {
    await expect(qualityMenu).toContainText(targetQualityName.trim());
  }

  expect(pageErrors).toEqual([]);
});
