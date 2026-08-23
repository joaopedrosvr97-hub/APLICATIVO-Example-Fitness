import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ProductCard } from '@/components/product-card';
import { useColors } from '@/hooks/use-colors';
import { PRODUCTS, CATEGORIES } from '@/lib/data/products';

const SORT_OPTIONS = [
  { id: 'relevance', label: 'Relevância' },
  { id: 'price_asc', label: 'Menor preço' },
  { id: 'price_desc', label: 'Maior preço' },
  { id: 'newest', label: 'Novidades' },
  { id: 'discount', label: 'Maior desconto' },
];

const SIZES = ['PP', 'P', 'M', 'G', 'GG'];

export default function ShopScreen() {
  const colors = useColors();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState('');

  const filteredProducts = useMemo(() => {
    let result = [...PRODUCTS];

    if (search.trim()) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (activeCategory !== 'all') {
      result = result.filter((p) => p.category === activeCategory);
    }

    if (selectedSizes.length > 0) {
      result = result.filter((p) => p.sizes.some((s) => selectedSizes.includes(s)));
    }

    if (maxPrice && !isNaN(parseFloat(maxPrice))) {
      result = result.filter((p) => p.price <= parseFloat(maxPrice));
    }

    switch (sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      case 'discount':
        result.sort((a, b) => (b.discount || 0) - (a.discount || 0));
        break;
    }

    return result;
  }, [search, activeCategory, sortBy, selectedSizes, maxPrice]);

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const activeFiltersCount =
    (activeCategory !== 'all' ? 1 : 0) +
    selectedSizes.length +
    (maxPrice ? 1 : 0);

  const clearFilters = () => {
    setActiveCategory('all');
    setSelectedSizes([]);
    setMaxPrice('');
    setSortBy('relevance');
  };

  return (
    <ScreenContainer containerClassName="bg-background">
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Loja</Text>
        <Pressable
          style={({ pressed }) => [
            styles.filterBtn,
            { backgroundColor: activeFiltersCount > 0 ? colors.primary : colors.surface, opacity: pressed ? 0.8 : 1 },
          ]}
          onPress={() => setShowFilters(true)}
        >
          <IconSymbol name="slider.horizontal.3" size={18} color={activeFiltersCount > 0 ? '#FFFFFF' : colors.foreground} />
          {activeFiltersCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View style={[styles.searchBar, { backgroundColor: colors.surface }]}>
          <IconSymbol name="magnifyingglass" size={18} color={colors.muted} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Buscar produtos..."
            placeholderTextColor={colors.muted}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')}>
              <IconSymbol name="xmark" size={16} color={colors.muted} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Categories */}
      <View style={[styles.categoriesWrapper, { backgroundColor: colors.background }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesRow}>
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat.id}
              style={({ pressed }) => [
                styles.chip,
                {
                  backgroundColor: activeCategory === cat.id ? colors.primary : colors.surface,
                  borderColor: activeCategory === cat.id ? colors.primary : colors.border,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
              onPress={() => setActiveCategory(cat.id)}
            >
              <Text style={[styles.chipText, { color: activeCategory === cat.id ? '#FFFFFF' : colors.foreground }]}>
                {cat.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Sort & Results Count */}
      <View style={[styles.sortRow, { backgroundColor: colors.background }]}>
        <Text style={[styles.resultsCount, { color: colors.muted }]}>
          {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.sortOptions}>
            {SORT_OPTIONS.map((opt) => (
              <Pressable
                key={opt.id}
                style={({ pressed }) => [
                  styles.sortChip,
                  {
                    backgroundColor: sortBy === opt.id ? colors.primary : colors.surface,
                    borderColor: sortBy === opt.id ? colors.primary : colors.border,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                onPress={() => setSortBy(opt.id)}
              >
                <Text style={[styles.sortChipText, { color: sortBy === opt.id ? '#FFFFFF' : colors.muted }]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Products Grid */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <IconSymbol name="magnifyingglass" size={48} color={colors.muted} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Nenhum produto encontrado</Text>
            <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
              Tente outros termos ou remova os filtros
            </Text>
            <Pressable
              style={[styles.clearBtn, { backgroundColor: colors.primary }]}
              onPress={clearFilters}
            >
              <Text style={styles.clearBtnText}>Limpar filtros</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <ProductCard product={item} />
          </View>
        )}
      />

      {/* Filters Modal */}
      <Modal visible={showFilters} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>Filtros</Text>
              <Pressable onPress={() => setShowFilters(false)}>
                <IconSymbol name="xmark" size={22} color={colors.foreground} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody}>
              {/* Category Filter */}
              <Text style={[styles.filterLabel, { color: colors.foreground }]}>Categoria</Text>
              <View style={styles.filterChips}>
                {CATEGORIES.map((cat) => (
                  <Pressable
                    key={cat.id}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor: activeCategory === cat.id ? colors.primary : colors.surface,
                        borderColor: activeCategory === cat.id ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setActiveCategory(cat.id)}
                  >
                    <Text style={[styles.filterChipText, { color: activeCategory === cat.id ? '#FFFFFF' : colors.foreground }]}>
                      {cat.name}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Size Filter */}
              <Text style={[styles.filterLabel, { color: colors.foreground }]}>Tamanho</Text>
              <View style={styles.filterChips}>
                {SIZES.map((size) => (
                  <Pressable
                    key={size}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor: selectedSizes.includes(size) ? colors.primary : colors.surface,
                        borderColor: selectedSizes.includes(size) ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => toggleSize(size)}
                  >
                    <Text style={[styles.filterChipText, { color: selectedSizes.includes(size) ? '#FFFFFF' : colors.foreground }]}>
                      {size}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Price Filter */}
              <Text style={[styles.filterLabel, { color: colors.foreground }]}>Preço máximo (R$)</Text>
              <TextInput
                style={[styles.priceInput, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
                placeholder="Ex: 200"
                placeholderTextColor={colors.muted}
                value={maxPrice}
                onChangeText={setMaxPrice}
                keyboardType="numeric"
                returnKeyType="done"
              />
            </ScrollView>

            <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
              <Pressable
                style={[styles.clearFiltersBtn, { borderColor: colors.border }]}
                onPress={() => { clearFilters(); setShowFilters(false); }}
              >
                <Text style={[styles.clearFiltersBtnText, { color: colors.foreground }]}>Limpar</Text>
              </Pressable>
              <Pressable
                style={[styles.applyBtn, { backgroundColor: colors.primary }]}
                onPress={() => setShowFilters(false)}
              >
                <Text style={styles.applyBtnText}>Aplicar filtros</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
    position: 'relative',
  },
  filterBadge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#E63946',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
  },
  categoriesWrapper: {
    paddingVertical: 10,
    borderBottomWidth: 0.5,
  },
  categoriesRow: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
    borderBottomWidth: 0.5,
  },
  resultsCount: {
    fontSize: 13,
    fontWeight: '500',
    minWidth: 80,
  },
  sortOptions: {
    flexDirection: 'row',
    gap: 6,
  },
  sortChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
  },
  sortChipText: {
    fontSize: 12,
    fontWeight: '500',
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  clearBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 8,
  },
  clearBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 0.5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalBody: {
    padding: 20,
    gap: 4,
  },
  filterLabel: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 10,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  priceInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 0.5,
  },
  clearFiltersBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  clearFiltersBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  applyBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
