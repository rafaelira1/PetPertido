import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import styles from '../postStyles';

// Gemini API (RF07). The key comes from .env, which does not go to GitHub (RNF05).
const GEMINI_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent';

// T11 Anúncios parecidos (RF23). Opens right after a post is published ({ post, justPublished })
// and from the "Parecidos" button of the post detail ({ post }).
function SimilarPostsScreen({ navigation, route }) {
  const { post, justPublished } = route.params;

  // Who lost a pet sees found animals. Who found an animal sees lost pets.
  let otherType = 'lost';
  if (post.type === 'lost') {
    otherType = 'found';
  }

  const [similar, setSimilar] = useState([]);
  const [message, setMessage] = useState('Procurando anúncios parecidos...');

  // Runs once, when the screen opens
  useEffect(() => {
    loadSimilar();
  }, []);

  const loadSimilar = async () => {
    try {
      // Active posts of the other kind with the same species
      const snapshot = await getDocs(
        query(
          collection(db, 'announcements'),
          where('type', '==', otherType),
          where('status', '==', 'active'),
          where('species', '==', post.species)
        )
      );
      let candidates = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      // Newest first. createdAt is a Firestore Timestamp, toMillis() turns it into a number.
      candidates.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
      candidates = candidates.slice(0, 30);

      if (candidates.length === 0) {
        setMessage('Nenhum anúncio parecido ainda.');
        return;
      }

      try {
        // One line for each candidate: "id: breed, color, size, place"
        let question = 'Animal: ' + post.breed + ', ' + post.color + ', ' + post.size + ', ' + post.neighborhood;
        question += '\nCandidates:';
        for (const c of candidates) {
          question += '\n' + c.id + ': ' + c.breed + ', ' + c.color + ', ' + c.size + ', ' + c.neighborhood;
        }
        question += '\nReturn only JSON {"ids": [...]} with up to 5 candidate ids most likely to be the same animal.';

        // Gives up after 10 seconds (RNF02)
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 10000);

        const response = await fetch(GEMINI_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_KEY },
          body: JSON.stringify({
            contents: [{ parts: [{ text: question }] }],
            generationConfig: { responseMimeType: 'application/json' },
          }),
          signal: controller.signal,
        });
        const data = await response.json();
        const result = JSON.parse(data.candidates[0].content.parts[0].text);
        setSimilar(candidates.filter((c) => result.ids.includes(c.id)));
        setMessage('A IA comparou o seu anúncio com os outros.');
      } catch (error) {
        // Plan B: if the AI fails, show the 5 newest of the same species
        setSimilar(candidates.slice(0, 5));
        setMessage('Anúncios recentes da mesma espécie.');
      }
    } catch (error) {
      setMessage('Erro ao buscar anúncios: ' + error.message);
    }
  };

  return (
    <ScrollView style={styles.container_scroll} contentContainerStyle={styles.content_scroll}>
      <View style={styles.box_info}>
        <MaterialCommunityIcons name={justPublished ? 'check' : 'star-four-points-outline'} size={26} color="#111" />
        <View style={styles.column}>
          <Text style={styles.text_choice}>{justPublished ? 'Anúncio publicado!' : 'Anúncios parecidos'}</Text>
          <Text style={styles.text_hint}>{message}</Text>
        </View>
      </View>

      {similar.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.card_post}
          onPress={() => navigation.navigate('AnnouncementDetail', { announcementId: item.id })}
        >
          {item.photoUrl ? (
            <Image source={{ uri: item.photoUrl }} style={styles.photo_post} />
          ) : (
            <View style={styles.photo_post} />
          )}
          <View style={styles.column}>
            <Text style={styles.text_choice}>
              {(item.name || 'Sem nome') + ' · ' + (item.species === 'cat' ? 'Gato' : 'Cão')}
            </Text>
            <Text style={styles.text_hint}>{item.breed + ' ' + item.color + ' · ' + item.size}</Text>
            <Text style={styles.text_hint}>
              {item.neighborhood + (item.lastSeenAt ? ' · ' + item.lastSeenAt.toDate().toLocaleDateString('pt-BR') : '')}
            </Text>
          </View>
        </TouchableOpacity>
      ))}

      <Text style={styles.text_hint_center}>Tocar num anúncio abre o detalhe, onde fica o botão do WhatsApp.</Text>

      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.button_light, styles.column]}
          onPress={() => navigation.navigate('MyAnnouncements')}
        >
          <Text style={styles.text_button_light}>Meus anúncios</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button_dark, styles.column]} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.text_button_dark}>Ir para o início</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

export default SimilarPostsScreen;
