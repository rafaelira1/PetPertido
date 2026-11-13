import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import styles from '../postStyles';

// T15 Confirmar reencontro (RF25). Opens over Meus anúncios (T13) with { post }.
function ReunionScreen({ navigation, route }) {
  const { post } = route.params;

  let question = 'O animal voltou para o dono?';
  if (post.type === 'lost' && post.name) {
    question = 'O ' + post.name + ' voltou para casa?';
  }

  const confirmReunion = async () => {
    try {
      // The post is not deleted: it goes to "Reencontrados" and counts in the profile (RF26)
      await updateDoc(doc(db, 'announcements', post.id), {
        status: 'reunited',
        reunitedAt: serverTimestamp(),
      });
      navigation.goBack();
    } catch (error) {
      alert('Erro ao salvar: ' + error.message);
    }
  };

  return (
    <View style={styles.container_modal}>
      <View style={styles.box_modal}>
        <View style={styles.circle_icon}>
          <MaterialCommunityIcons name="heart-outline" size={30} color="#111" />
        </View>
        <Text style={[styles.text_title, { textAlign: 'center' }]}>{question}</Text>
        <Text style={styles.text_hint_center}>
          O anúncio sai da lista, vai para "Reencontrados" e entra no contador de reencontros do app.
        </Text>

        <TouchableOpacity style={[styles.button_dark, { alignSelf: 'stretch' }]} onPress={confirmReunion}>
          <Text style={styles.text_button_dark}>Sim, ele voltou!</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button_light, { alignSelf: 'stretch' }]} onPress={() => navigation.goBack()}>
          <Text style={styles.text_button_light}>Ainda não</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default ReunionScreen;
