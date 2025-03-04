import { getApp, getApps, initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_KEY, AUTH_DOMAIN, PROJECT_ID, STORAGE_BUCKET, MESSAGING_SENDER_ID, APP_ID } from "@env";

// 🔹 Configuração extraída do seu `google-services.json`
const firebaseConfig = {
  apiKey: API_KEY,
  authDomain: AUTH_DOMAIN,
  projectId: PROJECT_ID,
  storageBucket: STORAGE_BUCKET,
  messagingSenderId: MESSAGING_SENDER_ID,
  appId: APP_ID,
};

// 🔹 Garante que o Firebase só seja inicializado uma vez
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// 🔹 Inicializa Firebase Auth com AsyncStorage para persistência do login
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// 🔹 Inicializa Firestore
const db = getFirestore(app);

export { auth, db, firebaseConfig };
