import Decimal from "decimal.js";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Trash2 } from "lucide-react";
import { useCart, useCartMutation, useCatalog, useQuote } from "../hooks/api";
import { Quantity } from "../components/Quantity";
import { NftCard } from "../components/NftCard";
import { Footer } from "../components/layout/Footer";
import { api } from "../services/api/client";
import { AxiosError } from "axios";
import { useState } from "react";

export function CartPage() {
  const [coupon, setCoupon] = useState(
    () => sessionStorage.getItem("kurio.coupon") ?? "",
  );
  const [appliedCoupon, setAppliedCoupon] = useState(
    () => sessionStorage.getItem("kurio.coupon") ?? "",
  );
  const [couponError, setCouponError] = useState("");
  const { data: cart = [], isLoading } = useCart();
  const { data: catalog } = useCatalog();
  const { data: quote } = useQuote(appliedCoupon || undefined);
  const mutate = useCartMutation();
  const nav = useNavigate();
  const update = (id: string, q: number) =>
    mutate.mutate(
      cart.map((x) => (x.nftId === id ? { ...x, quantity: q } : x)),
    );
  const remove = (id: string) =>
    mutate.mutate(cart.filter((x) => x.nftId !== id));
  const applyCoupon = async () => {
    setCouponError("");
    try {
      await api.get("/quote", { params: { coupon } });
      const normalized = coupon.trim().toUpperCase();
      sessionStorage.setItem("kurio.coupon", normalized);
      setAppliedCoupon(normalized);
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? (error.response?.data as { message?: string } | undefined)?.message
          : undefined;
      setCouponError(message ?? "Não foi possível validar o cupom.");
    }
  };
  const clearCoupon = () => {
    sessionStorage.removeItem("kurio.coupon");
    setCoupon("");
    setAppliedCoupon("");
    setCouponError("");
  };
  return (
    <>
      <section className="container kurio-cart-page mt-8 md:mt-12">
        <div className="kurio-cart-heading flex items-center gap-5 mb-6">
          <button
            className="mobile-only w-10 h-10 rounded-full surface grid place-items-center"
            onClick={() => history.back()}
          >
            <ChevronLeft />
          </button>
          <h1 className="text-xl font-bold md:hidden">Carrinho de NFTs</h1>
          <p className="desktop-only font-bold">Início / Mercado / Carrinho</p>
        </div>
        {isLoading ? (
          <div className="skeleton h-72" />
        ) : cart.length === 0 ? (
          <div className="py-24 text-center">
            <h2 className="text-2xl">Seu carrinho está vazio</h2>
            <Link
              to="/"
              className="btn btn-primary inline-flex items-center mt-6"
            >
              Explorar NFTs
            </Link>
          </div>
        ) : (
          <div className="kurio-cart-layout grid md:grid-cols-[1fr_360px] gap-14">
            <div>
              <div className="desktop-only grid grid-cols-[1.7fr_.7fr_.7fr_.7fr_30px] border-b border-[#5b331d] pb-3">
                <b>NFTs</b>
                <b>Preço</b>
                <b>Edições</b>
                <b>Total</b>
              </div>
              <div className="kurio-cart-lines space-y-3 md:mt-3">
                {cart.map((line) => {
                  const nft = catalog?.items.find((n) => n.id === line.nftId);
                  if (!nft) return null;
                  return (
                    <article
                      key={line.nftId}
                      className="kurio-cart-line relative surface rounded-[15px] md:rounded-none p-2 md:p-3 grid grid-cols-[96px_1fr] md:grid-cols-[1.7fr_.7fr_.7fr_.7fr_30px] items-center gap-3"
                    >
                      <div className="kurio-cart-product flex items-center gap-4">
                        <img
                          src={nft.image}
                          alt=""
                          className="w-24 md:w-16 aspect-square object-cover rounded-[12px]"
                        />
                        <div>
                          <b className="whitespace-nowrap text-sm md:text-base">
                            {nft.name}
                          </b>
                          <p className="muted text-sm">
                            Edição: {line.edition}
                          </p>
                        </div>
                      </div>
                      <span className="desktop-only muted">
                        {nft.price} ETH
                      </span>
                      <div className="kurio-cart-quantity scale-90 md:scale-100 origin-left">
                        <Quantity
                          value={line.quantity}
                          onChange={(q) => update(line.nftId, q)}
                          max={nft.stock}
                        />
                      </div>
                      <b className="kurio-cart-line-total price md:block absolute md:static ml-[108px] mt-11 md:m-0">
                        {new Decimal(nft.price).times(line.quantity).toFixed(2)}{" "}
                        ETH
                      </b>
                      <button
                        onClick={() => remove(line.nftId)}
                        className="kurio-cart-remove absolute md:static right-10 mt-10 md:m-0 muted"
                        aria-label={`Remover ${nft.name}`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </article>
                  );
                })}
              </div>
            </div>
            <aside className="kurio-cart-summary surface md:bg-transparent -mx-6 md:mx-0 p-6 md:p-0 rounded-t-[32px]">
              <h2 className="desktop-only text-xl font-bold border-b border-[#5b331d] pb-3">
                Resumo da carteira
              </h2>
              <label className="desktop-only block font-bold mt-6 mb-2">
                Código promocional
              </label>
              <div className="flex border border-[#5b331d] rounded-full md:rounded-none overflow-hidden">
                <input
                  className="field !border-0"
                  placeholder="Digite o código promocional..."
                  value={coupon}
                  onChange={(event) => setCoupon(event.target.value)}
                />
                <button
                  onClick={() => void applyCoupon()}
                  className="btn btn-primary !border-0 rounded-full md:rounded-none"
                >
                  {appliedCoupon ? "Aplicado" : "Aplicar"}
                </button>
              </div>
              {(couponError || appliedCoupon) && (
                <p
                  role={couponError ? "alert" : "status"}
                  className={`mt-2 text-sm ${couponError ? "text-red-400" : "accent"}`}
                >
                  {couponError || `Cupom ${appliedCoupon} aplicado.`}
                  {appliedCoupon && (
                    <button onClick={clearCoupon} className="ml-3 underline">
                      Remover
                    </button>
                  )}
                </p>
              )}
              <div className="mt-5 grid grid-cols-2 gap-y-4">
                <span>Subtotal</span>
                <span className="text-right">{quote?.subtotal} ETH</span>
                <span>Desconto do lançamento</span>
                <span className="text-right">(-) {quote?.discount} ETH</span>
                <span>Taxa de rede</span>
                <span className="text-right">
                  {quote?.networkFee} ETH
                  <small className="accent block">Taxa estimada</small>
                </span>
                <b>Total</b>
                <b className="price text-right text-xl">{quote?.total} ETH</b>
              </div>
              <button
                onClick={() => void nav({ to: "/checkout" })}
                className="btn btn-primary rounded-full md:rounded-none w-full mt-6 h-14"
              >
                Conectar e finalizar
              </button>
              <Link
                to="/"
                className="desktop-only accent text-center mt-4 block"
              >
                Continuar explorando
              </Link>
            </aside>
          </div>
        )}
      </section>
      <section className="desktop-only container mt-24">
        <h2 className="section-title">Colecionadores também viram</h2>
        <div className="grid grid-cols-5 gap-7 mt-8">
          {catalog?.items.slice(1, 6).map((n) => (
            <NftCard key={n.id} nft={n} />
          ))}
        </div>
      </section>
      <Footer />
    </>
  );
}
