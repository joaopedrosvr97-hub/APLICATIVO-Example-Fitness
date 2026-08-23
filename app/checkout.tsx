import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { AuthGuard } from '@/components/auth-guard';
import { useColors } from '@/hooks/use-colors';
import { useCart } from '@/lib/cart-context';

const PAYMENT_METHODS = [
  { id: 'pix', label: 'PIX', subtitle: '10% OFF adicional', icon: 'qrcode' },
  { id: 'card', label: 'CartÃ£o de crÃ©dito', subtitle: 'AtÃ© 12x sem juros', icon: 'creditcard.fill' },
  { id: 'boleto', label: 'Boleto bancÃ¡rio', subtitle: 'Vence em 3 dias Ãºteis', icon: 'doc.text.fill' },
];

export default function CheckoutScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, subtotal, shipping, discount, total, clearCart } = useCart();

  const [step, setStep] = useState<'address' | 'payment' | 'confirm' | 'success'>('address');
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [address, setAddress] = useState({
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
  });

  const pixDiscount = paymentMethod === 'pix' ? subtotal * 0.1 : 0;
  const finalTotal = total - pixDiscount;

  const handleConfirmOrder = () => {
    setStep('success');
    clearCart();
  };

  if (step === 'success') {
    const orderNumber = `F3-${Date.now().toString().slice(-6)}`;

    return (
      <AuthGuard>
        <View
          style={[styles.successContainer, { backgroundColor: colors.background, paddingTop: insets.top }]}
        >
          <View style={styles.successContent}>
            <View style={[styles.successIcon, { backgroundColor: colors.success + '20' }]}>
              <IconSymbol name="checkmark.circle.fill" size={64} color={colors.success} />
            </View>
            <Text style={[styles.successTitle, { color: colors.foreground }]}>Pedido realizado!</Text>
            <Text style={[styles.successSubtitle, { color: colors.muted }]}>
              Seu pedido foi confirmado com sucesso
            </Text>
            <View style={[styles.orderNumberCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.orderNumberLabel, { color: colors.muted }]}>NÃºmero do pedido</Text>
              <Text style={[styles.orderNumber, { color: colors.primary }]}>#{orderNumber}</Text>
            </View>
            <Text style={[styles.successInfo, { color: colors.muted }]}>
              VocÃª receberÃ¡ um e-mail com os detalhes do pedido e informaÃ§Ãµes de rastreamento.
            </Text>
            <Pressable
              style={[styles.continueBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.replace('/' as any)}
            >
              <Text style={styles.continueBtnText}>Continuar comprando</Text>
            </Pressable>
          </View>
        </View>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: colors.border }]}>
          <Pressable
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
            onPress={() => {
              if (step === 'payment') setStep('address');
              else if (step === 'confirm') setStep('payment');
              else router.back();
            }}
          >
            <IconSymbol name="chevron.left" size={22} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            {step === 'address' ? 'EndereÃ§o' : step === 'payment' ? 'Pagamento' : 'ConfirmaÃ§Ã£o'}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={[styles.stepsRow, { backgroundColor: colors.background }]}>
          {['address', 'payment', 'confirm'].map((s, i) => (
            <React.Fragment key={s}>
              <View
                style={[
                  styles.stepDot,
                  {
                    backgroundColor:
                      step === s || i < ['address', 'payment', 'confirm'].indexOf(step)
                        ? colors.primary
                        : colors.border,
                  },
                ]}
              >
                <Text style={styles.stepDotText}>{i + 1}</Text>
              </View>
              {i < 2 && (
                <View
                  style={[
                    styles.stepLine,
                    {
                      backgroundColor:
                        i < ['address', 'payment', 'confirm'].indexOf(step)
                          ? colors.primary
                          : colors.border,
                    },
                  ]}
                />
              )}
            </React.Fragment>
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {step === 'address' && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>EndereÃ§o de entrega</Text>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.muted }]}>CEP</Text>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border },
                  ]}
                  placeholder="00000-000"
                  placeholderTextColor={colors.muted}
                  value={address.cep}
                  onChangeText={(t) => setAddress({ ...address, cep: t })}
                  keyboardType="numeric"
                  maxLength={9}
                  returnKeyType="next"
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 2 }]}>
                  <Text style={[styles.inputLabel, { color: colors.muted }]}>Rua</Text>
                  <TextInput
                    style={[
                      styles.input,
                      { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border },
                    ]}
                    placeholder="Nome da rua"
                    placeholderTextColor={colors.muted}
                    value={address.street}
                    onChangeText={(t) => setAddress({ ...address, street: t })}
                    returnKeyType="next"
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={[styles.inputLabel, { color: colors.muted }]}>NÃºmero</Text>
                  <TextInput
                    style={[
                      styles.input,
                      { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border },
                    ]}
                    placeholder="NÂº"
                    placeholderTextColor={colors.muted}
                    value={address.number}
                    onChangeText={(t) => setAddress({ ...address, number: t })}
                    keyboardType="numeric"
                    returnKeyType="next"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.muted }]}>Complemento (opcional)</Text>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border },
                  ]}
                  placeholder="Apto, bloco, etc."
                  placeholderTextColor={colors.muted}
                  value={address.complement}
                  onChangeText={(t) => setAddress({ ...address, complement: t })}
                  returnKeyType="next"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.muted }]}>Bairro</Text>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border },
                  ]}
                  placeholder="Seu bairro"
                  placeholderTextColor={colors.muted}
                  value={address.neighborhood}
                  onChangeText={(t) => setAddress({ ...address, neighborhood: t })}
                  returnKeyType="next"
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 2 }]}>
                  <Text style={[styles.inputLabel, { color: colors.muted }]}>Cidade</Text>
                  <TextInput
                    style={[
                      styles.input,
                      { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border },
                    ]}
                    placeholder="Sua cidade"
                    placeholderTextColor={colors.muted}
                    value={address.city}
                    onChangeText={(t) => setAddress({ ...address, city: t })}
                    returnKeyType="next"
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={[styles.inputLabel, { color: colors.muted }]}>Estado</Text>
                  <TextInput
                    style={[
                      styles.input,
                      { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border },
                    ]}
                    placeholder="UF"
                    placeholderTextColor={colors.muted}
                    value={address.state}
                    onChangeText={(t) => setAddress({ ...address, state: t.toUpperCase() })}
                    maxLength={2}
                    autoCapitalize="characters"
                    returnKeyType="done"
                  />
                </View>
              </View>
            </View>
          )}

          {step === 'payment' && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>MÃ©todo de pagamento</Text>
              <View style={styles.paymentMethods}>
                {PAYMENT_METHODS.map((method) => (
                  <Pressable
                    key={method.id}
                    style={[
                      styles.paymentCard,
                      {
                        backgroundColor: colors.surface,
                        borderColor: paymentMethod === method.id ? colors.primary : colors.border,
                        borderWidth: paymentMethod === method.id ? 2 : 1,
                      },
                    ]}
                    onPress={() => setPaymentMethod(method.id)}
                  >
                    <View
                      style={[
                        styles.paymentIcon,
                        {
                          backgroundColor:
                            paymentMethod === method.id ? colors.primary + '15' : colors.background,
                        },
                      ]}
                    >
                      <IconSymbol
                        name={method.icon as any}
                        size={22}
                        color={paymentMethod === method.id ? colors.primary : colors.muted}
                      />
                    </View>
                    <View style={styles.paymentInfo}>
                      <Text style={[styles.paymentLabel, { color: colors.foreground }]}>{method.label}</Text>
                      <Text
                        style={[
                          styles.paymentSubtitle,
                          { color: method.id === 'pix' ? colors.success : colors.muted },
                        ]}
                      >
                        {method.subtitle}
                      </Text>
                    </View>
                    {paymentMethod === method.id && (
                      <IconSymbol name="checkmark.circle.fill" size={22} color={colors.primary} />
                    )}
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {step === 'confirm' && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Resumo do pedido</Text>

              {state.items.map((item) => (
                <View key={item.id} style={[styles.orderItem, { backgroundColor: colors.surface }]}>
                  <View style={styles.orderItemInfo}>
                    <Text style={[styles.orderItemName, { color: colors.foreground }]} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={[styles.orderItemMeta, { color: colors.muted }]}>
                      {item.size} Â· {item.color} Â· Qtd: {item.quantity}
                    </Text>
                  </View>
                  <Text style={[styles.orderItemPrice, { color: colors.foreground }]}>
                    R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                  </Text>
                </View>
              ))}

              <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.muted }]}>Subtotal</Text>
                  <Text style={[styles.summaryValue, { color: colors.foreground }]}>
                    R$ {subtotal.toFixed(2).replace('.', ',')}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.muted }]}>Frete</Text>
                  <Text
                    style={[
                      styles.summaryValue,
                      { color: shipping === 0 ? colors.success : colors.foreground },
                    ]}
                  >
                    {shipping === 0 ? 'GrÃ¡tis' : `R$ ${shipping.toFixed(2).replace('.', ',')}`}
                  </Text>
                </View>
                {discount > 0 && (
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: colors.success }]}>Cupom</Text>
                    <Text style={[styles.summaryValue, { color: colors.success }]}>
                      -R$ {discount.toFixed(2).replace('.', ',')}
                    </Text>
                  </View>
                )}
                {paymentMethod === 'pix' && (
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: colors.success }]}>Desconto PIX (10%)</Text>
                    <Text style={[styles.summaryValue, { color: colors.success }]}>
                      -R$ {pixDiscount.toFixed(2).replace('.', ',')}
                    </Text>
                  </View>
                )}
                <View style={[styles.totalDivider, { backgroundColor: colors.border }]} />
                <View style={styles.summaryRow}>
                  <Text style={[styles.totalLabel, { color: colors.foreground }]}>Total</Text>
                  <Text style={[styles.totalValue, { color: colors.primary }]}>
                    R$ {finalTotal.toFixed(2).replace('.', ',')}
                  </Text>
                </View>
              </View>

              <View style={[styles.paymentMethodInfo, { backgroundColor: colors.surface }]}>
                <IconSymbol
                  name={PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.icon as any}
                  size={18}
                  color={colors.primary}
                />
                <Text style={[styles.paymentMethodText, { color: colors.foreground }]}>
                  {PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.label}
                </Text>
              </View>
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>

        <View
          style={[
            styles.bottomBar,
            {
              backgroundColor: colors.background,
              borderTopColor: colors.border,
              paddingBottom: insets.bottom + 12,
            },
          ]}
        >
          <Pressable
            style={({ pressed }) => [
              styles.nextBtn,
              { backgroundColor: colors.primary, transform: [{ scale: pressed ? 0.97 : 1 }] },
            ]}
            onPress={() => {
              if (step === 'address') setStep('payment');
              else if (step === 'payment') setStep('confirm');
              else handleConfirmOrder();
            }}
          >
            <Text style={styles.nextBtnText}>
              {step === 'address'
                ? 'Continuar para pagamento'
                : step === 'payment'
                  ? 'Revisar pedido'
                  : 'Confirmar pedido'}
            </Text>
            {step === 'confirm' && (
              <Text style={styles.nextBtnPrice}>R$ {finalTotal.toFixed(2).replace('.', ',')}</Text>
            )}
          </Pressable>
        </View>
      </View>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  successContent: { padding: 32, alignItems: 'center', gap: 16, maxWidth: 320 },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: { fontSize: 26, fontWeight: '800' },
  successSubtitle: { fontSize: 15, textAlign: 'center' },
  orderNumberCard: { padding: 20, borderRadius: 16, alignItems: 'center', width: '100%', gap: 4 },
  orderNumberLabel: { fontSize: 13 },
  orderNumber: { fontSize: 22, fontWeight: '900' },
  successInfo: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
  continueBtn: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  continueBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 0,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  stepLine: { flex: 1, height: 2, maxWidth: 60 },
  scrollContent: { padding: 16 },
  section: { gap: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  inputGroup: { gap: 6 },
  inputLabel: { fontSize: 13, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  row: { flexDirection: 'row', gap: 12 },
  paymentMethods: { gap: 10 },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  paymentIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentInfo: { flex: 1 },
  paymentLabel: { fontSize: 15, fontWeight: '600' },
  paymentSubtitle: { fontSize: 12, marginTop: 2 },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 10,
  },
  orderItemInfo: { flex: 1 },
  orderItemName: { fontSize: 14, fontWeight: '600' },
  orderItemMeta: { fontSize: 12, marginTop: 2 },
  orderItemPrice: { fontSize: 14, fontWeight: '700' },
  summaryCard: { padding: 16, borderRadius: 16, gap: 10 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { fontSize: 14 },
  summaryValue: { fontSize: 14, fontWeight: '600' },
  totalDivider: { height: 1, marginVertical: 4 },
  totalLabel: { fontSize: 16, fontWeight: '700' },
  totalValue: { fontSize: 20, fontWeight: '900' },
  paymentMethodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 12,
  },
  paymentMethodText: { fontSize: 14, fontWeight: '600' },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 0.5,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
  },
  nextBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  nextBtnPrice: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
});
