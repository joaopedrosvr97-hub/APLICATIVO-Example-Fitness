F3 Fitness — Backend
Backend do F3 Fitness, aplicativo mobile e web voltado para organização, acompanhamento e evolução de treinos.
O backend fornece API, autenticação, gerenciamento de sessões e persistência de dados utilizando Node.js, TypeScript, Express, tRPC, PostgreSQL e Drizzle ORM.
🚧 Status: MVP em desenvolvimento
📌 Características
API backend em Node.js + TypeScript
Express como servidor HTTP
tRPC para procedures e comunicação tipada
PostgreSQL como banco de dados
Drizzle ORM para modelagem e acesso ao banco
Cadastro e login com e-mail e senha
Hash de senhas utilizando bcrypt
Sessões utilizando JWT
Google OAuth em processo de validação
Controle de usuários e permissões
Health check da API
Testes automatizados com Vitest
Integração preparada para aplicativo React Native/Expo
Build Android utilizando Expo Application Services (EAS)
🏗️ Arquitetura
F3 Fitness
│
├── 📱 Frontend
│   ├── React Native
│   ├── Expo
│   ├── Expo Router
│   ├── TypeScript
│   └── NativeWind
│
├── ⚙️ Backend
│   ├── Node.js
│   ├── Express
│   ├── tRPC
│   ├── JWT
│   └── bcrypt
│
├── 🗄️ Banco de dados
│   ├── PostgreSQL
│   └── Drizzle ORM
│
├── 🔐 Autenticação
│   ├── E-mail/Senha
│   └── Google OAuth
│
└── 🚀 Build
    └── Expo Application Services (EAS)
🛠️ Stack tecnológica
Categoria
Tecnologia
Runtime
Node.js
Linguagem
TypeScript
API
Express + tRPC
ORM
Drizzle ORM
Banco
PostgreSQL
Autenticação
JWT + bcrypt
OAuth
Google OAuth
Validação
TypeScript / validações do projeto
Testes
Vitest
Mobile
React Native + Expo
Build
EAS
📂 Estrutura principal
.
├── app/                    # Telas e rotas do aplicativo
├── assets/                 # Imagens, ícones e recursos
├── components/             # Componentes reutilizáveis
├── drizzle/                # Schema e configurações do banco
├── hooks/                  # Hooks personalizados
├── lib/                    # Funções e configurações do frontend
├── server/                 # Backend e API
│   ├── _core/              # Infraestrutura do servidor
│   ├── routes/             # Rotas HTTP
│   ├── db.ts               # Conexão e operações do banco
│   └── routers.ts          # Routers tRPC
├── shared/                 # Código compartilhado
├── tests/                  # Testes automatizados
├── app.config.ts           # Configuração do Expo
├── eas.json                # Configuração do EAS
├── package.json            # Dependências e scripts
└── tsconfig.json           # Configuração TypeScript
🔐 Autenticação
E-mail e senha
Usuário
   ↓
E-mail + senha
   ↓
Backend
   ↓
bcrypt
   ↓
PostgreSQL
   ↓
JWT
   ↓
Sessão autenticada
As senhas não devem ser armazenadas em texto puro.
Google OAuth
Aplicativo
   ↓
Google OAuth
   ↓
Autorização
   ↓
Backend
   ↓
Identificação do usuário
   ↓
PostgreSQL
   ↓
Sessão F3 Fitness
O Google OAuth está em processo de validação para utilização no ambiente mobile e posteriormente em produção.
🗄️ Banco de dados
O projeto utiliza PostgreSQL + Drizzle ORM.
A tabela principal de usuários possui campos como:
users
├── id
├── open_id
├── name
├── email
├── password
├── login_method
├── role
├── created_at
├── updated_at
└── last_signed_in
O modelo será expandido conforme as funcionalidades de treino forem implementadas.
Planejamento:
users
│
├── workouts
│   ├── exercises
│   └── sets
│
├── progress
├── measurements
└── goals
⚙️ Pré-requisitos
Antes de executar o projeto, instale:
Node.js
npm
PostgreSQL
Git
EAS CLI
Para desenvolvimento Android:
Android Studio
Android SDK
Java/JDK compatível com o ambiente Expo
Development Build ou dispositivo Android
🚀 Instalação
Clone o repositório:
git clone https://github.com/joaopedrosvr97-hub/APLICATIVO-Example-Fitness.git
Entre no projeto:
cd APLICATIVO-Example-Fitness
Instale as dependências:
npm install
Verifique o TypeScript:
npm run check
🔑 Variáveis de ambiente
Crie os arquivos .env necessários conforme o ambiente.
Exemplo:
DATABASE_URL=postgresql://usuario:senha@localhost:5432/f3fitness

JWT_SECRET=sua_chave_secreta

GOOGLE_CLIENT_ID=seu_google_client_id
GOOGLE_CLIENT_SECRET=seu_google_client_secret

