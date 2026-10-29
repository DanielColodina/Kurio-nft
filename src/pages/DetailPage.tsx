import { useState } from "react";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { ChevronLeft, Heart, ShoppingCart, Star } from "lucide-react";
import {
  useCart,
  useCartMutation,
  useCatalog,
  useNft,
  useSession,
} from "../hooks/api";
import { NftCard } from "../components/NftCard";
import { Quantity } from "../components/Quantity";
import { Footer } from "../components/layout/Footer";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api/client";

export function DetailPage() {
  const { id } = useParams({ from: "/nft/$id" });
  const { data: nft, isLoading, isError } = useNft(id);
  const { data: cart = [] } = useCart();
  const mutation = useCartMutation();
  const { data: catalog } = useCatalog();
  const [qty, setQty] = useState(1);
  const [edition, setEdition] = useState("1/50");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: user } = useSession();
  const { data: favorites = [] } = useQuery({
    queryKey: ["favorites"],
    queryFn: async () => (await api.get<string[]>("/favorites")).data,
    enabled: Boolean(user),
  });
  const favorite = useMutation({
    mutationFn: async () => (await api.put<string[]>(`/favorites/${id}`)).data,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["favorites"] });
      const previous = queryClient.getQueryData<string[]>(["favorites"]) ?? [];
      queryClient.setQueryData(
        ["favorites"],
        previous.includes(id)
          ? previous.filter((favoriteId) => favoriteId !== id)
          : [...previous, id],
      );
      return { previous };
    },
    onError: (_error, _value, context) =>
      queryClient.setQueryData(["favorites"], context?.previous ?? []),
    onSuccess: (value) => queryClient.setQueryData(["favorites"], value),
  });
  if (isLoading)
    return (
      <div className="container mt-14 grid md:grid-cols-2 gap-8">
        <div className="skeleton aspect-square" />
        <div className="space-y-5">
          {[1, 2, 3, 4].map((x) => (
            <div key={x} className="skeleton h-10" />
          ))}
        </div>
      </div>
    );
  if (isError || !nft)
    return (
      <div className="container py-32 text-center">
        <h1 className="text-2xl">NFT não encontrado</h1>
        <Link to="/" className="btn inline-flex items-center mt-6">
          Voltar ao mercado
        </Link>
      </div>
    );
  const add = () =>
    mutation.mutate([
      ...cart.filter((x) => x.nftId !== nft.id),
      { nftId: nft.id, quantity: qty, edition },
    ]);
  const buy = () => {
    add();
    void navigate({ to: "/cart" });
  };
  return (
    <>
      <section className="container kurio-detail-page mt-6 md:mt-12">
        <div className="mobile-only kurio-detail-mobile-controls flex justify-between">
          <button
            type="button"
            onClick={() => history.back()}
            aria-label="Voltar"
            className="w-11 h-11 rounded-full surface grid place-items-center"
          >
            <ChevronLeft aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() =>
              user
                ? favorite.mutate()
                : void navigate({
                    to: "/login",
                    search: { returnTo: `/nft/${id}` },
                  })
            }
            aria-label={
              favorites.includes(id)
                ? "Remover NFT dos favoritos"
                : "Adicionar NFT aos favoritos"
            }
            aria-pressed={favorites.includes(id)}
            className="w-11 h-11 rounded-full surface accent grid place-items-center"
          >
            <Heart
              size={19}
              fill={favorites.includes(id) ? "#d98e49" : "transparent"}
              aria-hidden="true"
            />
          </button>
        </div>
        {favorite.isError && (
          <p role="alert" className="mobile-only text-red-300 mb-2">
            Não foi possível atualizar os favoritos.
          </p>
        )}
        <p className="desktop-only font-bold mb-3">Início / Mercado</p>
        <div className="kurio-detail-layout grid md:grid-cols-[520px_1fr] gap-7 md:gap-10">
          <div className="kurio-detail-gallery md:grid md:grid-cols-[90px_1fr] gap-5">
            <div className="desktop-only space-y-4">
              {[1, 2, 3, 4].map((x) => (
                <button
                  type="button"
                  key={x}
                  aria-label={`Selecionar visualização ${x}`}
                  className="block border border-transparent focus:border-[#d98e49]"
                >
                  <img
                    src={nft.image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                </button>
              ))}
            </div>
            <div className="kurio-detail-main-image surface md:p-5">
              <img
                src={nft.image}
                alt={nft.name}
                width="520"
                height="520"
                fetchPriority="high"
                className="w-full aspect-square object-cover rounded-[22px] md:rounded-[10px]"
              />
            </div>
          </div>
          <div className="kurio-detail-panel surface md:bg-transparent -mt-10 md:mt-0 relative rounded-t-[30px] p-6 md:p-0">
            <div className="flex items-center justify-between">
              <h1 className="text-xl md:text-3xl font-bold">{nft.name}</h1>
              <span className="flex shrink-0 items-center gap-1">
                <Star size={16} fill="#d98e49" className="accent" />
                4.8<small>(19)</small>
              </span>
            </div>
            <p className="desktop-only price text-2xl mt-3">{nft.price} ETH</p>
            <div className="kurio-detail-description border-t border-[#38220f] mt-4 pt-4">
              <b className="desktop-only">Sobre este NFT:</b>
              <p className="muted leading-7 mt-2">
                Um colecionável digital 1/50 finalizado à mão da coleção Kurio
                Editions, verificado na Ethereum.
              </p>
            </div>
            <b className="block mt-4">Edição:</b>
            <div className="flex gap-2 mt-2">
              {["1/1", "1/10", "1/50", "ABERTA"].map((x) => (
                <button
                  type="button"
                  onClick={() => setEdition(x)}
                  aria-pressed={edition === x}
                  aria-label={`Selecionar edição ${x}`}
                  className={`min-h-[30px] md:min-h-0 rounded-full border px-3 py-1 text-sm ${edition === x ? "border-[#d98e49] accent" : "border-[#5b331d] muted"}`}
                  key={x}
                >
                  {x}
                </button>
              ))}
            </div>
            <div className="mobile-only muted leading-8 mt-4">
              <p>ID do token: {nft.tokenId}</p>
              <p>Coleção: Kurio Apes</p>
              <p>Atributos: Óculos, Esmeralda, Raro</p>
            </div>
            <div className="mt-8 md:flex md:items-center md:gap-5">
              <span className="mr-3 muted">Qtd.</span>
              <Quantity value={qty} onChange={setQty} max={nft.stock} />
              <span className="mobile-only float-right price text-xl mt-1">
                {nft.price} ETH
              </span>
              <div className="flex gap-3 mt-6 md:mt-0 md:ml-auto">
                <button
                  onClick={buy}
                  className="btn btn-primary rounded-full md:rounded-none grow md:w-36"
                >
                  Comprar NFT
                </button>
                <button
                  onClick={add}
                  className="btn rounded-full md:rounded-none"
                  aria-label="Adicionar ao carrinho"
                >
                  <ShoppingCart size={18} />
                  <span className="desktop-only"> Adicionar</span>
                </button>
              </div>
            </div>
            <div className="desktop-only muted leading-8 mt-3">
              <p>ID do token: {nft.tokenId}</p>
              <p>Coleção: Kurio Apes</p>
              <p>Atributos: Óculos, Esmeralda, Raro</p>
              <p className="text-white font-bold">
                Compartilhar este NFT: in ✉ ♥
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="desktop-only container mt-20">
        <div className="flex gap-9 border-b border-[#38220f]">
          <b className="accent border-b-2 border-[#d98e49] pb-3">
            Detalhes do NFT
          </b>
          <span>Avaliações de colecionadores (19)</span>
        </div>
        <p className="muted leading-7 mt-4">
          {nft.name} é uma obra digital finalizada à mão. Cada atributo fica
          armazenado nos metadados do token e verificado na rede. A obra explora
          identidade, movimento e luz em um mundo digital sem fronteiras.
        </p>
        <p className="muted leading-7 mt-6">
          <b className="text-white">Rede:</b>
          <br />
          Cunhado na {nft.network} com procedência imutável e metadados
          armazenados no IPFS.
        </p>
        <p className="muted leading-7 mt-6">
          <b className="text-white">Contrato:</b>
          <br />
          Direitos autorais do criador: 5% nas vendas secundárias, pagos
          automaticamente pelos mercados compatíveis.
        </p>
        <p className="muted leading-7 mt-6">
          <b className="text-white">Direitos autorais:</b>
          <br />
          0x7A42...19E8 • Contrato inteligente ERC-721 verificado.
        </p>
      </section>
      <section className="desktop-only container mt-20">
        <h2 className="section-title">Mais desta coleção</h2>
        <div className="grid grid-cols-5 gap-6 mt-7">
          {[
            "cosmic-bloom-118",
            "violet-nomad-314",
            "ivory-baron-088",
            "golden-beat-207",
            "golden-signal-160",
          ].map((relatedId) => {
            const related = catalog?.items.find(
              (item) => item.id === relatedId,
            );
            return related ? <NftCard key={related.id} nft={related} /> : null;
          })}
        </div>
      </section>
      <Footer />
    </>
  );
}
