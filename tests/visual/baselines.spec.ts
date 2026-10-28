import { test, expect } from "@playwright/test";

async function authenticate(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page
    .getByRole("main")
    .getByRole("button", { name: "Entrar", exact: true })
    .click();
  await page.waitForURL(/\/$/);
}

test("home visual", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await expect(page).toHaveScreenshot("home.png", {
    fullPage: true,
    animations: "disabled",
    maxDiffPixelRatio: 0.02,
  });
});

test("detalhe visual", async ({ page }) => {
  await page.goto("/nft/emerald-ape-042");
  await page.waitForLoadState("networkidle");
  await expect(page).toHaveScreenshot("detail.png", {
    fullPage: true,
    animations: "disabled",
    maxDiffPixelRatio: 0.02,
  });
});

for (const [name, path] of [
  ["cart", "/cart"],
  ["checkout", "/checkout"],
  ["login", "/login"],
  ["register", "/register"],
  ["profile", "/profile"],
  ["wallets", "/wallets"],
] as const) {
  test(`${name} visual`, async ({ page }) => {
    if (["checkout", "profile", "wallets"].includes(name)) {
      await authenticate(page);
    }
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot(`${name}.png`, {
      fullPage: true,
      animations: "disabled",
      maxDiffPixelRatio: 0.02,
    });
  });
}

test("confirmation visual", async ({ page }) => {
  await page.goto("/login?returnTo=%2Fcheckout");
  await page
    .getByRole("main")
    .getByRole("button", { name: "Entrar", exact: true })
    .click();
  await page.getByRole("button", { name: "Confirmar compra" }).click();
  await page.waitForURL(/order\/KUR-/);
  await page.waitForLoadState("networkidle");
  await expect(page).toHaveScreenshot("confirmation.png", {
    fullPage: true,
    animations: "disabled",
    maxDiffPixelRatio: 0.02,
  });
});
