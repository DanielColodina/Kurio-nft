import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft, WalletCards } from "lucide-react";
import { api } from "../services/api/client";
import {
  useCart,
  useCatalog,
  useQuote,
  useSession,
  useWallets,
} from "../hooks/api";
import type { Order } from "../types";
import { Footer } from "../components/layout/Footer";
import { queryClient } from "../app/query";

export function CheckoutPage() {
  const coupon = sessionStorage.getItem("kurio.coupon") ?? undefined;
  const { data: user } = useSession();
  const { data: wallets = [] } = useWallets();
  const { data: cart = [] } = useCart();
  const { data: nfts } = useCatalog();
  const { data: quote } = useQuote(coupon);
  const [selected, setSelected] = useState("reserve");
  const [provider, setProvider] = useState("Coinbase Wallet");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const nav = useNavigate();
  const key = useMemo(
    () => sessionStorage.getItem("kurio.checkout.key") ?? crypto.randomUUID(),
    [],
  );
  sessionStorage.setItem("kurio.checkout.key", key);
  const confirm = async () => {
    if (!user) {
      void nav({ to: "/login", search: { returnTo: "/checkout" } });
      return;
    }
    setBusy(true);
    setError("");
    try {
      const freshQuote = (
        await api.get<typeof quote>("/quote", {
          params: coupon ? { coupon } : undefined,
        })
      ).data;
      if (quote && freshQuote?.total !== quote.total) {
        await queryClient.invalidateQueries({ queryKey: ["quote"] });
        setError("A cotação mudou. Revise os valores e confirme novamente.");
        return;
      }
      const { data } = await api.post<Order>(
        "/orders",
        {
          wallet: provider,
          coupon,
          items: cart,
          expectedTotal: freshQuote?.total,
        },
        { headers: { "Idempotency-Key": key } },
      );
      sessionStorage.removeItem("kurio.checkout.key");
      sessionStorage.removeItem("kurio.coupon");
      void nav({ to: "/order/$id", params: { id: data.id } });
    } catch {
      setError("Não foi possível confirmar. Seu carrinho foi preservado.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <section className="container mt-7 md:mt-12">
        <div className="mobile-only flex items-center gap-5 mb-6">
          <button
            className="w-10 h-10 rounded-full surface grid place-items-center"
            onClick={() => history.back()}
          >
            <ChevronLeft />
          </button>
          <h1 className="text-xl font-bold">Pagamento com carteira</h1>
        </div>
        <p className="desktop-only font-bold mb-8">
          Início / Mercado / Pagamento
        </p>
        <div className="grid md:grid-cols-[1.6fr_.8fr] gap-12">
          <form className="desktop-only" onSubmit={(e) => e.preventDefault()}>
            <h1 className="text-xl font-bold mb-4">Perfil do colecionador</h1>
            <div className="grid grid-cols-2 gap-6">
              <label>
                Nome de exibição *
                <input className="field mt-2" defaultValue={user?.name} />
              </label>
              <label>
                Nome de usuário *
                <input
                  className="field mt-2"
                  defaultValue={user?.name?.toLowerCase().replaceAll(" ", "-")}
                />
              </label>
              <label>
                Rede *
                <select className="field mt-2">
                  <option>Ethereum</option>
                  <option>Polygon</option>
                </select>
              </label>
              <label>
                Nome do perfil *
                <input className="field mt-2" defaultValue={user?.name} />
              </label>
              <label>
                Endereço da carteira *
                <input
                  className="field mt-2"
                  defaultValue={wallets[0]?.address}
                />
              </label>
              <label>
                ENS ou carteira secundária
                <input className="field mt-2" defaultValue={user?.ens} />
              </label>
              <label>
                E-mail *
                <input
                  type="email"
                  className="field mt-2"
                  defaultValue={user?.email}
                />
              </label>
              <label>
                Nome ENS *
                <input className="field mt-2" defaultValue={user?.ens} />
              </label>
            </div>
            <label className="block mt-6">
              Observação do colecionador (opcional)
              <textarea className="field !h-32 mt-2 p-3" />
            </label>
          </form>
          <aside>
            <h2 className="mobile-only font-bold mb-3">
              Carteira conectada{" "}
              <button className="accent float-right">Trocar carteira</button>
            </h2>
            <div className="mobile-only space-y-5">
              {wallets.map((w) => (
                <label
                  key={w.id}
                  className="surface p-5 rounded-[14px] flex gap-4 items-center"
                >
                  <input
                    type="radio"
                    checked={selected === w.id}
                    onChange={() => setSelected(w.id)}
                    name="wallet"
                  />
                  <span>
                    <b className="block">{w.label}</b>
                    <span className="muted text-sm">
                      {w.address}
                      <br />
                      Rede {w.network}
                    </span>
                  </span>
                </label>
              ))}
            </div>
            <h2 className="font-bold mt-8 md:mt-0 mb-3">
              {innerWidth < 701 ? "Carteira e rede" : "Seus NFTs"}
            </h2>
            <div className="desktop-only border-y border-[#5b331d]">
              {cart.map((l) => {
                const n = nfts?.items.find((x) => x.id === l.nftId);
                return n ? (
                  <div
                    className="surface my-3 p-2 flex items-center gap-3"
                    key={l.nftId}
                  >
                    <img src={n.image} className="w-16" alt="" />
                    <b>
                      {n.name} <small className="muted">(× {l.quantity})</small>
                    </b>
                  </div>
                ) : null;
              })}
            </div>
            <div className="mobile-only space-y-4">
              {["WalletConnect", "MetaMask", "Coinbase Wallet"].map((p) => (
                <label
                  key={p}
                  className="surface rounded-[14px] p-4 flex items-center gap-3"
                >
                  <span className="w-10 h-10 rounded-full border border-[#5b331d] grid place-items-center">
                    <WalletCards size={17} />
                  </span>
                  {p}
                  <input
                    type="radio"
                    name="provider"
                    checked={provider === p}
                    onChange={() => setProvider(p)}
                    className="ml-auto"
                  />
                </label>
              ))}
            </div>
            <div className="desktop-only mt-5 grid grid-cols-2 gap-y-3">
              <span>Subtotal</span>
              <span className="text-right">{quote?.subtotal} ETH</span>
              <span>Taxa de rede</span>
              <span className="text-right">{quote?.networkFee} ETH</span>
            </div>
            <div className="flex justify-end gap-7 mt-7 text-lg">
              <b>Total:</b>
              <b className="price">{quote?.total} ETH</b>
            </div>
            {error && (
              <p role="alert" className="text-red-400 mt-4">
                {error}
              </p>
            )}
            <button
              onClick={confirm}
              disabled={busy || !cart.length}
              className="btn btn-primary rounded-full md:rounded-none w-full h-14 mt-10 md:mt-6 disabled:opacity-50"
            >
              {busy ? "Confirmando com segurança…" : "Confirmar compra"}
            </button>
          </aside>
        </div>
      </section>
      <Footer />
    </>
  );
}
