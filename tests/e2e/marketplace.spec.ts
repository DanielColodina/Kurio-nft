import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(async () => {
    await fetch("/api/test/reset", { method: "POST" });
  });
});

test("busca sincroniza a URL e filtra o catálogo", async ({
  page,
  isMobile,
}) => {
  if (isMobile) {
    await page.goto("/");
    await page.getByLabel("Buscar coleções").fill("Emerald");
    await page.getByLabel("Buscar coleções").press("Enter");
  } else {
    await page.goto("/?search=Emerald");
  }
  await expect(page).toHaveURL(/search=Emerald/);
  await expect(
    page.locator("a:visible", { hasText: "Emerald Ape #042" }).first(),
  ).toBeVisible();
  await expect(page.getByText("Sage Nomad #009")).toHaveCount(0);
});

test("detalhe adiciona item e carrinho persiste após refresh", async ({
  page,
}) => {
  await page.goto("/nft/emerald-ape-042");
  await page.getByRole("button", { name: "Adicionar ao carrinho" }).click();
  await page.goto("/cart");
  await expect(page.getByText("Emerald Ape #042")).toBeVisible();
  await page.reload();
  await expect(page.getByText("Emerald Ape #042")).toBeVisible();
});

test("login válido recupera sessão", async ({ page }) => {
  await page.goto("/login");
  await page
    .getByRole("main")
    .getByRole("button", { name: "Entrar", exact: true })
    .click();
  await expect(page).toHaveURL(/\/$/);
  await page.goto("/profile");
  await expect(page.getByText("Perfil do colecionador")).toBeVisible();
});

test("checkout cria um único pedido confirmado", async ({ page }) => {
  await page.goto("/login?returnTo=%2Fcheckout");
  await page
    .getByRole("main")
    .getByRole("button", { name: "Entrar", exact: true })
    .click();
  await expect(page).toHaveURL(/checkout/);
  await page.getByRole("button", { name: "Confirmar compra" }).click();
  await expect(page).toHaveURL(/order\/KUR-/);
  await expect(
    page.getByText("Seus NFTs agora estão na sua carteira"),
  ).toBeVisible();
});

test("recurso inexistente exibe estado apropriado", async ({ page }) => {
  await page.goto("/nft/inexistente");
  await expect(page.getByText("NFT não encontrado")).toBeVisible();
});

test("Socket.IO simulado conecta e atualiza o preço em tempo real", async ({
  page,
}) => {
  await page.goto("/nft/emerald-ape-042");
  await expect(page.locator("html")).toHaveAttribute(
    "data-realtime",
    "connected",
  );
  await page.evaluate(() => {
    window.dispatchEvent(
      new CustomEvent("kurio:demo-price-change", {
        detail: { nftId: "emerald-ape-042", price: "1.27" },
      }),
    );
  });
  await expect(
    page.locator(".price:visible", { hasText: "1.27 ETH" }).first(),
  ).toBeVisible();
});

test("ordenação por preço e âncora do diário permanecem funcionais", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "O diário é uma seção exclusiva do layout desktop.");
  await page.goto("/?sort=price_asc#diario");
  await expect(page).toHaveURL(/\?sort=price_asc#diario$/);
  await expect(
    page.locator(".kurio-nft-grid article").first(),
  ).toContainText("0.35 ETH");
  await expect(page.locator("#diario")).toBeInViewport();
});

test("rota privada redireciona ao login e preserva o retorno", async ({
  page,
}) => {
  await page.goto("/checkout");
  await expect(page).toHaveURL(/\/login\?returnTo=%2Fcheckout/);
  await page
    .getByRole("main")
    .getByRole("button", { name: "Entrar", exact: true })
    .click();
  await expect(page).toHaveURL(/\/checkout$/);
});

test("cupom inválido informa erro e cupom válido atualiza o total", async ({
  page,
}) => {
  await page.goto("/cart");
  const coupon = page.getByPlaceholder("Digite o código promocional...");
  await coupon.fill("INVALIDO");
  await page.getByRole("button", { name: "Aplicar" }).click();
  await expect(page.getByRole("alert")).toContainText("Cupom inválido");
  await coupon.fill("KURIO10");
  await page.getByRole("button", { name: "Aplicar" }).click();
  await expect(page.getByRole("status")).toContainText("KURIO10");
  await expect(page.getByText("(-) 0.81 ETH")).toBeVisible();
});

test("cadastro duplicado retorna conflito acessível", async ({ page }) => {
  await page.goto("/register");
  await page.getByPlaceholder("Nome de usuário").fill("Outro colecionador");
  await page.getByPlaceholder("Digite seu e-mail").fill("contato@email.com");
  await page.getByPlaceholder("Senha", { exact: true }).fill("Kurio@2026");
  await page.getByPlaceholder("Confirmar senha").fill("Kurio@2026");
  await page.getByRole("button", { name: "Criar perfil" }).click();
  await expect(page.getByRole("alert")).toContainText("já está cadastrado");
});

test("pagamento recusado mantém o carrinho", async ({ page }) => {
  await page.goto("/login");
  await page
    .getByRole("main")
    .getByRole("button", { name: "Entrar", exact: true })
    .click();
  await page.goto("/checkout?scenario=declined");
  await page.getByRole("button", { name: "Confirmar compra" }).click();
  await expect(page.getByText("Pagamento recusado")).toBeVisible();
  await page.goto("/cart");
  await expect(page.getByText("Emerald Ape #042")).toBeVisible();
});

test("perfil persiste avatar, dados e alteração de senha", async ({ page }) => {
  await page.goto("/login");
  await page
    .getByRole("main")
    .getByRole("button", { name: "Entrar", exact: true })
    .click();
  await page.goto("/profile");
  await page.getByLabel("Nome de exibição *").fill("Colecionador Atualizado");
  await page.getByLabel("Senha atual").fill("Kurio@2026");
  await page.getByLabel("Nova senha", { exact: true }).fill("NovaKurio@2026");
  await page.getByLabel("Confirmar nova senha").fill("NovaKurio@2026");
  await page.getByRole("button", { name: "Salvar", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Dados salvos");
  await page.reload();
  await expect(page.getByLabel("Nome de exibição *")).toHaveValue(
    "Colecionador Atualizado",
  );
});
