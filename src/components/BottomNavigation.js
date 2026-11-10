import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import styles, { colors } from '../styles';

const items = [
  { key: 'home', label: 'Início', icon: 'home', route: 'Home' },
  { key: 'publish', label: 'Publicar', icon: 'plus-circle-outline' },
  { key: 'profile', label: 'Perfil', icon: 'account-outline', route: 'Profile' },
];

export default function BottomNavigation({ navigation, active }) {
  return (
    <View style={styles.bottomBar}>
      {items.map((item) => {
        const selected = active === item.key;
        const disabled = !item.route;
        return (
          <TouchableOpacity
            key={item.key}
            accessibilityRole="button"
            accessibilityState={{ selected, disabled }}
            disabled={disabled}
            onPress={() => navigation.navigate(item.route)}
            style={[styles.bottomItem, disabled && styles.bottomItemDisabled]}
          >
            <MaterialCommunityIcons
              name={item.icon}
              size={22}
              color={selected ? colors.primary : colors.muted}
            />
            <Text style={[styles.bottomLabel, selected && styles.bottomLabelActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
