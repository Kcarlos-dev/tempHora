# API JWT MySQL Redis

Esta é uma API RESTful desenvolvida em Node.js com TypeScript, utilizando JWT para autenticação, MySQL como banco de dados principal e Redis para cache. O projeto segue uma arquitetura modular e organizada para facilitar manutenção e escalabilidade.

## Arquitetura

A aplicação é estruturada em camadas, promovendo separação de responsabilidades:

- **src/app.ts**: Configuração principal do Express (middlewares, rotas, etc.).
- **src/server.ts**: Ponto de entrada da aplicação, inicia o servidor.
- **src/routes/**: Definição das rotas da API. O arquivo `index.ts` orquestra as rotas principais (`auth` e `user`).
- **src/controllers/**: Controladores que lidam com as requisições HTTP, chamando serviços apropriados.
- **src/services/**: Lógica de negócio, interagindo com modelos e cache.
- **src/models/**: Interfaces e funções para acesso ao banco de dados MySQL.
- **src/middlewares/**: Middlewares para autenticação (`authMiddleware`), autorização baseada em roles (`roleMiddleware`), logging (`requestLogger`) e tratamento de erros (`errorHandler`).
- **src/config/**: Configurações para banco de dados (`database.ts`), JWT (`jwt.ts`), cache Redis (`cache.ts`) e logger (`logger.ts`).
- **src/types/express/**: Extensões de tipos TypeScript para Express (ex.: propriedade `user` em `Request`).
- **src/utils/**: Utilitários, como classe de erro customizada (`AppError.ts`).
- **src/tests/**: Testes unitários para serviços e controladores.

### Fluxo de Requisição
1. Requisição chega em `app.ts` via `/api`.
2. Middlewares globais (helmet, cors, JSON parsing, logging) são aplicados.
3. Rota específica é resolvida em `routes/index.ts` (ex.: `/auth/login` vai para `authController`).
4. Controlador valida entrada e chama serviço.
5. Serviço interage com modelo (MySQL) ou cache (Redis), aplicando lógica de negócio.
6. Resposta é retornada, com tratamento de erros via `errorHandler`.

### Autenticação e Autorização
- **JWT**: Tokens gerados no login, verificados em middlewares.
- **Roles**: Usuários têm roles ('root', 'adm', 'user'). Middlewares como `roleMiddleware` restringem acesso baseado em roles.

## Pré-requisitos
- Node.js (versão 18+)
- MySQL
- Redis
- npm ou yarn

## Instalação
1. Clone o repositório.
2. Instale dependências: `npm install`.
3. Configure o banco MySQL e Redis (veja `src/config/database.ts` e `src/config/cache.ts`).
4. Crie a tabela `users` com colunas: `id` (INT AUTO_INCREMENT PRIMARY KEY), `name` (VARCHAR), `email` (VARCHAR UNIQUE), `password_hash` (VARCHAR), `role` (ENUM('root', 'adm', 'user')).
5. Configure variáveis de ambiente (se aplicável) para JWT secret, DB credentials, etc.

## Execução
- Desenvolvimento: `npm run dev` (usa ts-node-dev).
- Produção: `npm run build` e `npm start`.

## Testes
- Execute: `npm test` (usa Jest).

## Tecnologias
- Express.js
- TypeScript
- MySQL2
- Redis
- bcrypt
- jsonwebtoken
- Jest
- Helmet, CORS, etc.

Para dúvidas ou contribuições, consulte os arquivos de código ou abra uma issue.