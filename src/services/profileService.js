import {
  collection,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore';

import { db } from './firebaseConfig';

function requireDatabase() {
  if (!db) {
    const error = new Error('Configure o Firebase para acessar o perfil.');
    error.code = 'app/firebase-not-configured';
    throw error;
  }
}

export async function getUserProfile(userId) {
  requireDatabase();
  const snapshot = await getDoc(doc(db, 'users', userId));
  return snapshot.exists() ? snapshot.data() : {};
}

export async function getProfileStats(userId) {
  requireDatabase();
  const ads = collection(db, 'announcements');
  const activeQuery = query(
    ads,
    where('userId', '==', userId),
    where('status', '==', 'active')
  );
  const reunitedQuery = query(
    ads,
    where('userId', '==', userId),
    where('status', '==', 'reunited')
  );
  const allReunitedQuery = query(ads, where('status', '==', 'reunited'));

  const [active, reunited, allReunited] = await Promise.all([
    getCountFromServer(activeQuery),
    getCountFromServer(reunitedQuery),
    getCountFromServer(allReunitedQuery),
  ]);

  return {
    active: active.data().count,
    reunited: reunited.data().count,
    totalReunited: allReunited.data().count,
  };
}

export async function updateUserProfile(userId, name, whatsapp) {
  requireDatabase();
  await setDoc(
    doc(db, 'users', userId),
    { name: name.trim(), whatsapp: whatsapp.trim() },
    { merge: true }
  );
}

export async function deleteUserData(userId) {
  requireDatabase();
  const userAdsQuery = query(
    collection(db, 'announcements'),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(userAdsQuery);
  const documents = snapshot.docs;

  // Firestore batches allow up to 500 writes; delete ads in smaller groups.
  for (let index = 0; index < documents.length; index += 400) {
    const batch = writeBatch(db);
    documents.slice(index, index + 400).forEach((announcement) => {
      batch.delete(announcement.ref);
    });
    if (index + 400 >= documents.length) {
      batch.delete(doc(db, 'users', userId));
    }
    await batch.commit();
  }

  if (documents.length === 0) {
    const batch = writeBatch(db);
    batch.delete(doc(db, 'users', userId));
    await batch.commit();
  }
}
