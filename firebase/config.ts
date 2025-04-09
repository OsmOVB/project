import { getApp, getApps, initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";
import { config } from "@/utils/config";

const firebaseConfig = {
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  projectId: config.projectId,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
  appId: config.appId,
};

// 🔹 Inicializa o Firebase apenas uma vez
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// 🔹 Configura o Auth com persistência no AsyncStorage
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// 🔹 Inicializa o Firestore
const db = getFirestore(app);

// ✅ Logs para confirmar inicialização
console.log("✅ Firebase App inicializado:", app.name);
console.log("✅ Firebase Auth inicializado:", auth);

export { auth, db, firebaseConfig };
