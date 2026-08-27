# APLICATIVO-Example-Fitness — Backend API

Backend robusto, modular e altamente escalável desenvolvido para servir como infraestrutura principal de **aplicativos mobile** (iOS/Android via React Native/Expo) e **plataformas web** focadas em saúde, treinos e acompanhamento fitness.

A arquitetura foi projetada focando em comunicação *type-safe* end-to-end via **tRPC**, validação estrita de esquemas com **Zod**, persistência de dados performática com **Drizzle ORM + PostgreSQL** e autenticação segura com suporte a cookies HTTP-only (Web) e Bearer tokens em storage seguro (Mobile).

---
## Stack

- **Runtime**: Node.js + TypeScript
- **API**: Express + [tRPC](https://trpc.io/)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/) (PostgreSQL)
- **Autenticação**: Manus OAuth — sessão via JWT (`jose`) + cookie HTTP-only (web) ou Bearer token (mobile, armazenado com `expo-secure-store`)
- **Senhas**: hash com `bcrypt`
- **Validação**: `zod`
- **Testes**: `vitest`

## ⚠️ Dependência da plataforma Manus

Este projeto foi construído sobre um template da plataforma [Manus](https://manus.im), e depende de serviços proprietários dela para funcionar completamente:

- **Manus OAuth**: fluxo de login/autenticação de usuários
- **Forge API**: proxy usado para storage (S3), LLM, geração de imagem e transcrição de voz

Isso significa que **rodar o backend localmente com todas as funcionalidades exige credenciais de um app registrado na Manus** (`VITE_APP_ID`, `OAUTH_SERVER_URL`, `BUILT_IN_FORGE_API_KEY`, etc.). Sem essas credenciais, rotas públicas (`publicProcedure`) e a lógica de negócio geral funcionam, mas login, storage de arquivos, LLM e afins não vão funcionar.

## Pré-requisitos

- Node.js 18 ou superior
- Uma instância PostgreSQL acessível (local ou remota)
- npm
- Um app registrado na plataforma Manus (para OAuth e Forge API) — necessário apenas se for testar autenticação/integrações

## Instalação

```bash
git clone https://github.com/joaopedrosvr97-hub/APLICATIVO-Example-Fitness.git
cd APLICATIVO-Example-Fitness
npm install
```

## Configuração de ambiente

Copie o arquivo de exemplo e preencha com seus valores reais:

```bash
cp .env.example .env
```

Variáveis principais:

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | String de conexão PostgreSQL (`postgres://usuario:senha@host:5432/banco`) |
| `JWT_SECRET` | Segredo usado para assinar os tokens de sessão. Gere um valor longo e aleatório. |
| `TRPC_SECRET` | Segredo adicional usado pelo tRPC. Gere um valor longo e aleatório. |
| `GOOGLE_CLIENT_SECRET` | Client secret do OAuth do Google, usado como provedor dentro do fluxo do Manus OAuth |
| `VITE_APP_ID` | ID do app registrado na Manus (OAuth) |
| `OAUTH_SERVER_URL` | URL do backend de OAuth da Manus |
| `VITE_OAUTH_PORTAL_URL` | URL do portal de login da Manus |
| `OWNER_OPEN_ID` | ID do owner do projeto na Manus |
| `OWNER_NAME` | Nome de exibição do owner |
| `BUILT_IN_FORGE_API_URL` | Endpoint da Forge API (Manus) |
| `BUILT_IN_FORGE_API_KEY` | Chave de API da Forge (storage, LLM, imagem, transcrição) |

> ⚠️ Nunca commit o arquivo `.env` com valores reais. Ele já está listado no `.gitignore`.

## Banco de dados

O projeto usa Drizzle ORM com PostgreSQL. Schema em `drizzle/schema.ts`.

Para aplicar o schema ao banco configurado em `DATABASE_URL`:

```bash
npx drizzle-kit push
```

Para gerar uma nova migration a partir de alterações no schema:

```bash
npx drizzle-kit generate
```

## Rodando o servidor

Desenvolvimento (com reload automático):

```bash
npm run dev
```

Build de produção:

```bash
npm run build
npm start
```

> Confira os nomes exatos dos scripts no `package.json` — podem variar conforme a configuração do projeto.

## Estrutura de pastas

```
server/
  db.ts              ← Funções de acesso ao banco
  routers.ts         ← Rotas/procedures do tRPC
  storage.ts         ← Helpers de storage (Forge API)
  _core/             ← Código de infraestrutura do template (evite modificar)
drizzle/
  schema.ts          ← Tabelas e tipos do banco
  relations.ts       ← Relacionamentos entre tabelas
  migrations/        ← Migrations geradas automaticamente
shared/
  types.ts           ← Tipos compartilhados
  const.ts           ← Constantes compartilhadas
```

## Testes

```bash
npm test
```

Os testes usam `vitest` e cobrem rotas de autenticação (registro, login, validação de sessão, logout).

## Segurança

- Senhas são armazenadas apenas como hash (`bcrypt`), nunca em texto puro.
- Sessões são JWTs assinados, verificados a cada requisição autenticada.
- Rotas protegidas usam `protectedProcedure`; rotas públicas usam `publicProcedure`.
- Nenhuma credencial deve ser commitada — use sempre variáveis de ambiente.
- Se você suspeitar que alguma credencial foi exposta, revogue e gere uma nova imediatamente.

## Licença

Este projeto está licenciado sob a [GNU General Public License v3.0](LICENSE). Qualquer trabalho derivado ou distribuído também deve permanecer open source sob os mesmos termos.
