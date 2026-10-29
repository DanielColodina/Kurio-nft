# Testes

Última execução: 29/10/2026, Chromium, Windows 11, Node.js 22.

## E2E

```text
28 passed
2 skipped
```

A suíte cobre busca e URL, detalhe direto e inexistente, carrinho após refresh, login e sessão, proteção e retorno de rota privada, cupom inválido e válido, conflito de cadastro, checkout confirmado, pagamento recusado, expiração de sessão durante o checkout com preservação do carrinho, troca de usuário com isolamento de perfil e favoritos, rollback otimista em falha de favorito, reconexão Socket.IO e persistência de perfil e senha.

As duas exclusões são intencionais por layout: o Diário da Cunhagem só existe no desktop e o controle de favorito do detalhe só existe no mobile. Cada teste restaura o estado do MSW antes de começar.

## Regressão visual

```text
18 passed
```

As baselines versionadas cobrem home, detalhe, carrinho, checkout, login, cadastro, perfil, carteiras e confirmação nos projetos desktop e mobile.

## Auditoria contra os PNGs originais

O comando `npm run audit:reference` comparou as 15 telas com os arquivos originais em `Jungle`, sem modificar as referências. Principais diferenças de pixels acima do limiar:

| Tela | Desktop | Mobile |
|---|---:|---:|
| Home | 17,62% | 20,22% |
| Detalhe | 16,43% | 22,47% |
| Carrinho | 10,51% | 21,41% |
| Checkout | 8,68% | 10,19% |
| Login | 17,97% | 10,21% |
| Cadastro | 17,08% | 10,41% |

Perfil desktop ficou em 3,60%, carteiras desktop em 4,34% e confirmação desktop em 3,40%. Os valores são registrados como resultado real; a interface não é declarada idêntica aos PNGs.

Comandos usados:

```bash
npm run typecheck
npm run lint
npm run build
npm run test:e2e
npm run test:visual
npm run audit:reference
```
