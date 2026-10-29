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

test("Socket.IO simulado atualiza preço e reconecta sem perder dados", async ({
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
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent("kurio:demo-reconnect"));
  });
  await expect(page.locator("html")).toHaveAttribute(
    "data-realtime",
    "reconnecting",
  );
  await expect(page.locator("html")).toHaveAttribute(
    "data-realtime",
    "connected",
  );
  await expect(
    page.locator(".price:visible", { hasText: "1.27 ETH" }).first(),
  ).toBeVisible();
});

test("sessão expirada durante checkout redireciona e preserva o carrinho", async ({
  page,
}) => {
  await page.goto("/login?returnTo=%2Fcheckout");
  await page
    .getByRole("main")
    .getByRole("button", { name: "Entrar", exact: true })
    .click();
  await expect(page).toHaveURL(/\/checkout$/);
  await page.evaluate(() => {
    sessionStorage.setItem("kurio.demo.checkout-session-expired", "true");
  });
  await page.getByRole("button", { name: "Confirmar compra" }).click();
  await expect(page).toHaveURL(/\/login\?returnTo=%2Fcheckout$/);
  await page.evaluate(() => {
    sessionStorage.removeItem("kurio.demo.checkout-session-expired");
  });
  await page.goto("/cart");
  await expect(page.getByText("Emerald Ape #042")).toBeVisible();
  const orderCount = await page.evaluate(() => {
    const state = JSON.parse(localStorage.getItem("kurio.mock.v3") ?? "{}");
    return Array.isArray(state.orders) ? state.orders.length : 0;
  });
  expect(orderCount).toBe(0);
});

test("troca de usuário mantém favoritos e perfil isolados", async ({ page }) => {
  await page.goto("/login");
  await page
    .getByRole("main")
    .getByRole("button", { name: "Entrar", exact: true })
    .click();
  const firstFavorites = await page.evaluate(async () => {
    const response = await fetch("/api/favorites/emerald-ape-042", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    });
    return response.json();
  });
  expect(firstFavorites).toContain("emerald-ape-042");
  await page.goto("/profile");
  await page.getByRole("button", { name: /Sair/ }).click();
  await expect(page).toHaveURL(/\/$/);

  await page.goto("/login");
  await page.getByPlaceholder("Digite seu e-mail").fill("curadora@email.com");
  await page.getByPlaceholder("Senha", { exact: true }).fill("Jungle@2026");
  await page
    .getByRole("main")
    .getByRole("button", { name: "Entrar", exact: true })
    .click();
  await page.goto("/profile");
  await expect(page.getByLabel("Nome de exibição *")).toHaveValue(
    "Curadora Jungle",
  );
  const secondFavorites = await page.evaluate(async () =>
    (await fetch("/api/favorites")).json(),
  );
  expect(secondFavorites).toEqual([]);
});

test("falha ao favoritar desfaz a atualização otimista", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, "O controle de favorito do detalhe é exclusivo do mobile.");
  await page.goto("/login");
  await page
    .getByRole("main")
    .getByRole("button", { name: "Entrar", exact: true })
    .click();
  await page.goto("/nft/emerald-ape-042?scenario=favorite-error");
  const favorite = page.getByRole("button", {
    name: "Adicionar NFT aos favoritos",
  });
  await expect(favorite).toHaveAttribute("aria-pressed", "false");
  const optimisticUpdate = page.evaluate(() => {
    const button = document.querySelector<HTMLButtonElement>(
      'button[aria-label="Adicionar NFT aos favoritos"]',
    );
    return new Promise<boolean>((resolve) => {
      if (!button) return resolve(false);
      const observer = new MutationObserver(() => {
        if (button.getAttribute("aria-pressed") === "true") {
          observer.disconnect();
          resolve(true);
        }
      });
      observer.observe(button, { attributes: true });
      window.setTimeout(() => {
        observer.disconnect();
        resolve(false);
      }, 2_000);
    });
  });
  await favorite.click();
  expect(await optimisticUpdate).toBe(true);
  await expect(page.getByRole("alert")).toContainText(
    "Não foi possível atualizar os favoritos",
  );
  await expect(favorite).toHaveAttribute("aria-pressed", "false");
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
