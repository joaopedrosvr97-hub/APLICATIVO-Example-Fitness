import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { useCart, CartItem } from '@/lib/cart-context';

function CartItemRow({ item }: { item: CartItem }) {
  const colors = useColors();
  const { updateQuantity, removeItem } = useCart();

  return (
    <View style={[styles.cartItem, { backgroundColor: colors.surface }]}>
      <Image source={{ uri: item.image }} style={styles.itemImage} resizeMode="cover" />
      <View style={styles.itemInfo}>
        <Text style={[styles.itemName, { color: colors.foreground }]} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={styles.itemMeta}>
          <View style={[styles.metaBadge, { backgroundColor: colors.background }]}>
            <Text style={[styles.metaBadgeText, { color: colors.muted }]}>Tam: {item.size}</Text>
          </View>
          <View style={[styles.colorDot, { backgroundColor: item.colorHex }]} />
          <Text style={[styles.metaBadgeText, { color: colors.muted }]}>{item.color}</Text>
        </View>
        <Text style={[styles.itemPrice, { color: colors.primary }]}>
          R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
        </Text>
        <View style={styles.quantityRow}>
          <Pressable
            style={[styles.qtyBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
            onPress={() => updateQuantity(item.id, item.quantity - 1)}
          >
            <IconSymbol name="minus" size={14} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.qtyText, { color: colors.foreground }]}>{item.quantity}</Text>
          <Pressable
            style={[styles.qtyBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
            onPress={() => updateQuantity(item.id, item.quantity + 1)}
          >
            <IconSymbol name="plus" size={14} color={colors.foreground} />
          </Pressable>
          <Pressable
            style={[styles.removeBtn, { backgroundColor: colors.background }]}
            onPress={() => removeItem(item.id)}
          >
            <IconSymbol name="trash.fill" size={16} color={colors.error} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default function CartScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, applyCoupon, removeCoupon, subtotal, shipping, discount, total, totalItems } = useCart();
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  const handleApplyCoupon = () => {
    if (!couponInput.trim()) return;
    const success = applyCoupon(couponInput.trim());
    if (success) {
      setCouponError('');
      setCouponInput('');
    } else {
      setCouponError('Cupom inválido. Tente: F3APP, F3FITNESS ou PRIMEIRACOMPRA');
    }
  };

  if (state.items.length === 0) {
    return (
      <ScreenContainer containerClassName="bg-background">
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.foreground }]}>Carrinho</Text>
        </View>
        <View style={styles.emptyState}>
          <IconSymbol name="cart.fill" size={64} color={colors.border} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Seu carrinho está vazio</Text>
          <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
            Adicione produtos para continuar comprando
          </Text>
          <Pressable
            style={[styles.shopBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/shop' as any)}
          >
            <Text style={styles.shopBtnText}>Explorar produtos</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer containerClassName="bg-background">
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Carrinho ({totalItems})
        </Text>
      </View>

      <FlatList
        data={state.items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <CartItemRow item={item} />}
        ListFooterComponent={
          <View>
            {/* Coupon */}
            <View style={[styles.couponSection, { backgroundColor: colors.surface }]}>
              <Text style={[styles.couponLabel, { color: colors.foreground }]}>Cupom de desconto</Text>
              {state.couponCode ? (
                <View style={styles.appliedCoupon}>
                  <View style={[styles.couponAppliedBadge, { backgroundColor: colors.success + '20' }]}>
                    <IconSymbol name="tag.fill" size={16} color={colors.success} />
                    <Text style={[styles.couponAppliedText, { color: colors.success }]}>
                      {state.couponCode} — {state.couponDiscount}% OFF aplicado!
                    </Text>
                  </View>
                  <Pressable onPress={removeCoupon}>
                    <IconSymbol name="xmark" size={18} color={colors.muted} />
                  </Pressable>
                </View>
              ) : (
                <View>
                  <View style={[styles.couponInput, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <TextInput
                      style={[styles.couponTextInput, { color: colors.foreground }]}
                      placeholder="Digite o cupom"
                      placeholderTextColor={colors.muted}
                      value={couponInput}
                      onChangeText={(t) => { setCouponInput(t); setCouponError(''); }}
                      autoCapitalize="characters"
                      returnKeyType="done"
                      onSubmitEditing={handleApplyCoupon}
                    />
                    <Pressable
                      style={[styles.couponApplyBtn, { backgroundColor: colors.primary }]}
                      onPress={handleApplyCoupon}
                    >
                      <Text style={styles.couponApplyText}>Aplicar</Text>
                    </Pressable>
                  </View>
                  {couponError ? (
                    <Text style={[styles.couponError, { color: colors.error }]}>{couponError}</Text>
                  ) : null}
                </View>
              )}
            </View>

            {/* Order Summary */}
            <View style={[styles.summary, { backgroundColor: colors.surface }]}>
              <Text style={[styles.summaryTitle, { color: colors.foreground }]}>Resumo do pedido</Text>

              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.muted }]}>Subtotal</Text>
                <Text style={[styles.summaryValue, { color: colors.foreground }]}>
                  R$ {subtotal.toFixed(2).replace('.', ',')}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.muted }]}>Frete</Text>
                <Text style={[styles.summaryValue, { color: shipping === 0 ? colors.success : colors.foreground }]}>
                  {shipping === 0 ? 'Grátis' : `R$ ${shipping.toFixed(2).replace('.', ',')}`}
                </Text>
              </View>

              {discount > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.success }]}>Desconto ({state.couponDiscount}%)</Text>
                  <Text style={[styles.summaryValue, { color: colors.success }]}>
                    -R$ {discount.toFixed(2).replace('.', ',')}
                  </Text>
                </View>
              )}

              <View style={[styles.totalDivider, { backgroundColor: colors.border }]} />

              <View style={styles.summaryRow}>
                <Text style={[styles.totalLabel, { color: colors.foreground }]}>Total</Text>
                <Text style={[styles.totalValue, { color: colors.primary }]}>
                  R$ {total.toFixed(2).replace('.', ',')}
                </Text>
              </View>

              {subtotal < 199 && (
                <View style={[styles.freeShippingHint, { backgroundColor: colors.warning + '20' }]}>
                  <IconSymbol name="truck.box.fill" size={14} color={colors.warning} />
                  <Text style={[styles.freeShippingText, { color: colors.warning }]}>
                    Falta R$ {(199 - subtotal).toFixed(2).replace('.', ',')} para frete grátis!
                  </Text>
                </View>
              )}
            </View>

            <View style={{ height: 120 }} />
          </View>
        }
      />

      {/* Checkout Button */}
      <View style={[styles.checkoutBar, { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: insets.bottom + 12 }]}>
        <Pressable
          style={({ pressed }) => [
            styles.checkoutBtn,
            { backgroundColor: colors.primary, transform: [{ scale: pressed ? 0.97 : 1 }] },
          ]}
          onPress={() => router.push('/checkout' as any)}
        >
          <Text style={styles.checkoutBtnText}>Finalizar compra</Text>
          <Text style={styles.checkoutBtnPrice}>R$ {total.toFixed(2).replace('.', ',')}</Text>
        </Pressable>
      </View>
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
  listContent: {
    padding: 16,
    gap: 12,
  },
  cartItem: {
    flexDirection: 'row',
    borderRadius: 16,
    overflow: 'hidden',
    gap: 12,
    padding: 12,
  },
  itemImage: {
    width: 90,
    height: 110,
    borderRadius: 10,
  },
  itemInfo: {
    flex: 1,
    gap: 6,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  metaBadgeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qtyBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontSize: 16,
    fontWeight: '700',
    minWidth: 24,
    textAlign: 'center',
  },
  removeBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
  },
  couponSection: {
    borderRadius: 16,
    padding: 16,
    marginTop: 4,
    gap: 10,
  },
  couponLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  appliedCoupon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  couponAppliedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  couponAppliedText: {
    fontSize: 13,
    fontWeight: '600',
  },
  couponInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  couponTextInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  couponApplyBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  couponApplyText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  couponError: {
    fontSize: 12,
    marginTop: 6,
  },
  summary: {
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    gap: 10,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalDivider: {
    height: 1,
    marginVertical: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '900',
  },
  freeShippingHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  freeShippingText: {
    fontSize: 12,
    fontWeight: '600',
  },
  checkoutBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 0.5,
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  checkoutBtnPrice: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
});
