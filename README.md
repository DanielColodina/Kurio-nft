# KURIO

Marketplace de NFTs desenvolvido para o desafio frontend da KURIO. O projeto cobre descoberta, carrinho, checkout e conta do colecionador usando uma API simulada no próprio navegador.

- Aplicação: https://ctksistemas.com.br/kurio-nft/
- Repositório: https://github.com/DanielColodina/Kurio-nft

## Rodando o projeto

Requisitos: Node.js 22 e npm 10.

```bash
npm ci
npm run dev
```

O servidor local usa `http://localhost:4174`. Os mocks ficam ativos por padrão. Para apontar a interface para uma API externa, inicie com `VITE_ENABLE_MOCKS=false`.

Contas disponíveis:

| E-mail | Senha |
|---|---|
| `contato@email.com` | `Kurio@2026` |
| `curadora@email.com` | `Jungle@2026` |

O cupom `KURIO10` aplica 10% de desconto. `EXPIRADO` permite testar o retorno de cupom vencido.

## Cenários de erro

Os cenários são selecionados pelo parâmetro `scenario` na URL:

| Cenário | Exemplo |
|---|---|
| Resposta lenta | `/?scenario=slow` |
| Sem conexão | `/?scenario=offline` |
| Erro 503 | `/?scenario=server-error` |
| Catálogo vazio | `/?scenario=empty` |
| Sessão expirada | `/checkout?scenario=expired` |
| Edição esgotada | `/checkout?scenario=sold-out` |
| Pagamento recusado | `/checkout?scenario=declined` |
| Pedido pendente | `/checkout?scenario=pending` |
| Timeout após criação | `/checkout?scenario=order-timeout` |

Para restaurar as fixtures, limpe o armazenamento do site ou envie `POST /api/test/reset` enquanto a aplicação estiver aberta.

## Comandos

```bash
npm run typecheck       # TypeScript
npm run lint            # ESLint
npm run build           # build de produção
npm run preview         # preview do build
npm run test:e2e        # fluxos Playwright
npm run test:visual     # regressão visual
npm run lighthouse      # três auditorias por página e perfil
```

Os testes sobem sua própria instância com MSW e reiniciam o estado antes de cada caso. Mais detalhes sobre contratos, sessão, cache, idempotência e tempo real estão em [ARCHITECTURE.md](./ARCHITECTURE.md).

## Decisões de interface

As artes entregues com os frames foram reaproveitadas em WebP. Em larguras até 1023 px a navegação passa para o modo compacto; a partir de 1024 px a composição desktop é usada. Estados que não existiam nos frames — carregamento, erro, vazio, sessão expirada e pagamento recusado — seguem a mesma paleta e hierarquia visual.
