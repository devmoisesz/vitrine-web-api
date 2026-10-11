# Segmentos e descoberta de lojas

Segmentos são tipos de estabelecimento, independentes de categorias e subcategorias de produtos. Não há enum, seeds nem classificação automática de lojas.

## Contratos

| Operação | Acesso | Dados |
| --- | --- | --- |
| GET /segments | Público | Lista ordenada de `{ id, name, slug }` |
| POST /segments | Administrador | `{ name, slug? }` |
| PUT /segments/:id | Administrador | `{ name, slug? }`; nome obrigatório, slug anterior preservado quando omitido |
| DELETE /segments/:id | Administrador | 204; 409 se associado a qualquer loja, inclusive inativa |
| POST /store | Administrador | Contrato existente + `segmentIds?: string[]` |
| PUT /store/:slug/edit | Administrador ou proprietário autorizado | Contrato existente + `segmentIds?: string[]` |
| GET /stores | Público | `name`, `segments=fitness,cosmeticos`, `page`; página de 20 e header `X-Total-Count` |

A consulta por nome/descrição existente é combinada com os segmentos. Vários slugs têm semântica OU: basta pertencer a um deles. A relação `some` filtra antes de contar e paginar, sem duplicar lojas. Sem slugs, todas as lojas elegíveis aparecem, inclusive sem segmento. Slugs desconhecidos não geram etiquetas fictícias nem correspondências. Ordenação estável por criação e id.

Nome normalizado com até 100 caracteres, único sem distinção de maiúsculas/minúsculas; slug único com até 100 caracteres e letras minúsculas, números e hífens. O slug é derivado do nome quando omitido na criação. IDs são UUIDs, com no máximo 100 associações por requisição; duplicados e IDs inexistentes são rejeitados. A chave composta no banco impede duplicidades e a FK bloqueia exclusão concorrente de segmentos associados.

Omitir `segmentIds` preserva as associações; `[]` remove todas. Funcionários e consumidores não ganham permissão para editar a loja. Respostas públicas de lojas incluem `segments: []` ou a lista de segmentos, sem expor a tabela de associação.

## Migração segura

A migração `20261009120000_add_store_segments` apenas cria `segment`, `store_segments`, índices e chaves estrangeiras. Não altera nem remove registros existentes. As duas lojas existentes começam sem segmentos e mantêm IDs, slugs, produtos e links. O índice funcional `segment_name_lower_key` é mantido no SQL da migração para unicidade concorrente de nomes.

Antes de executar em qualquer ambiente persistente:
1. Confirme host, banco e schema de `DATABASE_URL` sem divulgar a credencial. A CLI carrega o ambiente existente; não suponha que ele é local.
2. Faça backup/snapshot e valide a restauração em uma cópia. Registre contagens e IDs/slugs das lojas e produtos.
3. Na cópia, confira o histórico com `pnpm exec prisma migrate status`, revise todas as migrações pendentes e aplique `pnpm exec prisma migrate deploy`. Este comando aplica todas as pendentes, não apenas segmentos.
4. Compare os dados, confirme acesso às duas lojas e que ambas continuam em todas as lojas. Não execute seed, reset ou db push.
5. No ambiente de destino autorizado, repita status/deploy; gere o cliente com `pnpm exec prisma generate` antes do build e disponibilize a API antes do front que consome segmentos.

Em falha, investigue o status da migração antes de tentar novamente; não marque uma migração como aplicada sem conferir o SQL executado. Para reverter o código, a versão anterior pode conviver com as tabelas novas. Preserve essas tabelas até decidir explicitamente o destino das associações.

Nenhuma migração foi aplicada ao banco de produção nesta implementação.

## Verificação

- `pnpm test`: 505 testes em 75 arquivos aprovados.
- `pnpm exec tsc --noEmit --incremental false` e `pnpm build`: aprovados.
- PostgreSQL local: teste de migração compara todas as tabelas antigas antes/depois com duas lojas, usuário, produtos, imagens, carrinho e pedido; segmentos e associações continuam vazios.
- E2E de segmentos/lojas: CRUD, conflitos, FK, permissões reais de JWT/guards, seleção múltipla, limpeza/preservação, busca + segmentos + paginação e contagem aprovados.

Para repetir os oito testes E2E pertinentes, configure exclusivamente um banco local/de teste em `.env.test` (e confira qualquer `DATABASE_URL` já exportada, que tem precedência):

```sh
pnpm test:e2e test/e2e/store-segments-migration.e2e.spec.ts src/http/controllers/admin/store-segments.e2e.spec.ts src/http/controllers/users/list-stores.controller.e2e.spec.ts
```

O setup cria schemas aleatórios `e2e_*` e remove somente esses schemas ao terminar. Os testes não precisam das duas lojas reais. A suíte E2E completa com integrações externas não foi executada; o lint legado não tem configuração ESLint disponível neste repositório. Não houve alteração de CI, push ou deploy.
