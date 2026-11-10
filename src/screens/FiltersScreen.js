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
import styles, { colors } from '../styles';

const filterOptions = {
  type: [
    { key: 'lost', label: 'Perdidos' },
    { key: 'found', label: 'Encontrados' },
    { key: 'all', label: 'Todos' },
  ],
  species: [
    { key: 'dog', label: 'Cães' },
    { key: 'cat', label: 'Gatos' },
    { key: 'all', label: 'Todos' },
  ],
  period: [
    { key: '24h', label: '24 horas' },
    { key: '7d', label: '7 dias' },
    { key: '30d', label: '30 dias' },
    { key: 'all', label: 'Todo o período' },
  ],
};

function FilterChoices({ title, options, selected, onSelect }) {
  return (
    <View style={styles.filterSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.filterOptions}>
        {options.map((option) => {
          const active = selected === option.key;
          return (
            <TouchableOpacity
              key={option.key}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => onSelect(option.key)}
              style={[styles.filterChip, active && styles.filterChipSelected]}
            >
              <Text style={[styles.filterChipText, active && styles.filterChipTextSelected]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function FiltersScreen({ navigation, route }) {
  const startFilters = route.params?.filters || {};
  const [type, setType] = useState(startFilters.type || route.params?.activeTab || 'all');
  const [species, setSpecies] = useState(startFilters.species || 'all');
  const [period, setPeriod] = useState(startFilters.period || '7d');
  const [neighborhood, setNeighborhood] = useState(startFilters.neighborhood || '');

  const clearFilters = () => {
    setType('all');
    setSpecies('all');
    setPeriod('all');
    setNeighborhood('');
  };

  const applyFilters = () => {
    const activeTab = type === 'all' ? route.params?.activeTab || 'lost' : type;
    navigation.navigate('Home', {
      activeTab,
      filters: { type, species, period, neighborhood: neighborhood.trim() },
    });
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.filterHeader}>
          <Text style={styles.title}>Filtros</Text>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Fechar filtros"
            onPress={() => navigation.goBack()}
            style={styles.closeButton}
          >
            <MaterialCommunityIcons name="close" size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.filterContent} keyboardShouldPersistTaps="handled">
          <FilterChoices
            title="Tipo de anúncio"
            options={filterOptions.type}
            selected={type}
            onSelect={setType}
          />
          <FilterChoices
            title="Espécie"
            options={filterOptions.species}
            selected={species}
            onSelect={setSpecies}
          />
          <FilterChoices
            title="Período"
            options={filterOptions.period}
            selected={period}
            onSelect={setPeriod}
          />
          <FormField
            label="Bairro"
            value={neighborhood}
            onChangeText={setNeighborhood}
            placeholder="Todos os bairros"
          />
        </ScrollView>

        <View style={styles.filterFooter}>
          <TouchableOpacity style={styles.secondaryButton} onPress={clearFilters}>
            <Text style={styles.secondaryButtonText}>Limpar</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <PrimaryButton title="Aplicar filtros" onPress={applyFilters} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
