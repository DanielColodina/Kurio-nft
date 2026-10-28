# Relatório de testes

Validação executada em 28/10/2026 nos projetos Chromium desktop (1440×1080) e mobile (390×844).

A suíte E2E cobre busca e URL, ordenação e âncora, detalhe inexistente, carrinho persistente, login e sessão, proteção de rotas, cupom válido e inválido, conflito de cadastro, checkout idempotente, pagamento recusado e atualização por Socket.IO. O relatório HTML temporário não é versionado.

Resultado final: **21 testes aprovados e 1 ignorado**. O caso ignorado repete no projeto mobile uma asserção de âncora e ordenação já validada no desktop.

A regressão visual cobre home, detalhe, carrinho, checkout, confirmação, login, cadastro, perfil e carteiras em desktop e mobile. Os snapshots verificam regressões da implementação; a auditoria em `reports/reference-visual-audit` compara separadamente a interface com os PNGs originais.

Resultado final da regressão: **18/18 aprovados**.

Diferenças medidas contra as referências originais após as correções:

| Tela | Diferença |
|---|---:|
| Home desktop | 16,19% |
| Home mobile | 23,00% |
| Detalhe desktop/mobile | 16,43% / 23,29% |
| Carrinho desktop/mobile | 19,55% / 25,74% |
| Checkout desktop/mobile | 8,68% / 10,20% |
| Confirmação desktop | 3,40% |
| Login desktop/mobile | 18,72% / 10,21% |
| Cadastro desktop/mobile | 17,83% / 10,42% |
| Perfil desktop | 3,64% |
| Carteiras desktop | 4,45% |

Esses números são reportados sem alegar equivalência pixel-perfect onde a comparação ainda aponta diferenças.
