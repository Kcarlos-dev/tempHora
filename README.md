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

create view vw_users_colaboradores as
select `u`.`id`            AS `id_user`,
       `c`.`id_empresa`    AS `id_empresa`,
       `c`.`id`            AS `id_colaborador`,
       `u`.`email`         AS `email`,
       `u`.`password_hash` AS `password_hash`,
       `u`.`role`          AS `role`,
       `c`.`status`        AS `status`
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
| `REDIS_*` | Host, porta e senha opcional do Redis |
| `GCS_*` | Projeto, caminho da chave de serviço e bucket |
| `ALLOWED_ORIGINS` | Origens CORS separadas por vírgula (opcional) |

## Como executar

```bash
npm install
npm run dev
```

Build e produção:

```bash
npm run build
npm start
```

A API escuta em `http://localhost:<PORT>` (veja `PORT` no `.env`).

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
| POST | `/ponto/:id_empresa` | JWT, `admin`, `root`, `rh` ou `colaborador`; upload opcional de campo `foto` |
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

- `src/server.ts` — entrada do servidor
- `src/app.ts` — Express, middlewares globais e montagem de `/api`
- `src/routes/` — rotas por domínio
- `src/controllers/` — handlers HTTP
- `src/services/` — regras de negócio
- `src/models/` — acesso a dados MySQL
- `src/middlewares/` — autenticação JWT, papéis, empresa, upload, erros
- `src/config/` — configuração, banco, cache, JWT, storage, logs

Logs rotativos podem ser gravados em `logs/` conforme a configuração do logger.
