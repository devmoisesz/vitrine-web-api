# Erros Esperados por Rota

Este documento lista os erros esperados de cada rota da API, conforme documentado no Swagger de cada controller. Para cada rota são informados o código HTTP, a mensagem original (em inglês) e o motivo do erro em português.

## Padrões de erro comuns

| Código | Nome         | Mensagem original                                          | Motivo (PT-BR)                                                                                                                                  |
| ------ | ------------ | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `400`  | Bad Request  | `Invalid request data.`                                    | Os dados enviados no corpo, query ou parâmetros da requisição são inválidos (falha na validação do esquema Zod ou formato incorreto).           |
| `401`  | Unauthorized | `Invalid authentication credentials.`                      | Token JWT ausente, inválido ou expirado. O usuário precisa se autenticar novamente.                                                             |
| `401`  | Unauthorized | `Authentication required.`                                 | A rota exige autenticação, mas nenhum token foi enviado.                                                                                        |
| `403`  | Forbidden    | `User does not have permission to perform this operation.` | O usuário está autenticado, mas não possui o papel necessário (`Admin`, `PROPRIETARIO`, `FUNCIONARIO`) ou não é colaborador da loja em questão. |
| `404`  | Not Found    | `The requested resource could not be processed.`           | O recurso solicitado (loja, produto, categoria, endereço, carrinho, pedido, etc.) não existe ou não foi encontrado.                             |
| `409`  | Conflict     | `Unable to complete the requested operation.`              | Conflito de estado: o recurso já existe, já está no estado solicitado ou não é possível executar a operação no estado atual.                    |

---

## Autenticação / Conta

### `POST /accounts` — Criar conta (Público)

| Código | Mensagem original                             | Motivo (PT-BR)                                                                                                                                              |
| ------ | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `400`  | `Invalid request data.`                       | Os dados enviados no corpo são inválidos: nome, e-mail ou senha não atendem aos requisitos de validação (formato de e-mail, tamanho mínimo de senha, etc.). |
| `409`  | `Unable to complete the requested operation.` | Não foi possível concluir a operação, normalmente porque o e-mail informado já está cadastrado em outra conta.                                              |

### `POST /authenticate` — Autenticação (Público)

| Código | Mensagem original                             | Motivo (PT-BR)                                                                                      |
| ------ | --------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `400`  | `Invalid credentials.`                        | As credenciais enviadas estão incorretas: e-mail não cadastrado ou senha inválida.                  |
| `409`  | `Unable to complete the requested operation.` | Não foi possível concluir a operação de autenticação devido a um conflito no estado atual da conta. |

### `POST /authenticate/google` — Autenticação com Google (Público)

| Código | Mensagem original                                  | Motivo (PT-BR)                                                                                                   |
| ------ | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `400`  | _(não documentado explicitamente — validação Zod)_ | O campo `id_token` é obrigatório e deve ser uma string. Caso ausente ou inválido, o body não passa na validação. |
| `401`  | _(não documentado explicitamente)_                 | O `id_token` do Google é inválido, expirado ou não pôde ser validado.                                            |

### `PATCH /refresh` — Renovação de tokens (Público)

| Código | Mensagem original                               | Motivo (PT-BR)                                                                                                                                                                                  |
| ------ | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `401`  | `Refresh token is missing, invalid or expired.` | O cookie `refreshToken` está ausente, é inválido ou expirou. Mensagens reais: `Refresh token not found` (cookie ausente) ou `Invalid or expired refresh token` (assinatura/expiração inválida). |

### `POST /logout` — Logout (Público)

| Código | Mensagem original           | Motivo (PT-BR)                                                                                    |
| ------ | --------------------------- | ------------------------------------------------------------------------------------------------- |
| —      | _(nenhum erro documentado)_ | A rota apenas limpa o cookie `refreshToken` e sempre retorna `200` com a mensagem de confirmação. |

---

## Usuário / Perfil

### `GET /me` — Obter perfil do usuário (Auth)

| Código | Mensagem original                     | Motivo (PT-BR)                           |
| ------ | ------------------------------------- | ---------------------------------------- |
| `401`  | `Invalid authentication credentials.` | Token JWT ausente, inválido ou expirado. |

