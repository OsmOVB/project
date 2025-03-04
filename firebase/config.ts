import { getApp, getApps, initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🔹 Configuração extraída do seu `google-services.json`


// 🔹 Garante que o Firebase só seja inicializado uma vez
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// 🔹 Inicializa Firebase Auth com AsyncStorage para persistência do login
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// 🔹 Inicializa Firestore
const db = getFirestore(app);

export { auth, db, firebaseConfig };
