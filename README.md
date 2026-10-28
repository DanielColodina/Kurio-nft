# KURIO NFT Marketplace

Marketplace responsivo em React 19 e TypeScript, implementado a partir das 15 telas de referência do desafio.

Produção: https://ctksistemas.com.br/kurio-nft/

## Executar localmente

```bash
npm install
npm run dev
```

A aplicação abre em `http://localhost:4174`. O backend de demonstração roda no navegador com MSW e persiste o estado no `localStorage`.

Contas de teste:

- `contato@email.com` / `Kurio@2026`
- `curadora@email.com` / `Jungle@2026`

## Validação

```bash
npm run typecheck
npm run lint
npm run build
npm run test:e2e
npm run test:visual
npm run audit:reference
npm run lighthouse
```

A rota exigida pelo desafio continua disponível em `http://localhost:4174/?sort=price_asc#diario`.

## Cenários simulados

Use `?scenario=` com `slow`, `offline`, `server-error`, `empty`, `expired`, `sold-out`, `declined`, `pending` ou `order-timeout`. O cupom válido é `KURIO10`; `EXPIRADO` simula expiração. O estado pode ser reiniciado por `POST /api/test/reset`.

O checkout exige autenticação, refaz a cotação antes do pedido e usa `Idempotency-Key`. Favoritos, perfil, carteiras, carrinho autenticado e pedidos são isolados por usuário. Nenhuma chave privada ou seed phrase é solicitada.
