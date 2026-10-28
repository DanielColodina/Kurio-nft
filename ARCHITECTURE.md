# Arquitetura

## Organização

`src/pages` contém as telas e `src/components` concentra os elementos compartilhados. Rotas e parâmetros de busca são responsabilidade do TanStack Router. Dados remotos passam por hooks do TanStack Query e pelo cliente Axios em `src/services/api`. Os componentes não importam fixtures.

Em desenvolvimento e na demonstração pública, o MSW intercepta REST e Socket.IO. O mesmo conjunto de handlers é usado pelos testes. O estado simulado é persistido no `localStorage` para permitir refresh e pode ser restaurado pelo endpoint de teste.

## REST

| Método | Recurso | Uso |
|---|---|---|
| `GET` | `/session` | recuperar sessão |
| `POST` | `/login`, `/register`, `/logout` | conta e sessão |
| `GET` | `/nfts`, `/nfts/:id` | catálogo paginado e detalhe |
| `GET`, `PUT` | `/favorites`, `/favorites/:id` | favoritos do usuário |
| `GET`, `PUT` | `/cart` | carrinho do visitante ou usuário |
| `GET` | `/quote` | cupom, taxa e total |
| `POST`, `GET` | `/orders`, `/orders/:id` | criação e recuperação do pedido |
| `GET`, `PUT` | `/profile` | perfil do colecionador |
| `GET`, `PUT` | `/wallets` | carteiras cadastradas |

Preços são strings decimais e os cálculos usam `Decimal.js`. A criação do pedido exige `Idempotency-Key`. A tentativa fica associada ao conteúdo da requisição: repetir a mesma tentativa devolve o pedido original; usar a chave com outro conteúdo retorna conflito.

## Sessão e dados locais

Contas armazenam somente o hash da senha. Carrinho, favoritos, perfil, carteiras e pedidos são separados por usuário. O carrinho do visitante é transferido no login sem expor o carrinho de outra conta. Rotas privadas consultam a sessão antes de renderizar e guardam o destino para continuar o fluxo após o login.

No logout, o Query Client é limpo para não manter dados privados da sessão anterior. O cenário `expired` permite reproduzir perda de sessão durante a navegação.

## Cache e mutations

Consultas usam `staleTime` de 30 segundos, um retry e não refazem a requisição ao focar a janela. A chave do catálogo inclui todos os parâmetros enviados à API, isolando busca, filtros, ordenação e página. O `AbortSignal` do TanStack Query é encaminhado ao Axios.

Favoritar usa atualização otimista: o cache é atualizado antes da resposta e restaurado se a mutation falhar. Carrinho, cotação, perfil e carteiras são invalidados depois de mutations relacionadas.

## Socket.IO

O cliente se conecta com `socket.io-client`; o servidor simulado usa `@mswjs/socket.io-binding`. Os eventos são:

- `nft.updated`: identidade, preço, estoque e versão;
- `order.updated`: identidade do pedido e usuário, estado e versão.

Eventos antigos não substituem versões mais novas e estados terminais de pedido não regridem. Ao reconectar, catálogo e pedidos ativos são reconciliados pela API REST. Listeners são removidos ao encerrar o cliente.

## Limitações da demonstração

Não há blockchain, extensão de carteira ou pagamento real. Endereços, transações e conexão de carteira são simulados, e a aplicação nunca solicita chave privada ou seed phrase. As oito artes disponíveis foram reutilizadas nas fixtures adicionais para que filtros e paginação pudessem ser exercitados sem introduzir imagens externas.