OAUTH_SERVER_URL=http://localhost:3000
⚠️ Nunca envie .env, senhas, tokens ou credenciais reais para o GitHub.
Recomenda-se manter um .env.example contendo somente os nomes das variáveis.
🗄️ PostgreSQL
Crie o banco:
CREATE DATABASE f3fitness;
Configure:
DATABASE_URL=postgresql://postgres:SUA_SENHA@localhost:5432/f3fitness
Depois execute as migrações/configurações do Drizzle conforme os scripts definidos no projeto.
▶️ Executando
Frontend
npx expo start
Backend
npx tsx server/_core/index.ts
Por padrão:
http://localhost:3000
Health check
GET /api/health
Resposta esperada:
{
  "ok": true
}
🧪 Testes
Execute:
npm test
Verifique o TypeScript:
npm run check
Antes de um build:
npm run check
npm test
📦 Build Android
O projeto utiliza EAS Build.
Login:
eas login
Informações do projeto:
eas project:info
Credenciais:
eas credentials
Development
eas build --profile development --platform android
Preview
eas build --profile preview --platform android
Production
eas build --profile production --platform android
A build de produção deve ocorrer somente após validação dos fluxos de autenticação, banco de dados, OAuth e funcionalidades principais.
🔒 Segurança
Práticas adotadas ou planejadas:
Senhas armazenadas com hash bcrypt
JWT para gerenciamento de sessão
Variáveis sensíveis mantidas no ambiente
PostgreSQL com constraints e índices
Separação entre frontend e backend
Próximas melhorias
[ ] Rate limiting na autenticação
[ ] Restrição de CORS por origem
[ ] Validação rigorosa dos OAuth redirect URIs
[ ] Maior proteção do fluxo OAuth mobile
[ ] Rotação e gestão de tokens
[ ] Auditoria de sessões
[ ] Validação completa das entradas da API
🧪 Status de QA
O projeto ainda está em desenvolvimento e não deve ser considerado uma release de produção.
Área
Status
Interface mobile
🟢 Em desenvolvimento
Interface Web
🟢 Em desenvolvimento
Backend
🟢 Implementado
PostgreSQL
🟢 Implementado
Drizzle ORM
🟢 Implementado
Login e cadastro
🟢 Implementado
Google OAuth
🟡 Em validação
Sessões JWT
🟢 Implementado
Testes automatizados
🟡 Em expansão
EAS Build
🟡 Em validação
Play Store
🔴 Ainda não publicado
Funcionalidades completas de treino
🟡 Em desenvolvimento
🗺️ Roadmap
Fase 1 — Fundação
[x] Estrutura inicial
[x] React Native + Expo
[x] TypeScript
[x] Backend Node.js
[x] PostgreSQL
[x] Drizzle ORM
[x] Autenticação local
[x] Sistema de sessão
[x] Configuração EAS
Fase 2 — Autenticação
[x] Cadastro
[x] Login
[x] Logout
[x] Sessão persistente
[ ] Finalizar Google OAuth mobile
[ ] Testes completos de autenticação
[ ] Hardening de segurança
Fase 3 — Treinos
[ ] Cadastro de exercícios
[ ] Criação de treinos
[ ] Edição de treinos
[ ] Execução de treino
[ ] Séries e repetições
[ ] Carga utilizada
[ ] Histórico de treinos
Fase 4 — Evolução
[ ] Dashboard
[ ] Progresso
[ ] Gráficos
[ ] Medidas corporais
[ ] Metas
[ ] Histórico de evolução
Fase 5 — Produção
[ ] Testes completos
[ ] Auditoria de segurança
[ ] Build de produção
[ ] Testes em dispositivos físicos
[ ] Configuração Google Play Console
[ ] Publicação na Play Store
✏️ Como editar este README pelo painel do GitHub
Você pode editar o README.md diretamente pelo navegador, sem precisar abrir o VS Code.
Método 1 — Editar o README existente
Abra o repositório no GitHub.
Entre na página principal do projeto.
Localize o arquivo README.md.
Clique sobre README.md.
Clique no ícone de lápis (Edit this file).
Faça as alterações no editor Markdown.
Role até Commit changes.
Informe uma mensagem de commit objetiva.
Escolha Commit directly to the main branch se estiver trabalhando diretamente na main, ou crie uma nova branch para revisão.
Clique em Commit changes.
Método 2 — Criar um README.md
Caso o repositório ainda não possua README:
Abra o repositório.
Clique em Add file.
Selecione Create new file.
No nome do arquivo, coloque:
README.md
Cole o conteúdo deste arquivo.
Revise a prévia em Preview.
Vá até Commit changes.
Adicione uma mensagem de commit.
Confirme a criação do arquivo.
Método 3 — Alterar pelo celular
No aplicativo do GitHub ou pelo navegador:
Abra o repositório.
Acesse README.md.
Se a interface oferecer a opção de edição, toque no lápis.
Edite o Markdown.
Revise as alterações.
Faça o commit.
A disponibilidade de algumas opções pode variar conforme a interface atual do GitHub, permissões do repositório e branch protegida.
📝 Guia rápido de edição Markdown
Títulos
# Título principal

## Seção

### Subseção
Negrito
**texto em negrito**
Lista
- Item 1
- Item 2
- Item 3
Checklist
- [x] Concluído
- [ ] Pendente
Link
[GitHub](https://github.com/)
Código
Inline:
`npm install`
Bloco:
```bash
npm install
npm test
```
Tabela
| Área | Status |
|---|---|
| Backend | 🟢 Implementado |
| OAuth | 🟡 Em validação |
🤝 Contribuição
Crie uma branch:
git checkout -b feature/minha-feature
Valide as alterações:
npm run check
npm test
Depois:
git add .
git commit -m "feat: adiciona minha feature"
git push origin feature/minha-feature
📄 Licença
Este projeto está atualmente em desenvolvimento.
A definição da licença de distribuição será realizada antes da publicação oficial do projeto.
👨‍💻 Desenvolvimento
F3 Fitness
Projeto desenvolvido como aplicação full-stack utilizando React Native, Expo, Node.js e PostgreSQL.
Status atual: 🚧 MVP em desenvolvimento