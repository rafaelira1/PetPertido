import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import styles from '../postStyles';

// T07 Publicar: the user chooses the kind of post (RF06)
function NewPostScreen({ navigation }) {
  return (
    <View style={styles.container_screen}>
      <Text style={styles.text_title}>O que aconteceu?</Text>
      <Text style={styles.text_hint}>Escolha o tipo de anúncio.</Text>

      <TouchableOpacity
        style={styles.card_choice}
        onPress={() => navigation.navigate('PostForm', { type: 'lost' })}
      >
        <View style={styles.circle_icon}>
          <MaterialCommunityIcons name="magnify" size={30} color="#111" />
        </View>
        <Text style={styles.text_choice}>Perdi meu pet</Text>
        <Text style={styles.text_hint}>Publique foto, características e o último lugar onde ele foi visto.</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card_choice} onPress={() => navigation.navigate('FoundPhoto')}>
        <View style={styles.circle_icon}>
          <MaterialCommunityIcons name="camera-outline" size={30} color="#111" />
        </View>
        <Text style={styles.text_choice}>Encontrei um animal</Text>
        <Text style={styles.text_hint}>Tire uma foto. A IA ajuda a descrever o animal para o tutor se reconhecer.</Text>
      </TouchableOpacity>

      <Text style={styles.text_hint_center}>
        Depois de publicado, você edita ou exclui o anúncio em Perfil, Meus anúncios.
      </Text>
    </View>
  );
}

export default NewPostScreen;
