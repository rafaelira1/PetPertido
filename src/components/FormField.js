import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import styles, { colors } from '../styles';

export default function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoComplete,
  secureTextEntry = false,
  actionLabel,
  onActionPress,
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          secureTextEntry={secureTextEntry}
          returnKeyType="next"
        />
        {actionLabel ? (
          <TouchableOpacity
            accessibilityRole="button"
            onPress={onActionPress}
            style={styles.inputAction}
          >
            <Text style={styles.inputActionText}>{actionLabel}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}
