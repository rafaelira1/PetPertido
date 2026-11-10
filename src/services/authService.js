import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';

import { auth, db } from './firebaseConfig';

function ensureFirebaseIsReady() {
  if (!auth || !db) {
    const error = new Error('Configure o Firebase antes de usar sua conta.');
    error.code = 'app/firebase-not-configured';
    throw error;
  }
}

export async function signIn(email, password) {
  ensureFirebaseIsReady();
  return signInWithEmailAndPassword(auth, email.trim(), password);
}

export async function createAccount({ name, email, whatsapp, password }) {
  ensureFirebaseIsReady();

  const credential = await createUserWithEmailAndPassword(
    auth,
    email.trim(),
    password
  );

  await setDoc(doc(db, 'users', credential.user.uid), {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    whatsapp: whatsapp.trim(),
    termsAccepted: true,
    termsVersion: '1.0',
    termsAcceptedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  });

  return credential.user;
}

export async function sendPasswordReset(email) {
  ensureFirebaseIsReady();
  return sendPasswordResetEmail(auth, email.trim());
}

export function getAuthErrorMessage(error, action) {
  const code = error?.code;

  if (code === 'app/firebase-not-configured') {
    return error.message;
  }

  if (code === 'auth/network-request-failed') {
    return 'Sem conexão com a internet. Verifique sua rede e tente novamente.';
  }

  if (code === 'auth/too-many-requests') {
    return 'Muitas tentativas. Aguarde um pouco e tente novamente.';
  }

  if (code === 'auth/operation-not-allowed') {
    return 'Ative o provedor E-mail/senha em Firebase Console > Authentication > Sign-in method.';
  }

  if (code === 'auth/invalid-api-key' || code === 'auth/app-not-authorized') {
    return 'A configuração do Firebase não corresponde a este app. Confira os valores do arquivo .env.';
  }

  if (code === 'auth/unauthorized-domain') {
    return 'Adicione localhost em Firebase Console > Authentication > Settings > Authorized domains.';
  }

  if (action === 'login') {
    if (['auth/invalid-credential', 'auth/user-not-found', 'auth/wrong-password'].includes(code)) {
      return 'E-mail ou senha incorretos. Confira os dados e tente novamente.';
    }
    if (code === 'auth/invalid-email') {
      return 'Digite um e-mail válido.';
    }
  }

  if (action === 'register') {
    if (code === 'auth/email-already-in-use') {
      return 'Este e-mail já tem uma conta. Entre ou recupere sua senha.';
    }
    if (code === 'auth/weak-password') {
      return 'Use uma senha com pelo menos 6 caracteres.';
    }
    if (code === 'auth/invalid-email') {
      return 'Digite um e-mail válido.';
    }
    if (code === 'permission-denied' || code === 'firestore/permission-denied') {
      return 'A conta foi criada, mas não foi possível salvar o perfil. Tente novamente mais tarde.';
    }
  }

  if (action === 'reset' && code === 'auth/invalid-email') {
    return 'Digite um e-mail válido.';
  }

  return 'Não foi possível concluir. Confira os dados e tente novamente.';
}
