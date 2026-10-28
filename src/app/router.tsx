import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import { AppShell } from "../components/layout/AppShell";
import { HomePage, type HomeSearch } from "../pages/HomePage";
import { DetailPage } from "../pages/DetailPage";
import { CartPage } from "../pages/CartPage";
import { CheckoutPage } from "../pages/CheckoutPage";
import { OrderPage } from "../pages/OrderPage";
import { AuthPage } from "../pages/AuthPage";
import { ProfilePage } from "../pages/ProfilePage";
import { WalletsPage } from "../pages/WalletsPage";
import { api } from "../services/api/client";
import type { User } from "../types";

const requireAuth = async ({
  location,
}: {
  location: { pathname: string };
}) => {
  const { data: user } = await api.get<User | null>("/session");
  if (user) return;
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const returnTo = location.pathname.startsWith(base)
    ? location.pathname.slice(base.length) || "/"
    : location.pathname;
  throw redirect({ to: "/login", search: { returnTo } });
};

const rootRoute = createRootRoute({
  component: AppShell,
  notFoundComponent: () => (
    <div className="container py-32 text-center">
      <h1 className="text-3xl">Página não encontrada</h1>
    </div>
  ),
});
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  validateSearch: (s: Record<string, unknown>): HomeSearch => ({
    search: typeof s.search === "string" ? s.search : undefined,
    network: typeof s.network === "string" ? s.network : undefined,
    category: typeof s.category === "string" ? s.category : undefined,
    tab: typeof s.tab === "string" ? s.tab : undefined,
    maxPrice: typeof s.maxPrice === "string" ? s.maxPrice : undefined,
    favorites:
      s.favorites === true || s.favorites === "true" ? true : undefined,
    sort: typeof s.sort === "string" ? s.sort : undefined,
    page:
      typeof s.page === "number"
        ? s.page
        : typeof s.page === "string" && Number.isFinite(Number(s.page))
          ? Number(s.page)
          : undefined,
  }),
  component: HomePage,
});
const nftRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/nft/$id",
  component: DetailPage,
});
const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cart",
  component: CartPage,
});
const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/checkout",
  beforeLoad: requireAuth,
  component: CheckoutPage,
});
const orderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/order/$id",
  beforeLoad: requireAuth,
  component: OrderPage,
});
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  validateSearch: (s: Record<string, unknown>) => ({
    returnTo: typeof s.returnTo === "string" ? s.returnTo : undefined,
  }),
  component: () => <AuthPage mode="login" />,
});
const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: () => <AuthPage mode="register" />,
});
const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  beforeLoad: requireAuth,
  component: ProfilePage,
});
const walletsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/wallets",
  beforeLoad: requireAuth,
  component: WalletsPage,
});
const routeTree = rootRoute.addChildren([
  indexRoute,
  nftRoute,
  cartRoute,
  checkoutRoute,
  orderRoute,
  loginRoute,
  registerRoute,
  profileRoute,
  walletsRoute,
]);
export const router = createRouter({
  routeTree,
  basepath: import.meta.env.BASE_URL,
  defaultPreload: "intent",
  scrollRestoration: true,
});
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