### `PUT /account/edit` — Editar dados do usuário (Auth)

| Código | Mensagem original                                                   | Motivo (PT-BR)                                                                        |
| ------ | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `400`  | `Invalid request data.`                                             | Os dados enviados no corpo são inválidos (nome/e-mail fora dos padrões de validação). |
| `401`  | `Invalid authentication credentials.`                               | Token JWT ausente, inválido ou expirado.                                              |
| `409`  | `Unable to complete the requested operation. Email already exists.` | O e-mail informado já está cadastrado em outra conta.                                 |

### `PATCH /account/password` — Alterar senha (Auth)

| Código | Mensagem original                      | Motivo (PT-BR)                                                                                                                                                     |
| ------ | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| —      | _(nenhum erro documentado no Swagger)_ | A rota usa `JwtAuthGuard` (pode retornar `401` se não autenticado) e valida o corpo via Zod. Erros de senha atual incorreta não estão documentados nos decorators. |

---

## Endereços do usuário

### `POST /address/register` — Registrar endereço do usuário (Auth)

| Código | Mensagem original                     | Motivo (PT-BR)                                                                                                 |
| ------ | ------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `400`  | `Invalid address data.`               | Os dados do endereço são inválidos: campos obrigatórios ausentes ou em formato incorreto (ex.: CEP, UF, etc.). |
| `401`  | `Invalid authentication credentials.` | Token JWT ausente, inválido ou expirado.                                                                       |

### `GET /me/addresses` — Listar endereços do usuário (Auth)

| Código | Mensagem original                     | Motivo (PT-BR)                           |
| ------ | ------------------------------------- | ---------------------------------------- |
| `401`  | `Invalid authentication credentials.` | Token JWT ausente, inválido ou expirado. |

### `PUT /me/addressess/:addressId` — Atualizar endereço do usuário (Auth)

| Código | Mensagem original                     | Motivo (PT-BR)                                                                        |
| ------ | ------------------------------------- | ------------------------------------------------------------------------------------- |
| `400`  | `Invalid request data.`               | Os dados enviados no corpo são inválidos ou não atendem à validação.                  |
| `401`  | `Invalid authentication credentials.` | Token JWT ausente, inválido ou expirado.                                              |
| `404`  | `Address not found.`                  | O endereço informado (`addressId`) não existe ou não pertence ao usuário autenticado. |

---

## Lojas & Vitrine

### `GET /stores` — Listar lojas (Público)

| Código | Mensagem original                      | Motivo (PT-BR)                                                      |
| ------ | -------------------------------------- | ------------------------------------------------------------------- |
| —      | _(nenhum erro documentado no Swagger)_ | Rota pública de listagem. Não há erros documentados nos decorators. |

### `GET /store/:slug` — Obter perfil da loja (Público)

| Código | Mensagem original                  | Motivo (PT-BR)                                            |
| ------ | ---------------------------------- | --------------------------------------------------------- |
| `404`  | _(não documentado explicitamente)_ | A loja com o `slug` informado não existe ou está inativa. |

### `POST /store` — Registrar loja (Auth: Admin)

| Código | Mensagem original                                                    | Motivo (PT-BR)                                                                                                                                                 |
| ------ | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `400`  | `Invalid request data, store already exists or owner was not found.` | Os dados enviados são inválidos, a loja já existe (mesmo nome/e-mail/whatsapp) ou o e-mail do proprietário informado não pertence a nenhum usuário cadastrado. |
| `401`  | `Authentication required.`                                           | Token JWT ausente, inválido ou expirado.                                                                                                                       |
| `403`  | `User does not have permission to create a store.`                   | O usuário autenticado não é administrador e não tem permissão para criar lojas.                                                                                |

### `PATCH /stores/:slug/activate` — Ativar loja (Auth: Admin)

| Código | Mensagem original                                                      | Motivo (PT-BR)                                           |
| ------ | ---------------------------------------------------------------------- | -------------------------------------------------------- |
| `401`  | `Invalid authentication credentials.`                                  | Token JWT ausente, inválido ou expirado.                 |
| `403`  | `User does not have permission to perform this operation.`             | O usuário autenticado não é administrador.               |
| `404`  | `The requested resource could not be processed. Store not found.`      | A loja com o `slug` informado não existe.                |
| `409`  | `Unable to complete the requested operation. Store is already active.` | A loja já está ativa, não é possível ativá-la novamente. |

