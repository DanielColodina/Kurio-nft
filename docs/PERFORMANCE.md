# Performance e acessibilidade

O script `npm run lighthouse` audita home e detalhe três vezes nos perfis desktop e mobile. Medianas reais da última rodada de produção em 28/10/2026:

| Página/perfil | Performance | Acessibilidade | Boas práticas | SEO |
|---|---:|---:|---:|---:|
| Home desktop | 61 | 100 | 96 | 92 |
| Detalhe desktop | 62 | 100 | 96 | 92 |
| Home mobile | 39 | 100 | 96 | 92 |
| Detalhe mobile | 43 | 92 | 96 | 92 |

As metas de performance ainda não foram atingidas. Os principais custos são o carregamento das artes de grande dimensão, a inicialização da camada de simulação e o JavaScript do bundle. Os resultados são mantidos explícitos para não confundir estabilidade funcional com a meta de Lighthouse.
