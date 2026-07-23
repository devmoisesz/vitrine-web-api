# API Endpoints

Este documento lista os endpoints públicos e protegidos da API, método HTTP, rota e requisitos de autenticação/autorização.

## Autenticação / Conta

- POST /authenticate — Autenticação (Public). Body: { email, password }. Retorna `access_token` (JWT) e define cookie `refreshToken` (httpOnly).
  Example response:
  ```json
  {
    "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVC...",
    "refresh_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVC..."
  }
  ```
- PATCH /refresh — Renovação de tokens (Public). Lê cookie `refreshToken`, retorna novo `access_token` e sobrescreve cookie `refreshToken`.
  Example response:
  ```json
  {
    "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVC...",
    "refresh_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVC..."
  }
  ```
- POST /accounts — Criar conta (Public). Body: { name, email, password }.

## Usuário / Perfil

- GET /me — Obter perfil do usuário (Auth: `JwtAuthGuard`).
  Example response (`OutputGetProfileDto`):
  ```json
  {
    "user_name": "João da Silva",
    "user_email": "joao@example.com",
    "user_role": "Proprietário",
    "store_name": "Loja Exemplo",
    "store_address": {
      "label": "Loja Matriz",
      "cep": "01001-000",
      "state": "SP",
      "city": "São Paulo",
      "neighborhood": "Centro",
      "street": "Rua Exemplo",
      "number": "123",
      "complement": null,
      "createdAt": "2026-07-22T12:34:56.000Z"
    },
    "user_address": [
      {
        "label": "Casa",
        "cep": "01001-000",
        "state": "SP",
        "city": "São Paulo",
        "neighborhood": "Centro",
        "street": "Rua Exemplo",
        "number": "45",
        "complement": "Apto 12",
        "createdAt": "2026-06-01T10:00:00.000Z"
      }
    ]
  }
  ```
- PUT /account/edit — Editar dados do usuário (Auth: `JwtAuthGuard`). Body: { name, email }.

## Endereços do usuário

- POST /address/register — Registrar endereço do usuário (Auth: `JwtAuthGuard`). Body: address fields.
- GET /me/addresses — Listar endereços do usuário (Auth: `JwtAuthGuard`). Query: ?page=
  Example response (array of `Address`):
  ```json
  [
    {
      "id": "b1a2c3d4-...",
      "label": "Casa",
      "cep": "01001-000",
      "state": "SP",
      "city": "São Paulo",
      "neighborhood": "Centro",
      "street": "Rua Exemplo",
      "number": "45",
      "complement": "Apto 12",
      "createdAt": "2026-06-01T10:00:00.000Z",
      "updatedAt": "2026-06-02T11:00:00.000Z"
    }
  ]
  ```
- PUT /me/addressess/:addressId — Atualizar endereço do usuário (Auth: `JwtAuthGuard`). Body: address fields.

## Lojas & Vitrine

- GET /stores — Listar lojas (Public). Query: ?name=&?page=
  Example response (array of `Store`):
  ```json
  [
    {
      "id": "a1b2c3d4-...",
      "name": "Loja Exemplo",
      "slug": "loja-exemplo",
      "email": "contato@loja.com",
      "description": "Loja de roupas",
      "whatsapp": "+551199999999",
      "logo_image_url": null,
      "createdAt": "2026-01-01T09:00:00.000Z"
    }
  ]
  ```
- GET /store/:slug — Obter perfil da loja (Auth: `JwtAuthGuard`).
  Example response (`OutputStoreProfileDto`):
  ```json
  {
    "name": "Loja Exemplo",
    "logo_url": "https://cdn.example.com/loja-exemplo/logo.png",
    "description": "Loja de roupas",
    "whatsapp": "+551199999999",
    "address": {
      "id": "addr-...",
      "label": "Matriz",
      "cep": "01001-000",
      "state": "SP",
      "city": "São Paulo",
      "neighborhood": "Centro",
      "street": "Rua Exemplo",
      "number": "123",
      "complement": null,
      "createdAt": "2026-01-02T08:00:00.000Z",
      "updatedAt": "2026-01-02T08:00:00.000Z"
    }
  }
  ```
- POST /store — Registrar loja (Auth: `JwtAuthGuard` + `AdminAccessGuard`). Body: store data.
- PATCH /stores/:slug/deactivate — Desativar loja (Auth: `JwtAuthGuard` + `AdminAccessGuard`).
- PATCH /stores/:slug/activate — Ativar loja (Auth: `JwtAuthGuard` + `AdminAccessGuard`).

## Produtos (frontend / catálogo)

- GET /products — Listar produtos (Public). Query: ?name=&?categoryId=&?subcategoryId=&?page=
  Example response (array of `Product`):
  ```json
  [
    {
      "id": "p1-...",
      "name": "Camiseta Exemplo",
      "slug": "camiseta-exemplo",
      "description": "Camiseta 100% algodão",
      "price": "49.90",
      "sizes": ["P", "M", "G"],
      "stock": 10,
      "status": "ATIVO",
      "storeId": "a1b2c3d4-...",
      "categoryId": "cat-...",
      "subcategoryId": "sub-...",
      "createdAt": "2026-02-01T12:00:00.000Z"
    }
  ]
  ```
- GET /store/:slug/products — Listar produtos por loja (Public). Query: ?name=&?categoryId=&?subcategoryId=&?page=
  Example response: same shape as `/products` (array of `Product`).

## Produtos (colaborador/loja)

