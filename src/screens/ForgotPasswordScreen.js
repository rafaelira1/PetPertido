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
import { getAuthErrorMessage, sendPasswordReset } from '../services/authService';
import styles, { colors } from '../styles';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleReset = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim()) {
      setErrorMessage('Digite o e-mail usado na sua conta.');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordReset(email);
      setSuccessMessage('Se houver uma conta com esse e-mail, enviaremos um link para redefinir sua senha.');
    } catch (error) {
      if (error?.code === 'auth/user-not-found') {
        setSuccessMessage('Se houver uma conta com esse e-mail, enviaremos um link para redefinir sua senha.');
      } else {
        setErrorMessage(getAuthErrorMessage(error, 'reset'));
      }
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
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Voltar ao login"
            onPress={() => navigation.goBack()}
            style={styles.backLink}
          >
            <MaterialCommunityIcons name="arrow-left" size={23} color={colors.primary} />
          </TouchableOpacity>

          <View style={styles.brand}>
            <View style={styles.brandIcon}>
              <MaterialCommunityIcons name="lock-outline" size={30} color={colors.primary} />
            </View>
            <Text style={styles.title}>Esqueceu a senha?</Text>
            <Text style={styles.subtitle}>
              Digite o e-mail da sua conta. Enviaremos instruções para criar uma nova senha.
            </Text>
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

            {errorMessage ? (
              <Text accessibilityRole="alert" style={[styles.fieldError, { marginBottom: 12 }]}>
                {errorMessage}
              </Text>
            ) : null}
            {successMessage ? (
              <Text accessibilityRole="alert" style={[styles.listStatusText, { marginBottom: 16 }]}>
                {successMessage}
              </Text>
            ) : null}

            <PrimaryButton title="Enviar link" onPress={handleReset} loading={loading} />

            <View style={styles.footer}>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.link}>Voltar para o login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