### `PATCH /stores/:slug/deactivate` — Desativar loja (Auth: Admin)

| Código | Mensagem original                                                        | Motivo (PT-BR)                                                |
| ------ | ------------------------------------------------------------------------ | ------------------------------------------------------------- |
| `401`  | `Invalid authentication credentials.`                                    | Token JWT ausente, inválido ou expirado.                      |
| `403`  | `User does not have permission to perform this operation.`               | O usuário autenticado não é administrador.                    |
| `404`  | `The requested resource could not be processed. Store not found.`        | A loja com o `slug` informado não existe.                     |
| `409`  | `Unable to complete the requested operation. Store is already inactive.` | A loja já está inativa, não é possível desativá-la novamente. |

### `GET /stores/admin` — Listar todas as lojas (Auth: Admin)

| Código | Mensagem original                            | Motivo (PT-BR)                             |
| ------ | -------------------------------------------- | ------------------------------------------ |
| `401`  | _(não documentado — via `JwtAuthGuard`)_     | Token JWT ausente, inválido ou expirado.   |
| `403`  | _(não documentado — via `AdminAccessGuard`)_ | O usuário autenticado não é administrador. |

---

## Dados da loja (colaborador)

### `PUT /store/:slug/edit` — Editar dados da loja (Auth: Proprietário)

| Código | Mensagem original                                                   | Motivo (PT-BR)                                                            |
| ------ | ------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `401`  | `Invalid authentication credentials.`                               | Token JWT ausente, inválido ou expirado.                                  |
| `403`  | `User does not have permission to perform this action.`             | O usuário autenticado não é proprietário da loja ou não tem acesso a ela. |
| `404`  | `Store not found.`                                                  | A loja com o `slug` informado não existe.                                 |
| `409`  | `Unable to complete the requested operation. Email already exists.` | O novo e-mail informado já está em uso por outra loja.                    |

---

## Produtos (frontend / catálogo)

### `GET /products` — Listar produtos (Público)

| Código | Mensagem original                      | Motivo (PT-BR)                                                      |
| ------ | -------------------------------------- | ------------------------------------------------------------------- |
| —      | _(nenhum erro documentado no Swagger)_ | Rota pública de listagem. Não há erros documentados nos decorators. |

### `GET /products/:productId` — Obter produto (Público)

| Código | Mensagem original                  | Motivo (PT-BR)                                    |
| ------ | ---------------------------------- | ------------------------------------------------- |
| `404`  | _(não documentado explicitamente)_ | O produto com o `productId` informado não existe. |

### `GET /store/:slug/products` — Listar produtos por loja (Público)

| Código | Mensagem original  | Motivo (PT-BR)                            |
| ------ | ------------------ | ----------------------------------------- |
| `404`  | `Store not found.` | A loja com o `slug` informado não existe. |

---

## Produtos (colaborador/loja)

### `POST /stores/:slug/products` — Criar produto (Auth: Funcionário/Proprietário)

| Código | Mensagem original                                       | Motivo (PT-BR)                                                                       |
| ------ | ------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `400`  | `Invalid request data.`                                 | Os dados do produto são inválidos (nome, preço, estoque, tamanhos, categoria, etc.). |
| `401`  | `Invalid authentication credentials.`                   | Token JWT ausente, inválido ou expirado.                                             |
| `403`  | `User does not have permission to perform this action.` | O usuário não é colaborador da loja ou não tem o papel necessário.                   |
| `404`  | `Store, category or subcategory not found.`             | A loja, a categoria ou a subcategoria informada não existe.                          |

### `PUT /stores/:slug/products/:productId` — Editar produto (Auth: Funcionário/Proprietário)

| Código | Mensagem original                                                                            | Motivo (PT-BR)                                                                         |
| ------ | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `400`  | `Invalid request data.`                                                                      | Os dados enviados no corpo são inválidos.                                              |
| `401`  | `Invalid authentication credentials.`                                                        | Token JWT ausente, inválido ou expirado.                                               |
| `404`  | `The requested resource could not be processed. Product, category or subcategory not found.` | O produto, a categoria ou a subcategoria informada não existe.                         |
| `409`  | `Unable to complete the requested operation.`                                                | Conflito ao tentar editar o produto (ex.: já existe um produto com o mesmo nome/slug). |

