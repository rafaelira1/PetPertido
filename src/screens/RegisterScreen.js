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
import { createAccount, getAuthErrorMessage } from '../services/authService';
import styles, { colors } from '../styles';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = async () => {
    setErrorMessage('');

    if (!name.trim() || !email.trim() || !whatsapp.trim() || !password || !confirmPassword) {
      setErrorMessage('Preencha todos os campos para criar sua conta.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Use uma senha com pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('As senhas não são iguais. Confira e tente novamente.');
      return;
    }
    if (!acceptedTerms) {
      setErrorMessage('Aceite os termos de uso e a política de privacidade para continuar.');
      return;
    }

    setLoading(true);
    try {
      await createAccount({ name, email, whatsapp, password });
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error, 'register'));
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
          contentContainerStyle={[styles.scrollContent, { justifyContent: 'flex-start' }]}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Voltar ao login"
            onPress={() => navigation.goBack()}
            style={styles.backLink}
          >
            <MaterialCommunityIcons name="arrow-left" size={23} color={colors.primary} />
          </TouchableOpacity>

          <Text style={[styles.title, { textAlign: 'left', marginBottom: 8 }]}>Criar conta</Text>
          <Text style={[styles.subtitle, { textAlign: 'left', marginBottom: 22, marginTop: 0 }]}>
            Cadastre-se para ajudar um pet a voltar para casa.
          </Text>

          <View style={styles.form}>
            <FormField
              label="Nome completo"
              value={name}
              onChangeText={setName}
              placeholder="Como você quer ser chamado"
              autoComplete="name"
            />
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
              label="WhatsApp para contato"
              value={whatsapp}
              onChangeText={setWhatsapp}
              placeholder="(85) 99999-0000"
              keyboardType="phone-pad"
              autoComplete="tel"
            />
            <FormField
              label="Senha"
              value={password}
              onChangeText={setPassword}
              placeholder="Mínimo de 6 caracteres"
              autoCapitalize="none"
              autoComplete="new-password"
              secureTextEntry={!showPassword}
              actionLabel={showPassword ? 'Ocultar' : 'Mostrar'}
              onActionPress={() => setShowPassword((visible) => !visible)}
            />
            <FormField
              label="Confirmar senha"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Digite a senha novamente"
              autoCapitalize="none"
              autoComplete="new-password"
              secureTextEntry={!showPassword}
            />

            <TouchableOpacity
              accessibilityRole="checkbox"
              accessibilityState={{ checked: acceptedTerms }}
              onPress={() => setAcceptedTerms((accepted) => !accepted)}
              style={styles.termsRow}
            >
              <View style={[styles.checkbox, acceptedTerms && styles.checkboxSelected]}>
                {acceptedTerms ? (
                  <MaterialCommunityIcons name="check" size={15} color={colors.white} />
                ) : null}
              </View>
              <Text style={styles.termsText}>
                Li e aceito os Termos de Uso e a Política de Privacidade.
              </Text>
            </TouchableOpacity>

            {errorMessage ? (
              <Text accessibilityRole="alert" style={[styles.fieldError, { marginBottom: 12 }]}>
                {errorMessage}
              </Text>
            ) : null}

            <PrimaryButton title="Cadastrar" onPress={handleRegister} loading={loading} />

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Já tem conta?{' '}
                <Text style={styles.inlineLink} onPress={() => navigation.navigate('Login')}>
                  Entrar
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
