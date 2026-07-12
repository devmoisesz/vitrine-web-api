# Regras de autenticação da aplicação

## Objetivo

Este documento registra a regra de autenticação atualmente implementada na API, com foco no fluxo esperado pelo frontend. O backend usa JWT para autenticar requisições e cookies httpOnly para armazenar o refresh token no navegador.

## 1. Fluxo de autenticação

### Login

A rota pública `/authenticate` aceita e-mail e senha.

Passos:
1. O cliente envia e-mail e senha para o endpoint de autenticação.
2. O backend valida as credenciais com o serviço de autenticação.
3. O backend gera dois tokens JWT:
   - `access_token`: expira em 15 minutos e é usado para acessar rotas protegidas.
   - `refresh_token`: expira em 1 hora e é usado para renovar a sessão sem pedir senha novamente.
4. O backend define o `refreshToken` como cookie `httpOnly`, `Secure` em produção e `SameSite=strict`.
5. O backend retorna o `access_token` e o `refresh_token` no corpo da resposta.

### Refresh de sessão

A rota pública `/refresh` lê o `refreshToken` do cookie.

Passos:
1. O frontend chama `PATCH /refresh` sem enviar o refresh token no corpo da requisição.
2. O backend lê o cookie `refreshToken` do navegador.
3. O backend verifica a assinatura e a expiração do token com a chave pública.
4. Se for válido, emite um novo `access_token` e um novo `refresh_token`.
5. O backend sobrescreve o cookie `refreshToken` com o novo valor.
6. O frontend deve tratar a resposta como um novo conjunto de tokens e manter a sessão atualizada.

### Logout

Atualmente não existe um endpoint explícito de logout no backend. O fluxo esperado é:
- limpar o cookie `refreshToken` no cliente;
- descartar o `access_token` em memória ou em armazenamento local do frontend, caso o frontend o guarde;
- impedir novas chamadas autenticadas até que o usuário faça login novamente.

## 2. Armazenamento de tokens no frontend

A implementação atual assume que o frontend não armazenará o `refresh_token` em localStorage ou sessionStorage.

Regras recomendadas para o frontend:
- Guardar o `access_token` de forma temporária, preferencialmente em memória ou em estado de aplicação, para uso em chamadas autenticadas.
- Guardar o `refresh_token` exclusivamente no cookie `httpOnly` enviado pelo navegador.
- Nunca expor o `refresh_token` ao JavaScript do frontend, pois o cookie `httpOnly` impede leitura via `document.cookie`.
- O frontend deve confiar que o backend cuidará da rotação do refresh token via endpoint `/refresh`.

> Observação importante: o backend retorna `refresh_token` no corpo da resposta em login e refresh, mas a regra de segurança esperada pelo sistema é que o navegador mantenha esse token no cookie `httpOnly` e o frontend trate o valor apenas como parte da resposta do backend, sem depender de armazenamento manual no browser.

## 3. Validação do JWT no backend

O backend usa Passport + JWT Strategy para validar tokens recebidos nas rotas protegidas.

### Estrutura do payload

O payload do token contém:
- `sub`: identificador do usuário.
- `role`: papel do usuário, usado para autorização.

### Estratégia do JWT

A estratégia define:
- extração do token pelo header `Authorization: Bearer <token>`;
- validação com a chave pública RSA em base64;
- algoritmo `RS256`;
- injeção do usuário autenticado em `request.user` com:
  - `id`
  - `role`

## 4. Guarda de autenticação global

A guarda `JwtAuthGuard` é aplicada nas rotas protegidas.

Comportamento:
- Se a rota for marcada com `@Public()`, a autenticação é pulada.
- Caso contrário, o guard tenta validar o token JWT.
- Se o token estiver ausente ou inválido, a autenticação falha e a requisição não prossegue.

## 5. Autorização por papel e por loja

A aplicação usa duas camadas de proteção adicionais para controlar o acesso a recursos sensíveis.

### 5.1 AdminAccessGuard

O guard `AdminAccessGuard` permite acesso somente para usuários com `role === 'Admin'`.

Regras:
- Usuários sem autenticação recebem `401 Unauthorized`.
- Usuários autenticados, mas sem papel de admin, recebem `403 Forbidden`.
- Usuários admin passam sem outras validações.

### 5.2 StoreAccessGuard

O guard `StoreAccessGuard` é aplicado a rotas que dependem de uma loja, normalmente com parâmetro `storeId` na URL.

Regras:
- O usuário precisa estar autenticado.
- O `storeId` precisa estar presente na rota.
- A loja precisa existir.
- Se o usuário for `Admin`, ele tem acesso livre à loja.
- Se não for admin, o backend verifica se existe um relacionamento de colaborador entre o usuário e a loja.
- Se o usuário não for colaborador da loja, o acesso é negado com `403 Forbidden`.
- Se a rota exigir papéis específicos via `@RequireRoles(...)`, o papel do colaborador precisa corresponder a um dos papéis permitidos.

### 5.3 Decorator `RequireRoles`

O decorator `RequireRoles` define metadados de papéis permitidos em uma rota.

Exemplos:
- `@RequireRoles('Proprietário')`
- `@RequireRoles('Proprietário', 'Funcionário')`

Esses metadados são lidos pelo `StoreAccessGuard` para verificar se o colaborador tem permissão suficiente para a operação.

## 6. Papéis e permissões esperadas

Atualmente a aplicação trabalha com os seguintes conceitos principais:
- `Admin`: acesso global à plataforma.
- `Cliente`: usuário comum, sem acesso administrativo.
- `Colaborador`: usuário vinculado a uma loja; seu acesso depende do papel definido na relação com a loja.

### Permissões de negócio relevantes

- Rotas de administração da plataforma exigem `AdminAccessGuard`.
- Rotas específicas de uma loja exigem `StoreAccessGuard`.
- Rotas que protegem ações sensíveis de gestão de colaboradores usam `@RequireRoles('Proprietário')` ou outros papéis explicitamente permitidos.

## 7. Recomendação para o frontend

Para o frontend, o modelo esperado é:
1. Fazer login pelo endpoint `/authenticate`.
2. Receber o `access_token` no corpo e aceitar que o `refresh_token` seja mantido pelo cookie `httpOnly` no navegador.
3. Enviar o `access_token` no header `Authorization: Bearer ...` para rotas protegidas.
4. Em caso de expirado ou inválido, chamar `/refresh` sem precisar manipular o refresh token manualmente.
5. Tratar erros `401` e `403` como sinais de sessão expirada, sem permissão ou necessidade de reautenticação.
6. Nunca depender de `localStorage` ou `sessionStorage` para o refresh token.

## 8. Resumo prático

- O backend autentica usando JWT com algoritmo `RS256`.
- O `access_token` é usado para chamadas autenticadas.
- O `refresh_token` é tratado como token de longa duração e é armazenado via cookie `httpOnly`.
- O frontend deve seguir o modelo de sessão baseada em cookie e token de acesso em memória.
- A autorização é feita em duas camadas: autenticação global (`JwtAuthGuard`) e autorização por papel/loja (`AdminAccessGuard` e `StoreAccessGuard`).
