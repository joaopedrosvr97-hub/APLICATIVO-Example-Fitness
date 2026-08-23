import React from 'react';
import { View, Text, Pressable, StyleSheet, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { useFavorites } from '@/lib/favorites-context';
import type { Product } from '@/lib/data/products';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface ProductCardProps {
  product: Product;
  style?: object;
}

export function ProductCard({ product, style }: ProductCardProps) {
  const colors = useColors();
  const router = useRouter();
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(product.id);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: colors.surface, width: CARD_WIDTH },
        pressed && { opacity: 0.85 },
        style,
      ]}
      onPress={() => router.push(`/product/${product.id}` as any)}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.images[0] }}
          style={styles.image}
          resizeMode="cover"
        />
        {product.discount && (
          <View style={[styles.discountBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.discountText}>-{product.discount}%</Text>
          </View>
        )}
        {product.isNew && !product.discount && (
          <View style={[styles.newBadge, { backgroundColor: '#10B981' }]}>
            <Text style={styles.discountText}>NOVO</Text>
          </View>
        )}
        <Pressable
          style={[styles.favoriteBtn, { backgroundColor: colors.background }]}
          onPress={() => toggleFavorite(product.id)}
          hitSlop={8}
        >
          <IconSymbol
            name={favorited ? 'heart.fill' : 'heart'}
            size={18}
            color={favorited ? colors.primary : colors.muted}
          />
        </Pressable>
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={2}>
          {product.name}
        </Text>
        <View style={styles.priceRow}>
          <Text style={[styles.price, { color: colors.primary }]}>
            R$ {product.price.toFixed(2).replace('.', ',')}
          </Text>
        </View>
        {product.originalPrice && (
          <Text style={[styles.originalPrice, { color: colors.muted }]}>
            R$ {product.originalPrice.toFixed(2).replace('.', ',')}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 3 / 4,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  favoriteBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  info: {
    padding: 10,
  },
  name: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
  },
  originalPrice: {
    fontSize: 11,
    textDecorationLine: 'line-through',
    marginTop: 1,
  },
});
