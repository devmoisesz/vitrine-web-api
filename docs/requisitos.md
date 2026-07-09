# Vitrine Web — Documentação de Requisitos

## Contexto do Produto

Plataforma de vitrine digital para lojas de roupas de cidades pequenas, funcionando como um marketplace unificado.

Clientes navegam livremente pelo catálogo unificado e solicitam compras via WhatsApp.

A negociação de pagamento e entrega acontece fora da plataforma.

O acesso ao catálogo é público, exigindo autenticação apenas no momento de interagir com o carrinho ou finalizar compras.

---

# Requisitos Funcionais

## Autenticação e Perfil (todos os usuários)

- [ ] Deve ser possível se cadastrar com nome, e-mail e senha
- [ ] Deve ser possível fazer login com e-mail e senha
- [ ] Deve ser possível fazer login com Google
- [ ] Deve ser possível visualizar o próprio perfil
- [ ] Deve ser possível editar os próprios dados pessoais
- [ ] Deve ser possível fazer logout (sair da conta)

## Cliente

- [ ] Deve ser possível pesquisar produtos por nome de forma global na plataforma
- [ ] Deve ser possível filtrar produtos de forma global por categoria principal
- [ ] Deve ser possível filtrar produtos de forma global por subcategoria
- [ ] Deve ser possível combinar filtros de categoria, subcategoria e busca por nome
- [ ] Deve ser possível buscar lojas pelo nome
- [ ] Deve ser possível visualizar a página de uma loja (vitrine exclusiva) com seus dados e apenas os seus produtos
- [ ] Deve ser possível visualizar os detalhes de um produto
- [ ] Deve ser possível adicionar produtos ao carrinho de uma loja
- [ ] Deve ser possível remover produtos do carrinho
- [ ] Deve ser possível visualizar carrinhos ativos de múltiplas lojas simultaneamente
- [ ] Deve ser possível solicitar compra via WhatsApp, gerando mensagem automática com os produtos do carrinho, quantidades e modalidades aceitas pela loja
- [ ] Deve ser possível visualizar o histórico de solicitações enviadas via WhatsApp

## Funcionário

- [ ] Deve ser possível adicionar produtos à loja vinculada (nome, descrição, preço, categoria, subcategoria, estoque e imagem)
- [ ] Deve ser possível editar produtos da própria loja
- [ ] Deve ser possível desativar um produto da própria loja
- [ ] Deve ser possível remover um produto da própria loja
- [ ] Deve ser possível visualizar pedidos solicitados via WhatsApp para a própria loja

## Dono da Loja (permissões do Funcionário, mais as abaixo)

- [ ] Deve ser possível cadastrar funcionários e vinculá-los à própria loja
- [ ] Deve ser possível editar os dados da própria loja
- [ ] Deve ser possível desativar funcionários da própria loja

## Admin da Plataforma

- [ ] Deve ser possível cadastrar lojas (nome, descrição, WhatsApp, endereço, logo, modalidades de entrega e pagamento aceitas)
- [ ] Deve ser possível cadastrar o Dono de uma loja e vinculá-lo a ela
- [ ] Deve ser possível cadastrar funcionários e vinculá-los a uma loja
- [ ] Deve ser possível desativar e reativar lojas
- [ ] Deve ser possível desativar qualquer produto da plataforma
- [ ] Deve ser possível visualizar todas as lojas cadastradas na plataforma
- [ ] Deve ser possível cadastrar categorias principais na plataforma
- [ ] Deve ser possível cadastrar subcategorias dentro de uma categoria principal
- [ ] Deve ser possível editar nomes de categorias e subcategorias

---

# Regras de Negócio

## Usuários e Acesso

- [ ] Não é permitido cadastrar dois usuários com o mesmo e-mail
- [ ] Um Funcionário e um Dono devem estar obrigatoriamente vinculados a uma loja
- [ ] O Funcionário não pode cadastrar outros funcionários
- [ ] Apenas o Admin e o Dono podem cadastrar funcionários para uma loja
- [ ] O Dono e o Funcionário só podem gerenciar produtos e dados da própria loja
- [ ] O cliente pode visualizar o catálogo, buscar produtos e acessar vitrines de lojas sem estar autenticado. No entanto, as ações de adicionar ao carrinho ou finalizar a compra exigem autenticação obrigatória

## Carrinho

- [ ] Cada loja possui um carrinho isolado por cliente
- [ ] Um carrinho só aceita produtos da loja à qual pertence
- [ ] O cliente não pode adicionar ao carrinho um produto com estoque zerado
- [ ] O cliente não pode adicionar ao carrinho um produto desativado

## Pedido via WhatsApp

- [ ] A mensagem gerada deve conter: nome do cliente, lista de produtos, quantidades e modalidades de entrega e pagamento aceitas pela loja
- [ ] Se o cliente tiver endereço cadastrado, ele deve ser incluído automaticamente na mensagem
- [ ] Ao enviar a solicitação, o sistema deve registrar o pedido com data, loja, produtos selecionados e status **"solicitado"**
- [ ] O histórico do cliente exibe solicitações enviadas

## Produtos

- [ ] Um produto deve pertencer obrigatoriamente a uma loja
- [ ] Um produto desativado não pode aparecer em nenhuma busca.
- [ ] Um produto deve obrigatoriamente possuir categoria e subcategoria
- [ ] Um produto só pode ser publicado com nome, preço, categoria, subcategoria, estoque e pelo menos uma imagem
- [ ] Um produto deve possuir pelo menos uma imagem e no máximo 5 imagens.
- [ ] Na listagem geral e resultados de busca, os cards dos produtos devem exibir claramente a identificação da loja à qual pertencem

## Categorias

- [ ] Categorias e subcategorias são criadas e gerenciadas exclusivamente pelo Admin
- [ ] Uma subcategoria deve pertencer obrigatoriamente a uma categoria principal
- [ ] Uma categoria principal não pode ser excluída se houver subcategorias vinculadas
- [ ] Uma subcategoria não pode ser excluída se houver produtos vinculados a ela
- [ ] O vendedor seleciona a categoria principal e a subcategoria ao cadastrar um produto através de menus de seleção encadeados no frontend, sem poder criar categorias livres

## Lojas

- [ ] Um produto desativado não pode aparecer em nenhuma busca.
- [ ] Apenas o Admin pode cadastrar e desativar lojas
- [ ] Uma loja desativada não aparece nos resultados de busca global e sua rota de vitrine exclusiva fica inacessível
- [ ] Caso uma loja seja desativada, todos os seus produtos associados são ocultados da busca global automaticamente

---

# Requisitos Não Funcionais

## Segurança

- [ ] A senha do usuário deve ser armazenada criptografada com hash bcrypt
- [ ] O usuário deve ser autenticado via JWT (JSON Web Token)
- [ ] As entradas do usuário devem ser validadas no backend antes de serem processadas

## Dados e Armazenamento

- [ ] Os dados da aplicação devem ser persistidos em banco de dados relacional
- [ ] As imagens dos produtos devem ser armazenadas em serviço de storage externo (Cloudinary)

## Experiência e Interface

- [ ] A aplicação deve ser responsiva para dispositivos móveis
- [ ] Todas as listagens de produtos devem ser paginadas com 20 itens por página
- [ ] A aplicação deve integrar com a API ViaCEP para autopreenchimento de endereços no cadastro de lojas e no perfil do cliente
- [ ] O estado dos carrinhos das lojas do usuário não autenticado deve ser persistido temporariamente no LocalStorage do navegador para evitar perda de dados caso a página seja recarregada antes do login