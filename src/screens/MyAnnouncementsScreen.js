import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { deleteAnnouncement, getUserAnnouncements, markAnnouncementReunited } from '../services/announcementService';
import { auth } from '../services/firebaseConfig';
import styles, { colors } from '../styles';

const tabs = [
  { key: 'active', label: 'Ativos' },
  { key: 'reunited', label: 'Reencontrados' },
];

function formatDate(value) {
  if (!value) return 'Data não informada';
  const date = typeof value.toDate === 'function' ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return 'Data não informada';
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function MyAnnouncementCard({ announcement, onOpen, onDelete, onReunited, isActive }) {
  const name = announcement.name || 'Pet sem nome';
  const species = announcement.species || 'Espécie não informada';
  const typeLabel = announcement.type === 'found' ? 'ENCONTRADO' : 'PERDIDO';

  return (
    <View style={styles.myAnnouncementCard}>
      <TouchableOpacity
        accessibilityRole="button"
        onPress={onOpen}
        style={styles.myAnnouncementMain}
      >
        {announcement.photoUrl ? (
          <Image source={{ uri: announcement.photoUrl }} style={styles.petImagePhoto} />
        ) : (
          <View style={styles.petImage}>
            <MaterialCommunityIcons name="paw" size={27} color={colors.muted} />
          </View>
        )}
        <View style={styles.petInfo}>
          <Text style={styles.badge}>{typeLabel}</Text>
          <Text numberOfLines={1} style={styles.petName}>{name}</Text>
          <Text numberOfLines={1} style={styles.petDescription}>{species}</Text>
          <Text style={styles.petDate}>Publicado em {formatDate(announcement.createdAt)}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.announcementActions}>
        {isActive ? (
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => Alert.alert('Editar anúncio', 'A tela de edição será adicionada em uma próxima etapa.')}
            style={styles.announcementAction}
          >
            <MaterialCommunityIcons name="pencil-outline" size={16} color={colors.primary} />
            <Text style={styles.announcementActionText}>Editar</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity accessibilityRole="button" onPress={onDelete} style={styles.announcementAction}>
          <MaterialCommunityIcons name="delete-outline" size={16} color={colors.primary} />
          <Text style={styles.announcementActionText}>Excluir</Text>
        </TouchableOpacity>
        {isActive ? (
          <TouchableOpacity
            accessibilityRole="button"
            onPress={onReunited}
            style={[styles.announcementAction, styles.reunitedAction]}
          >
            <MaterialCommunityIcons name="heart-outline" size={16} color={colors.white} />
            <Text style={[styles.announcementActionText, { color: colors.white }]}>Reencontrado</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

export default function MyAnnouncementsScreen({ navigation }) {
  const userId = auth?.currentUser?.uid;
  const [activeTab, setActiveTab] = useState('active');
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadAnnouncements = useCallback(async (isRefresh = false) => {
    if (!userId) {
      setErrorMessage('Entre na sua conta para ver seus anúncios.');
      setLoading(false);
      return;
    }

    setErrorMessage('');
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      setAnnouncements(await getUserAnnouncements(userId, activeTab));
    } catch (error) {
      setErrorMessage('Não foi possível carregar seus anúncios. Tente novamente.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, userId]);

  useFocusEffect(useCallback(() => {
    loadAnnouncements();
  }, [loadAnnouncements]));

  const handleDelete = (announcement) => {
    Alert.alert(
      'Excluir anúncio?',
      'O anúncio será removido permanentemente.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAnnouncement(announcement.id);
              await loadAnnouncements(true);
            } catch (error) {
              Alert.alert('Não foi possível excluir', 'Tente novamente.');
            }
          },
        },
      ]
    );
  };

  const handleReunited = (announcement) => {
    Alert.alert(
      'Pet voltou para casa?',
      'Ao confirmar, este anúncio irá para a aba Reencontrados.',
      [
        { text: 'Ainda não', style: 'cancel' },
        {
          text: 'Sim, ele voltou!',
          onPress: async () => {
            try {
              await markAnnouncementReunited(announcement.id);
              await loadAnnouncements(true);
            } catch (error) {
              Alert.alert('Não foi possível atualizar', 'Tente novamente.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.screenHeader}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Voltar ao perfil"
          onPress={() => navigation.goBack()}
          style={styles.backLink}
        >
          <MaterialCommunityIcons name="arrow-left" size={23} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.screenHeaderTitle}>Meus anúncios</Text>
        <View style={{ width: 35 }} />
      </View>

      <View style={styles.myAdsTabs}>
        {tabs.map((tab) => {
          const selected = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              onPress={() => setActiveTab(tab.key)}
              style={[styles.myAdsTab, selected && styles.myAdsTabActive]}
            >
              <Text style={[styles.tabText, selected && styles.tabTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <View style={styles.listStatus}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.listStatusText}>Carregando seus anúncios...</Text>
        </View>
      ) : errorMessage ? (
        <View style={styles.listStatus}>
          <Text style={styles.listStatusText}>{errorMessage}</Text>
          <TouchableOpacity onPress={() => loadAnnouncements()} style={[styles.secondaryButton, { marginTop: 16 }]}>
            <Text style={styles.secondaryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={announcements}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.myAdsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => loadAnnouncements(true)} />
          }
          ListEmptyComponent={(
            <View style={styles.listStatus}>
              <MaterialCommunityIcons name="paw-outline" size={34} color={colors.muted} />
              <Text style={styles.listStatusTitle}>
                {activeTab === 'active' ? 'Você ainda não tem anúncios ativos' : 'Nenhum reencontro registrado'}
              </Text>
            </View>
          )}
          renderItem={({ item }) => (
            <MyAnnouncementCard
              announcement={item}
              isActive={activeTab === 'active'}
              onOpen={() => navigation.navigate('AnnouncementDetail', { announcementId: item.id })}
              onDelete={() => handleDelete(item)}
              onReunited={() => handleReunited(item)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}