### `DELETE /stores/:slug/products/:productId/` — Deletar produto (Auth: Funcionário/Proprietário)

| Código | Mensagem original                     | Motivo (PT-BR)                                    |
| ------ | ------------------------------------- | ------------------------------------------------- |
| `401`  | `Invalid authentication credentials.` | Token JWT ausente, inválido ou expirado.          |
| `404`  | `Product not found.`                  | O produto com o `productId` informado não existe. |

### `PATCH /stores/:slug/products/:productId/status` — Atualizar status do produto (Auth: Funcionário/Proprietário)

| Código | Mensagem original                     | Motivo (PT-BR)                                                  |
| ------ | ------------------------------------- | --------------------------------------------------------------- |
| `400`  | `Invalid product status.`             | O valor do campo `status` não é `ATIVO` nem `INATIVO`.          |
| `401`  | `Invalid authentication credentials.` | Token JWT ausente, inválido ou expirado.                        |
| `404`  | `Product not found.`                  | O produto com o `productId` informado não existe.               |
| `409`  | `Product already has this status.`    | O produto já está no status informado (não há mudança a fazer). |

### `GET /store/:slug/manage/products` — Listar produtos da loja para gerenciamento (Auth: Funcionário/Proprietário)

| Código | Mensagem original  | Motivo (PT-BR)                            |
| ------ | ------------------ | ----------------------------------------- |
| `404`  | `Store not found.` | A loja com o `slug` informado não existe. |

---

## Imagens de produto

### `POST /stores/:slug/productimages/:productId` — Upload de imagem (Auth: Funcionário/Proprietário)

| Código | Mensagem original                                   | Motivo (PT-BR)                                                               |
| ------ | --------------------------------------------------- | ---------------------------------------------------------------------------- |
| `400`  | `Product already has the maximum number of images.` | O produto atingiu o limite máximo de imagens permitido.                      |
| `404`  | `Product not found.`                                | O produto com o `productId` informado não existe.                            |
| `409`  | `Store not found for this product.`                 | A loja vinculada ao produto não foi encontrada (conflito de relacionamento). |

> **Nota:** O upload também valida o arquivo (formato `png`, `jpg`, `jpeg`, `webp` e tamanho máximo de `5MB`) — falhas nessa validação retornam erro de validação de arquivo.

### `PATCH /stores/:slug/productimages/:productId/:imageId` — Alterar imagem do produto (Auth: Funcionário/Proprietário)

| Código | Mensagem original                     | Motivo (PT-BR)                              |
| ------ | ------------------------------------- | ------------------------------------------- |
| `401`  | `Invalid authentication credentials.` | Token JWT ausente, inválido ou expirado.    |
| `404`  | `Product or image not found.`         | O produto ou a imagem informada não existe. |

> **Nota:** O arquivo também é validado (formato `png`, `jpg`, `jpeg`, `webp` e tamanho máximo de `5MB`).

### `PATCH /stores/:slug/productimages/:productId/:imageId/set-main` — Definir imagem principal (Auth: Funcionário/Proprietário)

| Código | Mensagem original                               | Motivo (PT-BR)                                           |
| ------ | ----------------------------------------------- | -------------------------------------------------------- |
| `401`  | `Invalid authentication credentials.`           | Token JWT ausente, inválido ou expirado.                 |
| `404`  | `Product or image not found.`                   | O produto ou a imagem informada não existe.              |
| `409`  | `The selected image is already the main image.` | A imagem selecionada já é a imagem principal do produto. |

### `DELETE /stores/:slug/productimages/:productId/:imageId` — Deletar imagem (Auth: Funcionário/Proprietário)

| Código | Mensagem original                     | Motivo (PT-BR)                              |
| ------ | ------------------------------------- | ------------------------------------------- |
| `401`  | `Invalid authentication credentials.` | Token JWT ausente, inválido ou expirado.    |
| `404`  | `Product or image not found.`         | O produto ou a imagem informada não existe. |

---

## Logo da loja

### `POST /stores/:slug/logo` — Upload de logo (Auth: Proprietário)

