import { getApp, getApps, initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, collection, doc, getDoc } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyA1h_lDChMQAEsDUPzO3gWhH5vzb0oStUI',
  authDomain: 'choppgo.firebase.com',
  databaseURL: 'https://choppgo.firebaseio.com',
  projectId: 'choppgo-8f7c4',
  storageBucket: 'com.company.choppGo',
  messagingSenderId: '1019413158991',
  appId: '1:1019413158991:android:d805f323bb2b67ba3e9e3a',
};

// Verifica se o Firebase já foi inicializado antes de inicializar novamente
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Inicializa o Firestore com cache persistente
const db = initializeFirestore(app, {
  localCache: persistentLocalCache()
});

async function checkDatabaseConnection() {
  try {
    const testDocRef = doc(collection(db, 'test'), 'connection');
    const testDoc = await getDoc(testDocRef);
    if (testDoc.exists()) {
      console.log('Conexão com o banco de dados verificada com sucesso.');
    } else {
      console.log('Falha ao verificar a conexão com o banco de dados.');
    }
  } catch (error) {
    console.error('Erro ao verificar a conexão com o banco de dados:', error);
  }
}

export { app, auth, db, firebaseConfig, checkDatabaseConnection };


