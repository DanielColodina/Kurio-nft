import { Link, useNavigate } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Nft } from "../types";
import { api } from "../services/api/client";
import { useSession } from "../hooks/api";

export function NftCard({
  nft,
  badge,
  stagger = false,
}: {
  nft: Nft;
  badge?: string | null;
  stagger?: boolean;
}) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: user } = useSession();
  const { data: favorites = [] } = useQuery({
    queryKey: ["favorites"],
    queryFn: async () => (await api.get<string[]>("/favorites")).data,
    enabled: Boolean(user),
  });
  const active = favorites.includes(nft.id);
  const favorite = useMutation({
    mutationFn: async () =>
      (await api.put<string[]>(`/favorites/${nft.id}`)).data,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["favorites"] });
      const previous = queryClient.getQueryData<string[]>(["favorites"]) ?? [];
      queryClient.setQueryData(
        ["favorites"],
        previous.includes(nft.id)
          ? previous.filter((id) => id !== nft.id)
          : [...previous, nft.id],
      );
      return { previous };
    },
    onError: (_error, _value, context) =>
      queryClient.setQueryData(["favorites"], context?.previous ?? []),
    onSuccess: (value) => queryClient.setQueryData(["favorites"], value),
  });
  return (
    <article className={`kurio-nft-card ${stagger ? "kurio-stagger" : ""}`}>
      <div className="kurio-nft-image-wrap">
        <Link to="/nft/$id" params={{ id: nft.id }}>
          <img
            src={nft.image}
            alt={`Arte do NFT ${nft.name}`}
            width="360"
            height="360"
            loading="lazy"
            decoding="async"
          />
        </Link>
        {badge && <span className="kurio-rarity">{badge}</span>}
        <button
          type="button"
          aria-label={`${active ? "Remover dos favoritos" : "Favoritar"} ${nft.name}`}
          aria-pressed={active}
          onClick={() =>
            user
              ? favorite.mutate()
              : void navigate({
                  to: "/login",
                  search: { returnTo: `/nft/${nft.id}` },
                })
          }
          className="kurio-favorite mobile-only"
        >
          <Heart size={18} fill={active ? "#d98e49" : "transparent"} />
        </button>
      </div>
      <div className="kurio-nft-meta">
        <Link to="/nft/$id" params={{ id: nft.id }}>
          {nft.name}
        </Link>
        <strong>{nft.price} ETH</strong>
        {nft.oldPrice && <del>{nft.oldPrice} ETH</del>}
      </div>
    </article>
  );
}