| Código | Mensagem original           | Motivo (PT-BR)                                                                  |
| ------ | --------------------------- | ------------------------------------------------------------------------------- |
| `404`  | `Store not found.`          | A loja com o `slug` informado não existe.                                       |
| `409`  | `Store already has a logo.` | A loja já possui um logo cadastrado. Use a rota de alteração para substituí-lo. |

> **Nota:** O arquivo é validado (formato `png`, `jpg`, `jpeg`, `webp` e tamanho máximo de `5MB`).

### `PATCH /stores/:slug/logo/change` — Alterar logo (Auth: Proprietário)

| Código | Mensagem original                     | Motivo (PT-BR)                                                   |
| ------ | ------------------------------------- | ---------------------------------------------------------------- |
| `401`  | `Invalid authentication credentials.` | Token JWT ausente, inválido ou expirado.                         |
| `404`  | `Store or current logo not found.`    | A loja não existe ou ainda não possui um logo para ser alterado. |

> **Nota:** O arquivo é validado (formato `png`, `jpg`, `jpeg`, `webp` e tamanho máximo de `5MB`).

### `DELETE /stores/:slug/logo/delete` — Deletar logo (Auth: Proprietário)

| Código | Mensagem original                     | Motivo (PT-BR)                                     |
| ------ | ------------------------------------- | -------------------------------------------------- |
| `401`  | `Invalid authentication credentials.` | Token JWT ausente, inválido ou expirado.           |
| `404`  | `Store or logo image not found.`      | A loja não existe ou não possui logo para remover. |

---

## Carrinho

### `POST /products/:productId/cart` — Adicionar produto ao carrinho (Auth)

| Código | Mensagem original                                | Motivo (PT-BR)                                                                                        |
| ------ | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `400`  | `Invalid product size or request data.`          | O tamanho selecionado é inválido (não existe para o produto) ou os dados da requisição são inválidos. |
| `404`  | `Product not found.`                             | O produto com o `productId` informado não existe.                                                     |
| `409`  | `Product unavailable or quantity exceeds stock.` | O produto está inativo/indisponível ou a quantidade solicitada excede o estoque disponível.           |

### `GET /carts` — Listar carrinhos do usuário (Auth)

| Código | Mensagem original                      | Motivo (PT-BR)                                                                                           |
| ------ | -------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| —      | _(nenhum erro documentado no Swagger)_ | A rota exige autenticação (`JwtAuthGuard`), que pode retornar `401` se o token estiver ausente/inválido. |

### `GET /cart/:cartId/products` — Listar produtos de um carrinho (Auth)

| Código | Mensagem original | Motivo (PT-BR)                                                             |
| ------ | ----------------- | -------------------------------------------------------------------------- |
| `404`  | `Cart not found.` | O carrinho com o `cartId` informado não existe ou não pertence ao usuário. |

### `PUT /cart/:cartItemId` — Atualizar item do carrinho (Auth)

| Código | Mensagem original                                                            | Motivo (PT-BR)                                                                      |
| ------ | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `400`  | `Invalid request data or selected size is invalid.`                          | Os dados enviados são inválidos ou o tamanho selecionado não existe para o produto. |
| `401`  | `Invalid authentication credentials.`                                        | Token JWT ausente, inválido ou expirado.                                            |
| `404`  | `The requested cart item or product could not be found.`                     | O item do carrinho informado ou o produto associado a ele não foi encontrado.       |
| `409`  | `Unable to process the request. Requested quantity exceeds available stock.` | A quantidade solicitada excede o estoque disponível do produto.                     |

### `DELETE /cart/:cartItemId` — Remover item do carrinho (Auth)

| Código | Mensagem original                             | Motivo (PT-BR)                                                  |
| ------ | --------------------------------------------- | --------------------------------------------------------------- |
| `401`  | `Invalid authentication credentials.`         | Token JWT ausente, inválido ou expirado.                        |
| `404`  | `The requested cart item could not be found.` | O item do carrinho informado (`cartItemId`) não foi encontrado. |

---

## Pedidos

### `POST /cart/:cartId/order` — Registrar pedido a partir do carrinho (Auth)

