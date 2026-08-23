import { Redirect, usePathname } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';

import { useColors } from '@/hooks/use-colors';
import { useAuth } from '@/hooks/use-auth';

type AuthGuardProps = {
  children: React.ReactNode;
};

export function AuthGuard({ children }: AuthGuardProps) {
  const colors = useColors();
  const pathname = usePathname();
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          backgroundColor: colors.background,
          padding: 24,
        }}
      >
        <ActivityIndicator color={colors.primary} />
        <Text style={{ color: colors.muted, fontSize: 14 }}>
          Verificando autenticacao...
        </Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <Redirect
        href={{
          pathname: '/auth/login',
          params: { redirectTo: pathname || '/(tabs)' },
        }}
      />
    );
  }

  return <>{children}</>;
}
