## Setup Inicial:

```bash
# Com node v22.21 ou superior (obrigatorio)
$ npm install
```

## Comandos Principais:

```bash
# Para iniciar o bot (windowns)
$ node .\src\index.js
```

```bash
# Para Atualizar os comandos (windowns)
$ node .\deploy-commands.js
```

Nota: Você precisa ter as `EXTENSÕES oficiais do ESLint e do Prettier instaladas` no seu VS Code para as configurações do ESlint e Prettier funcionarem corretamente.

# Estrutura do Projeto:

```bash
OharaBot-JS/
├── node_modules/
├── src/
│   ├── commands/          # Comandos ficam aqui
│   │   ├── admin/         # Subpastas para categorizar
│   │   └── util/          # Ex: ping.js, userinfo.js
│   ├── events/            # Eventos (ready, interactionCreate)
│   ├── functions/         # Handlers de carregamento
│   └── index.js           # Ponto de entrada (Entry Point)
├── .env                   # Variaveis de ambientes (Crie esse arquivo e peça as chaves)
├── .eslintrc.json         # Arquivo de configuração do ESlint (não mexa)
├── .gitignore             # Arquivo de configuração
├── .prettierrc            # Arquivo de configuração do Prettier (não mexa)
├── deploy-commands.js     # Script para registrar comandos "/"
├── packge-lock.json       # (não mexa)
├── package.json           # (não mexa)
└── REAME.md               # Este arquivo que você está vendo :)
```
