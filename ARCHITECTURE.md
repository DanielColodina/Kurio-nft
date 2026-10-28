# Arquitetura

O frontend é organizado em rotas, páginas, componentes, hooks, serviços, mocks e tipos. TanStack Router mantém filtros e busca na URL; TanStack Query controla cache, estados assíncronos e cancelamento; Axios concentra o acesso HTTP.

MSW fornece a API REST e o transporte Socket.IO da demonstração. O estado é persistido no navegador e separado por usuário. Senhas de teste são comparadas por hash SHA-256 e não ficam armazenadas em texto aberto. Valores financeiros usam `Decimal.js` e chegam pela API como strings.

O checkout cria um snapshot imutável de itens e preços. A chave de idempotência e o fingerprint da requisição impedem duplicação ou reutilização com conteúdo diferente. O carrinho só é removido após confirmação; recusas e falhas o preservam.

Eventos `nft.updated` e `order.updated` carregam identidade e versão. O cliente rejeita eventos antigos e reconcilia dados por REST na reconexão. Rotas privadas validam a sessão e preservam a URL de retorno.

O build usa base `/kurio-nft/`, enquanto o desenvolvimento permanece na raiz. Nginx serve somente esse subdiretório e mantém os outros sistemas do domínio isolados.
