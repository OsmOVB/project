// src/contexts/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

interface AuthContextProps {
  user: {
    uid: string;
    name: string;
    email: string;
    role: string;
    companyId?: string;
  } | null;
  loading: boolean;
  logout: () => Promise<void>;
}
interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthContext = createContext<AuthContextProps | null>(null);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthContextProps['user']>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUser({
            uid: firebaseUser.uid,
            name: userDoc.data().name || firebaseUser.displayName || '',
            email: firebaseUser.email!,
            role: userDoc.data().role,
            companyId: userDoc.data().companyId,
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false); // Finaliza o carregamento
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    const auth = getAuth();
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return context;
};
