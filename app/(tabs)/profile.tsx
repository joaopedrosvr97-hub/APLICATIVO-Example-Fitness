import React, { useState } from 'react';
import {
  Platform,
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { getApiBaseUrl } from '@/constants/oauth';
import * as Api from '@/lib/_core/api';
import * as Auth from '@/lib/_core/auth';

const MOCK_ORDERS = [
  { id: '#F3-2025-001', date: '15/03/2025', total: 249.8, status: 'Entregue', items: 2 },
  { id: '#F3-2025-002', date: '22/03/2025', total: 149.9, status: 'Enviado', items: 1 },
  { id: '#F3-2025-003', date: '01/04/2025', total: 89.9, status: 'Processando', items: 1 },
];

const STATUS_COLORS: Record<string, string> = {
  Entregue: '#10B981',
  Enviado: '#F59E0B',
  Processando: '#6B7280',
  Cancelado: '#EF4444',
};

function MenuItem({
  icon,
  label,
  subtitle,
  onPress,
  danger,
}: {
  icon: string;
  label: string;
  subtitle?: string;
  onPress?: () => void;
  danger?: boolean;
}) {
  const colors = useColors();
  return (
    <Pressable
      style={({ pressed }) => [
        styles.menuItem,
        { backgroundColor: colors.surface, opacity: pressed ? 0.7 : 1 },
      ]}
      onPress={onPress}
    >
      <View style={[styles.menuIconWrapper, { backgroundColor: danger ? colors.error + '15' : colors.primary + '15' }]}>
        <IconSymbol name={icon as any} size={20} color={danger ? colors.error : colors.primary} />
      </View>
      <View style={styles.menuText}>
        <Text style={[styles.menuLabel, { color: danger ? colors.error : colors.foreground }]}>{label}</Text>
        {subtitle && <Text style={[styles.menuSubtitle, { color: colors.muted }]}>{subtitle}</Text>}
      </View>
      {!danger && <IconSymbol name="chevron.right" size={18} color={colors.muted} />}
    </Pressable>
  );
}

function getInitials(name: string | null, email: string | null) {
  const base = (name?.trim() || email?.trim() || 'F3').split(/\s+/);
  return base
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export default function ProfileScreen() {
  const colors = useColors();
  const router = useRouter();
  const [user, setUser] = useState<Auth.User | null>(null);
  const [showOrders, setShowOrders] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      let cancelled = false;

      const loadUser = async () => {
        const storedUser = await Auth.getUserInfo();
        if (storedUser && !cancelled) {
          setUser(storedUser);
        }

        const serverUser = await Api.getMe();
        if (serverUser && !cancelled) {
          const normalizedUser: Auth.User = {
            id: serverUser.id,
            openId: serverUser.openId,
            name: serverUser.name,
            email: serverUser.email,
            loginMethod: serverUser.loginMethod,
            role: serverUser.role,
            lastSignedIn: new Date(serverUser.lastSignedIn),
          };
          await Auth.setUserInfo(normalizedUser);
          setUser(normalizedUser);
          return;
        }

        await Auth.removeSessionToken();
        await Auth.clearUserInfo();

        if (!cancelled) {
          setUser(null);
        }
      };

      void loadUser();

      return () => {
        cancelled = true;
      };
    }, []),
  );

  const isLoggedIn = !!user;

  const handleLogin = () => {
    router.push('/auth/login' as any);
  };

  const handleLogout = () => {
    Alert.alert('Sair', 'Tem certeza que deseja sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          try {
            if (Platform.OS === 'web' && typeof window !== 'undefined') {
              await Auth.clearUserInfo();
              setUser(null);
              const currentUrl = window.location.href;
              window.location.href = `${getApiBaseUrl()}/api/auth/logout?redirect=${encodeURIComponent(currentUrl)}`;
              return;
            }

            await Api.logout();
          } catch (error) {
            console.error('[Profile] Logout API failed', error);
          } finally {
            await Auth.removeSessionToken();
            await Auth.clearUserInfo();
            setUser(null);
          }
        },
      },
    ]);
  };

  return (
    <ScreenContainer containerClassName="bg-background">
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Perfil</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {isLoggedIn ? (
          <View style={[styles.userCard, { backgroundColor: colors.primary }]}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{getInitials(user.name, user.email)}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name || 'Usuario'}</Text>
              <Text style={styles.userEmail}>{user.email || user.openId}</Text>
            </View>
            <Pressable style={styles.editBtn}>
              <IconSymbol name="chevron.right" size={18} color="#FFFFFF" />
            </Pressable>
          </View>
        ) : (
          <View style={[styles.loginCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.loginIcon, { backgroundColor: colors.primary + '15' }]}>
              <IconSymbol name="person.fill" size={32} color={colors.primary} />
            </View>
            <Text style={[styles.loginTitle, { color: colors.foreground }]}>Entre na sua conta</Text>
            <Text style={[styles.loginSubtitle, { color: colors.muted }]}>
              Acesse seus pedidos, favoritos e muito mais
            </Text>
            <Pressable
              style={[styles.loginBtn, { backgroundColor: colors.primary }]}
              onPress={handleLogin}
            >
              <Text style={styles.loginBtnText}>Entrar ou criar conta</Text>
            </Pressable>
          </View>
        )}

        {isLoggedIn && (
          <View style={styles.section}>
            <Pressable
              style={[styles.sectionHeader, { backgroundColor: colors.surface }]}
              onPress={() => setShowOrders(!showOrders)}
            >
              <View style={styles.sectionHeaderLeft}>
                <IconSymbol name="doc.text.fill" size={18} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Meus Pedidos</Text>
              </View>
              <IconSymbol
                name={showOrders ? 'chevron.left' : 'chevron.right'}
                size={18}
                color={colors.muted}
              />
            </Pressable>

            {showOrders && MOCK_ORDERS.map((order) => (
              <View key={order.id} style={[styles.orderCard, { backgroundColor: colors.surface }]}>
                <View style={styles.orderHeader}>
                  <Text style={[styles.orderId, { color: colors.foreground }]}>{order.id}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[order.status] + '20' }]}>
                    <Text style={[styles.statusText, { color: STATUS_COLORS[order.status] }]}>
                      {order.status}
                    </Text>
                  </View>
                </View>
                <View style={styles.orderDetails}>
                  <Text style={[styles.orderDate, { color: colors.muted }]}>{order.date}</Text>
                  <Text style={[styles.orderItems, { color: colors.muted }]}>
                    {order.items} {order.items === 1 ? 'item' : 'itens'}
                  </Text>
                  <Text style={[styles.orderTotal, { color: colors.primary }]}>
                    R$ {order.total.toFixed(2).replace('.', ',')}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.menuSectionTitle, { color: colors.muted }]}>CONTA</Text>
          <View style={styles.menuGroup}>
            <MenuItem
              icon="location.fill"
              label="Enderecos"
              subtitle="Gerenciar enderecos de entrega"
              onPress={handleLogin}
            />
            <MenuItem
              icon="creditcard.fill"
              label="Pagamentos"
              subtitle="Cartoes e metodos salvos"
              onPress={handleLogin}
            />
            <MenuItem
              icon="bell.fill"
              label="Notificacoes"
              subtitle="Promocoes e atualizacoes"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.menuSectionTitle, { color: colors.muted }]}>SUPORTE</Text>
          <View style={styles.menuGroup}>
            <MenuItem
              icon="questionmark.circle.fill"
              label="Ajuda e FAQ"
              subtitle="Duvidas frequentes"
            />
            <MenuItem
              icon="envelope.fill"
              label="Fale conosco"
              subtitle="contato@f3fitness.com.br"
            />
            <MenuItem
              icon="info.circle.fill"
              label="Sobre o app"
              subtitle="Versao 1.0.0"
            />
          </View>
        </View>

        {isLoggedIn && (
          <View style={styles.section}>
            <View style={styles.menuGroup}>
              <MenuItem
                icon="arrow.right.square.fill"
                label="Sair da conta"
                onPress={handleLogout}
                danger
              />
            </View>
          </View>
        )}

        <View style={styles.appInfo}>
          <Text style={[styles.appInfoText, { color: colors.muted }]}>F3Fitness v1.0.0</Text>
          <Text style={[styles.appInfoText, { color: colors.muted }]}>
            Feito com carinho para quem treina
          </Text>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
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
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    gap: 14,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  userEmail: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginTop: 2,
  },
  editBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginCard: {
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    gap: 10,
  },
  loginIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  loginTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  loginSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  loginBtn: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
    width: '100%',
    alignItems: 'center',
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  section: {
    gap: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  orderCard: {
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderId: {
    fontSize: 14,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  orderDate: {
    fontSize: 12,
  },
  orderItems: {
    fontSize: 12,
  },
  orderTotal: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 'auto',
  },
  menuSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
    marginLeft: 4,
  },
  menuGroup: {
    gap: 2,
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  menuIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  menuSubtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  appInfo: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  appInfoText: {
    fontSize: 12,
  },
});
