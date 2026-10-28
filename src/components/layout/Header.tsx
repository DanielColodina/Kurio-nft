import { Link, useNavigate } from "@tanstack/react-router";
import { LogIn, Search, ShoppingCart } from "lucide-react";
import { useCart, useSession } from "../../hooks/api";

export function Header() {
  const { data: cart = [] } = useCart();
  const { data: user } = useSession();
  const navigate = useNavigate();
  return (
    <header className="desktop-only h-[70px] border-b border-[#38220f]">
      <div className="container h-full flex items-center justify-between">
        <Link to="/" className="font-bold tracking-[2px] text-sm">
          KURIO
        </Link>
        <nav aria-label="Navegação principal" className="flex gap-11 text-sm">
          <Link
            to="/"
            activeProps={{ className: "accent border-b-2 border-[#d98e49]" }}
            className="py-6"
          >
            Início
          </Link>
          <Link to="/" search={{ sort: "price_asc" }} className="py-6">
            Mercado
          </Link>
          <a href="#diario" className="py-6">
            Criadores
          </a>
          <a href="#diario" className="py-6">
            Aprenda
          </a>
        </nav>
        <div className="flex items-center gap-6">
          <Search size={21} />
          <Link
            to="/cart"
            aria-label={`Carrinho com ${cart.length} itens`}
            className="relative"
          >
            <ShoppingCart size={22} />
            <b className="absolute -right-2 -top-2 bg-[#d98e49] text-[#140d0a] rounded-full text-[10px] w-4 h-4 grid place-items-center">
              {cart.length}
            </b>
          </Link>
          <button
            onClick={() => void navigate({ to: user ? "/profile" : "/login" })}
            className="btn btn-primary !min-h-9 !px-3 flex items-center gap-2"
          >
            <LogIn size={16} />
            {user ? "Perfil" : "Entrar"}
          </button>
        </div>
      </div>
    </header>
  );
}
