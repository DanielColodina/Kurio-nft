import { useState } from "react";
import { api } from "../services/api/client";
import { queryClient } from "../app/query";
import { useWallets } from "../hooks/api";
import type { Wallet } from "../types";
import { Sidebar } from "../components/Sidebar";
export function WalletsPage() {
  const { data = [] } = useWallets();
  const [changes, setChanges] = useState<Partial<Wallet>>({});
  const [saved, setSaved] = useState(false);
  const primary: Wallet = {
    ...{
      id: "primary",
      label: "Principal",
      address: "",
      network: "Ethereum",
      provider: "MetaMask",
      primary: true,
    },
    ...(data.find((w) => w.primary) ?? {}),
    ...changes,
  };
  const change = (patch: Partial<Wallet>) =>
    setChanges((current) => ({ ...current, ...patch }));
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !/^0x[a-fA-F0-9]{8,}$/.test(primary.address) &&
      !primary.address.endsWith(".eth")
    )
      return;
    const wallets = data.some((wallet) => wallet.id === primary.id)
      ? data.map((wallet) => (wallet.id === primary.id ? primary : wallet))
      : [primary, ...data];
    await api.put("/wallets", wallets);
    await queryClient.invalidateQueries({ queryKey: ["wallets"] });
    setSaved(true);
  };
  return (
    <section className="container mt-8 grid md:grid-cols-[310px_1fr] gap-8">
      <Sidebar active="wallets" />
      <form onSubmit={save}>
        <h1 className="text-xl font-bold">
          Carteira principal{" "}
          <button type="button" className="accent float-right">
            Adicionar
          </button>
        </h1>
        <p className="muted text-sm mb-8">
          Estas carteiras ficam disponíveis no pagamento e para receber NFTs
          comprados.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          <label>
            Nome de exibição *
            <input
              className="field mt-2"
              value={primary.label}
              onChange={(e) => change({ label: e.target.value })}
            />
          </label>
          <label>
            Apelido da carteira *
            <input
              className="field mt-2"
              value={primary.label}
              onChange={(e) => change({ label: e.target.value })}
            />
          </label>
          <label>
            Rede *
            <select
              className="field mt-2"
              value={primary.network}
              onChange={(e) => change({ network: e.target.value })}
            >
              <option>Ethereum</option>
              <option>Polygon</option>
              <option>Solana</option>
            </select>
          </label>
          <label>
            Tipo de carteira *
            <select
              className="field mt-2"
              value={primary.provider}
              onChange={(e) => change({ provider: e.target.value })}
            >
              <option>MetaMask</option>
              <option>WalletConnect</option>
              <option>Coinbase Wallet</option>
            </select>
          </label>
          <label>
            Endereço da carteira *
            <input
              className="field mt-2"
              value={primary.address}
              onChange={(e) => change({ address: e.target.value })}
            />
          </label>
          <label>
            Nome ENS
            <input className="field mt-2" placeholder="nome.eth" />
          </label>
        </div>
        <button className="btn btn-primary mt-8">Salvar carteira</button>
        {saved && <span className="accent ml-4">Carteira salva.</span>}
        <h2 className="text-xl font-bold mt-8">Carteira secundária</h2>
        <p className="muted mt-2">
          Você ainda não adicionou uma carteira secundária.
        </p>
      </form>
    </section>
  );
}
