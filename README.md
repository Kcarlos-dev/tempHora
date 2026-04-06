# TempHora API

API REST em Node.js + TypeScript para gestão de usuários, empresas, colaboradores, ponto e atestados.

## Stack

- Node.js + Express
- TypeScript
- MySQL (`mysql2`)
- Redis (cache)
- JWT (autenticação)
- Jest (testes)

## Estrutura do projeto

```txt
src/
  app.ts
  server.ts
  config/
  controllers/
  middlewares/
  models/
  routes/
  services/
  tests/
  types/
  utils/
sql/
  queries.sql
  procedures.sql
```

## Pré-requisitos

- Node.js 18+
- MySQL 8+
- Redis
- npm

## Configuração de ambiente

Crie um arquivo `.env` na raiz do projeto com:

```env
PORT=4000

JWT_SECRET=change_this_secret
JWT_EXPIRES_IN=1h

MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=temphora

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
```

## Banco de dados

Use o arquivo `sql/queries.sql` como base para:

- criar o banco/tabelas
- inserir dados de exemplo
- consultar dados para validação

## Instalação

```bash
npm install
```

## Execução

### Desenvolvimento

```bash
npm run dev
```

Servidor padrão: `http://localhost:4000`

### Produção

```bash
npm run build
npm start
```

## Scripts disponíveis

- `npm run dev` - inicia em modo desenvolvimento
- `npm run build` - compila TypeScript
- `npm start` - roda build compilado
- `npm test` - executa testes
- `npm run test:watch` - testes em watch mode

## Autenticação e autorização

- A API usa JWT no header:
  - `Authorization: Bearer <token>`
- Login:
  - `POST /api/auth/login`
- Rotas protegidas usam:
  - `authMiddleware` (valida token)
  - `roleMiddleware` (valida perfil)

Perfis usados atualmente:

- `root`
- `admin`
- `rh`
- `colaborador`
- `user`

## Rotas da API

Base: `/api`

### Auth

- `POST /auth/login`

### User

- `GET /user` (autenticado)
- `POST /user` (admin/root)

### Empresa

- `GET /empresa`
- `GET /empresa/:id`
- `POST /empresa` (admin/root/rh)
- `PUT /empresa/:id` (admin/root/rh)
- `DELETE /empresa/:id` (admin/root)

### Colaborador

- `GET /colaborador`
- `GET /colaborador/:id`
- `POST /colaborador` (admin/root/rh)
- `PUT /colaborador/:id` (admin/root/rh)
- `PATCH /colaborador/:id/status` (admin/root/rh)

### Ponto

- `GET /ponto`
- `GET /ponto/:id`
- `POST /ponto` (admin/root/rh/colaborador)
- `PUT /ponto/:id` (admin/root/rh)
- `DELETE /ponto/:id` (admin/root)

### Atestado

- `GET /atestado`
- `GET /atestado/:id`
- `POST /atestado` (admin/root/rh/colaborador)
- `PUT /atestado/:id` (admin/root/rh)
- `DELETE /atestado/:id` (admin/root)

> Observação: no cadastro de atestado, `status` pode ser enviado; se não for enviado, o padrão é `pendente`.

## Exemplo rápido de uso

### 1) Login

```bash
curl -X POST "http://localhost:4000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@temphora.com",
    "password": "123456"
  }'
```

### 2) Usar token em rota protegida

```bash
curl -X GET "http://localhost:4000/api/empresa" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## Tratamento de erros

- Erros de validação e negócio retornam status HTTP apropriado com mensagem.
- Erros não tratados retornam `500`.

## Testes

```bash
npm test
```