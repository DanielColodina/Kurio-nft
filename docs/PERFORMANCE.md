# Lighthouse

Auditoria executada em 29/10/2026 contra o build publicado, usando Lighthouse 12.8.2 e Chrome headless. Foram feitas três medições por rota e perfil; a tabela mostra a mediana.

| Rota e perfil | Performance | Acessibilidade | Boas práticas | SEO | LCP | CLS | TBT |
|---|---:|---:|---:|---:|---:|---:|---:|
| Home mobile | 64 | 100 | 96 | 100 | 6.910 ms | 0,000 | 82 ms |
| Detalhe mobile | 64 | 100 | 96 | 100 | 6.676 ms | 0,000 | 28 ms |
| Home desktop | 94 | 100 | 96 | 100 | 1.417 ms | 0,007 | 0 ms |
| Detalhe desktop | 94 | 100 | 96 | 100 | 1.383 ms | 0,009 | 0 ms |

Comando utilizado:

```powershell
$env:LIGHTHOUSE_BASE_URL='https://ctksistemas.com.br/kurio-nft'
npm run lighthouse
```

No detalhe mobile, a acessibilidade subiu de 92 para 100, o CLS caiu de 0,106 para zero e o TBT mediano caiu de 58 ms para 28 ms. A performance passou de 62 para 64. A home mobile permaneceu em 64; seu principal gargalo continua sendo o LCP enquanto a demonstração registra o MSW e carrega os dados e imagens sob limitação simulada de rede e CPU.

Foram adicionados preload e prioridade alta à arte principal, dimensões explícitas para evitar deslocamentos e carregamento tardio das imagens secundárias. Os relatórios HTML e JSON das 12 execuções estão em `reports/lighthouse`.
