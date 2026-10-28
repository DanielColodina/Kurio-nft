import { Link } from "@tanstack/react-router";
export function Sidebar({
  active,
  onLogout,
}: {
  active: "profile" | "wallets";
  onLogout?: () => void;
}) {
  return (
    <aside className="desktop-only surface h-fit">
      <h2 className="font-bold text-xl p-4">Meu perfil</h2>
      <Link
        to="/profile"
        className={`block p-4 border-l-4 ${active === "profile" ? "border-[#d98e49] accent" : "border-transparent"}`}
      >
        ♙ Dados do perfil
      </Link>
      <Link
        to="/wallets"
        className={`block p-4 border-l-4 ${active === "wallets" ? "border-[#d98e49] accent" : "border-transparent"}`}
      >
        ⌾ Carteiras
      </Link>
      <span className="block p-4 muted">🛒 Atividade</span>
      <span className="block p-4 muted">♡ Lista de interesse</span>
      <button
        onClick={onLogout}
        className="p-4 border-t border-[#5b331d] w-full text-left accent"
      >
        ⇥ Sair
      </button>
    </aside>
  );
}
