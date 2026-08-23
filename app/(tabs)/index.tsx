import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  Pressable,
  StyleSheet,
  Dimensions,
  Image,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ProductCard } from '@/components/product-card';
import { useColors } from '@/hooks/use-colors';
import { PRODUCTS, BANNERS, CATEGORIES } from '@/lib/data/products';

const { width } = Dimensions.get('window');

function PromoBanner({ banner }: { banner: typeof BANNERS[0] }) {
  return (
    <View style={[styles.banner, { backgroundColor: banner.backgroundColor }]}>
      <View style={styles.bannerContent}>
        <View style={[styles.bannerBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
          <Text style={[styles.bannerBadgeText, { color: banner.textColor }]}>{banner.badge}</Text>
        </View>
        <Text style={[styles.bannerTitle, { color: banner.textColor }]}>{banner.title}</Text>
        <Text style={[styles.bannerSubtitle, { color: banner.textColor }]}>{banner.subtitle}</Text>
        <Text style={[styles.bannerDesc, { color: banner.textColor, opacity: 0.8 }]}>{banner.description}</Text>
      </View>
      <View style={styles.bannerDecor}>
        <View style={[styles.bannerCircle, { backgroundColor: 'rgba(255,255,255,0.08)' }]} />
        <View style={[styles.bannerCircleSmall, { backgroundColor: 'rgba(255,255,255,0.05)' }]} />
      </View>
    </View>
  );
}

function CategoryChip({ category, isActive, onPress }: { category: typeof CATEGORIES[0]; isActive: boolean; onPress: () => void }) {
  const colors = useColors();
  return (
    <Pressable
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: isActive ? colors.primary : colors.surface,
          borderColor: isActive ? colors.primary : colors.border,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
      onPress={onPress}
    >
      <Text style={[styles.chipText, { color: isActive ? '#FFFFFF' : colors.foreground }]}>
        {category.name}
      </Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('all');
  const [currentBanner, setCurrentBanner] = useState(0);

  const featuredProducts = PRODUCTS.filter((p) => p.isFeatured);
  const newProducts = PRODUCTS.filter((p) => p.isNew);
  const filteredProducts = activeCategory === 'all'
    ? PRODUCTS
    : PRODUCTS.filter((p) => p.category === activeCategory);

  return (
    <ScreenContainer containerClassName="bg-background">
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.logoText, { color: colors.primary }]}>F3</Text>
          <Text style={[styles.logoTextLight, { color: colors.foreground }]}>FITNESS</Text>
        </View>
        <View style={styles.headerRight}>
          <Pressable
            style={({ pressed }) => [styles.headerBtn, pressed && { opacity: 0.6 }]}
            onPress={() => router.push('/shop' as any)}
          >
            <IconSymbol name="magnifyingglass" size={22} color={colors.foreground} />
          </Pressable>
          <Pressable style={({ pressed }) => [styles.headerBtn, pressed && { opacity: 0.6 }]}>
            <IconSymbol name="bell.fill" size={22} color={colors.foreground} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Banners Carrossel */}
        <View style={styles.section}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const page = Math.round(e.nativeEvent.contentOffset.x / (width - 32));
              setCurrentBanner(page);
            }}
          >
            {BANNERS.map((banner) => (
              <View key={banner.id} style={{ width: width - 32 }}>
                <PromoBanner banner={banner} />
              </View>
            ))}
          </ScrollView>
          {/* Dots */}
          <View style={styles.dots}>
            {BANNERS.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor: i === currentBanner ? colors.primary : colors.border,
                    width: i === currentBanner ? 20 : 6,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Banner de Cupom */}
        <View style={[styles.couponBanner, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
          <IconSymbol name="tag.fill" size={20} color={colors.primary} />
          <View style={styles.couponText}>
            <Text style={[styles.couponTitle, { color: colors.foreground }]}>Cupom de boas-vindas!</Text>
            <Text style={[styles.couponCode, { color: colors.primary }]}>Use: F3APP — 5% OFF</Text>
          </View>
          <IconSymbol name="chevron.right" size={18} color={colors.muted} />
        </View>

        {/* Categorias */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Categorias</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesRow}>
            {CATEGORIES.map((cat) => (
              <CategoryChip
                key={cat.id}
                category={cat}
                isActive={activeCategory === cat.id}
                onPress={() => setActiveCategory(cat.id)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Novidades */}
        {newProducts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Novidades</Text>
              <Pressable onPress={() => router.push('/shop' as any)}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>Ver todos</Text>
              </Pressable>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
              {newProducts.map((product) => (
                <Pressable
                  key={product.id}
                  style={({ pressed }) => [
                    styles.horizontalCard,
                    { backgroundColor: colors.surface, opacity: pressed ? 0.85 : 1 },
                  ]}
                  onPress={() => router.push(`/product/${product.id}` as any)}
                >
                  <Image
                    source={{ uri: product.images[0] }}
                    style={styles.horizontalCardImage}
                    resizeMode="cover"
                  />
                  {product.discount && (
                    <View style={[styles.smallBadge, { backgroundColor: colors.primary }]}>
                      <Text style={styles.smallBadgeText}>-{product.discount}%</Text>
                    </View>
                  )}
                  <View style={styles.horizontalCardInfo}>
                    <Text style={[styles.horizontalCardName, { color: colors.foreground }]} numberOfLines={2}>
                      {product.name}
                    </Text>
                    <Text style={[styles.horizontalCardPrice, { color: colors.primary }]}>
                      R$ {product.price.toFixed(2).replace('.', ',')}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Mais Vendidos / Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              {activeCategory === 'all' ? 'Mais Vendidos' : CATEGORIES.find(c => c.id === activeCategory)?.name}
            </Text>
            <Pressable onPress={() => router.push('/shop' as any)}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>Ver todos</Text>
            </Pressable>
          </View>
          <View style={styles.grid}>
            {filteredProducts.slice(0, 6).map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                style={index % 2 === 0 ? { marginRight: 8 } : { marginLeft: 8 }}
              />
            ))}
          </View>
        </View>

        {/* Frete Grátis Banner */}
        <View style={[styles.freightBanner, { backgroundColor: colors.foreground }]}>
          <IconSymbol name="truck.box.fill" size={24} color={colors.background} />
          <View style={styles.freightText}>
            <Text style={[styles.freightTitle, { color: colors.background }]}>Frete Grátis</Text>
            <Text style={[styles.freightSubtitle, { color: colors.background, opacity: 0.7 }]}>
              Em compras acima de R$ 199
            </Text>
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -1,
  },
  logoTextLight: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  banner: {
    borderRadius: 16,
    padding: 24,
    height: 160,
    overflow: 'hidden',
    position: 'relative',
  },
  bannerContent: {
    zIndex: 1,
  },
  bannerBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
  },
  bannerBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  bannerSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 2,
  },
  bannerDesc: {
    fontSize: 12,
    marginTop: 4,
  },
  bannerDecor: {
    position: 'absolute',
    right: -20,
    top: -20,
    zIndex: 0,
  },
  bannerCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  bannerCircleSmall: {
    width: 80,
    height: 80,
    borderRadius: 40,
    position: 'absolute',
    bottom: -20,
    right: 20,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    marginTop: 10,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  couponBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    marginBottom: 24,
  },
  couponText: {
    flex: 1,
  },
  couponTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  couponCode: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  categoriesRow: {
    gap: 8,
    paddingRight: 16,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  horizontalList: {
    gap: 12,
    paddingRight: 16,
  },
  horizontalCard: {
    width: 140,
    borderRadius: 12,
    overflow: 'hidden',
  },
  horizontalCardImage: {
    width: 140,
    height: 180,
  },
  smallBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  smallBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  horizontalCardInfo: {
    padding: 10,
  },
  horizontalCardName: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    marginBottom: 4,
  },
  horizontalCardPrice: {
    fontSize: 14,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  freightBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 18,
    borderRadius: 16,
    marginBottom: 8,
  },
  freightText: {
    flex: 1,
  },
  freightTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  freightSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
});
