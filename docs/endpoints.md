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
      "logo_image_url": "https://cdn.example.com/vitrine-web/logo.png",
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
      "id": "124ccdb1-d81a-4d48-9d96-a4b0078b79aa",
      "name": "Pants Black",
      "slug": "pants-black",
      "description": "Pants Black Masculine",
      "price": "69.79",
      "sizes": [],
      "stock": 39,
      "status": "ATIVO",
      "storeId": "13705634-c648-4ad2-bdf3-ad42688bb38e",
      "categoryId": "6b8a4105-57b7-4012-b001-3f7d2592dc88",
      "subcategoryId": "cd2da19d-e89a-455a-ba30-5db035f54605",
      "createdAt": "2026-07-24T23:52:26.282Z",
      "store": {
        "id": "13705634-c648-4ad2-bdf3-ad42688bb38e",
        "name": "store 015",
        "slug": "store-015",
        "logo_url": "https://cdn.example.com/loja-exemplo/logo.png",
      },
      "products_images": [
        {
          "image_url": "https://cdn.example.com/vitrine-web/loja-exemplo/products/p1/img1.jpg"
        }
      ]
    },
  ]
  ```
- GET /products/:productId — Lista apenas um produto, rota para interface para visualizar um produto (Public).
  Example response (array of `Product`):
  ```json
  {
    "product": {
      "id": "2116c889-a801-4d9b-8c73-b0c06af95763",
      "name": "Pants Black",
      "slug": "pants-black",
      "description": "Pants Black Masculine",
      "price": "69.79",
      "sizes": [],
      "stock": 39,
      "status": "ATIVO",
      "storeId": "c4c711b4-7038-44de-9b5c-c7fb97c09324",
      "categoryId": "043f8d76-2725-4926-9a2d-98622ce077ed",
      "subcategoryId": "3ca8b53b-4fc9-4c56-af04-755b7b709445",
      "createdAt": "2026-07-24T23:57:40.960Z",
      "store": {
        "id": "c4c711b4-7038-44de-9b5c-c7fb97c09324",
        "name": "store 013",
        "slug": "store-013",
        "logo_image_url": "https://cdn.example.com/vitrine-web/logo.png"
      }
    },
    "images": [
      {
        "id": "2cb69670-4b05-48d5-8b02-edbfc6df56f1",
        "productId": "2116c889-a801-4d9b-8c73-b0c06af95763",
        "image_url": "https://cdn.example.com/vitrine-web/loja-exemplo/products/p1/img1.jpg",
        "storage_public_id": "1868c3d2-4f9d-4db6-b40e-507a7424a233",
        "is_main": true,
        "createdAt": "2026-07-24T23:57:40.990Z"
      },
      {
        "id": "78a7185e-4ba7-4dec-b270-716687386b94",
        "productId": "2116c889-a801-4d9b-8c73-b0c06af95763",
        "image_url": "https://cdn.example.com/vitrine-web/loja-exemplo/products/p1/img1.jpg",
        "storage_public_id": "4217db5b-da01-44af-ab00-c98925ca7d93",
        "is_main": false,
        "createdAt": "2026-07-24T23:57:41.003Z"
      }
    ]
  }
  ```
- GET /store/:slug/products — Listar produtos por loja (Public). Query: ?name=&?categoryId=&?subcategoryId=&?page=
  Example response: same shape as `/products` (array of `Product`).

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

## Carrinho

- POST /products/:productId/cart — Adicionar produto no carrinho (Auth: `JwtAuthGuard`). Body: quantity, size(opcional)

GET /carts — Listar carrinhos do usuário (Auth: JwtAuthGuard). Query: ?page=
Example response:

```json
[
  {
    "id": "c176cff6-94c6-4220-a77d-6dcc8da51f61",
    "userId": "782e0b23-3f01-4c73-9655-985659e4a1fe",
    "storeId": "ede6fd30-56c4-4e1b-ba32-7cb8dcb55230",
    "createdAt": "2026-07-24T13:18:25.144Z",
    "updatedAt": "2026-07-24T13:18:25.144Z",
    "store": {
      "id": "ede6fd30-56c4-4e1b-ba32-7cb8dcb55230",
      "name": "store 014",
      "logo_image_url": "https://cdn.example.com/vitrine-web/logo.png",
      "whatsapp": "72969860425"
    },
    "cart_items": [
      {
        "id": "a4158e3d-0c55-4e5d-8cea-8ba75566f0f3",
        "cartId": "c176cff6-94c6-4220-a77d-6dcc8da51f61",
        "productId": "f4f01cb8-c019-4835-9297-03e6d79af7dc",
        "quantity": 5,
        "selectedSize": "M",
        "product": {
          "id": "f4f01cb8-c019-4835-9297-03e6d79af7dc",
          "name": "Pants Black",
          "price": "69.79",
          "stock": 39,
          "products_images": [
            {
              "id": "d9b58241-1315-4010-ae0d-7d54236303fa",
              "productId": "f4f01cb8-c019-4835-9297-03e6d79af7dc",
              "image_url": "https://cdn.example.com/vitrine-web/loja-exemplo/products/p1/img1.jpg",
              "storage_public_id": "92b24e62-2451-47b4-8041-5c80b068858b",
              "is_main": true,
              "createdAt": "2026-07-24T13:18:25.100Z"
            }
          ]
        }
      }
    ]
  }
]
```

GET /cart/:cartId/products — Listar produtos de um carrinho (Auth: JwtAuthGuard).
Example response:

```json
[
  {
    "id": "c5dd0ce8-1415-4fe5-a8c1-2a924a4819e7",
    "cartId": "18bf7a30-5d67-48b7-b287-21fb4995016c",
    "productId": "570787f0-a1ec-4dc6-b12a-1f27b62b2152",
    "quantity": 5,
    "selectedSize": "M",
    "createdAt": "2026-07-24T19:36:06.570Z",
    "product": {
      "name": "Pants Black",
      "price": "69.79",
      "products_images": [
        {
          "image_url": "https://cdn.example.com/vitrine-web/loja-exemplo/products/p1/img1.jpg"
        }
      ],
      "category": {
        "name": "Pants"
      },
      "subcategory": {
        "name": "Masculine"
      }
    }
  },
  {
    "id": "052c188e-d52e-41b1-89f2-1966354e6a50",
    "cartId": "18bf7a30-5d67-48b7-b287-21fb4995016c",
    "productId": "c48cca7a-b078-47ad-98a5-e12047a24fb5",
    "quantity": 5,
    "selectedSize": "P",
    "createdAt": "2026-07-24T19:36:06.535Z",
    "product": {
      "name": "Blouse White",
      "price": "69.79",
      "products_images": [
        {
          "image_url": "https://cdn.example.com/vitrine-web/loja-exemplo/products/p1/img1.jpg"
        }
      ],
      "category": {
        "name": "Pants"
      },
      "subcategory": {
        "name": "Masculine"
      }
    }
  }
]
```

- PUT /cart/:cartItemId — Atualizar item registrado no carrinho (Auth: `JwtAuthGuard`). Body: quantity, size.
- DELETE /cart/:cartItemId — Remove item registrado no carrinho (Auth: `JwtAuthGuard`). 

## Pedidos

- POST /cart/:cartId/order - Registrar o pedido do usuario após ele solicitar um pedido (Auth: `JwtAuthGuard`)

GET /orders — Listar pedidos de um usuario (Auth: JwtAuthGuard).
Example response:

```json

