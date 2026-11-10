import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import FormField from '../components/FormField';
import PrimaryButton from '../components/PrimaryButton';
import { getAuthErrorMessage, signIn } from '../services/authService';
import styles, { colors } from '../styles';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Preencha o e-mail e a senha para entrar.');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error, 'login'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.brand}>
            <View style={styles.brandIcon}>
              <MaterialCommunityIcons name="paw" size={32} color={colors.primary} />
            </View>
            <Text style={styles.title}>Pet Perdido</Text>
            <Text style={styles.subtitle}>Ajude cães e gatos a voltarem para casa.</Text>
          </View>

          <View style={styles.form}>
            <FormField
              label="E-mail"
              value={email}
              onChangeText={setEmail}
              placeholder="seuemail@exemplo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            <FormField
              label="Senha"
              value={password}
              onChangeText={setPassword}
              placeholder="Digite sua senha"
              autoCapitalize="none"
              autoComplete="current-password"
              secureTextEntry={!showPassword}
              actionLabel={showPassword ? 'Ocultar' : 'Mostrar'}
              onActionPress={() => setShowPassword((visible) => !visible)}
            />

            <View style={styles.linkRow}>
              <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={styles.link}>Esqueci minha senha</Text>
              </TouchableOpacity>
            </View>

            {errorMessage ? (
              <Text accessibilityRole="alert" style={[styles.fieldError, { marginBottom: 12 }]}>
                {errorMessage}
              </Text>
            ) : null}

            <PrimaryButton title="Entrar" onPress={handleLogin} loading={loading} />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Ainda não tem conta?</Text>
              <TouchableOpacity
                style={[styles.secondaryButton, { width: '100%', marginTop: 12 }]}
                accessibilityRole="button"
                onPress={() => navigation.navigate('Register')}
              >
                <Text style={styles.secondaryButtonText}>Criar conta</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
