import { getApp, getApps, initializeApp } from "firebase/app";
import { 
  browserLocalPersistence, 
  initializeAuth, 
  getReactNativePersistence
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { config } from "@/utils/config";
import { Platform } from "react-native";

// 🔹 Configuração extraída do seu `google-services.json`
const firebaseConfig = {
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  projectId: config.projectId,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
  appId: config.appId,
};

// 🔹 Garante que o Firebase só seja inicializado uma vez
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// 🔹 Configuração do Auth para persistência no Mobile e Web
const auth = Platform.OS === "web"
  ? initializeAuth(app, { persistence: browserLocalPersistence }) 
  : initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });

const db = getFirestore(app);
// 🔍 Verificar se a inicialização está funcionando
console.log("✅ Firebase App inicializado:", app.name);
console.log("✅ Firebase Auth inicializado:", auth);

export { auth, db, firebaseConfig };
