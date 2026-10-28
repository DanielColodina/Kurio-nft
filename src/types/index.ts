export type Nft = {
  id: string;
  tokenId: string;
  name: string;
  price: string;
  oldPrice?: string;
  image: string;
  rarity?: "RARO" | "ÉPICO";
  category: string;
  network: "Ethereum" | "Polygon" | "Solana";
  stock: number;
  version: number;
};

export type CartLine = { nftId: string; quantity: number; edition: string };
export type User = {
  id: string;
  name: string;
  email: string;
  ens: string;
  avatar?: string;
};
export type Wallet = {
  id: string;
  label: string;
  address: string;
  network: string;
  provider: string;
  primary: boolean;
};
export type OrderStatus = "pending" | "confirmed" | "declined";
export type OrderItem = CartLine & {
  name: string;
  tokenId: string;
  image: string;
  unitPrice: string;
};
export type Order = {
  id: string;
  transaction: string;
  status: OrderStatus;
  createdAt: string;
  total: string;
  networkFee: string;
  wallet: string;
  items: OrderItem[];
  userId: string;
  version: number;
};
