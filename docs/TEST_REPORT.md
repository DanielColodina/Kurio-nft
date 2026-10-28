# Testes

Última execução: 28/10/2026, Chromium, Windows 11, Node.js 22.

## E2E

```text
23 passed
1 skipped
```

O caso ignorado é a âncora do diário no projeto mobile, pois a seção existe somente na composição desktop. A mesma ordenação é exercitada no desktop.

A suíte cobre busca e URL, detalhe direto e inexistente, carrinho após refresh, login e sessão, proteção e retorno de rota privada, cupom inválido e válido, conflito de cadastro, checkout confirmado, pagamento recusado, atualização de preço por Socket.IO e persistência de perfil e senha. Cada teste restaura o estado do MSW antes de começar.

## Regressão visual

```text
18 passed
```

As baselines versionadas cobrem home, detalhe, carrinho, checkout, login, cadastro, perfil, carteiras e confirmação nos projetos desktop e mobile. Elas servem para detectar regressão entre commits; não são apresentadas como comparação automática com os arquivos-fonte do layout.

Comandos usados:

```bash
npm run test:e2e
npm run test:visual
```
