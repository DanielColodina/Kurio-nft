import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { SlidersHorizontal, Search } from "lucide-react";
import { useCatalog } from "../hooks/api";
import { NftCard } from "../components/NftCard";
import { Footer } from "../components/layout/Footer";

export type HomeSearch = {
  search?: string;
  network?: string;
  category?: string;
  tab?: string;
  maxPrice?: string;
  minPrice?: string;
  favorites?: boolean;
  sort?: string;
  page?: number;
};
const journalTitles = [
  "Como funciona a propriedade de NFTs",
  "10 artistas digitais para acompanhar",
  "Raridade, atributos e procedência",
  "Como proteger sua carteira",
];

export function HomePage() {
  const asset = (file: string) =>
    `${import.meta.env.BASE_URL}assets/nfts/${file}`;
  const params = useSearch({ from: "/" });
  const navigate = useNavigate({ from: "/" });
  const [term, setTerm] = useState(params.search ?? "");
  const [maxPrice, setMaxPrice] = useState(params.maxPrice ?? "12.30");
  const [minPrice, setMinPrice] = useState(params.minPrice ?? "0.02");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { data, isLoading, isError, refetch } = useCatalog({
    search: params.search,
    network: params.network,
    category: params.category,
    tab: params.tab,
    maxPrice: params.maxPrice,
    minPrice: params.minPrice,
    sort: params.sort,
    page: String(params.page ?? 1),
  });
  const visibleItems = useMemo(() => {
    const items = data?.items ?? [];
    if (!params.favorites) return items;
    try {
      const state = JSON.parse(localStorage.getItem("kurio.mock.v3") ?? "{}");
      const favorites = state.favoritesByUser?.[state.session?.id] ?? [];
      return items.filter((item) => favorites.includes(item.id));
    } catch {
      return items;
    }
  }, [data?.items, params.favorites]);
  const updateSearch = (patch: Partial<HomeSearch>) =>
    void navigate({
      search: (old) => ({ ...old, ...patch, page: patch.page ?? 1 }),
    });
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    updateSearch({ search: term || undefined });
  };
  useEffect(() => {
    if (term === (params.search ?? "")) return;
    const timeout = window.setTimeout(
      () =>
        void navigate({
          search: (old) => ({
            ...old,
            search: term || undefined,
            page: 1,
          }),
        }),
      300,
    );
    return () => window.clearTimeout(timeout);
  }, [navigate, term, params.search]);
  const facetCategories = Object.entries(data?.facets.categories ?? {});
  const facetNetworks = Object.entries(data?.facets.networks ?? {});
  const tabs = [
    [undefined, "Todos os NFTs"],
    ["new", "Novos lançamentos"],
    ["trending", "Em alta"],
  ] as const;

  return (
    <>
      <section className="kurio-mobile-search mobile-only">
        <div className="container">
          <form onSubmit={submit} className="kurio-search-form">
            <label>
              <Search size={20} />
              <input
                type="search"
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                placeholder="Explorar coleções"
                aria-label="Buscar coleções"
              />
            </label>
            <button
              type="button"
              onClick={() => setFiltersOpen((value) => !value)}
              aria-expanded={filtersOpen}
              aria-label="Filtros"
            >
              <SlidersHorizontal size={20} />
            </button>
          </form>
          {filtersOpen && (
            <div className="kurio-mobile-filter-panel">
              <b>Redes</b>
              {facetNetworks.map(([network, count]) => (
                <button key={network} onClick={() => updateSearch({ network: network.toLowerCase() })}>
                  {network} ({count})
                </button>
              ))}
              <b>Categorias</b>
              {facetCategories.map(([category, count]) => (
                <button key={category} onClick={() => updateSearch({ category })}>
                  {category} ({count})
                </button>
              ))}
              <button
                onClick={() =>
                  updateSearch({
                    network: undefined,
                    category: undefined,
                    minPrice: undefined,
                    maxPrice: undefined,
                    tab: undefined,
                    sort: undefined,
                  })
                }
              >
                Limpar
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="container kurio-hero-section">
        <div className="kurio-hero">
          <div className="kurio-hero-copy">
            <p className="kurio-eyebrow">Bem-vindo à Kurio</p>
            <h1 className="desktop-only">
              SEJA DONO DO FUTURO
              <br />
              DA ARTE DIGITAL
            </h1>
            <h1 className="mobile-only">
              SEJA DONO DA
              <br />
              CULTURA DIGITAL
            </h1>
            <p className="desktop-only kurio-hero-description">
              Descubra NFTs selecionados de criadores emergentes e consagrados.
              <br />
              Colecione arte digital rara, apoie artistas e tenha uma parte da
              <br />
              cultura da internet.
            </p>
            <p className="mobile-only kurio-hero-description">
              Descubra NFTs selecionados
              <br />
              de criadores do mundo
              <br />
              todo.
            </p>
            <a href="#catalogo" className="kurio-hero-cta">
              EXPLORAR <span className="mobile-only">→</span>
            </a>
          </div>
          <div className="kurio-hero-art">
            <img
              className="kurio-hero-main"
              src={asset("emerald-ape-042.webp")}
              alt="Emerald Ape em destaque"
              width="520"
              height="520"
              fetchPriority="high"
            />
            <img
              className="kurio-hero-secondary mobile-only"
              src={asset("sage-nomad-009.webp")}
              alt="Sage Nomad"
              width="180"
              height="180"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="kurio-hero-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
        </div>
      </section>

      <section id="catalogo" className="container kurio-catalog-section">
        <div className="kurio-catalog-layout">
          <div className="desktop-only kurio-sidebar-column">
            <aside className="kurio-filter-panel">
              <h2>Coleções</h2>
              <div className="kurio-category-list">
                {facetCategories.map(([name, count]) => (
                  <button
                    key={name}
                    className={
                      params.category === name ? "active" : ""
                    }
                    onClick={() =>
                      updateSearch({
                        category: params.category === name ? undefined : name,
                      })
                    }
                  >
                    <span>{name}</span>
                    <b>({count})</b>
                  </button>
                ))}
              </div>
              <h3>Faixa de preço</h3>
              <label className="kurio-price-input">
                Mínimo
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={minPrice}
                  onChange={(event) => setMinPrice(event.target.value)}
                />
              </label>
              <input
                type="range"
                min="0.02"
                max="12.30"
                step="0.01"
                value={maxPrice}
                onChange={(event) => setMaxPrice(event.target.value)}
                aria-label="Preço máximo"
              />
              <p>
                Preço: 0,02 – {Number(maxPrice).toFixed(2).replace(".", ",")}{" "}
                ETH
              </p>
              <button
                className="kurio-apply"
                onClick={() => updateSearch({ minPrice, maxPrice })}
              >
                Aplicar
              </button>
              <h3>Rede</h3>
              <div className="kurio-network-list">
                {facetNetworks.map(([name, count]) => (
                  <button
                    key={name}
                    className={
                      params.network === String(name).toLowerCase()
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      updateSearch({
                        network:
                          params.network === String(name).toLowerCase()
                            ? undefined
                            : String(name).toLowerCase(),
                      })
                    }
                  >
                    <span>{name}</span>
                    <b>({count})</b>
                  </button>
                ))}
              </div>
            </aside>
            <article className="kurio-featured-card">
              <h2>NFT EM DESTAQUE</h2>
              <h3>OFERTA LIMITADA</h3>
              <img
                src={asset("sage-nomad-009.webp")}
                alt="Sage Nomad em oferta limitada"
              />
            </article>
          </div>
          <div className="kurio-catalog-content">
            <form onSubmit={submit} className="desktop-only kurio-desktop-search">
              <label htmlFor="desktop-catalog-search">Buscar no catálogo</label>
              <div>
                <Search size={20} aria-hidden="true" />
                <input
                  id="desktop-catalog-search"
                  type="search"
                  value={term}
                  onChange={(event) => setTerm(event.target.value)}
                  placeholder="Nome, criador, coleção, categoria ou rede"
                />
                {term && (
                  <button type="button" onClick={() => setTerm("")}>
                    Limpar
                  </button>
                )}
              </div>
            </form>
            <div className="kurio-catalog-toolbar">
              <div className="kurio-tabs" role="tablist" aria-label="Catálogo">
                {tabs.map(([value, label]) => (
                  <button
                    role="tab"
                    aria-selected={
                      params.tab === value || (!params.tab && !value)
                    }
                    className={
                      params.tab === value || (!params.tab && !value)
                        ? "active"
                        : ""
                    }
                    onClick={() => updateSearch({ tab: value })}
                    key={label}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <label className="desktop-only kurio-sort-label">
                Ordenar por:
                <select
                  aria-label="Ordenação"
                  value={params.sort ?? ""}
                  onChange={(event) =>
                    updateSearch({ sort: event.target.value || undefined })
                  }
                >
                  <option value="">Listados recentemente</option>
                  <option value="price_asc">Menor preço</option>
                  <option value="price_desc">Maior preço</option>
                </select>
              </label>
            </div>
            {(params.search || params.network || params.category || params.minPrice || params.maxPrice || params.tab || params.sort) && (
              <div className="kurio-active-filters" aria-label="Filtros ativos">
                {[
                  params.search && `Busca: ${params.search}`,
                  params.category,
                  params.network,
                  params.minPrice && `Mín. ${params.minPrice} ETH`,
                  params.maxPrice && `Máx. ${params.maxPrice} ETH`,
                ].filter(Boolean).map((label) => <span key={String(label)}>{label}</span>)}
                <button
                  onClick={() => {
                    setTerm("");
                    setMinPrice("0.02");
                    setMaxPrice("12.30");
                    updateSearch({
                      search: undefined, network: undefined, category: undefined,
                      minPrice: undefined, maxPrice: undefined, tab: undefined,
                      sort: undefined,
                    });
                  }}
                >
                  Limpar filtros
                </button>
              </div>
            )}
            {isLoading ? (
              <div className="kurio-nft-grid">
                {Array.from({ length: 9 }, (_, index) => (
                  <div key={index}>
                    <div className="skeleton aspect-square" />
                    <div className="skeleton h-5 mt-3 w-3/4" />
                  </div>
                ))}
              </div>
            ) : isError ? (
              <div className="py-20 text-center">
                <p>Não foi possível carregar o catálogo.</p>
                <button onClick={() => void refetch()} className="btn mt-4">
                  Tentar novamente
                </button>
              </div>
            ) : visibleItems.length ? (
              <>
                <p className="kurio-result-count" aria-live="polite">
                  {data?.total ?? 0} resultado(s)
                </p>
                <div className="kurio-nft-grid">
                  {visibleItems.map((nft, index) => (
                    <NftCard
                      key={`${nft.id}-${index}`}
                      nft={nft}
                      badge={nft.id === "neon-vessel-552" ? "RARO" : null}
                      stagger={index % 2 === 1}
                    />
                  ))}
                </div>
              </>
            ) : (
              <p className="py-20 text-center muted">Nenhum NFT encontrado.</p>
            )}
            <nav
              className="kurio-pagination"
              aria-label="Paginação"
            >
              <button
                aria-label="Página anterior"
                disabled={(params.page ?? 1) <= 1}
                onClick={() =>
                  updateSearch({ page: Math.max(1, (params.page ?? 1) - 1) })
                }
              >
                ‹
              </button>
              {Array.from({ length: data?.totalPages ?? 1 }, (_, index) => index + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => updateSearch({ page })}
                  aria-current={
                    (params.page ?? 1) === page ? "page" : undefined
                  }
                  className={(params.page ?? 1) === page ? "active" : ""}
                >
                  {page}
                </button>
              ))}
              <button
                aria-label="Próxima página"
                onClick={() =>
                    updateSearch({ page: Math.min(data?.totalPages ?? 1, (params.page ?? 1) + 1) })
                }
                disabled={(params.page ?? 1) >= (data?.totalPages ?? 1)}
              >
                ›
              </button>
            </nav>
          </div>
        </div>
      </section>

      <section className="desktop-only container kurio-promos">
        <article>
          <img src={asset("emerald-ape-042.webp")} alt="Emerald Ape" />
          <div>
            <b>
              Lançamentos gênesis
              <br />
              de edição limitada
            </b>
            <p>
              Colecione edições escassas
              <br />
              diretamente dos criadores antes
              <br />
              da revelação pública.
            </p>
            <a href="#catalogo">Explorar →</a>
          </div>
        </article>
        <article>
          <img src={asset("ivory-baron-088.webp")} alt="Ivory Baron" />
          <div>
            <b>
              Arte digital selecionada
              <br />e muito mais
            </b>
            <p>
              Explore novos artistas,
              <br />
              coleções verificadas e obras
              <br />
              digitais que definem a
            </p>
            <a href="#catalogo">Explorar →</a>
          </div>
        </article>
      </section>
      <section id="diario" className="desktop-only container kurio-journal">
        <h2>Diário da Cunhagem</h2>
        <p>
          Histórias, guias e insights para colecionadores sobre o universo da
          propriedade digital.
        </p>
        <div>
          {visibleItems.slice(0, 4).map((nft, index) => (
            <article key={nft.id}>
              <img src={nft.image} alt="" />
              <div>
                <small>
                  {12 + index} de setembro&nbsp; | &nbsp;Leitura de{" "}
                  {index === 0 ? 6 : index + 1} min
                </small>
                <h3>{journalTitles[index]}</h3>
                <p>
                  {
                    [
                      "Aprenda a colecionar, negociar e verificar ativos digitais.",
                      "Conheça criadores que moldam a cultura digital.",
                      "Entenda raridade, procedência, direitos autorais e utilidade.",
                      "Proteja sua carteira, seus ativos e sua identidade.",
                    ][index]
                  }
                </p>
                <a href="#catalogo">Ler mais →</a>
              </div>
            </article>
          ))}
        </div>
      </section>
      <Footer />
    </>
  );
}
