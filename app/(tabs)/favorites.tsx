import React from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ProductCard } from '@/components/product-card';
import { useColors } from '@/hooks/use-colors';
import { useFavorites } from '@/lib/favorites-context';
import { PRODUCTS } from '@/lib/data/products';

export default function FavoritesScreen() {
  const colors = useColors();
  const router = useRouter();
  const { favorites } = useFavorites();

  const favoriteProducts = PRODUCTS.filter((p) => favorites.includes(p.id));

  return (
    <ScreenContainer containerClassName="bg-background">
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Favoritos {favoriteProducts.length > 0 ? `(${favoriteProducts.length})` : ''}
        </Text>
      </View>

      {favoriteProducts.length === 0 ? (
        <View style={styles.emptyState}>
          <IconSymbol name="heart.fill" size={64} color={colors.border} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Nenhum favorito ainda</Text>
          <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
            Toque no coração dos produtos para salvá-los aqui
          </Text>
          <Pressable
            style={[styles.shopBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/shop' as any)}
          >
            <Text style={styles.shopBtnText}>Explorar produtos</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={favoriteProducts}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <ProductCard product={item} />
            </View>
          )}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  shopBtn: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 8,
  },
  shopBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  grid: {
    padding: 16,
  },
  row: {
    gap: 16,
    justifyContent: 'space-between',
  },
  cardWrapper: {
    flex: 1,
  },
});
