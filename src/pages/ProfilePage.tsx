import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { api } from "../services/api/client";
import { queryClient } from "../app/query";
import { useProfile } from "../hooks/api";
import type { User } from "../types";
import { Sidebar } from "../components/Sidebar";

const apiMessage = (error: unknown) =>
  (error as { response?: { data?: { message?: string } } }).response?.data
    ?.message ?? "Não foi possível salvar as alterações.";

export function ProfilePage() {
  const { data } = useProfile();
  const [draft, setDraft] = useState<Partial<User>>({});
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const nav = useNavigate();

  if (!data) return <div className="skeleton container h-96 mt-8" />;
  const form: User = { ...data, ...draft };

  const selectAvatar = (file?: File) => {
    setError("");
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 250_000) {
      setError("Escolha uma imagem de até 250 KB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setDraft((current) => ({ ...current, avatar: String(reader.result) }));
    reader.readAsDataURL(file);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setStatus("");
    if (passwords.next !== passwords.confirm) {
      setError("A confirmação da nova senha não confere.");
      return;
    }
    if ((passwords.current || passwords.next) && (!passwords.current || !passwords.next)) {
      setError("Preencha a senha atual e a nova senha.");
      return;
    }
    setSaving(true);
    try {
      await api.put("/profile", form);
      if (passwords.next) {
        await api.put("/profile/password", {
          currentPassword: passwords.current,
          newPassword: passwords.next,
        });
      }
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      await queryClient.invalidateQueries({ queryKey: ["session"] });
      setPasswords({ current: "", next: "", confirm: "" });
      setStatus("Dados salvos.");
    } catch (requestError) {
      setError(apiMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  const logout = async () => {
    await api.post("/logout");
    queryClient.clear();
    void nav({ to: "/" });
  };

  return (
    <section className="container mt-8 grid md:grid-cols-[310px_1fr] gap-8">
      <Sidebar active="profile" onLogout={logout} />
      <form onSubmit={save} noValidate>
        <h1 className="text-xl font-bold mb-8">Perfil do colecionador</h1>
        <div className="flex items-center gap-4 mb-8">
          {form.avatar ? (
            <img src={form.avatar} alt="Avatar atual" className="w-20 h-20 rounded-full object-cover" />
          ) : (
            <span className="w-20 h-20 rounded-full surface grid place-items-center" aria-hidden="true">
              {form.name.slice(0, 1).toUpperCase()}
            </span>
          )}
          <label className="btn cursor-pointer">
            Alterar avatar
            <input
              className="sr-only"
              type="file"
              accept="image/*"
              onChange={(event) => selectAvatar(event.target.files?.[0])}
            />
          </label>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <label>
            Nome de exibição *
            <input className="field mt-2" required value={form.name} onChange={(event) => setDraft((old) => ({ ...old, name: event.target.value }))} />
          </label>
          <label>
            Nome de usuário
            <input className="field mt-2" value={form.name.toLowerCase().replaceAll(" ", "-")} readOnly />
          </label>
          <label>
            E-mail *
            <input className="field mt-2" type="email" required value={form.email} onChange={(event) => setDraft((old) => ({ ...old, email: event.target.value }))} />
          </label>
          <label>
            Nome ENS
            <input className="field mt-2" value={form.ens} onChange={(event) => setDraft((old) => ({ ...old, ens: event.target.value }))} />
          </label>
        </div>
        <h2 className="text-lg mt-8 mb-5">Alterar senha</h2>
        <div className="max-w-[420px] space-y-5">
          <label className="block">Senha atual<input className="field mt-2" type="password" autoComplete="current-password" value={passwords.current} onChange={(event) => setPasswords((old) => ({ ...old, current: event.target.value }))} /></label>
          <label className="block">Nova senha<input className="field mt-2" type="password" minLength={8} autoComplete="new-password" value={passwords.next} onChange={(event) => setPasswords((old) => ({ ...old, next: event.target.value }))} /></label>
          <label className="block">Confirmar nova senha<input className="field mt-2" type="password" autoComplete="new-password" value={passwords.confirm} onChange={(event) => setPasswords((old) => ({ ...old, confirm: event.target.value }))} /></label>
        </div>
        <button className="btn btn-primary mt-8" disabled={saving}>{saving ? "Salvando…" : "Salvar"}</button>
        <button type="button" className="mobile-only btn mt-8 ml-3" onClick={logout}>Sair</button>
        {status && <span role="status" className="accent ml-4">{status}</span>}
        {error && <p role="alert" className="text-red-300 mt-4">{error}</p>}
      </form>
    </section>
  );
}
