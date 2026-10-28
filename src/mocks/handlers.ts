import Decimal from "decimal.js";
import { delay, http, HttpResponse, ws } from "msw";
import { toSocketIo } from "@mswjs/socket.io-binding";
import { nfts } from "./fixtures";
import { currentCart, ownerId, readState, resetState, updateState } from "./store";
import type { CartLine, User, Wallet } from "../types";

const activeScenario = () =>
  new URL(location.href).searchParams.get("scenario") ?? "default";
const scenarioDelay = () =>
  activeScenario() === "slow" ? delay(1400) : delay(100);
const quote = (cart: CartLine[], coupon?: string | null) => {
  const subtotal = cart.reduce(
    (sum, line) =>
      sum.plus(
        new Decimal(nfts.find((n) => n.id === line.nftId)?.price ?? 0).times(
          line.quantity,
        ),
      ),
    new Decimal(0),
  );
  const fee = new Decimal("0.016");
  const normalizedCoupon = coupon?.trim().toUpperCase();
  const discount =
    normalizedCoupon === "KURIO10" ? subtotal.times("0.10") : new Decimal(0);
  return {
    subtotal: subtotal.toFixed(2),
    discount: discount.toFixed(2),
    networkFee: fee.toFixed(3),
    total: subtotal.minus(discount).plus(fee).toFixed(3),
    coupon: normalizedCoupon === "KURIO10" ? normalizedCoupon : null,
  };
};

const realtime = ws.link("ws://kurio.local");
const apiPath = (path: string) => `${import.meta.env.BASE_URL}api${path}`;
const unauthorized = () =>
  HttpResponse.json({ message: "Sessão expirada." }, { status: 401 });

