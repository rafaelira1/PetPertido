import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Text, TouchableOpacity, View } from 'react-native';

import styles, { colors } from '../styles';

export default function DeleteAnnouncementModal({ visible, onCancel, onConfirm, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const deletingRef = useRef(false);

  useEffect(() => {
    if (visible) setError('');
  }, [visible]);

  const confirmDelete = async () => {
    if (deletingRef.current) return;
    deletingRef.current = true;
    setDeleting(true);
    setError('');
    try {
      await onConfirm();
      setDeleting(false);
      deletingRef.current = false;
      onCancel();
      if (onDeleted) onDeleted();
    } catch (error) {
      setError(error?.code === 'permission-denied'
        ? 'Você não tem permissão para excluir este anúncio.'
        : 'Não foi possível excluir o anúncio. Verifique sua conexão e tente novamente.');
      setDeleting(false);
      deletingRef.current = false;
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => { if (!deleting) onCancel(); }}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard} accessibilityViewIsModal>
          <Text style={styles.sectionTitle}>Excluir anúncio?</Text>
          <Text style={styles.listStatusText}>O anúncio será removido permanentemente.</Text>
          {error ? <Text accessibilityRole="alert" style={{ color: colors.danger, marginTop: 12 }}>{error}</Text> : null}
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={{ disabled: deleting, busy: deleting }}
            disabled={deleting}
            onPress={confirmDelete}
            style={[styles.button, { marginTop: 16, opacity: deleting ? 0.6 : 1 }]}
          >
            {deleting ? <ActivityIndicator color={colors.white} /> : <Text style={styles.buttonText}>Excluir anúncio</Text>}
          </TouchableOpacity>
          <TouchableOpacity accessibilityRole="button" disabled={deleting} onPress={onCancel} style={styles.modalCancel}>
            <Text style={styles.secondaryButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
