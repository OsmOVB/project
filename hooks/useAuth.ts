import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { User } from '../types';

interface AuthState {
  user: User | null;
  isLoading: boolean; // Estado de carregamento
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true, // 🔹 Começa carregando

      // 📌 Função de login
      login: async (email, password) => {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;

        const userDoc = await getDoc(doc(db, 'users', uid));
        if (!userDoc.exists()) throw new Error('Usuário não encontrado.');

        const userData = userDoc.data() as User;
        set({ user: userData, isLoading: false });

        await AsyncStorage.setItem('user', JSON.stringify(userData));
      },

      // 📌 Função de logout
      logout: async () => {
        await signOut(auth);
        set({ user: null, isLoading: false });
        await AsyncStorage.removeItem('user');
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// 📌 Recupera o estado de autenticação ao iniciar o app
onAuthStateChanged(auth, async (firebaseUser) => {
  if (firebaseUser) {
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data() as User;
      useAuth.setState({ user: userData, isLoading: false });
    }
  } else {
    useAuth.setState({ user: null, isLoading: false });
  }
});
