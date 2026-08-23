export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  category: string;
  images: string[];
  sizes: string[];
  colors: { name: string; hex: string }[];
  description: string;
  isFeatured?: boolean;
  isNew?: boolean;
  rating: number;
  reviews: number;
}

export const CATEGORIES = [
  { id: 'all', name: 'Todos', icon: 'grid-view' },
  { id: 'tops', name: 'Tops', icon: 'fitness-center' },
  { id: 'leggings', name: 'Leggings', icon: 'straighten' },
  { id: 'shorts', name: 'Shorts', icon: 'sports' },
  { id: 'bras', name: 'Sutiãs', icon: 'favorite' },
  { id: 'accessories', name: 'Acessórios', icon: 'watch' },
];

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Top Fitness Compressão Pro',
    price: 89.90,
    originalPrice: 129.90,
    discount: 31,
    category: 'tops',
    images: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=500&fit=crop',
    ],
    sizes: ['PP', 'P', 'M', 'G', 'GG'],
    colors: [
      { name: 'Preto', hex: '#000000' },
      { name: 'Vermelho', hex: '#E63946' },
      { name: 'Cinza', hex: '#6B7280' },
    ],
    description: 'Top de alta compressão ideal para treinos intensos. Tecido tecnológico com proteção UV50+ e secagem rápida. Perfeito para academia, crossfit e corrida.',
    isFeatured: true,
    isNew: false,
    rating: 4.8,
    reviews: 234,
  },
  {
    id: '2',
    name: 'Legging Sculpt Power',
    price: 149.90,
    originalPrice: 199.90,
    discount: 25,
    category: 'leggings',
    images: [
      'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400&h=500&fit=crop',
    ],
    sizes: ['PP', 'P', 'M', 'G', 'GG'],
    colors: [
      { name: 'Preto', hex: '#000000' },
      { name: 'Marinho', hex: '#1E3A5F' },
      { name: 'Rosa', hex: '#F472B6' },
    ],
    description: 'Legging modeladora com efeito sculpt que define e valoriza as curvas. Cintura alta com cós largo anti-derrapante. Tecido com 4 vias de elasticidade.',
    isFeatured: true,
    isNew: true,
    rating: 4.9,
    reviews: 512,
  },
  {
    id: '3',
    name: 'Short Run Performance',
    price: 79.90,
    originalPrice: 99.90,
    discount: 20,
    category: 'shorts',
    images: [
      'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=500&fit=crop',
    ],
    sizes: ['PP', 'P', 'M', 'G', 'GG'],
    colors: [
      { name: 'Preto', hex: '#000000' },
      { name: 'Vermelho', hex: '#E63946' },
      { name: 'Branco', hex: '#FFFFFF' },
    ],
    description: 'Short leve e respirável para corrida e treinos ao ar livre. Bolso lateral com zíper e forro interno embutido. Secagem ultra-rápida.',
    isFeatured: false,
    isNew: true,
    rating: 4.6,
    reviews: 189,
  },
  {
    id: '4',
    name: 'Sutiã Esportivo Impact',
    price: 119.90,
    originalPrice: 159.90,
    discount: 25,
    category: 'bras',
    images: [
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=500&fit=crop',
    ],
    sizes: ['PP', 'P', 'M', 'G', 'GG'],
    colors: [
      { name: 'Preto', hex: '#000000' },
      { name: 'Coral', hex: '#FF6B6B' },
      { name: 'Verde', hex: '#10B981' },
    ],
    description: 'Sutiã de alto impacto com alças reguláveis e bojo removível. Ideal para atividades de alta intensidade como crossfit, jump e corrida.',
    isFeatured: true,
    isNew: false,
    rating: 4.7,
    reviews: 321,
  },
  {
    id: '5',
    name: 'Conjunto Fitness Luxo',
    price: 219.90,
    originalPrice: 299.90,
    discount: 27,
    category: 'tops',
    images: [
      'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&h=500&fit=crop',
    ],
    sizes: ['PP', 'P', 'M', 'G', 'GG'],
    colors: [
      { name: 'Preto', hex: '#000000' },
      { name: 'Nude', hex: '#D4A574' },
    ],
    description: 'Conjunto completo com top e legging de tecido premium. Acabamento de luxo com detalhes em tela e recortes estratégicos que valorizam o corpo.',
    isFeatured: true,
    isNew: true,
    rating: 4.9,
    reviews: 98,
  },
  {
    id: '6',
    name: 'Mochila Fitness Pro',
    price: 159.90,
    originalPrice: 199.90,
    discount: 20,
    category: 'accessories',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=400&h=500&fit=crop',
    ],
    sizes: ['Único'],
    colors: [
      { name: 'Preto', hex: '#000000' },
      { name: 'Cinza', hex: '#6B7280' },
    ],
    description: 'Mochila esportiva com compartimento para notebook, bolso para garrafa e material impermeável. Capacidade de 25L, ideal para academia e viagens.',
    isFeatured: false,
    isNew: false,
    rating: 4.5,
    reviews: 156,
  },
  {
    id: '7',
    name: 'Legging Seamless Glow',
    price: 169.90,
    originalPrice: 219.90,
    discount: 23,
    category: 'leggings',
    images: [
      'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=500&fit=crop',
    ],
    sizes: ['PP', 'P', 'M', 'G', 'GG'],
    colors: [
      { name: 'Lilás', hex: '#A78BFA' },
      { name: 'Rosa', hex: '#F472B6' },
      { name: 'Preto', hex: '#000000' },
    ],
    description: 'Legging sem costura com tecnologia seamless para máximo conforto. Tecido com efeito brilhante e modelador. Cintura alta com detalhe em tela.',
    isFeatured: false,
    isNew: true,
    rating: 4.8,
    reviews: 267,
  },
  {
    id: '8',
    name: 'Garrafa Térmica Sport 750ml',
    price: 59.90,
    originalPrice: 79.90,
    discount: 25,
    category: 'accessories',
    images: [
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop',
    ],
    sizes: ['750ml'],
    colors: [
      { name: 'Preto', hex: '#000000' },
      { name: 'Vermelho', hex: '#E63946' },
      { name: 'Prata', hex: '#9CA3AF' },
    ],
    description: 'Garrafa térmica de aço inoxidável com capacidade de 750ml. Mantém a temperatura por até 24h. Tampa com alça para fácil transporte.',
    isFeatured: false,
    isNew: false,
    rating: 4.6,
    reviews: 423,
  },
];

export const BANNERS = [
  {
    id: '1',
    title: 'NOVA COLEÇÃO',
    subtitle: 'Verão 2025',
    description: 'Descubra os novos lançamentos',
    backgroundColor: '#E63946',
    textColor: '#FFFFFF',
    badge: 'ATÉ 40% OFF',
  },
  {
    id: '2',
    title: 'FRETE GRÁTIS',
    subtitle: 'Acima de R$ 199',
    description: 'Em todo o Brasil',
    backgroundColor: '#111111',
    textColor: '#FFFFFF',
    badge: 'APROVEITE',
  },
  {
    id: '3',
    title: 'CUPOM EXCLUSIVO',
    subtitle: 'Use: F3APP',
    description: '5% OFF na primeira compra',
    backgroundColor: '#1E3A5F',
    textColor: '#FFFFFF',
    badge: '5% OFF',
  },
];
