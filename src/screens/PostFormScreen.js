import React, { useState, useEffect, useRef } from 'react';
import { ActivityIndicator, View, Text, TextInput, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { collection, addDoc, doc, getDoc, updateDoc, deleteDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { auth, db } from '../services/firebaseConfig';
import styles from '../postStyles';

// One form for three screens. What arrives in route.params decides which one:
// T08 Pet perdido:       { type: 'lost' }
// T10 Animal encontrado: { type: 'found', photo, pet }  (pet comes from the AI)
// T14 Editar anúncio:    { post }  (a post from the "announcements" collection)
function PostFormScreen({ navigation, route }) {
  const { post, pet } = route.params;
  const type = post ? post.type : route.params.type;
  const isLost = type === 'lost';

  // Where the first values come from: the saved post, the AI answer or nothing
  const start = post || pet || {};

  // The photo is kept as a data URI ("data:image/jpeg;base64,...") inside the post (RNF03)
  let startPhoto = null;
  if (post) {
    startPhoto = post.photoUrl;
  } else if (route.params.photo) {
    startPhoto = 'data:image/jpeg;base64,' + route.params.photo;
  }

  // The date the pet was seen is a Firestore Timestamp; the field shows it as dd/mm/aaaa
  let startDate = new Date().toLocaleDateString('pt-BR');
  if (post && post.lastSeenAt) {
    startDate = post.lastSeenAt.toDate().toLocaleDateString('pt-BR');
  }

  const [photo, setPhoto] = useState(startPhoto);
  const [name, setName] = useState(start.name || '');
  const [species, setSpecies] = useState(start.species || '');
  const [breed, setBreed] = useState(start.breed || '');
  const [color, setColor] = useState(start.color || '');
  const [size, setSize] = useState(start.size || '');
  const [characteristics, setCharacteristics] = useState(start.characteristics || '');
  const [neighborhood, setNeighborhood] = useState(start.neighborhood || '');
  const [referencePoint, setReferencePoint] = useState(start.referencePoint || '');
  const [situation, setSituation] = useState(start.situation || 'Está comigo');
  const [date, setDate] = useState(startDate);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);

  const clearError = (field) => {
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const fieldError = (field) => errors[field] ? (
    <Text accessibilityRole="alert" style={{ color: '#b42318', marginTop: 4 }}>{errors[field]}</Text>
  ) : null;

  // Changes the title at the top of the screen
  useEffect(() => {
    if (post) {
      navigation.setOptions({ title: 'Editar anúncio' });
    } else if (isLost) {
      navigation.setOptions({ title: 'Pet perdido' });
    } else {
      navigation.setOptions({ title: 'Animal encontrado' });
    }
  }, []);

  // Opens the gallery and keeps the photo, smaller, as base64 text (RNF03)
  const choosePhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1] });
    if (!result.canceled) {
      const context = ImageManipulator.manipulate(result.assets[0].uri);
      context.resize({ width: 600 });
      const image = await context.renderAsync();
      const small = await image.saveAsync({ compress: 0.5, format: SaveFormat.JPEG, base64: true });
      setPhoto('data:image/jpeg;base64,' + small.base64);
      clearError('photo');
    }
  };

  // Turns "dd/mm/aaaa" into a Date. Returns null when the text is not a real date.
  const readDate = (text) => {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(text)) return null;
    const parts = text.split('/');
    const day = Number(parts[0]);
    const month = Number(parts[1]);
    const year = Number(parts[2]);
    const value = new Date(year, month - 1, day);
    if (value.getFullYear() !== year || value.getDate() !== day || value.getMonth() !== month - 1) {
      return null;
    }
    return value;
  };

  const savePost = async () => {
    if (savingRef.current) return;
    const seenAt = readDate(date.trim());
    const validationErrors = {};
    if (!photo) validationErrors.photo = 'Adicione uma foto do animal.';
    if (isLost && !name.trim()) validationErrors.name = 'Informe o nome do pet.';
    if (!species) validationErrors.species = 'Selecione a espécie do animal.';
    if (!size) validationErrors.size = 'Selecione o porte do animal.';
    if (!neighborhood.trim()) validationErrors.neighborhood = 'Informe o bairro.';
    if (!seenAt) {
      validationErrors.date = 'Informe uma data válida no formato dd/mm/aaaa.';
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (seenAt > today) validationErrors.date = 'A data não pode estar no futuro.';
    }
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) return;

    savingRef.current = true;
    setSaving(true);
    try {
      const postData = {
        name: name.trim(),
        photoUrl: photo,
        species: species,
        breed: breed,
        color: color,
        size: size,
        characteristics: characteristics,
        neighborhood: neighborhood.trim(),
        referencePoint: referencePoint,
        lastSeenAt: Timestamp.fromDate(seenAt),
      };
      if (!isLost) {
        postData.situation = situation;
      }

      if (post) {
        // T14: Update (RF13, RF17)
        await updateDoc(doc(db, 'announcements', post.id), postData);
        alert('Anúncio atualizado com sucesso!');
        navigation.goBack();
      } else {
        // T08 and T10: Create (RF11, RF15)
        const user = await getDoc(doc(db, 'users', auth.currentUser.uid));
        postData.userId = auth.currentUser.uid;
        postData.type = type;
        postData.status = 'active';
        postData.createdAt = serverTimestamp();
        postData.contactWhatsapp = user.exists() ? user.data().whatsapp || '' : '';

        const newPost = await addDoc(collection(db, 'announcements'), postData);
        postData.id = newPost.id;

        // Início stays below Parecidos, so "back" does not open the form again
        navigation.reset({
          index: 1,
          routes: [
            { name: 'Home' },
            { name: 'SimilarPosts', params: { post: postData, justPublished: true } },
          ],
        });
      }
    } catch (error) {
      alert('Erro ao salvar: ' + error.message);
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  // T14: Delete (RF14, RF18)
  const deletePost = () => {
    Alert.alert('Excluir anúncio', 'Tem certeza? Não dá para desfazer.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'announcements', post.id));
            navigation.goBack();
          } catch (error) {
            alert('Erro ao excluir: ' + error.message);
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container_scroll} contentContainerStyle={styles.content_scroll}>
      {pet && (
        <View style={styles.box_info}>
          <MaterialCommunityIcons name="creation" size={24} color="#111" />
          <View style={styles.column}>
            <Text style={styles.text_choice}>Análise da IA concluída</Text>
            <Text style={styles.text_hint}>Confira os campos sugeridos e corrija o que precisar.</Text>
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.photo_small} onPress={choosePhoto}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.photo_fill} />
        ) : (
          <MaterialCommunityIcons name="camera-outline" size={32} color="#111" />
        )}
      </TouchableOpacity>
      <Text style={styles.text_hint}>Toque na foto para escolher outra. De preferência do corpo inteiro.</Text>
      {fieldError('photo')}

      {isLost && (
        <View>
          <Text style={styles.text_label}>Nome do pet</Text>
          <TextInput
            style={styles.text_input}
            placeholder="Ex.: Thor"
            placeholderTextColor="gray"
            value={name}
            onChangeText={(value) => { setName(value); clearError('name'); }}
          />
          {fieldError('name')}
        </View>
      )}

      <Text style={styles.text_label}>Espécie</Text>
      <View style={styles.row}>
        <TouchableOpacity
          style={species === 'dog' ? styles.option_selected : styles.option}
          onPress={() => { setSpecies('dog'); clearError('species'); }}
        >
          <Text style={species === 'dog' ? styles.text_option_selected : styles.text_option}>Cão</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={species === 'cat' ? styles.option_selected : styles.option}
          onPress={() => { setSpecies('cat'); clearError('species'); }}
        >
          <Text style={species === 'cat' ? styles.text_option_selected : styles.text_option}>Gato</Text>
        </TouchableOpacity>
      </View>
      {fieldError('species')}

      <View style={styles.row}>
        <View style={styles.column}>
          <Text style={styles.text_label}>Raça</Text>
          <TextInput
            style={styles.text_input}
            placeholder="Ex.: vira-lata"
            placeholderTextColor="gray"
            value={breed}
            onChangeText={setBreed}
          />
        </View>
        <View style={styles.column}>
          <Text style={styles.text_label}>Cor da pelagem</Text>
          <TextInput
            style={styles.text_input}
            placeholder="Ex.: caramelo"
            placeholderTextColor="gray"
            value={color}
            onChangeText={setColor}
          />
        </View>
      </View>

      <Text style={styles.text_label}>Porte</Text>
      <View style={styles.row}>
        <TouchableOpacity
          style={size === 'pequeno' ? styles.option_selected : styles.option}
          onPress={() => { setSize('pequeno'); clearError('size'); }}
        >
          <Text style={size === 'pequeno' ? styles.text_option_selected : styles.text_option}>Pequeno</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={size === 'médio' ? styles.option_selected : styles.option}
          onPress={() => { setSize('médio'); clearError('size'); }}
        >
          <Text style={size === 'médio' ? styles.text_option_selected : styles.text_option}>Médio</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={size === 'grande' ? styles.option_selected : styles.option}
          onPress={() => { setSize('grande'); clearError('size'); }}
        >
          <Text style={size === 'grande' ? styles.text_option_selected : styles.text_option}>Grande</Text>
        </TouchableOpacity>
      </View>
      {fieldError('size')}

      <Text style={styles.text_label}>Características marcantes</Text>
      <TextInput
        style={styles.text_input_big}
        placeholder="Coleira, manchas, cicatriz, comportamento..."
        placeholderTextColor="gray"
        value={characteristics}
        onChangeText={setCharacteristics}
        multiline
      />

      <Text style={styles.text_label}>{isLost ? 'Bairro onde foi visto pela última vez' : 'Bairro onde encontrou'}</Text>
      <TextInput
        style={styles.text_input}
        placeholder="Ex.: Meireles"
        placeholderTextColor="gray"
        value={neighborhood}
        onChangeText={(value) => { setNeighborhood(value); clearError('neighborhood'); }}
      />
      {fieldError('neighborhood')}
      <Text style={styles.text_label}>Ponto de referência</Text>
      <TextInput
        style={styles.text_input}
        placeholder="Ex.: perto da Praça Portugal"
        placeholderTextColor="gray"
        value={referencePoint}
        onChangeText={setReferencePoint}
      />
      <Text style={styles.text_hint}>Coloque só um ponto de referência, nunca o endereço exato.</Text>

      {!isLost && (
        <View>
          <Text style={styles.text_label}>Situação do animal</Text>
          <View style={styles.row}>
            <TouchableOpacity
              style={situation === 'Está comigo' ? styles.option_selected : styles.option}
              onPress={() => setSituation('Está comigo')}
            >
              <Text style={situation === 'Está comigo' ? styles.text_option_selected : styles.text_option}>
                Está comigo
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={situation === 'Ficou no local' ? styles.option_selected : styles.option}
              onPress={() => setSituation('Ficou no local')}
            >
              <Text style={situation === 'Ficou no local' ? styles.text_option_selected : styles.text_option}>
                Ficou no local
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={situation === 'Em ONG/clínica' ? styles.option_selected : styles.option}
              onPress={() => setSituation('Em ONG/clínica')}
            >
              <Text style={situation === 'Em ONG/clínica' ? styles.text_option_selected : styles.text_option}>
                Em ONG/clínica
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Text style={styles.text_label}>{isLost ? 'Quando sumiu' : 'Quando encontrou'}</Text>
      <TextInput
        style={styles.text_input}
        placeholder="dd/mm/aaaa"
        placeholderTextColor="gray"
        value={date}
        onChangeText={(value) => { setDate(value); clearError('date'); }}
      />
      {fieldError('date')}

      {Object.keys(errors).length > 0 && (
        <Text accessibilityRole="alert" style={{ color: '#b42318', marginTop: 12 }}>
          Confira os campos destacados acima antes de continuar.
        </Text>
      )}

      <TouchableOpacity
        style={[styles.button_dark, saving && { opacity: 0.6 }]}
        onPress={savePost}
        disabled={saving}
        accessibilityRole="button"
        accessibilityState={{ disabled: saving, busy: saving }}
      >
        {saving && <ActivityIndicator color="#fff" />}
        <Text style={styles.text_button_dark}>{saving ? 'Salvando...' : post ? 'Salvar alterações' : 'Publicar anúncio'}</Text>
      </TouchableOpacity>

      {post && (
        <TouchableOpacity onPress={deletePost} disabled={saving}>
          <Text style={styles.text_link}>Excluir anúncio</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

export default PostFormScreen;
