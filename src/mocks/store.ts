import type { CartLine, Order, User, Wallet } from "../types";
import { demoUser, secondDemoUser } from "./fixtures";

const key = "kurio.mock.v2";

export type State = {
  session: User | null;
  accounts: Array<{ user: User; passwordHash: string }>;
  carts: Record<string, CartLine[]>;
  favoritesByUser: Record<string, string[]>;
  profilesByUser: Record<string, User>;
  walletsByUser: Record<string, Wallet[]>;
  orders: Order[];
  attempts: Record<string, string | { orderId: string; fingerprint: string }>;
};

const initialWallets: Wallet[] = [
  { id: "reserve", label: "Reserva", address: "nova.kurio.eth", network: "Polygon", provider: "WalletConnect", primary: false },
  { id: "primary", label: "Principal", address: "0xA91F…E82C", network: "Ethereum", provider: "Coinbase Wallet", primary: true },
];

const initial: State = {
  session: null,
  accounts: [
    { user: demoUser, passwordHash: "0287713ae5fcff3888cfa095ad3d43fc9f5366cafa6abe3d9a5cde3940551790" },
    { user: secondDemoUser, passwordHash: "55a71a77caa8544080433193f6d5c17ccc9dbd6b13bfbdfd7f5a431d9b7f7666" },
  ],
  carts: {
    guest: [
      { nftId: "emerald-ape-042", quantity: 1, edition: "1/50" },
      { nftId: "violet-nomad-314", quantity: 1, edition: "1/1" },
      { nftId: "ivory-baron-088", quantity: 2, edition: "1/10" },
      { nftId: "golden-beat-207", quantity: 2, edition: "1/50" },
    ],
  },
  favoritesByUser: { [demoUser.id]: [], [secondDemoUser.id]: [] },
  profilesByUser: { [demoUser.id]: demoUser, [secondDemoUser.id]: secondDemoUser },
  walletsByUser: { [demoUser.id]: initialWallets, [secondDemoUser.id]: [] },
  orders: [],
  attempts: {},
};

export function readState(): State {
  try {
    const stored = JSON.parse(localStorage.getItem(key) ?? "") as Partial<State>;
    return {
      ...structuredClone(initial),
      ...stored,
      accounts: stored.accounts ?? structuredClone(initial.accounts),
      carts: stored.carts ?? structuredClone(initial.carts),
      favoritesByUser: stored.favoritesByUser ?? structuredClone(initial.favoritesByUser),
      profilesByUser: stored.profilesByUser ?? structuredClone(initial.profilesByUser),
      walletsByUser: stored.walletsByUser ?? structuredClone(initial.walletsByUser),
    };
  } catch {
    return structuredClone(initial);
  }
}

export function writeState(state: State) {
  localStorage.setItem(key, JSON.stringify(state));
}

export function updateState(mutator: (state: State) => void) {
  const state = readState();
  mutator(state);
  writeState(state);
  return state;
}

export function resetState() {
  localStorage.removeItem(key);
  localStorage.removeItem("kurio.mock.v1");
}

export const ownerId = (state: State) => state.session?.id ?? "guest";
export const currentCart = (state: State) => state.carts[ownerId(state)] ?? [];
