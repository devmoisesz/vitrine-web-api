# Contratos para a repaginação pública

Nenhuma alteração de contrato HTTP, regra de produção ou migração foi necessária. Base auditada: `11669bf` em `dev`; branch de verificação: `test/repaginacao-catalogo`.

| Contrato | Uso no front-end |
| --- | --- |
| `GET /stores?page=&name=` | Diretório de marcas e exemplo de uma loja na home. DTO público com logo, banner e descrição; ordem de cadastro; 20 por página. |
| `GET /store/:slug` | Identidade, descrição, endereço, contato e modalidades cadastradas. |
| `GET /store/:slug/products?page=&name=&categoryId=&subcategoryId=` | Busca por nome/descrição, categorias e paginação local. 40 por página. |
| `GET /products/:id` | Produto e identificação da loja proprietária. |
| `GET /categories`, `GET /subcategories` | Taxonomia existente; filtros são enviados à consulta local. |

`PrismaProductsRepository.findManyByStore` aplica o mesmo `where` à lista e à contagem: `storeId`, produto ativo, loja ativa, nome/descrição, categoria e subcategoria. O banco aplica `skip`/`take` após esses critérios. `X-Total-Count` representa o resultado filtrado.

Os endpoints `/products` e `/home/stores` foram mantidos para compatibilidade. Seus consumidores públicos antigos foram removidos do front-end; nenhum dado de loja ou produto foi apagado.

O front-end adicionou um Route Handler de leituras públicas em `/api/catalog/*` para consultar esta API sem depender da origem CORS da prévia. Esse handler tem lista restrita de caminhos, não encaminha sessão e preserva a contagem. Não exige publicar uma nova API antes da interface.

## Verificação

- `pnpm test`: 74 arquivos e 496 testes aprovados, incluindo dois novos casos de isolamento da consulta e contagem por loja (`2ca7f8a`).
- Prettier aplicado ao novo teste.
- ESLint não executável no estado atual do repositório: ESLint 9 instalado sem `eslint.config.*`. Não foi criada uma configuração paralela.
- Testes E2E que gravam em PostgreSQL não foram executados; nenhuma mensagem ou pedido foi enviado às lojas.
- Versão do pacote mantida em `0.0.1`; nenhuma release, tag ou publicação realizada.
