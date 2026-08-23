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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { getApiBaseUrl } from '@/constants/oauth';
import * as Api from '@/lib/_core/api';
import * as Auth from '@/lib/_core/auth';

export default function RegisterScreen() {
  const colors = useColors();
  const router = useRouter();
  const params = useLocalSearchParams<{ redirectTo?: string }>();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const getPostAuthPath = () => {
    const redirectTo = typeof params.redirectTo === 'string' ? params.redirectTo : null;
    return redirectTo || '/(tabs)';
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

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Campos obrigatorios', 'Por favor, preencha todos os campos.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Senha fraca', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const result = await Api.register({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      await Auth.setSessionToken(result.token);
      await Auth.setUserInfo({
        id: result.user.id,
        openId: result.user.openId,
        name: result.user.name,
        email: result.user.email,
        loginMethod: result.user.loginMethod,
        role: result.user.role,
        lastSignedIn: new Date(result.user.lastSignedIn),
      });

      Alert.alert(
        'Conta criada!',
        'Seu cadastro foi concluido e a sessao ja esta ativa.',
        [{ text: 'Continuar', onPress: () => router.replace(getPostAuthPath() as any) }],
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Falha ao criar conta.';
      Alert.alert('Erro no cadastro', message);
    } finally {
      setLoading(false);
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
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Criar conta</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: colors.foreground }]}>Junte-se ao F3Fitness</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Crie sua conta e ganhe 5% OFF na primeira compra
          </Text>
          <View style={[styles.couponHint, { backgroundColor: colors.primary + '15' }]}>
            <IconSymbol name="tag.fill" size={14} color={colors.primary} />
            <Text style={[styles.couponHintText, { color: colors.primary }]}>
              Cupom: F3APP - 5% OFF na 1a compra
            </Text>
          </View>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.foreground }]}>Nome completo</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <IconSymbol name="person.fill" size={18} color={colors.muted} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                placeholder="Seu nome"
                placeholderTextColor={colors.muted}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>
          </View>

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
                placeholder="Minimo 6 caracteres"
                placeholderTextColor={colors.muted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                returnKeyType="done"
                onSubmitEditing={handleRegister}
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

          <Pressable
            style={({ pressed }) => [
              styles.registerBtn,
              { backgroundColor: colors.primary, opacity: loading ? 0.7 : pressed ? 0.85 : 1 },
            ]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.registerBtnText}>{loading ? 'Criando conta...' : 'Criar conta gratis'}</Text>
          </Pressable>

          <Text style={[styles.terms, { color: colors.muted }]}>
            Ao criar uma conta, voce concorda com nossos{' '}
            <Text style={{ color: colors.primary }}>Termos de Uso</Text> e{' '}
            <Text style={{ color: colors.primary }}>Politica de Privacidade</Text>.
          </Text>
        </View>

        <View style={styles.dividerRow}>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          <Text style={[styles.dividerText, { color: colors.muted }]}>ou</Text>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        </View>

        <Pressable
          onPress={handleGoogleLogin}
          style={({ pressed }) => [
            styles.googleBtn,
            {
              borderColor: colors.border,
              backgroundColor: colors.surface,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Text style={[styles.googleBtnText, { color: colors.foreground }]}>Continuar com Google</Text>
        </Pressable>

        <View style={styles.loginCta}>
          <Text style={[styles.loginText, { color: colors.muted }]}>Ja tem uma conta?</Text>
          <Pressable
            onPress={() =>
              router.replace({
                pathname: '/auth/login',
                params: typeof params.redirectTo === 'string' ? { redirectTo: params.redirectTo } : {},
              } as any)
            }
          >
            <Text style={[styles.loginLink, { color: colors.primary }]}>Entrar</Text>
          </Pressable>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  titleSection: {
    marginBottom: 28,
    gap: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  couponHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  couponHintText: {
    fontSize: 13,
    fontWeight: '600',
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
  registerBtn: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  registerBtnText: {
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
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  googleBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  terms: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  loginCta: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  loginText: {
    fontSize: 15,
  },
  loginLink: {
    fontSize: 15,
    fontWeight: '700',
  },
});
