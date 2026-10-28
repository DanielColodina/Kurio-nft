# Lighthouse

Auditoria executada em 28/10/2026 contra o build publicado, usando Lighthouse 12.8.2 e Chrome headless. Foram feitas três medições por rota e perfil; a tabela mostra a mediana.

| Rota e perfil | Performance | Acessibilidade | Boas práticas | SEO | LCP | CLS | TBT |
|---|---:|---:|---:|---:|---:|---:|---:|
| Home mobile | 64 | 100 | 96 | 100 | 6.478 ms | 0,000 | 120 ms |
| Detalhe mobile | 62 | 92 | 96 | 100 | 6.327 ms | 0,106 | 58 ms |
| Home desktop | 93 | 100 | 96 | 100 | 1.357 ms | 0,007 | 0 ms |
| Detalhe desktop | 95 | 100 | 96 | 100 | 1.323 ms | 0,009 | 0 ms |

Comando utilizado:

```powershell
$env:LIGHTHOUSE_BASE_URL='https://ctksistemas.com.br/kurio-nft'
npm run lighthouse
```

As metas são atingidas no desktop, exceto pelo resultado fixo de boas práticas em 96. No mobile, o principal gargalo é o LCP: antes da primeira renderização, a demonstração carrega e registra o MSW para que nenhuma chamada escape para uma API inexistente. O detalhe também fica abaixo da meta de acessibilidade por pontos de contraste e hierarquia do painel móvel. Esses resultados permanecem registrados porque remover os mocks ou as imagens apenas durante a auditoria não representaria a entrega real.

Os arquivos HTML e JSON das 12 execuções estão em `reports/lighthouse`.