const hashPassword = async (value: string) => {
  const hash = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(hash), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
};
const normalize = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export const handlers = [
  realtime.addEventListener("connection", (connection) => {
    setTimeout(() => {
      const io = toSocketIo(connection);
      io.client.on(
        "demo.price-change",
        (_event, nftId: string, price: string) => {
          const nft = nfts.find((item) => item.id === nftId);
          if (!nft) return;
          nft.price = price;
          nft.version += 1;
          io.client.emit("nft.updated", {
            id: nft.id,
            price: nft.price,
            stock: nft.stock,
            version: nft.version,
          });
        },
      );
      io.client.on(
        "demo.order-change",
        (_event, orderId: string, status: string) => {
          const state = readState();
          const order = state.orders.find((item) => item.id === orderId);
          if (!order || ["confirmed", "declined"].includes(order.status))
            return;
          const version = order.version + 1;
          updateState((draft) => {
            const current = draft.orders.find((item) => item.id === orderId);
            if (current) {
              current.status = status as "pending" | "confirmed" | "declined";
              current.version = version;
            }
          });
          io.client.emit("order.updated", {
            id: orderId,
            status,
            version,
            userId: order.userId,
          });
        },
      );
    }, 0);
  }),
  http.get(apiPath("/nfts"), async ({ request }) => {
    await scenarioDelay();
    if (activeScenario() === "offline") return HttpResponse.error();
    if (activeScenario() === "server-error")
      return HttpResponse.json(
        { message: "Catálogo indisponível." },
        { status: 503 },
      );
    const url = new URL(request.url);
    const search = normalize(url.searchParams.get("search") ?? "");
    const network = url.searchParams.get("network");
    const category = url.searchParams.get("category");
    const tab = url.searchParams.get("tab");
    const maxPrice = url.searchParams.get("maxPrice");
    const minPrice = url.searchParams.get("minPrice");
    const sort = url.searchParams.get("sort");
    const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
    const pageSize = 9;
    let items =
      activeScenario() === "empty"
        ? []
        : nfts.filter(
            (n) =>
              (!search ||
                normalize(
                  [n.name, n.creator, n.collection, n.category, n.network].join(" "),
                ).includes(search)) &&
              (!network || n.network.toLowerCase() === network) &&
              (!category || n.category === category) &&
              (!minPrice || new Decimal(n.price).greaterThanOrEqualTo(minPrice)) &&
              (!maxPrice || new Decimal(n.price).lessThanOrEqualTo(maxPrice)),
          );
    if (tab === "new") items = items.filter((item) => item.launch);
    if (tab === "trending")
      items = items.filter((item) => item.trending);
    if (sort === "price_asc")
      items = [...items].sort((a, b) =>
        new Decimal(a.price).comparedTo(b.price),
      );
    if (sort === "price_desc")
      items = [...items].sort((a, b) =>
        new Decimal(b.price).comparedTo(a.price),
      );
    if (!sort)
      items = [...items].sort((a, b) =>
        String(b.createdAt).localeCompare(String(a.createdAt)),
      );
    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * pageSize;
    const countBy = (field: "category" | "network") =>
      Object.fromEntries(
        nfts.reduce((map, nft) => {
          map.set(nft[field], (map.get(nft[field]) ?? 0) + 1);
          return map;
        }, new Map<string, number>()),
      );
    return HttpResponse.json({
      items: items.slice(start, start + pageSize),
      total,
      page: safePage,
      totalPages,
      facets: { categories: countBy("category"), networks: countBy("network") },
    });
  }),
  http.get(apiPath("/nfts/:id"), async ({ params }) => {
    await scenarioDelay();
    const nft = nfts.find((n) => n.id === params.id);
    return nft
      ? HttpResponse.json(nft)
      : new HttpResponse(null, { status: 404 });
  }),
  http.get(apiPath("/session"), () =>
    HttpResponse.json(
      activeScenario() === "expired" ? null : readState().session,
    ),
  ),
  http.post(apiPath("/login"), async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };
    const state = readState();
    const account = state.accounts.find(
      ({ user }) => user.email.toLowerCase() === body.email.toLowerCase(),
    );
    if (!account || account.passwordHash !== (await hashPassword(body.password)))
      return HttpResponse.json(
        { message: "E-mail ou senha incorretos." },
        { status: 401 },
      );
    const user = account.user;
    updateState((s) => {
      const guestCart = s.carts.guest ?? [];
      if (guestCart.length && (s.carts[user.id]?.length ?? 0) === 0) {
        s.carts[user.id] = guestCart;
        s.carts.guest = [];
      }
      s.session = user;
    });
    return HttpResponse.json(user);
  }),
  http.post(apiPath("/register"), async ({ request }) => {
    const body = (await request.json()) as {
      name: string;
      email: string;
      password: string;
    };
    const state = readState();
    if (
      state.accounts.some(
        ({ user }) => user.email.toLowerCase() === body.email.toLowerCase(),
      )
    )
      return HttpResponse.json(
        { message: "Este e-mail já está cadastrado." },
        { status: 409 },
      );
    const user: User = {
      id: crypto.randomUUID(),
      name: body.name,
      email: body.email,
      ens: "",
    };
    const passwordHash = await hashPassword(body.password);
    updateState((s) => {
      s.session = user;
      s.accounts.push({ user, passwordHash });
      s.profilesByUser[user.id] = user;
      s.favoritesByUser[user.id] = [];
      s.walletsByUser[user.id] = [];
      s.carts[user.id] = s.carts.guest ?? [];
      s.carts.guest = [];
    });
    return HttpResponse.json(user, { status: 201 });
  }),
  http.post(apiPath("/logout"), () => {
    updateState((s) => {
      s.session = null;
    });
    return new HttpResponse(null, { status: 204 });
  }),
  http.get(apiPath("/cart"), () => HttpResponse.json(currentCart(readState()))),
  http.put(apiPath("/cart"), async ({ request }) => {
    const cart = (await request.json()) as CartLine[];
    updateState((s) => {
      s.carts[ownerId(s)] = cart;
    });
    return HttpResponse.json(cart);
  }),
  http.get(apiPath("/quote"), ({ request }) => {
    const coupon = new URL(request.url).searchParams.get("coupon");
    if (coupon?.toUpperCase() === "EXPIRADO")
      return HttpResponse.json({ message: "Cupom expirado." }, { status: 410 });
    if (coupon && coupon.toUpperCase() !== "KURIO10")
      return HttpResponse.json({ message: "Cupom inválido." }, { status: 422 });
    return HttpResponse.json(quote(currentCart(readState()), coupon));
  }),
  http.get(apiPath("/favorites"), () =>
    readState().session
      ? HttpResponse.json(
          readState().favoritesByUser[readState().session!.id] ?? [],
        )
      : unauthorized(),
  ),
  http.put(apiPath("/favorites/:id"), ({ params }) => {
    if (!readState().session) return unauthorized();
    const state = updateState((s) => {
      const id = String(params.id);
      const userId = s.session!.id;
      const favorites = s.favoritesByUser[userId] ?? [];
      s.favoritesByUser[userId] = favorites.includes(id)
        ? favorites.filter((x) => x !== id)
        : [...favorites, id];
    });
    return HttpResponse.json(state.favoritesByUser[state.session!.id] ?? []);
  }),
  http.get(apiPath("/profile"), () =>
    readState().session
      ? HttpResponse.json(readState().profilesByUser[readState().session!.id])
      : unauthorized(),
  ),
  http.put(apiPath("/profile"), async ({ request }) => {
    if (!readState().session) return unauthorized();
    const profile = (await request.json()) as User;
    updateState((s) => {
      s.profilesByUser[s.session!.id] = profile;
      const account = s.accounts.find(({ user }) => user.id === s.session!.id);
      if (account) account.user = profile;
      s.session = profile;
    });
    return HttpResponse.json(profile);
  }),
  http.get(apiPath("/wallets"), () =>
    readState().session
      ? HttpResponse.json(
          readState().walletsByUser[readState().session!.id] ?? [],
        )
      : unauthorized(),
  ),
  http.put(apiPath("/wallets"), async ({ request }) => {
    if (!readState().session) return unauthorized();
    const wallets = (await request.json()) as Wallet[];
    updateState((s) => {
      s.walletsByUser[s.session!.id] = wallets;
    });
    return HttpResponse.json(wallets);
  }),
  http.post(apiPath("/orders"), async ({ request }) => {
    if (!readState().session) return unauthorized();
    const key = request.headers.get("Idempotency-Key");
    if (!key)
      return HttpResponse.json(
        { message: "Chave de idempotência obrigatória." },
        { status: 400 },
      );
    const body = (await request.json()) as {
      wallet: string;
      coupon?: string | null;
      items?: CartLine[];
      expectedTotal?: string;
    };
    const state = readState();
    const prior = state.attempts[key];
    const fingerprint = JSON.stringify(body);
    if (prior) {
      const attempt =
        typeof prior === "string" ? { orderId: prior, fingerprint } : prior;
      if (attempt.fingerprint !== fingerprint)
        return HttpResponse.json(
          {
            message: "A chave de idempotência já foi usada com outro conteúdo.",
          },
          { status: 409 },
        );
      return HttpResponse.json(
        state.orders.find((o) => o.id === attempt.orderId),
      );
    }
    if (activeScenario() === "sold-out")
      return HttpResponse.json(
        { message: "Uma edição ficou indisponível. Revise o carrinho." },
        { status: 409 },
      );
    const cart = currentCart(state);
    const values = quote(cart, body.coupon);
    if (body.expectedTotal && body.expectedTotal !== values.total)
      return HttpResponse.json(
        {
          message: "A cotação mudou. Revise os valores e confirme novamente.",
          quote: values,
        },
        { status: 409 },
      );
    const items = cart.map((line) => {
      const nft = nfts.find((item) => item.id === line.nftId);
      if (!nft) throw new Error(`NFT ${line.nftId} não encontrado.`);
      return {
        ...structuredClone(line),
        name: nft.name,
        tokenId: nft.tokenId,
        image: nft.image,
        unitPrice: nft.price,
      };
    });
    const order = {
      id: `KUR-${Date.now()}`,
      transaction: "0xA91F…E82C",
      status: (activeScenario() === "declined"
        ? "declined"
        : activeScenario() === "pending" || activeScenario() === "order-timeout"
          ? "pending"
          : "confirmed") as "pending" | "confirmed" | "declined",
      createdAt: new Date().toISOString(),
      total: values.total,
      networkFee: values.networkFee,
      wallet: body.wallet,
      items,
      userId: state.session!.id,
      version: 1,
    };
    updateState((s) => {
      s.orders.push(order);
      s.attempts[key] = { orderId: order.id, fingerprint };
      if (order.status === "confirmed") {
        const userId = s.session!.id;
        s.carts[userId] = (s.carts[userId] ?? []).filter(
          (line) => !order.items.some((item) => item.nftId === line.nftId),
        );
      }
    });
    if (activeScenario() === "order-timeout") return HttpResponse.error();
    return HttpResponse.json(order, { status: 201 });
  }),
  http.get(apiPath("/orders/:id"), ({ params }) => {
    if (!readState().session) return unauthorized();
    const state = readState();
    const order = state.orders.find(
      (o) => o.id === params.id && o.userId === state.session!.id,
    );
    return order
      ? HttpResponse.json(order)
      : new HttpResponse(null, { status: 404 });
  }),
  http.post(apiPath("/test/reset"), () => {
    resetState();
    return new HttpResponse(null, { status: 204 });
  }),
];