| Código | Mensagem original                                        | Motivo (PT-BR)                                                                                                  |
| ------ | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `400`  | `Cart is empty or request cannot be processed.`          | O carrinho está vazio ou a requisição não pôde ser processada.                                                  |
| `401`  | `Authentication required.`                               | Token JWT ausente, inválido ou expirado.                                                                        |
| `404`  | `Cart not found.`                                        | O carrinho com o `cartId` informado não existe ou não pertence ao usuário.                                      |
| `409`  | `Product is unavailable or there is insufficient stock.` | Algum produto do carrinho está indisponível (inativo) ou o estoque é insuficiente para a quantidade solicitada. |

### `GET /orders` — Listar pedidos do usuário (Auth)

| Código | Mensagem original                      | Motivo (PT-BR)                                                                                           |
| ------ | -------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| —      | _(nenhum erro documentado no Swagger)_ | A rota exige autenticação (`JwtAuthGuard`), que pode retornar `401` se o token estiver ausente/inválido. |

### `GET /store/:slug/orders` — Listar pedidos de uma loja (Auth: Funcionário/Proprietário)

| Código | Mensagem original                                       | Motivo (PT-BR)                                                                 |
| ------ | ------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `401`  | `Invalid authentication credentials.`                   | Token JWT ausente, inválido ou expirado.                                       |
| `403`  | `User does not have permission to perform this action.` | O usuário autenticado não é colaborador da loja ou não tem o papel necessário. |
| `404`  | `Store not found.`                                      | A loja com o `slug` informado não existe.                                      |

### `GET /orders/:orderId` — Listar produtos de um pedido (Auth)

| Código | Mensagem original  | Motivo (PT-BR)                                                                        |
| ------ | ------------------ | ------------------------------------------------------------------------------------- |
| `404`  | `Order not found.` | O pedido com o `orderId` informado não existe ou não pertence ao usuário autenticado. |

---

## Colaboradores / Funcionários

### `POST /stores/:slug/collaborators` — Registrar colaborador (Auth: Proprietário)

| Código | Mensagem original                                      | Motivo (PT-BR)                                                                   |
| ------ | ------------------------------------------------------ | -------------------------------------------------------------------------------- |
| `400`  | `Invalid request data or collaborator already exists.` | Os dados enviados são inválidos ou já existe um colaborador com o mesmo e-mail.  |
| `401`  | `Authentication required.`                             | Token JWT ausente, inválido ou expirado.                                         |
| `403`  | `User does not have permission to manage this store.`  | O usuário autenticado não é proprietário da loja ou não tem permissão de gestão. |
| `404`  | `Store not found.`                                     | A loja com o `slug` informado não existe.                                        |

### `GET /store/:slug/employees` — Listar colaboradores (Auth: Proprietário)

| Código | Mensagem original                                       | Motivo (PT-BR)                                    |
| ------ | ------------------------------------------------------- | ------------------------------------------------- |
| `401`  | `Invalid authentication credentials.`                   | Token JWT ausente, inválido ou expirado.          |
| `403`  | `User does not have permission to perform this action.` | O usuário autenticado não é proprietário da loja. |
| `404`  | `Store not found.`                                      | A loja com o `slug` informado não existe.         |

### `DELETE /store/:slug/delete/:employeeId` — Remover colaborador (Auth: Proprietário)

| Código | Mensagem original                                                        | Motivo (PT-BR)                                                                           |
| ------ | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| `401`  | `Invalid authentication credentials.`                                    | Token JWT ausente, inválido ou expirado.                                                 |
| `404`  | `Store or employee not found.`                                           | A loja ou o colaborador informado não existe.                                            |
| `409`  | `Unable to complete the requested operation. Cannot delete store owner.` | Não é possível remover o proprietário da loja. Apenas colaboradores podem ser excluídos. |

---

## Endereços da loja

### `POST /address/:slug/register/` — Registrar endereço da loja (Auth: Proprietário)

| Código | Mensagem original                                     | Motivo (PT-BR)                                                                   |
| ------ | ----------------------------------------------------- | -------------------------------------------------------------------------------- |
| `400`  | `Invalid address data or store not found.`            | Os dados do endereço são inválidos ou a loja informada não existe.               |
| `401`  | `Authentication required.`                            | Token JWT ausente, inválido ou expirado.                                         |
| `403`  | `User does not have permission to manage this store.` | O usuário autenticado não é proprietário da loja ou não tem permissão de gestão. |

