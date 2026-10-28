import { useState } from "react";
import { api } from "../services/api/client";
import { queryClient } from "../app/query";
import { useWallets } from "../hooks/api";
import type { Wallet } from "../types";
import { Sidebar } from "../components/Sidebar";

const emptyWallet = (primary: boolean): Wallet => ({
  id: primary ? "primary" : "secondary",
  label: primary ? "Principal" : "Secundária",
  address: "",
  network: primary ? "Ethereum" : "Polygon",
  provider: primary ? "MetaMask" : "WalletConnect",
  primary,
});
const validAddress = (value: string) =>
  /^0x[a-fA-F0-9]{8,}$/.test(value) || value.endsWith(".eth");

function WalletFields({ wallet, change }: { wallet: Wallet; change: (patch: Partial<Wallet>) => void }) {
  return (
    <div className="grid md:grid-cols-2 gap-6 mt-5">
      <label>Nome de exibição *<input className="field mt-2" required value={wallet.label} onChange={(event) => change({ label: event.target.value })} /></label>
      <label>Rede *<select className="field mt-2" value={wallet.network} onChange={(event) => change({ network: event.target.value })}><option>Ethereum</option><option>Polygon</option><option>Solana</option></select></label>
      <label>Tipo de carteira *<select className="field mt-2" value={wallet.provider} onChange={(event) => change({ provider: event.target.value })}><option>MetaMask</option><option>WalletConnect</option><option>Coinbase Wallet</option></select></label>
      <label>Endereço da carteira *<input className="field mt-2" required value={wallet.address} onChange={(event) => change({ address: event.target.value })} /></label>
    </div>
  );
}

export function WalletsPage() {
  const { data = [] } = useWallets();
  const [primaryChanges, setPrimaryChanges] = useState<Partial<Wallet>>({});
  const [secondaryChanges, setSecondaryChanges] = useState<Partial<Wallet>>({});
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const storedPrimary = data.find((wallet) => wallet.primary);
  const storedSecondary = data.find((wallet) => !wallet.primary);
  const primary = { ...emptyWallet(true), ...storedPrimary, ...primaryChanges };
  const secondary = { ...emptyWallet(false), ...storedSecondary, ...secondaryChanges };
  const showSecondary = Boolean(storedSecondary || adding);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!validAddress(primary.address) || (showSecondary && !validAddress(secondary.address))) {
      setError("Informe um endereço válido para cada carteira.");
      return;
    }
    await api.put("/wallets", [primary, ...(showSecondary ? [secondary] : [])]);
    await queryClient.invalidateQueries({ queryKey: ["wallets"] });
    setMessage("Carteiras salvas.");
  };

  return (
    <section className="container mt-8 grid md:grid-cols-[310px_1fr] gap-8">
      <Sidebar active="wallets" />
      <form onSubmit={save}>
        <h1 className="text-xl font-bold">Carteira principal <button type="button" className="accent float-right" onClick={() => setAdding(true)}>Adicionar secundária</button></h1>
        <p className="muted text-sm mb-8">Estas carteiras ficam disponíveis no pagamento e para receber NFTs comprados.</p>
        <WalletFields wallet={primary} change={(patch) => setPrimaryChanges((current) => ({ ...current, ...patch }))} />
        <h2 className="text-xl font-bold mt-8">Carteira secundária</h2>
        {showSecondary ? <WalletFields wallet={secondary} change={(patch) => setSecondaryChanges((current) => ({ ...current, ...patch }))} /> : <p className="muted mt-2">Você ainda não adicionou uma carteira secundária.</p>}
        <button className="btn btn-primary mt-8">Salvar carteiras</button>
        {message && <span role="status" className="accent ml-4">{message}</span>}
        {error && <p role="alert" className="text-red-300 mt-4">{error}</p>}
      </form>
    </section>
  );
}
