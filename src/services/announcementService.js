import {
  Timestamp,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

import { db } from './firebaseConfig';

function requireDatabase() {
  if (!db) {
    const error = new Error('Configure o Firebase para carregar os anúncios.');
    error.code = 'app/firebase-not-configured';
    throw error;
  }
}

export async function getActiveAnnouncements(type, filters = {}) {
  requireDatabase();

  const constraints = [
    where('type', '==', type),
    where('status', '==', 'active'),
  ];

  if (filters.species && filters.species !== 'all') {
    constraints.push(where('species', '==', filters.species));
  }
  if (filters.neighborhood?.trim()) {
    constraints.push(where('neighborhood', '==', filters.neighborhood.trim()));
  }
  if (filters.period && filters.period !== 'all') {
    const days = filters.period === '24h' ? 1 : filters.period === '7d' ? 7 : 30;
    const from = new Date();
    from.setDate(from.getDate() - days);
    constraints.push(where('createdAt', '>=', Timestamp.fromDate(from)));
  }

  const announcementsQuery = query(
    collection(db, 'announcements'),
    ...constraints,
    orderBy('createdAt', 'desc'),
    limit(30)
  );

  const snapshot = await getDocs(announcementsQuery);
  return snapshot.docs.map((announcement) => ({
    id: announcement.id,
    ...announcement.data(),
  }));
}

export async function getAnnouncement(announcementId) {
  requireDatabase();
  const snapshot = await getDoc(doc(db, 'announcements', announcementId));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() };
}

export async function getUserAnnouncements(userId, status) {
  requireDatabase();
  const announcementsQuery = query(
    collection(db, 'announcements'),
    where('userId', '==', userId),
    where('status', '==', status),
    orderBy('createdAt', 'desc'),
    limit(100)
  );
  const snapshot = await getDocs(announcementsQuery);
  return snapshot.docs.map((announcement) => ({
    id: announcement.id,
    ...announcement.data(),
  }));
}

export async function markAnnouncementReunited(announcementId) {
  requireDatabase();
  await updateDoc(doc(db, 'announcements', announcementId), {
    status: 'reunited',
    reunitedAt: serverTimestamp(),
  });
}

export async function deleteAnnouncement(announcementId) {
  requireDatabase();
  await deleteDoc(doc(db, 'announcements', announcementId));
}
