<div align="center">

<img src="img/vitrine-web.jpg" alt="Vitrine Web" width="700" />

<br/><br/>

<img src="https://img.shields.io/badge/status-in_development-F59E0B?style=flat-square&logoColor=white" height="22"/>
<img src="https://img.shields.io/badge/arquitetura-NestJS_%2B_Prisma-EC4899?style=flat-square" height="22"/>
<img src="https://img.shields.io/badge/testes-Vitest_%2B_e2e-7C3AED?style=flat-square" height="22"/>
<img src="https://img.shields.io/badge/database-PostgreSQL-336791?style=flat-square&logo=postgresql&logoColor=white" height="22"/>
<img src="https://img.shields.io/badge/autenticação-JWT_RS256-10B981?style=flat-square" height="22"/>

<br/><br/>

**Plataforma de vitrines digitais para lojistas de moda** — API para apresentação das lojas, catálogo local, carrinhos e pedidos com atendimento pelo WhatsApp.

*A plataforma apresenta os negócios. Cada lojista apresenta sua marca, organiza seus produtos e conduz a venda.*

</div>

---

## 🎯 Visão Geral

Vitrine Web oferece presença digital para lojas de moda e aproxima clientes do atendimento de cada lojista. A experiência pública oferece:

- **Diretório de marcas**: Clientes escolhem uma loja e exploram seu catálogo próprio
- **Negociação Flexível**: Carrinho integrado com envio de solicitação via WhatsApp
- **Cadastro assistido**: O administrador cadastra a loja após o contato comercial
- **Acesso Público**: Catálogo aberto, autenticação apenas para carrinho e pedidos

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

### Estrutura de Camadas

```
src/
├── auth/              # Estratégias JWT & Guards
├── http/              # Controllers & Rotas (47 endpoints)
├── use-cases/         # Lógica de negócio
├── database/          # Serviços Prisma
├── storage/           # Cloudinary integration
├── env/               # Validação com Zod
└── app.module.ts      # Configuração principal
```

---

## 🔐 Segurança & Autenticação

### Estratégia JWT

- **Algoritmo**: RS256 (RSA assimétrico)
- **Access Token**: 15 minutos de expiração
- **Refresh Token**: 1 hora em cookie `httpOnly` + `Secure` + `SameSite=strict`
- **Password Hashing**: bcryptjs com salt automático

### Guards Multi-camada

```typescript
// Autenticação JWT
@UseGuards(JwtAuthGuard)

// Verificação de admin global
@UseGuards(AdminAccessGuard)

// Validação de acesso por loja + roles
@UseGuards(StoreAccessGuard)
@RequireRoles('PROPRIETARIO', 'FUNCIONARIO')
```

---

## 🛣️ API: 47 Endpoints

### Catálogo (Público)
- `GET /products` — Listagem com filtros e paginação
- `GET /products/:productId` — Detalhes com imagens
- `GET /stores` — Busca de lojas
- `GET /store/:slug` — Vitrine exclusiva

### Autenticação
- `POST /accounts` — Cadastro
- `POST /authenticate` — Login
- `PATCH /refresh` — Renovar tokens

### Carrinho (Autenticado)
- `POST /products/:productId/cart` — Adicionar
- `GET /carts` — Listar carrinhos
- `PUT /cart/:cartItemId` — Atualizar
- `DELETE /cart/:cartItemId` — Remover

### Pedidos
- `POST /cart/:cartId/order` — Criar pedido
- `GET /orders` — Histórico do cliente
- `GET /store/:slug/orders` — Pedidos da loja

### Gestão de Produtos
- `POST /stores/:slug/products` — Criar
- `PUT /stores/:slug/products/:productId` — Editar
- `DELETE /stores/:slug/products/:productId` — Deletar
- `PATCH /stores/:slug/products/:productId/status` — Ativar/desativar

### Admin
- `POST /stores` — Criar loja
- `PATCH /stores/:slug/deactivate` — Desativar loja
- `POST /categories` — Criar categoria
- `POST /categories/:slug/subcategory` — Criar subcategoria

---

## 📋 Regras de Negócio

### Carrinho
- ✅ Cliente autenticado obrigatório
- ✅ Um carrinho ativo por loja
- ✅ Criação automática ao adicionar primeiro produto
- ✅ Rejeita produtos com estoque zerado
- ✅ Deleção automática quando vazio

### Produtos
- ✅ Obrigatório: nome, preço, categoria, subcategoria, estoque, imagem
- ✅ Máximo 5 imagens por produto
- ✅ Produtos desativados nunca aparecem em buscas
- ✅ Identificação clara da loja nos cards

### Lojas
- ✅ Loja desativada oculta todos seus produtos
- ✅ Uma única loja por endereço
- ✅ Apenas Admin pode criar/desativar

### Colaboradores
- ✅ Funcionário vinculado obrigatoriamente a loja
- ✅ Apenas PROPRIETARIO cadastra funcionários
- ✅ Papéis distintos com permissões específicas

---

## 🚀 Performance

### Otimizações

- **Índices**: `products(store_id, subcategory_id)` para busca otimizada
- **Paginação**: 40 itens por página (padrão)
- **Storage**: Cloudinary CDN com cache global

---

## 🧪 Testes

- **Vitest** + SWC (~10x mais rápido que Babel)
- **Supertest** para HTTP mocking
- **Faker.js** para dados de teste
- **V8** para cobertura

---

## 📦 Stack Completa

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

## 🎯 Destaques Técnicos

- **Arquitetura em camadas** com separação clara
- **Guards multi-camada** (JWT + Role + Store)
- **Validação com Zod** em toda entrada
- **Type-safe** (TypeScript + Prisma)
- **Testes rápidos** (Vitest)
- **Padrão de repositório** (abstração de dados)
- **Tratamento robusto de erros**
- **Paginação consistente** em todas listagens

---

## 📚 Documentação

- [`docs/requirements.md`](./docs/requirements.md) — Requisitos funcionais e não-funcionais
- [`docs/endpoints.md`](./docs/endpoints.md) — Especificação completa de endpoints

---

<div align="center">

### Desenvolvido por

<a href="https://github.com/devmoisesz">
  <img src="https://img.shields.io/badge/GitHub-111827?style=flat&logo=github&logoColor=white" height="26"/>
</a>
<a href="https://www.linkedin.com/in/moises-figueiredo/">
  <img src="https://img.shields.io/badge/LinkedIn-111827?style=flat&logo=linkedin&logoColor=0A66C2" height="26"/>
</a>

<sub>Construído com foco em arquitetura escalável, código testável e aprendizado real.</sub>

</div>
