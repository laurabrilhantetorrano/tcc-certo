# Nana & Mimi — Moda Infantil (TCC)

**Autores:** Ana Clara Kajita, Ellen Lopes, Laura Brilhante, Miriana Martins, Victor Gabriel, Vinicius Matos

---

## 📖 Visão Geral

Este projeto é uma plataforma de comércio eletrônico (e-commerce) para a loja de moda infantil **Nana & Mimi**.
A arquitetura conta com frontend em **React (Vite)** e camada de persistência robusta utilizando **Node.js, Express e MongoDB** (com Mongoose ODM), seguindo o padrão de **Repositories / Data Access Layer (DAL)**.

---

## 🗄️ Arquitetura do Banco de Dados (MongoDB)

A camada de persistência foi estruturada de forma modular, segura e escalável:

```
server/
├── config/
│   └── database.js          # Conexão centralizada resiliente, pooling e graceful shutdown
├── models/                  # Definição dos Schemas Mongoose, validações e índices
│   ├── Product.js           # Catálogo de produtos, preços, estoque e categorização
│   ├── User.js              # Usuários, controle de papéis (cliente/admin) e bcrypt hash
│   ├── Cart.js              # Carrinho ativo com referências a User e Product
│   ├── Order.js             # Pedidos finalizados, itens e status
│   ├── Contact.js           # Mensagens do canal de atendimento
│   └── index.js             # Barrel export dos modelos
├── repositories/            # Camada de Acesso a Dados (Data Access Layer)
│   ├── BaseRepository.js    # CRUD genérico, paginação, projeção e contagem
│   ├── ProductRepository.js # Filtros, busca textual, controle de estoque atômico
│   ├── UserRepository.js    # Busca por e-mail/username e checagens de existência
│   ├── CartRepository.js    # Gerenciamento de itens e carrinhos de sessão
│   ├── OrderRepository.js   # Criação de pedidos com cálculo de total e histórico
│   ├── ContactRepository.js # Consulta e atualização de status de atendimento
│   └── index.js             # Barrel export dos repositórios
├── controllers/             # Regras de orquestração das requisições HTTP
├── routes/                  # Definição e agrupamento de rotas REST
├── middlewares/
│   ├── errorHandler.js      # Tratamento centralizado de erros do Mongoose e MongoDB
│   └── sanitize.js          # Prevenção ativa contra NoSQL Injection recursivo
├── seeds/                   # Carga inicial com dados dos 8 produtos reais e usuários
│   ├── seed.js              # Script executável e idempotente
│   └── data/
│       └── initialProducts.js
├── migrations/              # Controle evolutivo de schema sem perda de dados
│   ├── migrate.js           # Runner de migrações com collection de controle (_migrations)
│   └── scripts/             # Scripts versionados (001, 002, ...)
└── tests/                   # Testes automatizados da camada de persistência
    ├── modelsValidation.test.js
    ├── repositoriesAndSecurity.test.js
    └── persistenceIntegration.test.js
```

---

## 📊 Collections e Modelagem de Dados

### 1. `products` (Produtos)
* **Finalidade:** Armazenar os produtos comercializados na loja.
* **Campos principais:**
  * `legacyId` (Number, único, sparse): Identificador numérico para manter compatibilidade com as rotas originais (`/produto/:id`).
  * `nome` (String, obrigatório, 2-120 chars): Nome do produto.
  * `descricao` (String, obrigatório): Descrição detalhada da peça.
  * `preco` (Number, obrigatório, min: 0): Preço em formato numérico para cálculos.
  * `precoFormatado` (String): Preço em moeda brasileira (ex: `R$ 105,00`).
  * `precoAntigo` / `precoAntigoFormatado` (Number / String, opcional): Preço promocional anterior.
  * `categoria` (String, enum): Categoria/fileira (`Coleção Nana & Mimi`, `Conforto & Estilo`, etc.).
  * `img` (String, obrigatório): Caminho ou URL da imagem do produto.
  * `tamanhos` (Array de Strings, default: `['P', 'M', 'G']`): Grades disponíveis.
  * `estoque` (Number, default: 10, min: 0): Quantidade disponível.
  * `ativo` (Boolean, default: true): Visibilidade no catálogo.
  * `createdAt` / `updatedAt` (Date): Timestamps automáticos.
