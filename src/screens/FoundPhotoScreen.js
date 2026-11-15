import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import styles from '../postStyles';

// Gemini API (RF07). The key comes from .env, which does not go to GitHub (RNF05).
const GEMINI_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

// T09 Foto do animal encontrado (RF15). The AI part is RF22.
function FoundPhotoScreen({ navigation }) {
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);

  // Opens the camera or the gallery and keeps the photo as base64 text
  const choosePhoto = async (useCamera) => {
    let result;
    if (useCamera) {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        alert('Libere o acesso à câmera nas configurações do celular.');
        return;
      }
      result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1] });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1] });
    }

    if (!result.canceled) {
      // Shrinks the photo to 600px, so it fits inside a Firestore document (RNF03)
      const context = ImageManipulator.manipulate(result.assets[0].uri);
      context.resize({ width: 600 });
      const image = await context.renderAsync();
      const small = await image.saveAsync({ compress: 0.5, format: SaveFormat.JPEG, base64: true });
      setPhoto(small.base64);
    }
  };

  // Sends the photo to Gemini and opens the form already filled (RF22)
  const fillWithAI = async () => {
    if (photo) {
      setLoading(true);
      try {
        const question =
          'Look at this animal and answer only JSON. "species" is "dog" or "cat". ' +
          'The other fields are in Brazilian Portuguese, all in lowercase: ' +
          '{"species": "dog", "breed": "probable breed", "color": "fur color", ' +
          '"size": "pequeno", "médio" or "grande"}';

        // Gives up after 10 seconds (RNF02)
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 10000);

        const response = await fetch(GEMINI_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_KEY },
          body: JSON.stringify({
            contents: [{ parts: [{ text: question }, { inlineData: { mimeType: 'image/jpeg', data: photo } }] }],
            generationConfig: { responseMimeType: 'application/json' },
          }),
          signal: controller.signal,
        });
        const data = await response.json();
        const pet = JSON.parse(data.candidates[0].content.parts[0].text);
        navigation.navigate('PostForm', { type: 'found', photo: photo, pet: pet });
      } catch (error) {
        alert('Não deu para analisar a foto. Preencha os dados à mão.');
        navigation.navigate('PostForm', { type: 'found', photo: photo });
      }
      setLoading(false);
    } else {
      alert('Tire ou escolha uma foto primeiro.');
    }
  };

  const fillByHand = () => {
    if (photo) {
      navigation.navigate('PostForm', { type: 'found', photo: photo });
    } else {
      alert('Tire ou escolha uma foto primeiro.');
    }
  };

  return (
    <ScrollView style={styles.container_scroll} contentContainerStyle={styles.content_scroll}>
      <View style={styles.photo_big}>
        {photo ? (
          <Image source={{ uri: 'data:image/jpeg;base64,' + photo }} style={styles.photo_fill} />
        ) : (
          <MaterialCommunityIcons name="camera-outline" size={60} color="#999" />
        )}
      </View>
      <Text style={styles.text_hint_center}>Enquadre o animal inteiro, de preferência de lado.</Text>

      <View style={styles.row}>
        <TouchableOpacity style={[styles.button_light, styles.column]} onPress={() => choosePhoto(false)}>
          <MaterialCommunityIcons name="image-outline" size={22} color="#111" />
          <Text style={styles.text_button_light}>Galeria</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button_light, styles.column]} onPress={() => choosePhoto(true)}>
          <MaterialCommunityIcons name="camera-outline" size={22} color="#111" />
          <Text style={styles.text_button_light}>Câmera</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.text_label, { textAlign: 'center', marginTop: 24 }]}>Como quer preencher os dados?</Text>

      <TouchableOpacity style={styles.button_dark} onPress={fillWithAI} disabled={loading}>
        <MaterialCommunityIcons name="creation" size={22} color="#fff" />
        <Text style={styles.text_button_dark}>{loading ? 'Analisando a foto...' : 'Preencher com IA'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button_light} onPress={fillByHand} disabled={loading}>
        <Text style={styles.text_button_light}>Preencher manualmente</Text>
      </TouchableOpacity>

      <Text style={styles.text_hint_center}>
        A IA analisa só o animal. Se ela não conseguir, você preenche à mão.
      </Text>
    </ScrollView>
  );
}

export default FoundPhotoScreen;
