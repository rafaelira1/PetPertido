import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getAnnouncement } from '../services/announcementService';
import styles, { colors } from '../styles';

function formatDate(value) {
  if (!value) return 'Data não informada';
  const date = typeof value.toDate === 'function' ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return 'Data não informada';
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function DetailItem({ label, value }) {
  if (!value) return null;
  return (
    <View style={styles.detailItem}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

export default function AnnouncementDetailScreen({ navigation, route }) {
  const announcementId = route.params?.announcementId;
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadAnnouncement = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const result = await getAnnouncement(announcementId);
      if (!result) setErrorMessage('Este anúncio não está mais disponível.');
      setAnnouncement(result);
    } catch (error) {
      setErrorMessage('Não foi possível carregar o anúncio. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [announcementId]);

  useEffect(() => {
    loadAnnouncement();
  }, [loadAnnouncement]);

  const contactOnWhatsApp = async () => {
    const digits = (announcement?.contactWhatsapp || '').replace(/\D/g, '');
    if (!digits) {
      Alert.alert('Contato indisponível', 'O autor ainda não cadastrou um WhatsApp neste anúncio.');
      return;
    }

    const phone = digits.startsWith('55') ? digits : `55${digits}`;
    const petName = announcement.name || 'o animal anunciado';
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(`Olá! Estou entrando em contato sobre ${petName}.`)}`;
    try {
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert('Não foi possível abrir o WhatsApp', 'Verifique se há um navegador ou WhatsApp disponível.');
    }
  };

  const typeLabel = announcement?.type === 'found' ? 'ENCONTRADO' : 'PERDIDO';
  const location = [announcement?.neighborhood, announcement?.referencePoint].filter(Boolean).join(' · ');

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.screenHeader}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          onPress={() => navigation.goBack()}
          style={styles.backLink}
        >
          <MaterialCommunityIcons name="arrow-left" size={23} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.screenHeaderTitle}>Anúncio</Text>
        <View style={{ width: 35 }} />
      </View>

      {loading ? (
        <View style={styles.listStatus}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.listStatusText}>Carregando anúncio...</Text>
        </View>
      ) : errorMessage ? (
        <View style={styles.listStatus}>
          <Text style={styles.listStatusText}>{errorMessage}</Text>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.detailContent}>
            {announcement.photoUrl ? (
              <Image source={{ uri: announcement.photoUrl }} style={styles.detailPhoto} />
            ) : (
              <View style={[styles.detailPhoto, styles.detailPhotoPlaceholder]}>
                <MaterialCommunityIcons name="paw" size={48} color={colors.muted} />
              </View>
            )}

            <View style={styles.detailHeading}>
              <Text style={styles.badge}>{typeLabel}</Text>
              <Text style={styles.detailTitle}>{announcement.name || 'Pet sem nome'}</Text>
              <Text style={styles.homeSubtitle}>
                Publicado em {formatDate(announcement.createdAt)}
              </Text>
            </View>

            <View style={styles.detailGrid}>
              <DetailItem label="Espécie" value={announcement.species} />
              <DetailItem label="Raça" value={announcement.breed} />
              <DetailItem label="Pelagem" value={announcement.color} />
              <DetailItem label="Porte" value={announcement.size} />
            </View>
            <DetailItem label="Características" value={announcement.characteristics} />
            <DetailItem label="Onde foi visto" value={location || 'Bairro não informado'} />
            <DetailItem label="Data em que foi visto" value={formatDate(announcement.lastSeenAt)} />
          </ScrollView>

          <View style={styles.detailFooter}>
            <TouchableOpacity
              accessibilityRole="button"
              style={styles.secondaryButton}
              onPress={() => Alert.alert('Anúncios parecidos', 'As sugestões de anúncios serão adicionadas em uma próxima etapa.')}
            >
              <MaterialCommunityIcons name="star-four-points-outline" size={17} color={colors.primary} />
              <Text style={[styles.secondaryButtonText, { marginLeft: 6 }]}>Parecidos</Text>
            </TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" style={styles.button} onPress={contactOnWhatsApp}>
              <MaterialCommunityIcons name="message-outline" size={18} color={colors.white} />
              <Text style={[styles.buttonText, { marginLeft: 7 }]}>WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