* **Índices:**
  * `{ nome: 'text', descricao: 'text' }` — Busca textual em tempo real no campo de pesquisa.
  * `{ categoria: 1, ativo: 1 }` — Consulta otimizada das fileiras na Home page.
  * `{ preco: 1 }` — Ordenação e filtragem por preço.
  * `{ legacyId: 1 }` — Acesso rápido por ID legado.

### 2. `users` (Usuários)
* **Finalidade:** Gerenciamento de clientes e administradores com autenticação segura.
* **Campos principais:**
  * `username` (String, único, obrigatório, 3-30 chars, lowercase).
  * `email` (String, único, obrigatório, validado por regex idêntica ao frontend).
  * `senha` (String, obrigatório, min: 6 chars, armazenado como hash `bcrypt`).
  * `nomeCompleto` (String, opcional).
  * `telefone` (String, opcional).
  * `role` (String, enum: `cliente` | `admin`, default: `cliente`).
  * `ativo` (Boolean, default: true).
  * `createdAt` / `updatedAt` (Date): Timestamps automáticos.
* **Índices:**
  * `{ email: 1 }` (unique) — Evita duplicidade e acelera login por e-mail.
  * `{ username: 1 }` (unique) — Evita nomes repetidos e acelera login por usuário.
* **Segurança:** O método `toJSON()` intercepta a serialização e remove automaticamente o campo `senha`, garantindo que senhas nunca vazem em respostas JSON.

### 3. `orders` (Pedidos)
* **Finalidade:** Histórico de compras finalizadas pelo cliente.
* **Campos principais:**
  * `usuario` (ObjectId ref `User`, obrigatório).
  * `itens` (Array de subdocumentos): `{ produto, nome, precoUnitario, quantidade, tamanho, subtotal }`.
  * `valorSubtotal` (Number, obrigatório, min: 0).
  * `valorFrete` (Number, default: 0).
  * `valorTotal` (Number, obrigatório, min: 0).
  * `status` (String, enum: `pendente`, `pago`, `enviado`, `entregue`, `cancelado`).
  * `enderecoEntrega` (Object: `rua`, `numero`, `bairro`, `cidade`, `estado`, `cep`).
  * `formaPagamento` (String, enum: `pix`, `cartao_credito`, `boleto`).
* **Índices:**
  * `{ usuario: 1, createdAt: -1 }` — Histórico ordenado de pedidos por cliente.
  * `{ status: 1, createdAt: -1 }` — Painel operacional de pedidos por status.

### 4. `carts` (Carrinhos)
* **Finalidade:** Persistência do carrinho tanto para usuários autenticados quanto para visitantes anônimos.
* **Campos principais:**
  * `usuario` (ObjectId ref `User`, sparse).
  * `sessionId` (String, sparse).
  * `itens` (Array): `{ produto, nome, img, tamanho, quantidade, precoUnitario }`.
  * `status` (String, enum: `ativo`, `abandonado`, `finalizado`).
* **Virtuals:** `totalItens` e `subtotal` calculados automaticamente em tempo de execução.

### 5. `contacts` (Mensagens de Contato)
* **Finalidade:** Mensagens enviadas pelos clientes na página Contato.
* **Campos principais:**
  * `nome`, `email`, `telefone`, `assunto`, `mensagem`, `respondida` (Boolean).
* **Índices:**
  * `{ respondida: 1, createdAt: -1 }` — Fila de mensagens pendentes.

---

## ⚙️ Variáveis de Ambiente

Crie o arquivo `.env` na raiz do projeto baseado no `.env.example`:

