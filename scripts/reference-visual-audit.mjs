import { chromium } from "playwright";
import sharp from "sharp";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const referenceDir = path.join(
  process.env.USERPROFILE ?? "",
  "OneDrive",
  "Área de Trabalho",
  "Jungle",
);
const outputDir = path.join(root, "reports", "reference-visual-audit");
await mkdir(outputDir, { recursive: true });
const cases = [
  {
    name: "home-desktop",
    folder: "Frontend Challenge",
    sub: "Desktop",
    file: "Início.png",
    url: "/",
    width: 1440,
    height: 900,
    fullPage: true,
  },
  {
    name: "detail-desktop",
    folder: "Frontend Challenge (1)",
    sub: "Desktop",
    file: "Detalhes do NFT.png",
    url: "/nft/emerald-ape-042",
    width: 1440,
    height: 900,
    fullPage: true,
  },
  {
    name: "cart-desktop",
    folder: "Frontend Challenge (2)",
    sub: "Desktop",
    file: "Carrinho de NFTs.png",
    url: "/cart",
    width: 1440,
    height: 900,
    fullPage: true,
    setup: "desktop-cart",
  },
  {
    name: "checkout-desktop",
    folder: "Frontend Challenge (3)",
    sub: "Desktop",
    file: "Pagamento.png",
    url: "/checkout",
    width: 1440,
    height: 900,
    fullPage: true,
    setup: "desktop-cart",
    auth: true,
  },
  {
    name: "confirmation-desktop",
    folder: "Frontend Challenge (4)",
    sub: "Desktop",
    file: "Confirmação de Pedido.png",
    url: "/",
    width: 1440,
    height: 900,
    fullPage: true,
    setup: "confirmed-order",
  },
  {
    name: "login-desktop",
    folder: "Frontend Challenge (5)",
    sub: "Desktop",
    file: "Login.png",
    url: "/login",
    width: 1440,
    height: 900,
    fullPage: true,
  },
  {
    name: "register-desktop",
    folder: "Frontend Challenge (6)",
    sub: "Desktop",
    file: "Cadastro.png",
    url: "/register",
    width: 1440,
    height: 900,
    fullPage: true,
  },
  {
    name: "profile-desktop",
    folder: "Frontend Challenge (7)",
    sub: "Desktop",
    file: "Perfil do Colecionador.png",
    url: "/profile",
    width: 1440,
    height: 1080,
    fullPage: false,
    auth: true,
  },
  {
    name: "wallets-desktop",
    folder: "Frontend Challenge (8)",
    sub: "Desktop",
    file: "Carteiras.png",
    url: "/wallets",
    width: 1440,
    height: 1080,
    fullPage: false,
    auth: true,
  },
  {
    name: "home-mobile",
    folder: "Frontend Challenge (9)",
    sub: "Mobile",
    file: "Início.png",
    url: "/",
    width: 414,
    height: 896,
    fullPage: false,
  },
  {
    name: "detail-mobile",
    folder: "Frontend Challenge (10)",
    sub: "Mobile",
    file: "Detalhes do NFT.png",
    url: "/nft/emerald-ape-042",
    width: 414,
    height: 896,
    fullPage: false,
  },
  {
    name: "cart-mobile",
    folder: "Frontend Challenge (11)",
    sub: "Mobile",
    file: "Carrinho de NFTs.png",
    url: "/cart",
    width: 414,
    height: 896,
    fullPage: false,
  },
  {
    name: "checkout-mobile",
    folder: "Frontend Challenge (12)",
    sub: "Mobile",
    file: "Pagamento.png",
    url: "/checkout",
    width: 414,
    height: 896,
    fullPage: false,
    auth: true,
  },
  {
    name: "login-mobile",
    folder: "Frontend Challenge (13)",
    sub: "Mobile",
    file: "Login.png",
    url: "/login",
    width: 414,
    height: 896,
    fullPage: false,
  },
  {
    name: "register-mobile",
    folder: "Frontend Challenge (14)",
    sub: "Mobile",
    file: "Cadastro.png",
    url: "/register",
    width: 414,
    height: 896,
    fullPage: false,
  },
];
const baseUrl = process.env.KURIO_URL || "http://127.0.0.1:4174";
const browser = await chromium.launch({ headless: true });
const report = [];
for (const c of cases) {
  const referenceFile = path.join(referenceDir, c.folder, c.sub, c.file);
  const refBuf = await readFile(referenceFile);
  const refMeta = await sharp(refBuf).metadata();
  const page = await browser.newPage({
    viewport: { width: c.width, height: c.height },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(baseUrl + c.url, {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });
  if (c.auth) {
    await page.waitForTimeout(1000);
    await page.evaluate(async () => {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "contato@email.com",
          password: "Kurio@2026",
        }),
      });
      if (!response.ok) throw new Error("Falha ao preparar sessão autenticada");
    });
    await page.goto(baseUrl + c.url, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
  }
  if (c.setup === "desktop-cart" || c.setup === "confirmed-order") {
    await page.waitForTimeout(1500);
    await page.evaluate(async () => {
      const cart = await fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([
          { nftId: "emerald-ape-042", quantity: 2, edition: "1/50" },
          { nftId: "violet-nomad-314", quantity: 6, edition: "1/1" },
          { nftId: "ivory-baron-088", quantity: 9, edition: "1/10" },
        ]),
      });
      if (!cart.ok) throw new Error("Falha ao preparar carrinho desktop");
    });
    if (c.setup === "desktop-cart") {
      await page.reload({ waitUntil: "domcontentloaded" });
    }
  }
  if (c.setup === "confirmed-order") {
    const orderId = await page.evaluate(async () => {
      const login = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "contato@email.com",
          password: "Kurio@2026",
        }),
      });
      if (!login.ok) throw new Error("Falha ao preparar login do recibo");
      const order = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": "reference-confirmed-order",
        },
        body: JSON.stringify({ wallet: "MetaMask" }),
      });
      if (!order.ok) throw new Error("Falha ao preparar pedido do recibo");
      return (await order.json()).id;
    });
    await page.goto(`${baseUrl}/order/${orderId}`, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
  }
  await page
    .waitForFunction(() => [...document.images].every((i) => i.complete), {
      timeout: 15000,
    })
    .catch(() => {});
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  const current = await page.screenshot({
    fullPage: c.fullPage,
    animations: "disabled",
  });
  await page.close();
  const curMeta = await sharp(current).metadata();
  const w = refMeta.width,
    h = refMeta.height;
  const imageSized = await sharp(current)
    .extract({
      left: 0,
      top: 0,
      width: Math.min(w, curMeta.width),
      height: Math.min(h, curMeta.height),
    })
    .png()
    .toBuffer();
  const normalized = await sharp({
    create: { width: w, height: h, channels: 4, background: "#140d0a" },
  })
    .composite([{ input: imageSized, left: 0, top: 0 }])
    .removeAlpha()
    .png()
    .toBuffer();
  await writeFile(path.join(outputDir, c.name + "-actual.png"), normalized);
  const [refRaw, actRaw] = await Promise.all([
    sharp(refBuf).removeAlpha().raw().toBuffer(),
    sharp(normalized).raw().toBuffer(),
  ]);
  let different = 0,
    channelDelta = 0;
  const diff = Buffer.alloc(w * h * 3);
  for (let i = 0; i < w * h; i++) {
    const k = i * 3;
    const dr = Math.abs(refRaw[k] - actRaw[k]),
      dg = Math.abs(refRaw[k + 1] - actRaw[k + 1]),
      db = Math.abs(refRaw[k + 2] - actRaw[k + 2]);
    const isDifferent = Math.max(dr, dg, db) > 30;
    if (isDifferent) different++;
    channelDelta += dr + dg + db;
    diff[k] = isDifferent ? 255 : refRaw[k] >> 2;
    diff[k + 1] = isDifferent ? 40 : refRaw[k + 1] >> 2;
    diff[k + 2] = isDifferent ? 40 : refRaw[k + 2] >> 2;
  }
  await sharp(diff, { raw: { width: w, height: h, channels: 3 } })
    .png()
    .toFile(path.join(outputDir, c.name + "-diff.png"));
  report.push({
    case: c.name,
    reference: referenceFile,
    referenceSize: [w, h],
    actualRenderedSize: [curMeta.width, curMeta.height],
    pixelDifferenceOver30Pct: Math.round((different / (w * h)) * 10000) / 100,
    meanAbsoluteChannelDifference:
      Math.round((channelDelta / (w * h * 3)) * 100) / 100,
    errors,
  });
}
await browser.close();
await writeFile(
  path.join(outputDir, "report.json"),
  JSON.stringify(report, null, 2),
  "utf8",
);
for (const x of report) console.log(JSON.stringify(x));
console.log("Relatórios:", outputDir);
