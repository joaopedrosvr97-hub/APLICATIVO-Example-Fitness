import React, { useState } from 'react';
import * as Linking from 'expo-linking';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import * as Api from '@/lib/_core/api';
import * as Auth from '@/lib/_core/auth';
import { getApiBaseUrl } from '@/constants/oauth';

export default function LoginScreen() {
  const colors = useColors();
  const router = useRouter();
  const params = useLocalSearchParams<{ redirectTo?: string }>();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const getPostAuthPath = () => {
    const redirectTo = typeof params.redirectTo === 'string' ? params.redirectTo : null;
    return redirectTo || '/(tabs)';
  };

  const persistAuth = async (payload: Api.AuthUser, token: string) => {
    await Auth.setSessionToken(token);
    await Auth.setUserInfo({
      id: payload.id,
      openId: payload.openId,
      name: payload.name,
      email: payload.email,
      loginMethod: payload.loginMethod,
      role: payload.role,
      lastSignedIn: new Date(payload.lastSignedIn),
    });
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Campos obrigatorios', 'Por favor, preencha e-mail e senha.');
      return;
    }

    setLoading(true);
    try {
      const result = await Api.login({
        email: email.trim(),
        password,
      });

      await persistAuth(result.user, result.token);
      router.replace(getPostAuthPath() as any);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Falha ao fazer login.';
      Alert.alert('Erro no login', message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const baseUrl = getApiBaseUrl();
    if (!baseUrl) {
      Alert.alert('Erro', 'API URL nao configurada');
      return;
    }

    const redirectUrl = Linking.createURL('/oauth/callback');
    const authUrl = `${baseUrl}/auth/google?mobile=true&redirectUri=${encodeURIComponent(redirectUrl)}`;

    try {
      if (Platform.OS === 'web') {
        window.location.href = authUrl;
      } else {
        await Linking.openURL(authUrl);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Falha no login com Google');
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: colors.border }]}>
        <Pressable
          style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.6 }]}
          onPress={() => router.back()}
        >
          <IconSymbol name="xmark" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Entrar</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.logoSection}>
          <View style={[styles.logoBox, { backgroundColor: colors.primary }]}>
            <Text style={styles.logoText}>F3</Text>
          </View>
          <Text style={[styles.welcomeTitle, { color: colors.foreground }]}>Bem-vindo de volta!</Text>
          <Text style={[styles.welcomeSubtitle, { color: colors.muted }]}>
            Entre na sua conta para continuar
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.foreground }]}>E-mail</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <IconSymbol name="envelope.fill" size={18} color={colors.muted} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                placeholder="seu@email.com"
                placeholderTextColor={colors.muted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.foreground }]}>Senha</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <IconSymbol name="lock.fill" size={18} color={colors.muted} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                placeholder="Sua senha"
                placeholderTextColor={colors.muted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)}>
                <IconSymbol
                  name={showPassword ? 'eye.slash.fill' : 'eye.fill'}
                  size={18}
                  color={colors.muted}
                />
              </Pressable>
            </View>
          </View>

          <Pressable style={styles.forgotPassword}>
            <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
              Esqueceu a senha?
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.loginBtn,
              { backgroundColor: colors.primary, opacity: loading ? 0.7 : pressed ? 0.85 : 1 },
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginBtnText}>{loading ? 'Entrando...' : 'Entrar'}</Text>
          </Pressable>
        </View>

        <View style={styles.dividerRow}>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          <Text style={[styles.dividerText, { color: colors.muted }]}>ou</Text>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        </View>

        <Pressable
          onPress={handleGoogleLogin}
          style={({ pressed }) => [
            {
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 14,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.surface,
              opacity: pressed ? 0.8 : 1,
              marginBottom: 16,
            },
          ]}
        >
          <Text style={{ fontSize: 15, fontWeight: '600', color: colors.foreground }}>
            Continuar com Google
          </Text>
        </Pressable>

        <View style={styles.registerCta}>
          <Text style={[styles.registerText, { color: colors.muted }]}>Nao tem uma conta?</Text>
          <Pressable
            onPress={() =>
              router.replace({
                pathname: '/auth/register',
                params: typeof params.redirectTo === 'string' ? { redirectTo: params.redirectTo } : {},
              } as any)
            }
          >
            <Text style={[styles.registerLink, { color: colors.primary }]}>Criar conta gratis</Text>
          </Pressable>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
  },
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 24,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 32,
    gap: 8,
  },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  welcomeSubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  form: {
    gap: 16,
    marginBottom: 24,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loginBtn: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 13,
  },
  registerCta: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  registerText: {
    fontSize: 15,
  },
  registerLink: {
    fontSize: 15,
    fontWeight: '700',
  },
});