- POST /stores/:slug/products — Criar produto (Auth: `JwtAuthGuard` + `StoreAccessGuard`, roles: `FUNCIONARIO`|`PROPRIETARIO`). Body: product data.
  Example response: returns the created product id (string). Example:
  ```json
  "550e8400-e29b-41d4-a716-446655440000"
  ```
- PUT /stores/:slug/products/:productId — Editar produto (Auth: `JwtAuthGuard` + `StoreAccessGuard`, roles: `FUNCIONARIO`|`PROPRIETARIO`). Body: edited fields.
- DELETE /stores/:slug/products/:productId/ — Deletar produto (Auth: `JwtAuthGuard` + `StoreAccessGuard`, roles: `FUNCIONARIO`|`PROPRIETARIO`).
- PATCH /stores/:slug/products/:productId/status — Atualizar status do produto (Auth: `JwtAuthGuard` + `StoreAccessGuard`, roles: `FUNCIONARIO`|`PROPRIETARIO`). Body: { status: ATIVO|INATIVO }

## Imagens de produto

- POST /stores/:slug/productimages/:productId — Upload de imagem (Auth: `JwtAuthGuard` + `StoreAccessGuard`, roles: `FUNCIONARIO`|`PROPRIETARIO`). FormFile `file`, optional body `is_main`.
  Example response (`ProductImages` created):
  ```json
  {
    "id": "img-...",
    "productId": "p1-...",
    "image_url": "https://cdn.example.com/vitrine-web/loja-exemplo/products/p1/img1.jpg",
    "storage_public_id": "public-id-xyz",
    "is_main": true,
    "createdAt": "2026-03-01T10:00:00.000Z"
  }
  ```
- PATCH /stores/:slug/productimages/:productId/:imageId — Substituir imagem (Auth: `JwtAuthGuard` + `StoreAccessGuard`, roles: `FUNCIONARIO`|`PROPRIETARIO`). FormFile `file`.
- DELETE /stores/:slug/productimages/:productId/:imageId — Deletar imagem (Auth: `JwtAuthGuard` + `StoreAccessGuard`, roles: `FUNCIONARIO`|`PROPRIETARIO`). Query: ?newMainId=

## Logo da loja

- POST /stores/:slug/logo — Upload de logo (Auth: `JwtAuthGuard` + `StoreAccessGuard`, roles: `PROPRIETARIO`). FormFile `file`.
- PATCH /stores/:slug/logo/change — Alterar logo (Auth: `JwtAuthGuard` + `StoreAccessGuard`, roles: `PROPRIETARIO`). FormFile `file`.
- DELETE /stores/:slug/logo/delete — Deletar logo (Auth: `JwtAuthGuard` + `StoreAccessGuard`, roles: `PROPRIETARIO`).

## Colaboradores / Funcionários

- POST /stores/:storeId/collaborators — Registrar colaborador (Auth: `JwtAuthGuard` + `StoreAccessGuard`, role required: `PROPRIETARIO`). Body: { name, email, password, role }.
- GET /store/:slug/employees — Listar colaboradores (Auth: `JwtAuthGuard` + `StoreAccessGuard`, role: `PROPRIETARIO`). Query: ?page=
  Example response (array of employees):
  ```json
  [
    {
      "name": "Maria Silva",
      "email": "maria@loja.com"
    }
  ]
  ```
- DELETE /store/:slug/delete/:employeeId — Remover colaborador (Auth: `JwtAuthGuard` + `StoreAccessGuard`, role: `PROPRIETARIO`).

## Endereços da loja

- POST /address/:slug/register/ — Registrar endereço da loja (Auth: `JwtAuthGuard` + `StoreAccessGuard`, role: `PROPRIETARIO`). Body: address fields.
- PUT /store/:slug/address — Atualizar endereço da loja (Auth: `JwtAuthGuard` + `StoreAccessGuard`, role: `PROPRIETARIO`). Body: address fields.

## Categorias / Subcategorias (Admin)

- POST /categories — Criar categoria (Auth: `JwtAuthGuard` + `AdminAccessGuard`). Body: { name }.
- PUT /categories/:slug/edit — Editar categoria (Auth: `JwtAuthGuard` + `AdminAccessGuard`). Body: { name }.
- POST /categories/:slug/subcategory — Criar subcategoria (Auth: `JwtAuthGuard` + `AdminAccessGuard`). Body: { name }.
- PUT /categories/:slug/subcategories/:id — Editar subcategoria (Auth: `JwtAuthGuard` + `AdminAccessGuard`). Body: { name }.
- GET /categories — Listar categorias (Public).
  Example response (array of `Category`):
  ```json
  [
    {
      "id": "cat-...",
      "name": "Roupas",
      "slug": "roupas",
      "createdAt": "2026-01-10T09:00:00.000Z"
    }
  ]
  ```
- GET /subcategories — Listar subcategorias (Public). Query: ?categoryId=
  Example response (array of `SubCategory`):
  ```json
  [
    {
      "id": "sub-...",
      "name": "Camisetas",
      "slug": "camisetas",
      "categoryId": "cat-...",
      "createdAt": "2026-01-12T09:00:00.000Z"
    }
  ]
  ```

---

> Observação: Este documento foi gerado a partir dos controllers registrados em `src/http/http.module.ts`. Para detalhes sobre validação e payloads, consulte os esquemas Zod em `src/http/zod/schema` e as DTOs nos serviços correspondentes.
