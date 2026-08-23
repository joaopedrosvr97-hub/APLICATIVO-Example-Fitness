# F3Fitness — Plano de Design de Interface

## Visão Geral

O F3Fitness é um aplicativo de loja de roupas e acessórios fitness voltado para um público feminino e masculino que busca estilo e performance. Inspirado no app Hardyn Fitness, o design prioriza uma experiência de compra fluida, visual impactante e navegação intuitiva em portrait (9:16).

---

## Paleta de Cores

| Token | Valor (Light) | Valor (Dark) | Uso |
|-------|--------------|-------------|-----|
| `primary` | `#E63946` | `#FF4D5A` | Botões principais, destaques, badges |
| `background` | `#FFFFFF` | `#0D0D0D` | Fundo de telas |
| `surface` | `#F8F8F8` | `#1A1A1A` | Cards, modais, bottom sheets |
| `foreground` | `#111111` | `#F5F5F5` | Texto principal |
| `muted` | `#6B7280` | `#9CA3AF` | Texto secundário, labels |
| `border` | `#E5E7EB` | `#2A2A2A` | Separadores, bordas |
| `success` | `#10B981` | `#34D399` | Confirmações, estoque |
| `warning` | `#F59E0B` | `#FBBF24` | Promoções, alertas |
| `error` | `#EF4444` | `#F87171` | Erros, remoção |

**Tipografia:** Sistema nativo (SF Pro no iOS, Roboto no Android). Títulos em bold, corpo em regular.

---

## Lista de Telas

### 1. Splash / Onboarding
- Logo F3Fitness centralizado com fundo escuro
- Animação de entrada suave
- Botões "Entrar" e "Criar conta"

### 2. Login / Cadastro
- Formulário de e-mail e senha
- Login social (Google)
- Link para recuperação de senha
- Navegação para cadastro

### 3. Home (Tab: Início)
- **Header:** Logo F3Fitness + ícone de notificação + ícone de busca
- **Banner de promoção:** Carrossel horizontal com ofertas e cupons
- **Categorias rápidas:** Chips horizontais (Tops, Leggings, Shorts, Sutiãs, Acessórios)
- **Seção "Novidades":** Grid 2 colunas com cards de produto
- **Seção "Mais Vendidos":** Lista horizontal com cards
- **Banner de cupom:** Card destacado com código de desconto

### 4. Catálogo / Busca (Tab: Loja)
- **Barra de busca** no topo
- **Filtros:** Bottom sheet com opções de categoria, tamanho, cor, preço
- **Ordenação:** Dropdown (Relevância, Menor preço, Maior preço, Novidades)
- **Grid de produtos:** 2 colunas com cards (imagem, nome, preço, badge de desconto)
- **Paginação infinita** com FlatList

### 5. Detalhes do Produto
- **Carrossel de imagens** full-width no topo
- **Nome e preço** com badge de desconto
- **Seletor de tamanho:** Chips horizontais (PP, P, M, G, GG)
- **Seletor de cor:** Círculos coloridos
- **Descrição** expansível
- **Botão "Adicionar ao carrinho"** fixo no bottom
- **Botão de favoritar** no header

### 6. Carrinho (Tab: Carrinho)
- **Lista de itens:** Imagem, nome, tamanho, cor, quantidade, preço
- **Controles de quantidade:** Botões + e -
- **Resumo do pedido:** Subtotal, frete, desconto, total
- **Campo de cupom:** Input com botão "Aplicar"
- **Botão "Finalizar compra"** fixo no bottom

### 7. Favoritos (Tab: Favoritos)
- Grid 2 colunas com produtos favoritados
- Botão de remover em cada card
- Estado vazio com CTA para explorar

### 8. Perfil (Tab: Perfil)
- **Avatar e nome** do usuário
- **Seções:** Meus Pedidos, Endereços, Pagamentos, Notificações, Ajuda, Sair
- **Histórico de pedidos:** Lista com status (Processando, Enviado, Entregue)

### 9. Checkout
- **Endereço de entrega:** Seleção/cadastro
- **Método de pagamento:** Cartão, PIX, Boleto
- **Resumo final** do pedido
- **Confirmação:** Tela de sucesso com número do pedido

---

## Fluxos Principais

### Fluxo de Compra
1. Home → tap no produto → Detalhes do Produto
2. Selecionar tamanho e cor → "Adicionar ao carrinho"
3. Tab Carrinho → revisar itens → aplicar cupom
4. "Finalizar compra" → Checkout → Confirmação

### Fluxo de Favoritos
1. Qualquer card de produto → tap no coração
2. Tab Favoritos → visualizar lista
3. Tap no produto → Detalhes → Adicionar ao carrinho

### Fluxo de Busca
1. Tab Loja → tap na barra de busca
2. Digitar termo → resultados em tempo real
3. Aplicar filtros → Grid de produtos

---

## Componentes Reutilizáveis

| Componente | Descrição |
|-----------|-----------|
| `ProductCard` | Card de produto com imagem, nome, preço, badge |
| `CategoryChip` | Chip de categoria com ícone |
| `SizeSelector` | Seletor de tamanho em chips |
| `ColorSelector` | Seletor de cor em círculos |
| `CartItem` | Item do carrinho com controles |
| `PromoBanner` | Banner de promoção com gradiente |
| `PriceTag` | Exibição de preço com desconto |
| `EmptyState` | Estado vazio com ilustração e CTA |

---

## Princípios de UX

- **One-handed usage:** Ações principais sempre no terço inferior da tela
- **Visual hierarchy:** Imagens grandes, preços em destaque, CTAs em vermelho
- **Feedback imediato:** Animações de press, loading states, toasts de confirmação
- **Consistência:** Espaçamento de 4/8/16/24px, bordas arredondadas de 8/12/16px
