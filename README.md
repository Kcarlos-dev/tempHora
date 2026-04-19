# Temphora

API REST em TypeScript para gestão de empresas, colaboradores, registro de ponto e atestados. Usa autenticação JWT, MySQL como banco principal, Redis para cache e Google Cloud Storage para armazenamento de arquivos (fotos de ponto e documentos).

## Requisitos

- Node.js (versão compatível com o TypeScript do projeto)
- MySQL com o schema e tabelas definidos para o projeto
- Redis em execução (conforme variáveis de ambiente)
- Conta/projeto GCP com bucket configurado, se for usar upload para o GCS

## Banco de dados

Schema de referência: **`temphora`**. Ajuste `MYSQL_DATABASE` no `.env` para o banco onde o script abaixo for executado (crie o schema antes, se necessário: `CREATE DATABASE temphora;` e `USE temphora;`).

```sql
create table users
(
    id            int auto_increment
        primary key,
    name          varchar(255) not null,
    email         varchar(255) not null,
    password_hash varchar(255) not null,
    role          varchar(50)  not null,
    constraint uq_user_email
        unique (email)
);

create table empresa
(
    id         int auto_increment
        primary key,
    enterprise varchar(255) not null,
    cnpj       varchar(255) not null,
    email      varchar(255) not null,
    phone      varchar(255) null,
    constraint uq_empresa_cnpj
        unique (cnpj)
);

create table colaborador
(
    id         int auto_increment
        primary key,
    id_empresa int                                                              not null,
    id_user    int                                                              not null,
    full_name  varchar(255)                                                     not null,
    cpf        varchar(255)                                                     null,
    phone      varchar(255)                                                     null,
    position   varchar(255)                                                     null,
    status     enum ('inativo', 'ativo', 'ferias', 'desligado') default 'ativo' null,
    constraint colaborador_pk
        unique (cpf),
    constraint fk_colaborador_empresa
        foreign key (id_empresa) references empresa (id),
    constraint fk_colaborador_user
        foreign key (id_user) references users (id)
);

create table ponto
(
    id             int auto_increment
        primary key,
    id_colaborador int            not null,
    tipo           varchar(255)   not null,
    data_hora      datetime       not null,
    latitude       decimal(10, 8) null,
    longitude      decimal(11, 8) null,
    foto           longtext       null,
    constraint fk_ponto_colaborador
        foreign key (id_colaborador) references colaborador (id)
);

create table atestados
(
    id             int auto_increment
        primary key,
    id_colaborador int                             not null,
    data_inicio    datetime                        not null,
    data_fim       datetime                        not null,
    arquivo        varchar(255)                    null,
    status         varchar(255) default 'pendente' not null,
    constraint fk_atestado_colaborador
        foreign key (id_colaborador) references colaborador (id)
);

create or replace view vw_users_colaboradores as
select `u`.`id`            AS `id_user`,
       `c`.`id_empresa`    AS `id_empresa`,
       `c`.`id`            AS `id_colaborador`,
       `u`.`name`          AS `name`,
       `c`.`full_name`     AS `full_name`,
       `c`.`cpf`           AS `cpf`,
       `u`.`email`         AS `email`,
       `u`.`password_hash` AS `password_hash`,
       `u`.`role`          AS `role`,
       `c`.`status`        AS `status`,
       `c`.`foto`          AS `foto`
from (`temphora`.`users` `u` left join `temphora`.`colaborador` `c` on ((`u`.`id` = `c`.`id_user`)));
```

## Configuração

1. Copie o exemplo de ambiente:

   ```bash
   cp .env.example .env
   ```

2. Preencha pelo menos `JWT_SECRET` (obrigatório para subir a aplicação), credenciais MySQL, Redis e, se usar uploads no GCS, `GCS_PROJECT_ID`, `GCS_KEY_FILENAME` e `GCS_BUCKET_NAME`.

Variáveis principais:

| Variável | Descrição |
|----------|-----------|
| `PORT` | Porta HTTP (padrão `4000`) |
| `JWT_SECRET` | Segredo para assinatura JWT |
| `JWT_EXPIRES_IN` | Expiração do token (ex.: `1h`, `15m`, `7d`) |
| `MYSQL_*` | Host, porta, usuário, senha e nome do banco |
| `MYSQL_SSL` | `true` / `1` / `yes` para TLS (ex.: Cloud SQL “somente SSL”) |
| `MYSQL_SSL_REJECT_UNAUTHORIZED` | `true` para validar certificado do servidor (exige CA no cliente) |
| `REDIS_*` | Host, porta e senha opcional do Redis |
| `GCS_PROJECT_ID` | ID do projeto GCP |
| `GCS_KEY_FILENAME` | Caminho da chave de serviço (apenas local; no Cloud Run usar ADC) |
| `GCS_BUCKET_NAME` | Nome do bucket GCS |
| `ALLOWED_ORIGINS` | Origens CORS separadas por vírgula (opcional) |

## Como executar

### Desenvolvimento local (sem Docker)

```bash
npm install
npm run dev
```

### Desenvolvimento local (com Docker Compose)

```bash
docker-compose up
```

### Rodar com Docker (usando o Dockerfile)

```bash
docker build -t temphora .
docker run -p 4000:4000 --env-file .env temphora
```

### Build e produção (sem Docker)

```bash
npm run build
npm start
```

A API escuta em `http://localhost:<PORT>` (veja `PORT` no `.env`).

## Deploy no Cloud Run

