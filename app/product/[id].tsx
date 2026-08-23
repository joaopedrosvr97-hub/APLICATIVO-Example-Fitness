import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { useFavorites } from '@/lib/favorites-context';
import { useCart } from '@/lib/cart-context';
import { PRODUCTS } from '@/lib/data/products';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addItem } = useCart();

  const product = PRODUCTS.find((p) => p.id === id);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<{ name: string; hex: string } | null>(null);
  const [descExpanded, setDescExpanded] = useState(false);

  if (!product) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFoundText, { color: colors.foreground }]}>Produto não encontrado</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={[styles.backLink, { color: colors.primary }]}>Voltar</Text>
        </Pressable>
      </View>
    );
  }

  const favorited = isFavorite(product.id);

  const handleAddToCart = () => {
    if (!selectedSize) {
      Alert.alert('Selecione um tamanho', 'Por favor, selecione o tamanho antes de adicionar ao carrinho.');
      return;
    }
    if (!selectedColor) {
      Alert.alert('Selecione uma cor', 'Por favor, selecione a cor antes de adicionar ao carrinho.');
      return;
    }
    addItem({
      id: `${product.id}-${selectedSize}-${selectedColor.name}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      size: selectedSize,
      color: selectedColor.name,
      colorHex: selectedColor.hex,
      quantity: 1,
    });
    Alert.alert('Adicionado!', `${product.name} foi adicionado ao carrinho.`, [
      { text: 'Continuar comprando', style: 'cancel' },
      { text: 'Ver carrinho', onPress: () => router.push('/cart' as any) },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header overlay */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable
          style={[styles.headerBtn, { backgroundColor: colors.background }]}
          onPress={() => router.back()}
        >
          <IconSymbol name="chevron.left" size={22} color={colors.foreground} />
        </Pressable>
        <Pressable
          style={[styles.headerBtn, { backgroundColor: colors.background }]}
          onPress={() => toggleFavorite(product.id)}
        >
          <IconSymbol
            name={favorited ? 'heart.fill' : 'heart'}
            size={22}
            color={favorited ? colors.primary : colors.foreground}
          />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Carousel */}
        <View style={styles.imageSection}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const page = Math.round(e.nativeEvent.contentOffset.x / width);
              setSelectedImage(page);
            }}
          >
            {product.images.map((img, i) => (
              <Image key={i} source={{ uri: img }} style={styles.mainImage} resizeMode="cover" />
            ))}
          </ScrollView>

          {/* Image dots */}
          {product.images.length > 1 && (
            <View style={styles.imageDots}>
              {product.images.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.imageDot,
                    { backgroundColor: i === selectedImage ? colors.primary : 'rgba(255,255,255,0.6)' },
                  ]}
                />
              ))}
            </View>
          )}

          {/* Badges */}
          {product.discount && (
            <View style={[styles.discountBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.discountText}>-{product.discount}%</Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={[styles.infoSection, { backgroundColor: colors.background }]}>
          {/* Name & Price */}
          <View style={styles.nameRow}>
            <Text style={[styles.productName, { color: colors.foreground }]}>{product.name}</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: colors.primary }]}>
              R$ {product.price.toFixed(2).replace('.', ',')}
            </Text>
            {product.originalPrice && (
              <Text style={[styles.originalPrice, { color: colors.muted }]}>
                R$ {product.originalPrice.toFixed(2).replace('.', ',')}
              </Text>
            )}
          </View>

          {/* Rating */}
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <IconSymbol
                key={star}
                name={star <= Math.floor(product.rating) ? 'star.fill' : 'star'}
                size={14}
                color={star <= Math.floor(product.rating) ? '#F59E0B' : colors.border}
              />
            ))}
            <Text style={[styles.ratingText, { color: colors.muted }]}>
              {product.rating} ({product.reviews} avaliações)
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Size Selector */}
          <Text style={[styles.selectorLabel, { color: colors.foreground }]}>
            Tamanho{selectedSize ? `: ${selectedSize}` : ''}
          </Text>
          <View style={styles.sizeRow}>
            {product.sizes.map((size) => (
              <Pressable
                key={size}
                style={[
                  styles.sizeChip,
                  {
                    backgroundColor: selectedSize === size ? colors.primary : colors.surface,
                    borderColor: selectedSize === size ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelectedSize(size)}
              >
                <Text style={[styles.sizeChipText, { color: selectedSize === size ? '#FFFFFF' : colors.foreground }]}>
                  {size}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Color Selector */}
          <Text style={[styles.selectorLabel, { color: colors.foreground }]}>
            Cor{selectedColor ? `: ${selectedColor.name}` : ''}
          </Text>
          <View style={styles.colorRow}>
            {product.colors.map((color) => (
              <Pressable
                key={color.name}
                style={[
                  styles.colorCircle,
                  { backgroundColor: color.hex },
                  selectedColor?.name === color.name && styles.colorCircleSelected,
                  color.hex === '#FFFFFF' && { borderWidth: 1, borderColor: '#E5E7EB' },
                ]}
                onPress={() => setSelectedColor(color)}
              >
                {selectedColor?.name === color.name && (
                  <IconSymbol
                    name="checkmark"
                    size={14}
                    color={color.hex === '#FFFFFF' || color.hex === '#F5F5F5' ? '#000' : '#FFF'}
                  />
                )}
              </Pressable>
            ))}
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Description */}
          <Text style={[styles.selectorLabel, { color: colors.foreground }]}>Descrição</Text>
          <Text
            style={[styles.description, { color: colors.muted }]}
            numberOfLines={descExpanded ? undefined : 3}
          >
            {product.description}
          </Text>
          <Pressable onPress={() => setDescExpanded(!descExpanded)}>
            <Text style={[styles.expandBtn, { color: colors.primary }]}>
              {descExpanded ? 'Ver menos' : 'Ver mais'}
            </Text>
          </Pressable>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Shipping Info */}
          <View style={styles.shippingInfo}>
            <IconSymbol name="truck.box.fill" size={18} color={colors.success} />
            <Text style={[styles.shippingText, { color: colors.foreground }]}>
              Frete grátis em compras acima de R$ 199
            </Text>
          </View>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.bottomBar, { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: insets.bottom + 12 }]}>
        <Pressable
          style={({ pressed }) => [
            styles.addToCartBtn,
            { backgroundColor: colors.primary, transform: [{ scale: pressed ? 0.97 : 1 }] },
          ]}
          onPress={handleAddToCart}
        >
          <IconSymbol name="cart.fill" size={20} color="#FFFFFF" />
          <Text style={styles.addToCartText}>Adicionar ao carrinho</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  notFoundText: {
    fontSize: 18,
    fontWeight: '600',
  },
  backLink: {
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  imageSection: {
    position: 'relative',
  },
  mainImage: {
    width,
    height: width * 1.2,
  },
  imageDots: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  imageDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  discountBadge: {
    position: 'absolute',
    top: 80,
    left: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  infoSection: {
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
  },
  nameRow: {
    marginBottom: 8,
  },
  productName: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
    marginBottom: 8,
  },
  price: {
    fontSize: 26,
    fontWeight: '900',
  },
  originalPrice: {
    fontSize: 16,
    textDecorationLine: 'line-through',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 13,
    marginLeft: 4,
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  selectorLabel: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
  sizeRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  sizeChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    minWidth: 52,
    alignItems: 'center',
  },
  sizeChipText: {
    fontSize: 14,
    fontWeight: '700',
  },
  colorRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorCircleSelected: {
    borderWidth: 3,
    borderColor: '#E63946',
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 8,
  },
  expandBtn: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  shippingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  shippingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 0.5,
  },
  addToCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 16,
  },
  addToCartText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
