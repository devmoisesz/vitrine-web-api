markdown_content = """# 🚀 Guia de UI/UX: Arquitetura e Design da Tela de Múltiplos Carrinhos

> **Documento de Diretrizes de Interface e Experiência do Usuário (UI/UX)** > **Projeto:** Marketplace B2C com Finalização via WhatsApp  
> **Escopo:** Tela Geral de Carrinhos (`/carrinhos`) e Componentização Frontend

---

## 📌 A "Dica de Ouro" para o Frontend

Ao projetar uma plataforma de marketplace onde um usuário pode ter **múltiplos carrinhos ativos (um por loja)**, o maior risco visual é a **poluição de interface** e o **excesso de rolagem (scroll)**. 

A abordagem ideal não é exibir todos os produtos de todas as lojas abertos de uma só vez, mas sim utilizar o **padrão de Cards Resumidos com Accordion / Collapsible**.

---

## 🎨 Estrutura Visual da Página (`/carrinhos`)

### 1. Visão Geral (Card Compacto)
Cada loja com produtos no carrinho é representada por um card individual. As informações visíveis no estado inicial são apenas as essenciais para tomada de decisão rápida:

* **Cabeçalho do Card:** Logo da Loja + Nome da Loja + Tempo de atualização (ex: *"Atualizado há 5 min"*).
* **Corpo do Card:** Quantidade total de itens + Valor Subtotal formatado em BRL (`R$`).
* **Ações Principais:**
  * **Botão Secundário:** `Ver Produtos` / `Expandir` (Abre os detalhes sem sair da página).
  * **Botão Primário (Destaque em Verde WhatsApp):** `Finalizar no WhatsApp` (Gera o link e mensagem para a loja específica).

  Saída de código
File generated successfully.

```text
+-----------------------------------------------------------------------+
| 🏪 Moda Urbana Oficial                      Atualizado há 5 min      |
|                                                                       |
| 📦 3 itens selecionados                                               |
| 💰 Total: R$ 250,00                                                   |
|                                                                       |
| [ 👁️ Ver Produtos ]                   [ 💬 Finalizar no WhatsApp ]     |
+-----------------------------------------------------------------------+