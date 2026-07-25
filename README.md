# Vitrine Web API

**Marketplace de roupas para cidades pequenas** — Uma plataforma escalável de e-commerce construída com arquitetura moderna, segurança robusta e padrões de design bem definidos.

---

## 🏗️ Arquitetura

### Stack Técnico

| Camada | Tecnologia |
|--------|-----------|
| **Runtime** | Node.js |
| **Framework** | NestJS 11 (TypeScript) |
| **Banco de Dados** | PostgreSQL 15+ |
| **ORM** | Prisma 7 |
| **Autenticação** | JWT (RS256) + Passport |
| **Storage** | Cloudinary (CDN) |
| **Validação** | Zod |
| **Testes** | Vitest + Supertest |
| **Lint/Format** | ESLint + Prettier |

### Estrutura de Diretórios

```
src/
├── auth/              # Estratégias JWT, Guards (JwtAuthGuard, AdminAccessGuard, StoreAccessGuard)
├── http/              # Controllers & Rotas (47 endpoints)
├── use-cases/         # Lógica de negócio (camada de aplicação)
├── database/          # Serviços Prisma (camada de dados)
├── storage/           # Cloudinary integration
├── env/               # Validação de variáveis com Zod
└── app.module.ts      # Configuração principal
```

---

## 🔐 Segurança & Autenticação

### Estratégia JWT

- **Algoritmo**: RS256 (RSA assimétrico)
- **Access Token**: 15 minutos de expiração
- **Refresh Token**: 1 hora, armazenado em cookie `httpOnly` + `Secure` + `SameSite=strict`
- **Password Hashing**: bcryptjs com salt automático

### Guards de Autorização (Multi-camada)

```typescript
// Guard 1: Validação JWT
@UseGuards(JwtAuthGuard)

// Guard 2: Verificação de role global
@UseGuards(AdminAccessGuard)  // role === 'ADMIN'

// Guard 3: Validação de acesso por loja + role específico
@UseGuards(StoreAccessGuard)
@RequireRoles('PROPRIETARIO', 'FUNCIONARIO')
```

**Fluxo de Autorização:**
1. `JwtAuthGuard` valida token e injeta `user` no request
2. `AdminAccessGuard` verifica se `role === 'ADMIN'`
3. `StoreAccessGuard` verifica se usuário é colaborador da loja solicitada
4. `@RequireRoles()` valida papéis específicos do colaborador

---

## 💾 Modelo de Dados

### Enums & Validações

- **UserRole**: `USER`, `ADMIN`
- **CollaboratorRole**: `PROPRIETARIO`, `FUNCIONARIO`
- **StatusStore**: `ATIVA`, `INATIVA` (com cascade em produtos)
- **StatusProduct**: `ATIVO`, `INATIVO`

### Constraints & Índices

- `Product(slug, storeId)` — unique (slug por loja)
- `Cart(userId, storeId)` — unique (um carrinho ativo por loja)
- `Product(storeId, subcategoryId)` — index (otimização de busca)
- Cascata de deleção em relacionamentos críticos (manutenção de integridade)

---

## 🛣️ API Endpoints (47 total)

### Autenticação (Público)
- `POST /accounts` — Cadastro
- `POST /authenticate` — Login (retorna access_token + refresh_token)
- `PATCH /refresh` — Renovar tokens

### Catálogo (Público)
- `GET /products?name=&categoryId=&subcategoryId=&page=` — Listagem paginada com filtros
- `GET /products/:productId` — Detalhes do produto com imagens
- `GET /stores?name=&page=` — Busca de lojas
- `GET /store/:slug` — Vitrine exclusiva da loja

### Carrinho (Autenticado)
- `POST /products/:productId/cart` — Adicionar ao carrinho
- `GET /carts?page=` — Listar carrinhos do usuário
- `PUT /cart/:cartItemId` — Atualizar quantidade/tamanho
- `DELETE /cart/:cartItemId` — Remover item

### Pedidos (Autenticado)
- `POST /cart/:cartId/order` — Criar pedido (registra data + produtos)
- `GET /orders?page=` — Histórico do cliente
- `GET /store/:slug/orders?page=` — Pedidos da loja (store staff)

### Gestão de Produtos (Store Staff)
- `POST /stores/:slug/products` — Criar com validação de estoque/imagens
- `PUT /stores/:slug/products/:productId` — Editar
- `DELETE /stores/:slug/products/:productId` — Deletar
- `PATCH /stores/:slug/products/:productId/status` — Ativar/desativar