```bash
cp .env.example .env
```

| Variável | Descrição | Exemplo |
|---|---|---|
| `PORT` | Porta onde o backend HTTP roda | `5000` |
| `NODE_ENV` | Ambiente (`development` ou `production`) | `development` |
| `MONGODB_URI` | String de conexão com o MongoDB | `mongodb://localhost:27017/nana_e_mimi` |
| `JWT_SECRET` | Chave secreta para tokens JWT | `sua_chave_secreta_aqui` |
| `JWT_EXPIRES_IN` | Tempo de expiração do token | `7d` |
| `CLIENT_URL` | Origem permitida no CORS (Frontend) | `http://localhost:5173` |

> 🔒 **Segurança:** O arquivo `.env` está explicitamente incluído no `.gitignore` e nunca deve ser versionado no Git.

---

## 🚀 Como Executar

### 1. Pré-requisitos
* **Node.js** v18 ou superior instalado.
* **Docker e Docker Compose** (ou uma instância local do **MongoDB** v6+).

### 2. Instalação das Dependências
```bash
npm install
```

### 3. Iniciar o Banco de Dados com Docker
Suba o container do MongoDB localmente com armazenamento persistente:

```bash
docker compose up -d
```

Para verificar se o container está rodando:
```bash
docker ps
```

### 4. Executar as Migrações
Aplica alterações estruturais e sincroniza índices de forma não-destrutiva:

```bash
npm run db:migrate
```

### 5. Executar os Seeds (Carga Inicial)
Popula os 8 produtos reais do catálogo da Nana & Mimi, usuários de teste e mensagens de exemplo (o script é idempotente e pode ser rodado várias vezes sem duplicar dados):

```bash
npm run db:seed
```

* **Usuário Admin criado:** `admin@nanaemimi.com.br` | Senha: `AdminPassword123!`
* **Usuário Cliente criado:** `cliente@exemplo.com.br` | Senha: `ClientePassword123!`

### 6. Iniciar a API Backend
```bash
# Modo padrão
npm run server

# Modo desenvolvimento (com reinicialização automática)
npm run server:dev
```
A API estará disponível em: `http://localhost:5000`
Health check: `http://localhost:5000/api/health`

### 7. Iniciar o Frontend Vite
Em outro terminal:
```bash
npm run dev
```
Acesse a aplicação em: `http://localhost:5173`

---

## 🧪 Testes Automatizados

A camada de persistência conta com suítes de testes automatizados utilizando o test runner nativo do Node.js:

```bash
npm test
```

Os testes cobrem:
* **Validação de Schemas e Modelos:** Campos obrigatórios, preços negativos, integridade de dados e regex de e-mail idêntica à do frontend.
* **Segurança e Proteção:** Ocultação de senha na serialização `toJSON()`, hash bcrypt e proteção ativa contra injeção NoSQL via middleware `sanitizeNoSql`.
* **Tratamento de Erros:** Mapeamento de erros de chave duplicada (código 11000) e IDs malformatados (`CastError`) no middleware `errorHandler`.
* **Repositórios e Integração:** Ciclo completo de CRUD (criação, consulta com filtros, atualização atômica de estoque e exclusão).

---

## 🔒 Boas Práticas e Segurança Implementadas

1. **Proteção contra NoSQL Injection:** Middleware `sanitizeNoSql` inspeciona e remove recursivamente operadores maliciosos como `$gt`, `$ne`, `$where` e chaves com `.`.
2. **Criptografia de Senhas:** Senhas são salgadas e hasheadas com `bcryptjs` antes de persistir no banco.
3. **Mongoose Hooks e Virtuals:** Sanitização automática no `toJSON()` e cálculo dinâmico de subtotais.
4. **Tratamento Resiliente de Erros:** Detalhes internos de infraestrutura e stack traces nunca são expostos em ambiente de produção.
5. **Máscara de Logs:** A URI de conexão com o MongoDB mascara senhas e credenciais nos logs do console.