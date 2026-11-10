import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { EmailAuthProvider, deleteUser, reauthenticateWithCredential, signOut } from 'firebase/auth';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import BottomNavigation from '../components/BottomNavigation';
import FormField from '../components/FormField';
import PrimaryButton from '../components/PrimaryButton';
import { auth } from '../services/firebaseConfig';
import { deleteUserData, getProfileStats, getUserProfile, updateUserProfile } from '../services/profileService';
import styles, { colors } from '../styles';

function ProfileOption({ icon, label, onPress, danger = false }) {
  return (
    <TouchableOpacity accessibilityRole="button" onPress={onPress} style={styles.profileOption}>
      <MaterialCommunityIcons
        name={icon}
        size={20}
        color={danger ? colors.danger : colors.primary}
      />
      <Text style={[styles.profileOptionText, danger && { color: colors.danger }]}>{label}</Text>
      <MaterialCommunityIcons name="chevron-right" size={20} color={colors.muted} />
    </TouchableOpacity>
  );
}

export default function ProfileScreen({ navigation }) {
  const user = auth?.currentUser;
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ active: 0, reunited: 0, totalReunited: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [editVisible, setEditVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [deletePassword, setDeletePassword] = useState('');

  const loadProfile = useCallback(async () => {
    if (!user) {
      setErrorMessage('Entre na sua conta para abrir o perfil.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMessage('');
    try {
      const [profileData, profileStats] = await Promise.all([
        getUserProfile(user.uid),
        getProfileStats(user.uid),
      ]);
      setProfile(profileData);
      setName(profileData.name || '');
      setWhatsapp(profileData.whatsapp || '');
      setStats(profileStats);
    } catch (error) {
      setErrorMessage('Não foi possível carregar os dados do perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(useCallback(() => {
    loadProfile();
  }, [loadProfile]));

  const handleSaveProfile = async () => {
    if (!name.trim() || !whatsapp.trim()) {
      Alert.alert('Dados incompletos', 'Preencha seu nome e WhatsApp.');
      return;
    }

    setSaving(true);
    try {
      await updateUserProfile(user.uid, name, whatsapp);
      setProfile((current) => ({ ...current, name: name.trim(), whatsapp: whatsapp.trim() }));
      setEditVisible(false);
    } catch (error) {
      Alert.alert('Não foi possível salvar', 'Confira sua conexão e tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const askToDeleteAccount = () => {
    Alert.alert(
      'Excluir conta?',
      'Seus anúncios e dados de perfil também serão excluídos. Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Continuar', style: 'destructive', onPress: () => setDeleteVisible(true) },
      ]
    );
  };

  const handleDeleteAccount = async () => {
    if (!user?.email || !deletePassword) {
      Alert.alert('Digite sua senha', 'Precisamos confirmar sua identidade para excluir a conta.');
      return;
    }

    setSaving(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, deletePassword);
      await reauthenticateWithCredential(user, credential);
      await deleteUserData(user.uid);
      await deleteUser(user);
      setDeleteVisible(false);
    } catch (error) {
      const message = error?.code === 'auth/wrong-password' || error?.code === 'auth/invalid-credential'
        ? 'Senha incorreta. Confira e tente novamente.'
        : 'Não foi possível excluir a conta. Confira sua conexão e tente novamente.';
      Alert.alert('Falha ao excluir a conta', message);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    if (auth) await signOut(auth);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.profileContent}>
        {loading ? (
          <View style={styles.profileLoading}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.listStatusText}>Carregando perfil...</Text>
          </View>
        ) : errorMessage ? (
          <View style={styles.profileLoading}>
            <Text style={styles.listStatusText}>{errorMessage}</Text>
            <TouchableOpacity onPress={loadProfile} style={[styles.secondaryButton, { marginTop: 16 }]}>
              <Text style={styles.secondaryButtonText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.profileHeading}>
              <View style={styles.profileAvatar}>
                <MaterialCommunityIcons name="account-outline" size={38} color={colors.muted} />
              </View>
              <Text style={styles.title}>{profile?.name || 'Meu perfil'}</Text>
              <Text style={styles.homeSubtitle}>{profile?.email || user?.email}</Text>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.active}</Text>
                <Text style={styles.statLabel}>Anúncios ativos</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.reunited}</Text>
                <Text style={styles.statLabel}>Reencontrados</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.totalReunited}</Text>
                <Text style={styles.statLabel}>Pets ajudados</Text>
              </View>
            </View>

            <View style={styles.profileMenu}>
              <ProfileOption
                icon="format-list-bulleted"
                label="Meus anúncios"
                onPress={() => navigation.navigate('MyAnnouncements')}
              />
              <ProfileOption
                icon="account-edit-outline"
                label="Editar dados da conta"
                onPress={() => setEditVisible(true)}
              />
              <ProfileOption
                icon="file-document-outline"
                label="Termos de uso e privacidade"
                onPress={() => Alert.alert('Termos e privacidade', 'Os termos aceitos no cadastro serão disponibilizados aqui.')}
              />
              <ProfileOption
                icon="delete-outline"
                label="Excluir conta e dados"
                danger
                onPress={askToDeleteAccount}
              />
              <ProfileOption icon="logout" label="Sair" onPress={handleSignOut} />
            </View>
          </>
        )}
      </ScrollView>

      <BottomNavigation navigation={navigation} active="profile" />

      <Modal visible={editVisible} transparent animationType="fade" onRequestClose={() => setEditVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.sectionTitle}>Editar dados da conta</Text>
            <FormField label="Nome completo" value={name} onChangeText={setName} placeholder="Seu nome" />
            <FormField label="WhatsApp" value={whatsapp} onChangeText={setWhatsapp} placeholder="(85) 99999-0000" keyboardType="phone-pad" />
            <Text style={styles.homeSubtitle}>E-mail: {user?.email}</Text>
            <PrimaryButton title="Salvar alterações" onPress={handleSaveProfile} loading={saving} />
            <TouchableOpacity style={styles.modalCancel} onPress={() => setEditVisible(false)}>
              <Text style={styles.secondaryButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={deleteVisible} transparent animationType="fade" onRequestClose={() => setDeleteVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.sectionTitle}>Confirmar exclusão</Text>
            <Text style={styles.listStatusText}>Digite sua senha para excluir a conta e os dados associados.</Text>
            <FormField
              label="Senha"
              value={deletePassword}
              onChangeText={setDeletePassword}
              placeholder="Sua senha atual"
              autoCapitalize="none"
              secureTextEntry
            />
            <PrimaryButton title="Excluir conta" onPress={handleDeleteAccount} loading={saving} />
            <TouchableOpacity style={styles.modalCancel} onPress={() => setDeleteVisible(false)}>
              <Text style={styles.secondaryButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