### Imagens (Cloudinary)
- `POST /stores/:slug/productimages/:productId` — Upload (FormFile)
- `PATCH /stores/:slug/productimages/:productId/:imageId` — Substituir
- `DELETE /stores/:slug/productimages/:productId/:imageId` — Deletar com query `?newMainId=`

### Admin
- `POST /stores` — Criar loja
- `PATCH /stores/:slug/deactivate` | `activate` — Gerenciar status
- `POST /categories` — Criar categoria
- `POST /categories/:slug/subcategory` — Criar subcategoria

---

## 📋 Regras de Negócio Implementadas

### Validações de Carrinho

- ✅ Cliente autenticado obrigatório para adicionar ao carrinho
- ✅ Um carrinho ativo por loja (constraint unique)
- ✅ Criação automática ao adicionar primeiro produto
- ✅ Rejeita produtos com estoque zerado ou desativados
- ✅ Produtos devem pertencer à loja do carrinho
- ✅ Deleção automática quando carrinho fica vazio
- ✅ Ordenação por `updatedAt` DESC (mais recentes primeiro)

### Validações de Produtos

- ✅ Obrigatório: nome, preço, categoria, subcategoria, estoque, ≥1 imagem
- ✅ Máximo 5 imagens por produto
- ✅ Produtos desativados nunca aparecem em buscas
- ✅ Identificação clara da loja nos cards (relação `Product.store`)
- ✅ Estoque inteiro (Int)

### Validações de Lojas

- ✅ Uma única loja desativada oculta todos seus produtos (via status cascade)
- ✅ Uma loja pode ter apenas um endereço
- ✅ Apenas Admin pode criar/desativar lojas
- ✅ Lojas desativadas inacessíveis na rota `/store/:slug`

### Gestão de Colaboradores

- ✅ Funcionário vinculado obrigatoriamente a uma loja
- ✅ Apenas PROPRIETARIO pode cadastrar novos funcionários
- ✅ Funcionários não podem gerenciar outros funcionários
- ✅ Cada papel (PROPRIETARIO/FUNCIONARIO) têm permissões distintas

---

## 🧪 Testes & Qualidade

- **Framework**: Vitest (SWC transpiler, ~10x mais rápido que Babel)
- **HTTP Mocking**: Supertest
- **Dados de Teste**: Faker.js
- **Cobertura**: V8

---

## 🚀 Performance & Otimizações

### Paginação

- 40 produtos por página (padrão em todas as listagens)
- Query param `?page=` (1-indexed)

### Storage de Imagens

- Cloudinary CDN (cache global, otimização de tamanho)
- `storage_public_id` para rastreabilidade e deleção segura

---

## 📦 Dependências Principais

```json
{
  "@nestjs/core": "^11.0.1",
  "@nestjs/jwt": "^11.0.2",
  "@nestjs/passport": "^11.0.5",
  "@prisma/client": "^7.8.0",
  "passport-jwt": "^4.0.1",
  "bcryptjs": "^3.0.3",
  "zod": "^4.4.3",
  "cloudinary": "^2.10.0"
}
```

---

## 📝 Validação de Entrada

Todos os DTOs usam **Zod** para validação estruturada:

- Schemas de request/response tipados
- Mensagens de erro estruturadas
- Validação em tempo de compilação + runtime

---

## 🔧 Configuração

Variáveis de ambiente obrigatórias:

```bash
DATABASE_URL
JWT_PRIVATE_KEY (base64)
JWT_PUBLIC_KEY (base64)
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
NODE_ENV
```

---

## 📚 Documentação

Veja também:
- [`docs/requirements.md`](./docs/requirements.md) — Requisitos funcionais e não-funcionais
- [`docs/endpoints.md`](./docs/endpoints.md) — Especificação completa de endpoints

---

## 🎯 Destaques Técnicos

- **Arquitetura em camadas** com separação clara de responsabilidades (controllers → use-cases → database)
- **Guards de autorização multi-camada** (JWT + Role + Store access)
- **Validação declarativa** com Zod em toda entrada de dados
- **Tipo seguro end-to-end** (TypeScript + Prisma)
- **Testes rápidos** com Vitest + SWC
- **Padrão de repositório** via Prisma (abstração de dados)
- **Tratamento robusto de erros** com guards customizados
- **Paginação consistente** em todas listagens
