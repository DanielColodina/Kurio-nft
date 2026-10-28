import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { api } from "../services/api/client";
import { queryClient } from "../app/query";
import { useProfile } from "../hooks/api";
import type { User } from "../types";
import { Sidebar } from "../components/Sidebar";

export function ProfilePage() {
  const { data } = useProfile();
  const [draft, setDraft] = useState<Partial<User>>({});
  const [saved, setSaved] = useState(false);
  const nav = useNavigate();
  if (!data) return <div className="skeleton container h-96 mt-8" />;
  const form: User = { ...data, ...draft };
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.put("/profile", form);
    await queryClient.invalidateQueries({ queryKey: ["profile"] });
    setSaved(true);
  };
  const logout = async () => {
    await api.post("/logout");
    queryClient.clear();
    void nav({ to: "/" });
  };
  return (
    <section className="container mt-8 grid md:grid-cols-[310px_1fr] gap-8">
      <Sidebar active="profile" onLogout={logout} />
      <form onSubmit={save}>
        <h1 className="text-xl font-bold mb-8">Perfil do colecionador</h1>
        <div className="grid md:grid-cols-2 gap-6">
          <label>
            Nome de exibição *
            <input
              className="field mt-2"
              value={form.name}
              onChange={(e) =>
                setDraft((old) => ({ ...old, name: e.target.value }))
              }
            />
          </label>
          <label>
            Nome de usuário *
            <input
              className="field mt-2"
              value={form.name.toLowerCase().replaceAll(" ", "-")}
              readOnly
            />
          </label>
          <label>
            E-mail *
            <input
              className="field mt-2"
              value={form.email}
              onChange={(e) =>
                setDraft((old) => ({ ...old, email: e.target.value }))
              }
            />
          </label>
          <label>
            Nome ENS *
            <input
              className="field mt-2"
              value={form.ens}
              onChange={(e) =>
                setDraft((old) => ({ ...old, ens: e.target.value }))
              }
            />
          </label>
        </div>
        <h2 className="text-lg mt-8 mb-5">Alterar senha</h2>
        <div className="max-w-[420px] space-y-5">
          <input className="field" type="password" placeholder="Senha atual" />
          <input className="field" type="password" placeholder="Nova senha" />
          <input
            className="field"
            type="password"
            placeholder="Confirmar nova senha"
          />
        </div>
        <button className="btn btn-primary mt-8">Salvar</button>
        {saved && (
          <span role="status" className="accent ml-4">
            Dados salvos.
          </span>
        )}
      </form>
    </section>
  );
}
