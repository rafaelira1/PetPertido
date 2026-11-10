import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signOut } from 'firebase/auth';

import BottomNavigation from '../components/BottomNavigation';
import { getActiveAnnouncements } from '../services/announcementService';
import { auth } from '../services/firebaseConfig';
import styles, { colors } from '../styles';

const tabs = [
  { key: 'lost', label: 'Perdidos' },
  { key: 'found', label: 'Encontrados' },
];

function formatDate(value) {
  if (!value) return 'Data não informada';

  const date = typeof value.toDate === 'function' ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return 'Data não informada';

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });
}

function getSpeciesLabel(species) {
  if (species === 'dog' || species === 'cachorro' || species === 'cão') return 'Cão';
  if (species === 'cat' || species === 'gato') return 'Gato';
  return species || 'Espécie não informada';
}

function AnnouncementCard({ announcement, type, onPress }) {
  const name = announcement.name || (type === 'lost' ? 'Pet perdido' : 'Animal encontrado');
  const details = [
    getSpeciesLabel(announcement.species),
    announcement.breed,
  ].filter(Boolean).join(' · ');
  const location = announcement.neighborhood || announcement.referencePoint || 'Fortaleza, CE';

  return (
    <TouchableOpacity accessibilityRole="button" activeOpacity={0.8} onPress={onPress} style={styles.petCard}>
      {announcement.photoUrl ? (
        <Image source={{ uri: announcement.photoUrl }} style={styles.petImagePhoto} />
      ) : (
        <View style={styles.petImage}>
          <MaterialCommunityIcons name="paw" size={28} color={colors.muted} />
        </View>
      )}
      <View style={styles.petInfo}>
        <Text style={styles.badge}>{type === 'lost' ? 'PERDIDO' : 'ENCONTRADO'}</Text>
        <Text numberOfLines={1} style={styles.petName}>{name}</Text>
        <Text numberOfLines={1} style={styles.petDescription}>{details}</Text>
        <Text numberOfLines={1} style={styles.petDate}>
          {location} · {formatDate(announcement.createdAt)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation, route }) {
  const [activeTab, setActiveTab] = useState('lost');
  const [filters, setFilters] = useState({
    type: 'all',
    species: 'all',
    period: '7d',
    neighborhood: '',
  });
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (route.params?.filters) {
      setFilters({
        type: 'all',
        species: 'all',
        period: '7d',
        neighborhood: '',
        ...route.params.filters,
      });
    }
    if (route.params?.activeTab) setActiveTab(route.params.activeTab);
  }, [route.params?.filters, route.params?.activeTab]);

  const loadAnnouncements = useCallback(async (isRefresh = false) => {
    setErrorMessage('');
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const results = await getActiveAnnouncements(activeTab, filters);
      setAnnouncements(results);
    } catch (error) {
      setAnnouncements([]);
      setErrorMessage(
        error?.code === 'app/firebase-not-configured'
          ? 'Configure o Firebase para carregar os anúncios.'
          : 'Não foi possível carregar os anúncios. Tente novamente.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, filters]);

  useEffect(() => {
    loadAnnouncements();
  }, [loadAnnouncements]);

  const handleSignOut = async () => {
    if (auth) await signOut(auth);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.homeHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={styles.homeTitle}>Pet Perdido</Text>
            <Text style={styles.homeSubtitle}>Anúncios recentes · Fortaleza, CE</Text>
          </View>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Sair da conta"
            onPress={handleSignOut}
            style={{ padding: 8 }}
          >
            <MaterialCommunityIcons name="logout" size={21} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.tabRow} accessibilityRole="tablist">
          {tabs.map((tab) => {
            const selected = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                onPress={() => setActiveTab(tab.key)}
                style={[styles.tabButton, selected && styles.tabButtonActive]}
              >
                <Text style={[styles.tabText, selected && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.homeActionRow}>
          <Text style={styles.homeSubtitle}>Anúncios recentes</Text>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => navigation.navigate('Filters', { filters, activeTab })}
            style={styles.filterButton}
          >
            <MaterialCommunityIcons name="tune-variant" size={17} color={colors.primary} />
            <Text style={styles.filterButtonText}>Filtros</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        {loading ? (
          <View style={styles.listStatus}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.listStatusText}>Carregando anúncios...</Text>
          </View>
        ) : errorMessage ? (
          <View style={styles.listStatus}>
            <MaterialCommunityIcons name="wifi-alert" size={30} color={colors.muted} />
            <Text style={styles.listStatusTitle}>Não foi possível abrir a lista</Text>
            <Text style={styles.listStatusText}>{errorMessage}</Text>
            <TouchableOpacity onPress={() => loadAnnouncements()} style={[styles.secondaryButton, { marginTop: 18 }]}>
              <Text style={styles.secondaryButtonText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : announcements.length === 0 ? (
          <View style={styles.listStatus}>
            <MaterialCommunityIcons name="paw-outline" size={34} color={colors.muted} />
            <Text style={styles.listStatusTitle}>
              Nenhum pet {activeTab === 'lost' ? 'perdido' : 'encontrado'} por enquanto
            </Text>
            <Text style={styles.listStatusText}>
              Quando houver novos anúncios, eles aparecerão aqui.
            </Text>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => loadAnnouncements(true)}
              style={[styles.secondaryButton, { marginTop: 18 }]}
            >
              <Text style={styles.secondaryButtonText}>Atualizar lista</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={announcements}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <AnnouncementCard
                announcement={item}
                type={activeTab}
                onPress={() => navigation.navigate('AnnouncementDetail', { announcementId: item.id })}
              />
            )}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => loadAnnouncements(true)} />
            }
          />
        )}
      </View>

      <BottomNavigation navigation={navigation} active="home" />
    </SafeAreaView>
  );
}