### `PUT /store/:slug/address` — Atualizar endereço da loja (Auth: Proprietário)

| Código | Mensagem original                     | Motivo (PT-BR)                                                                                    |
| ------ | ------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `400`  | `Invalid address data.`               | Os dados do endereço enviados no corpo são inválidos.                                             |
| `401`  | `Invalid authentication credentials.` | Token JWT ausente, inválido ou expirado.                                                          |
| `409`  | `Store address cannot be updated.`    | Não foi possível atualizar o endereço da loja (ex.: a loja ainda não possui endereço cadastrado). |

---

## Categorias / Subcategorias (Admin)

### `POST /categories` — Criar categoria (Auth: Admin)

| Código | Mensagem original                     | Motivo (PT-BR)                            |
| ------ | ------------------------------------- | ----------------------------------------- |
| `401`  | `Invalid authentication credentials.` | Token JWT ausente, inválido ou expirado.  |
| `409`  | `Category already registered.`        | Já existe uma categoria com o mesmo nome. |

### `PUT /categories/:slug/edit` — Editar categoria (Auth: Admin)

| Código | Mensagem original                                                          | Motivo (PT-BR)                                                                          |
| ------ | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `400`  | `Category not registered.`                                                 | A categoria informada não está registrada (o corpo da requisição ou o slug é inválido). |
| `401`  | `Invalid authentication credentials.`                                      | Token JWT ausente, inválido ou expirado.                                                |
| `403`  | `User does not have permission to perform this operation.`                 | O usuário autenticado não é administrador.                                              |
| `409`  | `Unable to complete the requested operation. Category already registered.` | Já existe uma categoria com o novo nome informado.                                      |

### `POST /categories/:slug/subcategory` — Criar subcategoria (Auth: Admin)

| Código | Mensagem original                                  | Motivo (PT-BR)                                                                 |
| ------ | -------------------------------------------------- | ------------------------------------------------------------------------------ |
| `400`  | `Category not registered or invalid request data.` | A categoria informada no `slug` não existe ou os dados enviados são inválidos. |
| `401`  | `Invalid authentication credentials.`              | Token JWT ausente, inválido ou expirado.                                       |
| `409`  | `Subcategory already registered.`                  | Já existe uma subcategoria com o mesmo nome na categoria informada.            |

### `PUT /categories/:slug/subcategories/:id` — Editar subcategoria (Auth: Admin)

| Código | Mensagem original                                                             | Motivo (PT-BR)                                                         |
| ------ | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `400`  | `Subcategory not registered.`                                                 | A subcategoria informada não está registrada (corpo ou `id` inválido). |
| `401`  | `Invalid authentication credentials.`                                         | Token JWT ausente, inválido ou expirado.                               |
| `403`  | `User does not have permission to perform this operation.`                    | O usuário autenticado não é administrador.                             |
| `404`  | `Category not found.`                                                         | A categoria informada no `slug` não existe.                            |
| `409`  | `Unable to complete the requested operation. Subcategory already registered.` | Já existe uma subcategoria com o novo nome informado.                  |

### `GET /categories` — Listar categorias (Público)

| Código | Mensagem original                      | Motivo (PT-BR)                                                      |
| ------ | -------------------------------------- | ------------------------------------------------------------------- |
| —      | _(nenhum erro documentado no Swagger)_ | Rota pública de listagem. Não há erros documentados nos decorators. |

### `GET /subcategories` — Listar subcategorias (Público)

| Código | Mensagem original                      | Motivo (PT-BR)                                                      |
| ------ | -------------------------------------- | ------------------------------------------------------------------- |
| —      | _(nenhum erro documentado no Swagger)_ | Rota pública de listagem. Não há erros documentados nos decorators. |

---

> **Observação:** As mensagens de erro exibidas neste documento são as descrições dos decorators Swagger de cada controller. As mensagens de erro reais retornadas pelos serviços podem variar levemente em texto, mas mantêm o mesmo código HTTP e significado. Para detalhes sobre validação e payloads, consulte os esquemas Zod em `src/http/zod/schema`.
