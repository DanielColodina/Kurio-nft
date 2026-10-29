import { useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Eye, EyeOff, X } from "lucide-react";
import { api } from "../services/api/client";
import { queryClient } from "../app/query";
import { AxiosError } from "axios";

const backdropNfts: ReadonlyArray<readonly [string, string, string]> = [
  ["emerald-ape-042.webp", "Emerald Ape #042", "1.19"],
  ["sage-nomad-009.webp", "Sage Nomad #009", "1.69"],
  ["neon-vessel-552.webp", "Neon Vessel #552", "1.99"],
  ["cosmic-bloom-118.webp", "Cosmic Bloom #118", "1.29"],
  ["violet-nomad-314.webp", "Violet Nomad #314", "1.39"],
  ["ivory-baron-088.webp", "Ivory Baron #088", "1.79"],
  ["golden-beat-207.webp", "Golden Beat #207", "0.99"],
  ["sage-nomad-009.webp", "Golden Frequency #071", "0.59"],
  ["golden-signal-160.webp", "Golden Signal #160", "0.39"],
];

function AuthMarketplaceBackdrop() {
  const asset = (file: string) =>
    `${import.meta.env.BASE_URL}assets/nfts/${file}`;
  return (
    <div className="desktop-only kurio-auth-backdrop" aria-hidden="true">
      <section className="kurio-auth-hero">
        <div>
          <p>Bem-vindo à Kurio</p>
          <h2>
            SEJA DONO DO FUTURO
            <br />
            DA ARTE DIGITAL
          </h2>
          <span>
            Descubra NFTs selecionados de criadores emergentes e consagrados.
            Colecione arte digital rara, apoie artistas e tenha uma parte da
            cultura da internet.
          </span>
          <b>EXPLORAR NFTs</b>
        </div>
        <img src={asset("emerald-ape-042.webp")} alt="" />
      </section>
      <section className="kurio-auth-market">
        <aside>
          <h3>EXPLORAR</h3>
          {[
            "Todos os NFTs",
            "Arte",
            "Colecionáveis",
            "Fotografia",
            "Música",
            "Games",
            "Mundos virtuais",
          ].map((item) => (
            <span key={item}>{item}</span>
          ))}
          <h3>REDES</h3>
          <span>Ethereum</span>
          <span>Polygon</span>
          <span>Solana</span>
        </aside>
        <div>
          <header>
            <b>EM DESTAQUE</b>
            <span>Mais recentes</span>
          </header>
          <div className="kurio-auth-grid">
            {backdropNfts.map(([image, name, price], index) => (
              <article key={`${image}-${index}`}>
                <img src={asset(image)} alt="" />
                <b>{name}</b>
                <span>{price} ETH</span>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export function AuthPage({ mode }: { mode: "login" | "register" }) {
  const nav = useNavigate();
  const search = useSearch({ strict: false }) as { returnTo?: string };
  const [name, setName] = useState("");
  const [email, setEmail] = useState(
    mode === "login" ? "contato@email.com" : "",
  );
  const [password, setPassword] = useState(
    mode === "login" ? "Kurio@2026" : "",
  );
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Informe um e-mail válido.");
      return;
    }
    if (password.length < 8) {
      setError("A senha precisa ter ao menos 8 caracteres.");
      return;
    }
    if (mode === "register" && password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    setBusy(true);
    try {
      await api.post(mode === "login" ? "/login" : "/register", {
        name,
        email,
        password,
      });
      await queryClient.invalidateQueries({ queryKey: ["session"] });
      const allowedReturn = search.returnTo?.startsWith("/")
        ? search.returnTo
        : "/";
      if (allowedReturn === "/") void nav({ to: "/" });
      else
        window.location.assign(
          `${import.meta.env.BASE_URL}${allowedReturn.replace(/^\//, "")}`,
        );
    } catch (err: unknown) {
      const message =
        err instanceof AxiosError
          ? (err.response?.data as { message?: string } | undefined)?.message
          : undefined;
      setError(message ?? "Não foi possível autenticar.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="kurio-auth-page min-h-[calc(100vh-70px)] flex items-center justify-center py-12">
      <AuthMarketplaceBackdrop />
      <section className="kurio-auth-modal w-[470px] max-w-[calc(100%-56px)] surface md:border-b-8 border-[#d98e49] p-7 md:p-14 rounded-[28px] md:rounded-none">
        <Link
          to="/"
          className="desktop-only kurio-auth-close"
          aria-label="Fechar"
        >
          <X size={18} />
        </Link>
        <Link
          to="/"
          className="mobile-only block text-center text-3xl tracking-[4px] font-bold mb-28"
        >
          KURIO
        </Link>
        <div className="desktop-only text-center text-xl mb-7">
          <Link
            to="/login"
            search={{ returnTo: undefined }}
            className={mode === "login" ? "accent" : ""}
          >
            Entrar
          </Link>{" "}
          |{" "}
          <Link to="/register" className={mode === "register" ? "accent" : ""}>
            Criar conta
          </Link>
        </div>
        <p className="desktop-only kurio-auth-intro">
          {mode === "login"
            ? "Entre para gerenciar sua carteira, coleção e perfil de criador."
            : "Crie sua conta para colecionar, negociar e acompanhar seus NFTs."}
        </p>
        <h1 className="mobile-only text-center text-xl font-bold mb-8">
          {mode === "login" ? "Entrar" : "Criar perfil de colecionador"}
        </h1>
        <form onSubmit={submit} className="space-y-3">
          {mode === "register" && (
            <input
              className="field rounded-[10px] md:rounded-none h-12"
              placeholder="Nome de usuário"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}
          <input
            className="field rounded-[10px] md:rounded-none h-12"
            type="email"
            placeholder="Digite seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label className="relative block">
            <input
              className="field rounded-[10px] md:rounded-none h-12 pr-12"
              type={show ? "text" : "password"}
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-4 top-4 muted"
              aria-label={show ? "Ocultar senha" : "Mostrar senha"}
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </label>
          {mode === "register" && (
            <input
              className="field rounded-[10px] md:rounded-none h-12"
              type={show ? "text" : "password"}
              placeholder="Confirmar senha"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          )}
          {mode === "login" && (
            <button type="button" className="accent text-sm block ml-auto">
              Esqueceu a senha?
            </button>
          )}
          {error && (
            <p role="alert" className="text-red-400 text-sm">
              {error}
            </p>
          )}
          <button
            disabled={busy}
            className="kurio-auth-submit btn btn-primary rounded-[9px] md:rounded-none w-full h-[60px] mt-8"
          >
            {busy ? "Aguarde…" : mode === "login" ? "Entrar" : "Criar perfil"}
          </button>
        </form>
        <div className="kurio-auth-divider flex items-center gap-3 my-8">
          <i className="h-px bg-[#5b331d] grow" />
          <small>Ou continue com</small>
          <i className="h-px bg-[#5b331d] grow" />
        </div>
        <button
          onClick={() =>
            setError(
              "Login social indisponível nesta demonstração. Use as credenciais de teste.",
            )
          }
          className="field rounded-[6px] mb-3"
        >
          🌐 Continuar com Google
        </button>
        <button
          onClick={() =>
            setError(
              "Login social indisponível nesta demonstração. Use as credenciais de teste.",
            )
          }
          className="field rounded-[6px]"
        >
          ⓕ Continuar com Facebook
        </button>
        <p className="mobile-only text-center muted mt-10">
          {mode === "login" ? (
            <>
              Novo na Kurio? <Link to="/register">Crie uma conta</Link>
            </>
          ) : (
            <>
              Já tem uma conta?{" "}
              <Link to="/login" search={{ returnTo: undefined }}>
                Entre
              </Link>
            </>
          )}
        </p>
      </section>
    </div>
  );
}