[
  {
    "id": "30a364b4-fafa-4e0e-8c7c-e266bc4dfa24",
    "userId": "949f32d4-93d4-4494-b060-f82e555ececf",
    "storeId": "c8bfd185-4eb7-4e27-bfb3-6527eb0d109e",
    "total": "348.95",
    "createdAt": "2026-07-25T00:59:58.590Z"
  }
]

```

GET /orders/:orderId — Listar produtos de um pedido (Auth: JwtAuthGuard).
Example response:

```json

{
  "id": "035fade4-3afd-482e-b7ba-2b20dc806da0",
  "userId": "3d6e2223-b071-47c9-9850-40ae18965e6a",
  "storeId": "4997d8d1-b20e-408f-9c5e-fef46beb1ef9",
  "total": "348.95",
  "createdAt": "2026-07-25T02:05:45.079Z",
  "order_items": [
    {
      "id": "f01079e1-c65a-4d10-921d-5459b1016772",
      "orderId": "035fade4-3afd-482e-b7ba-2b20dc806da0",
      "productId": "87e4263a-baf3-4bb0-a361-430120ab7db7",
      "price": "69.79",
      "quantity": 5,
      "selectedSize": null,
      "product": {
        "id": "87e4263a-baf3-4bb0-a361-430120ab7db7",
        "name": "Blouse White",
        "price": "69.79",
        "products_images": [
          {
            "image_url": "https://cdn.example.com/vitrine-web/loja-exemplo/products/p1/img1.jpg"
          }
        ]
      }
    }
  ]
}

```

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
