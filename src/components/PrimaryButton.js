import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';

import styles, { colors } from '../styles';

export default function PrimaryButton({
  title,
  onPress,
  loading = false,
  disabled = false,
}) {
  const unavailable = disabled || loading;

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={{ disabled: unavailable, busy: loading }}
      style={[styles.button, unavailable && styles.buttonDisabled]}
      onPress={onPress}
      disabled={unavailable}
    >
      {loading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <Text style={styles.buttonText}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
