import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api/client";
import type { CartLine, Nft, Order, User, Wallet } from "../types";

export const useCatalog = (params: Record<string, string | undefined> = {}) =>
  useQuery({
    queryKey: ["nfts", params],
    queryFn: async ({ signal }) =>
      (
        await api.get<{ items: Nft[]; total: number }>("/nfts", {
          params,
          signal,
        })
      ).data,
  });
export const useNft = (id: string) =>
  useQuery({
    queryKey: ["nft", id],
    queryFn: async ({ signal }) =>
      (await api.get<Nft>(`/nfts/${id}`, { signal })).data,
  });
export const useSession = () =>
  useQuery({
    queryKey: ["session"],
    queryFn: async () => (await api.get<User | null>("/session")).data,
  });
export const useCart = () =>
  useQuery({
    queryKey: ["cart"],
    queryFn: async () => (await api.get<CartLine[]>("/cart")).data,
  });
export const useQuote = (coupon?: string) =>
  useQuery({
    queryKey: ["quote", coupon ?? ""],
    queryFn: async () =>
      (
        await api.get<{
          subtotal: string;
          discount: string;
          networkFee: string;
          total: string;
          coupon: string | null;
        }>("/quote", { params: coupon ? { coupon } : undefined })
      ).data,
  });
export function useCartMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (cart: CartLine[]) =>
      (await api.put<CartLine[]>("/cart", cart)).data,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["cart"] });
      void qc.invalidateQueries({ queryKey: ["quote"] });
    },
  });
}
export const useProfile = () =>
  useQuery({
    queryKey: ["profile"],
    queryFn: async () => (await api.get<User>("/profile")).data,
  });
export const useWallets = () =>
  useQuery({
    queryKey: ["wallets"],
    queryFn: async () => (await api.get<Wallet[]>("/wallets")).data,
  });
export const useOrder = (id: string) =>
  useQuery({
    queryKey: ["order", id],
    queryFn: async () => (await api.get<Order>(`/orders/${id}`)).data,
    enabled: Boolean(id),
    refetchInterval: (query) =>
      query.state.data?.status === "pending" ? 2_000 : false,
  });
