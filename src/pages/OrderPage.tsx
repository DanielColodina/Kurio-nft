import { Link, useParams } from "@tanstack/react-router";
import { CheckCircle2, X } from "lucide-react";
import { useOrder } from "../hooks/api";
import { Button } from "../components/ui/button";
export function OrderPage() {
  const { id } = useParams({ from: "/order/$id" });
  const { data: order, isLoading } = useOrder(id);
  if (isLoading)
    return (
      <div className="skeleton w-[560px] max-w-[90%] h-[700px] mx-auto mt-24" />
    );
  if (!order)
    return (
      <div className="container py-32 text-center">Pedido não encontrado.</div>
    );
  if (order.status === "pending")
    return (
      <div className="container py-32 text-center" role="status">
        <h1 className="text-2xl font-bold">Pagamento em processamento</h1>
        <p className="muted mt-4">
          O pedido {order.id} será atualizado automaticamente após a
          confirmação.
        </p>
      </div>
    );
  if (order.status === "declined")
    return (
      <div className="container py-32 text-center" role="alert">
        <h1 className="text-2xl font-bold">Pagamento recusado</h1>
        <p className="muted mt-4">
          Nenhum item foi removido do carrinho. Revise a carteira e tente
          novamente.
        </p>
      </div>
    );
  return (
    <div className="w-[580px] max-w-[calc(100%-32px)] surface mx-auto mt-16 md:mt-20 border-b-8 border-[#d98e49]">
      <div className="p-8 text-center relative">
        <Link to="/" className="absolute right-5 top-5 accent">
          <X />
        </Link>
        <CheckCircle2 className="accent mx-auto" size={64} />
        <h1 className="muted font-bold mt-5">
          Seus NFTs agora estão na sua carteira
        </h1>
      </div>
      <div className="border-y border-[#d98e49] p-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <span>
          ID da transação
          <br />
          <b className="muted">{order.transaction}</b>
        </span>
        <span>
          Data
          <br />
          <b className="muted">
            {new Date(order.createdAt).toLocaleDateString("pt-BR")}
          </b>
        </span>
        <span>
          Total
          <br />
          <b className="muted">{order.total} ETH</b>
        </span>
        <span>
          Carteira
          <br />
          <b className="muted">{order.wallet}</b>
        </span>
      </div>
      <div className="p-8">
        <h2 className="font-bold mb-4">Detalhes da transação</h2>
        {order.items.map((item) => {
          return (
            <div
              key={`${item.nftId}-${item.edition}`}
              className="grid grid-cols-[64px_1fr_auto] gap-3 items-center mb-4"
            >
              <img src={item.image} alt="" />
              <span>
                <b>{item.name}</b>
                <small className="muted block">
                  ID do token: {item.tokenId}
                </small>
              </span>
              <b className="price">× {item.quantity}</b>
            </div>
          );
        })}
        <div className="border-b border-[#5b331d] grid grid-cols-2 gap-3 py-4">
          <span className="text-right">Taxa de rede</span>
          <span className="text-right">{order.networkFee} ETH</span>
          <b className="text-right">Total</b>
          <b className="price text-right">{order.total} ETH</b>
        </div>
        <p className="muted text-center text-sm leading-6 mt-5">
          Transação confirmada na Ethereum. A propriedade foi transferida para
          sua carteira conectada e registrada na rede.
        </p>
        <Button className="block mx-auto mt-6">Ver no Etherscan</Button>
      </div>
    </div>
  );
}
