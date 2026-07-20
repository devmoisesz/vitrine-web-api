# Vitrine Web — Documentação de Requisitos

## Contexto do Produto

Plataforma de vitrine digital para lojas de roupas de cidades pequenas, funcionando como um marketplace unificado.

Clientes navegam livremente pelo catálogo unificado e solicitam compras via WhatsApp.

A negociação de pagamento e entrega acontece fora da plataforma.

O acesso ao catálogo é público, exigindo autenticação apenas no momento de interagir com o carrinho ou finalizar compras.

---

# Requisitos Funcionais

## Autenticação e Perfil (todos os usuários)

- [x] Deve ser possível se cadastrar com nome, e-mail e senha
- [x] Deve ser possível fazer login com e-mail e senha
- [ ] Deve ser possível fazer login com Google
- [x] Deve ser possível cadastrar endereços 
- [x] Deve ser possível visualizar o próprio perfil
- [x] Deve ser possível editar os próprios dados pessoais

## Cliente

- [x] Deve ser possível pesquisar produtos por nome de forma global na plataforma
- [x] Deve ser possível listar todos produtos mais recentes  
- [x] Deve ser possível filtrar produtos de forma global por categoria principal
- [x] Deve ser possível filtrar produtos de forma global por subcategoria
- [ ] Deve ser possível combinar filtros de categoria, subcategoria e busca por nome
- [x] Deve ser possível buscar lojas pelo nome
- [x] Deve ser possível visualizar a página de uma loja (vitrine exclusiva) com seus dados
- [ ] Deve ser possível visualizar os detalhes de um produto
- [x] Deve ser possível cadastrar vários endereços 
- [x] Deve ser possível editar seus próprios endereços
- [x] Deve ser possível visualizar seus próprios endereços
- [ ] Deve ser possível adicionar produtos ao carrinho de uma loja
- [ ] Deve ser possível remover produtos do carrinho
- [ ] Deve ser possível visualizar carrinhos ativos de múltiplas lojas simultaneamente
- [ ] Deve ser possível solicitar compra via WhatsApp, gerando mensagem automática com os produtos do carrinho, quantidades e modalidades aceitas pela loja
- [ ] Deve ser possível visualizar o histórico de solicitações enviadas via WhatsApp

## Funcionário

- [x] Deve ser possível adicionar produtos à loja vinculada (nome, descrição, preço, categoria, subcategoria, estoque e imagem)
- [x] Deve ser possível escolher qual imagem do produto é a principal
- [x] Deve ser possível trocar imagem do produto
- [x] Deve ser possível deletar imagem do produto
- [x] Deve ser possível editar produtos da própria loja
- [x] Deve ser possível desativar um produto da própria loja
- [x] Deve ser possível ativar um produto desativado da própria loja
- [x] Deve ser possível remover um produto da própria loja
- [ ] Deve ser possível visualizar pedidos solicitados via WhatsApp para a própria loja

## Dono da Loja (permissões do Funcionário, mais as abaixo)

- [x] Deve ser possível fazer upload do logo da loja
- [x] Deve ser possível deletar logo da loja
- [x] Deve ser possível trocar logo da loja
- [x] Deve ser possível cadastrar funcionários e vinculá-los à própria loja
- [x] Deve ser possível cadastrar endereço da loja
- [x] Deve ser possível editar os dados da própria loja
- [x] Deve ser possível desativar funcionários da própria loja

## Admin da Plataforma

- [x] Deve ser possível cadastrar lojas 
- [x] Deve ser possível cadastrar o Dono de uma loja e vinculá-lo a ela
- [x] Deve ser possível desativar e reativar lojas
- [x] Deve ser possível cadastrar categorias principais na plataforma
- [x] Deve ser possível cadastrar subcategorias dentro de uma categoria principal
- [x] Deve ser possível editar nomes de categorias e subcategorias

---

# Regras de Negócio

## Usuários e Acesso

- [x] Não é permitido cadastrar dois usuários com o mesmo e-mail
- [x] Um Funcionário e um Dono devem estar obrigatoriamente vinculados a uma loja
- [x] O Funcionário não pode cadastrar outros funcionários
- [x] Apenas o Dono pode cadastrar funcionários para uma loja
- [x] O Dono e o Funcionário só podem gerenciar produtos e dados da própria loja

## Carrinho

- [ ] Cada loja possui um carrinho isolado por cliente
- [ ] Um carrinho só aceita produtos da loja à qual pertence
- [ ] O cliente não pode adicionar ao carrinho um produto com estoque zerado
- [ ] O cliente não pode adicionar ao carrinho um produto desativado

## Pedido via WhatsApp

- [ ] A mensagem gerada deve conter: nome do cliente, lista de produtos, quantidades e modalidades de entrega e pagamento aceitas pela loja
- [ ] Se o cliente tiver endereço cadastrado, ele deve ser incluído automaticamente na mensagem
- [ ] Ao enviar a solicitação, o sistema deve registrar o pedido com data, loja e produtos selecionados
- [ ] O histórico do cliente exibe solicitações enviadas

## Produtos

- [x] Um produto deve pertencer obrigatoriamente a uma loja
- [x] Um produto desativado não pode aparecer em nenhuma busca.
- [x] Um produto deve obrigatoriamente possuir categoria e subcategoria
- [x] Um produto só pode ser publicado com nome, preço, categoria, subcategoria, estoque e pelo menos uma imagem
- [x] Um produto deve possuir pelo menos uma imagem e no máximo 5 imagens.
- [ ] Na listagem geral e resultados de busca, os cards dos produtos devem exibir claramente a identificação da loja à qual pertencem

## Categorias

- [x] Categorias e subcategorias são criadas e gerenciadas exclusivamente pelo Admin
- [x] Uma subcategoria deve pertencer obrigatoriamente a uma categoria principal
- [ ] O vendedor seleciona a categoria principal e a subcategoria ao cadastrar um produto através de menus de seleção encadeados na interface, sem poder criar categorias livres

## Lojas

- [x] Um produto desativado não pode aparecer em nenhuma busca.
- [x] Uma loja só pode ter um endereço cadastrado
- [x] Apenas o Admin pode cadastrar e desativar lojas
- [x] Uma loja desativada não aparece nos resultados de busca global e sua rota de vitrine exclusiva fica inacessível
- [x] Caso uma loja seja desativada, todos os seus produtos associados são ocultados da busca global automaticamente

---

# Requisitos Não Funcionais

## Segurança

- [x] A senha do usuário deve ser armazenada criptografada com hash bcrypt
- [x] O usuário deve ser autenticado via JWT (JSON Web Token)
- [x] As entradas do usuário devem ser validadas no backend antes de serem processadas

## Dados e Armazenamento

- [x] Os dados da aplicação devem ser persistidos em banco de dados relacional
- [ ] As imagens dos produtos devem ser armazenadas em serviço de storage externo (Cloudinary)

## Experiência e Interface

- [ ] A aplicação deve ser responsiva para dispositivos móveis
- [ ] Todas as listagens de produtos devem ser paginadas com 40 itens por página
- [ ] A aplicação deve integrar com a API ViaCEP para autopreenchimento de endereços no cadastro de lojas e no perfil do cliente
