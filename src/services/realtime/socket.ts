import { io, type Socket } from "socket.io-client";
import type { QueryClient } from "@tanstack/react-query";
import type { Nft, Order } from "../../types";

type NftEvent = Pick<Nft, "id" | "price" | "stock" | "version">;
type OrderEvent = Pick<Order, "id" | "status" | "userId" | "version">;
let socket: Socket | undefined;
const onDemoPriceChange = (event: Event) => {
  const { nftId, price } = (event as CustomEvent).detail as {
    nftId: string;
    price: string;
  };
  socket?.emit("demo.price-change", nftId, price);
};
const onDemoOrderChange = (event: Event) => {
  const { orderId, status } = (event as CustomEvent).detail as {
    orderId: string;
    status: Order["status"];
  };
  socket?.emit("demo.order-change", orderId, status);
};

export function startRealtime(queryClient: QueryClient) {
  socket?.disconnect();
  window.removeEventListener("kurio:demo-price-change", onDemoPriceChange);
  window.removeEventListener("kurio:demo-order-change", onDemoOrderChange);
  window.addEventListener("kurio:demo-price-change", onDemoPriceChange);
  window.addEventListener("kurio:demo-order-change", onDemoOrderChange);
  document.documentElement.dataset.realtime = "connecting";
  socket = io("http://kurio.local", {
    transports: ["websocket"],
    reconnection: true,
  });
  socket.on("nft.updated", (event: NftEvent) => {
    queryClient.setQueryData<Nft>(["nft", event.id], (current) =>
      current && current.version >= event.version
        ? current
        : { ...current!, ...event },
    );
    void queryClient.invalidateQueries({ queryKey: ["nfts"] });
    void queryClient.invalidateQueries({ queryKey: ["quote"] });
  });
  socket.on("order.updated", (event: OrderEvent) => {
    queryClient.setQueryData<Order>(["order", event.id], (current) =>
      current &&
      current.userId === event.userId &&
      current.version < event.version &&
      !["confirmed", "declined"].includes(current.status)
        ? { ...current, status: event.status, version: event.version }
        : current,
    );
  });
  socket.on("connect", () => {
    document.documentElement.dataset.realtime = "connected";
    void queryClient.invalidateQueries({ queryKey: ["nfts"] });
    void queryClient.invalidateQueries({ queryKey: ["order"] });
  });
  socket.on("disconnect", () => {
    document.documentElement.dataset.realtime = "disconnected";
  });
  socket.on("connect_error", (error) => {
    document.documentElement.dataset.realtime = "error";
    if (import.meta.env.DEV) console.warn("[KURIO realtime]", error.message);
  });
  return socket;
}

export function stopRealtime() {
  window.removeEventListener("kurio:demo-price-change", onDemoPriceChange);
  window.removeEventListener("kurio:demo-order-change", onDemoOrderChange);
  socket?.removeAllListeners();
  socket?.disconnect();
  socket = undefined;
}