O projeto inclui um `Dockerfile` multi-stage otimizado para produção.

### Build e push da imagem

```bash
gcloud builds submit --tag gcr.io/SEU_PROJECT_ID/temphora
```

### Deploy

```bash
gcloud run deploy temphora \
  --image gcr.io/SEU_PROJECT_ID/temphora \
  --platform managed \
  --region southamerica-east1 \
  --set-env-vars "JWT_SECRET=...,MYSQL_HOST=...,MYSQL_USER=...,MYSQL_PASSWORD=...,MYSQL_DATABASE=temphora,MYSQL_SSL=true,GCS_BUCKET_NAME=...,REDIS_HOST=..." \
  --allow-unauthenticated
```

### Notas sobre Cloud Run

- **MySQL / Cloud SQL:** Com a opção **“Permitir somente conexões SSL”**, defina `MYSQL_SSL=true`. Com SSL ativo, o padrão é `rejectUnauthorized: false` (certificado gerenciado pelo Google), a menos que `MYSQL_SSL_REJECT_UNAUTHORIZED=true` e você configure validação de CA no cliente.
- **GCS:** Não é necessário configurar `GCS_KEY_FILENAME`. O SDK usa automaticamente as credenciais da service account do Cloud Run (Application Default Credentials). Basta conceder o papel `Storage Object Admin` à service account.
- **MySQL:** Se usar Cloud SQL, adicione `--add-cloudsql-instances INSTANCE_CONNECTION_NAME` ao comando de deploy.
- **Redis:** Se usar Memorystore, configure um VPC connector com `--vpc-connector`.

## Comportamento da API

- Prefixo base: **`/api`**
- Limite de taxa: **120 requisições por IP a cada 15 minutos** (resposta `429` quando excedido)
- Segurança: Helmet, CORS, corpo JSON

## Rotas (resumo)

Todas abaixo são relativas a `/api`.

### Autenticação (`/auth`)

| Método | Caminho | Descrição |
|--------|---------|-----------|
| POST | `/auth/login` | Login |

### Usuários (`/user`)

| Método | Caminho | Proteção |
|--------|---------|----------|
| GET | `/user` | JWT, papel `root` |
| POST | `/user/:id_empresa` | JWT, papéis `admin`, `root` ou `rh` |

### Empresa (`/empresa`)

| Método | Caminho | Proteção |
|--------|---------|----------|
| GET | `/empresa/:id_empresa` | JWT |
| POST | `/empresa` | JWT, `root` |
| PUT | `/empresa/:id_empresa` | JWT, `admin`, `root` ou `rh` |
| DELETE | `/empresa/:id_empresa` | JWT, `root` |

### Colaborador (`/colaborador`)

| Método | Caminho | Proteção |
|--------|---------|----------|
| GET | `/colaborador/:id_empresa` | JWT, `admin`, `root` ou `rh` |
| GET | `/colaborador/:id_empresa/:cpf` | JWT |
| POST | `/colaborador/:id_empresa` | JWT, `admin`, `root` ou `rh` |
| PUT | `/colaborador/:id_empresa/:id` | JWT, `admin`, `root` ou `rh` |
| PATCH | `/colaborador/:id_empresa/:id/status` | JWT, `admin`, `root` ou `rh` |

### Ponto (`/ponto`)

| Método | Caminho | Proteção |
|--------|---------|----------|
| GET | `/ponto/planilha/:id_empresa/:id_colaborador/:data_inicial/:data_final` | JWT (exportação CSV) |
| GET | `/ponto/:id_empresa/:id_colaborador` | JWT |
| POST | `/ponto/:id_empresa` | JWT, `admin`, `root`, `rh` ou `colaborador`; `multipart/form-data` com campo `foto` (arquivo obrigatório, enviado ao GCS) |
| PUT | `/ponto/:id_empresa/:id` | JWT, `admin`, `root` ou `rh` |
| DELETE | `/ponto/:id_empresa/:id` | JWT, `admin` ou `root` |

### Atestado (`/atestado`)

| Método | Caminho | Proteção |
|--------|---------|----------|
| GET | `/atestado/:id_empresa/:id_colaborador` | JWT |
| POST | `/atestado/:id_empresa` | JWT, `admin`, `root`, `rh` ou `colaborador` |
| PUT | `/atestado/:id_empresa/:id` | JWT, `admin`, `root` ou `rh` |
| DELETE | `/atestado/:id_empresa/:id` | JWT, `admin` ou `root` |

## Estrutura do código (visão geral)

```
├── Dockerfile              # Build multi-stage para produção / Cloud Run
├── .dockerignore           # Arquivos excluídos da imagem Docker
├── docker-compose.yml      # Ambiente de desenvolvimento local
├── .env.example            # Modelo de variáveis de ambiente
├── src/
│   ├── server.ts           # Entrada do servidor
│   ├── app.ts              # Express, middlewares globais e montagem de /api
│   ├── routes/             # Rotas por domínio
│   ├── controllers/        # Handlers HTTP
│   ├── services/           # Regras de negócio
│   ├── models/             # Acesso a dados MySQL
│   ├── middlewares/         # Auth JWT, roles, empresa, upload (multer), erros
│   ├── config/             # Configuração, banco, cache, JWT, storage GCS, logs
│   ├── utils/              # Classes utilitárias (AppError)
│   └── tests/              # Testes automatizados
└── logs/                   # Logs rotativos (gerados em runtime)
```
