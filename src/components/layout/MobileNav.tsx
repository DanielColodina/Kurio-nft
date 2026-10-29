import { Link, useRouterState } from "@tanstack/react-router";
import { Heart, Home, ScanLine, ShoppingCart, User } from "lucide-react";
export function MobileNav() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  if (pathname !== "/") return null;
  return (
    <nav
      aria-label="Navegação móvel"
      className="mobile-only kurio-mobile-nav fixed bottom-0 inset-x-0 z-50 h-[94px] rounded-t-[32px] bg-[#2a1712] flex items-center justify-around px-4 pb-[env(safe-area-inset-bottom)]"
    >
      <Link to="/" aria-label="Início">
        <Home size={22} fill="#d98e49" color="#d98e49" />
      </Link>
      <Link to="/" search={{ favorites: true }} aria-label="Favoritos">
        <Heart size={23} fill="#d7b183" color="#d7b183" />
      </Link>
      <Link
        to="/"
        className="-mt-12 w-16 h-16 grid place-items-center rounded-full bg-[#b8753e] border-2 border-[#dca06a]"
        aria-label="Explorar"
      >
        <ScanLine />
      </Link>
      <Link to="/cart" aria-label="Carrinho">
        <ShoppingCart size={22} />
      </Link>
      <Link to="/profile" aria-label="Perfil">
        <User size={22} />
      </Link>
    </nav>
  );
}
