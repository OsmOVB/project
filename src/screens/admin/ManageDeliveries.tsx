import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { useAuth } from '@/src/hooks/useAuth';
import { auth, db } from '@/src/firebase/config';
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import Button from '@/src/components/Button';

export default function ManageDeliveries() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [deliverers, setDeliverers] = useState<any[]>([]);

  useEffect(() => {
    if (user?.companyId) fetchDeliverers();
  }, [user]);

  async function fetchDeliverers() {
    if (!user || !user.companyId) {
      setDeliverers([]);
      return;
    }
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'delivery'),
      where('companyId', '==', user.companyId)
    );
    const snapshot = await getDocs(q);
    const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setDeliverers(list);
  }

  async function addDeliverer() {
    if (!email.includes('@')) return Alert.alert('Email inválido');

    if (deliverers.length >= 2) {
      Alert.alert(
        'Limite gratuito atingido',
        'Mais de dois entregadores exige plano adicional.'
      );
    }

    try {
      let userId: string;

      try {
        const cred = await createUserWithEmailAndPassword(
          auth,
          email,
          'SenhaTemp123!'
        );
        userId = cred.user.uid;

        await sendPasswordResetEmail(auth, email);

        if (!user) throw new Error('Usuário não autenticado');
        await setDoc(doc(db, 'users', userId), {
          email,
          role: 'delivery',
          companyId: user?.companyId,
          active: true,
          createdAt: new Date().toISOString(),
        });

        Alert.alert('Entregador criado e convite enviado');
      } catch (err: any) {
        if (err.code === 'auth/email-already-in-use') {
          const q = query(collection(db, 'users'), where('email', '==', email));
          const snapshot = await getDocs(q);
          if (snapshot.empty)
            throw new Error('Usuário já usado mas não localizado');

          const ref = snapshot.docs[0].ref;
          userId = snapshot.docs[0].id;

          await updateDoc(ref, {
            role: 'delivery',
            companyId: user?.companyId,
            active: true,
          });

          await sendPasswordResetEmail(auth, email)
            .then(() => {
              console.log('Convite reenviado');
            })
            .catch((err) => {
              console.error('Erro ao reenviar convite:', err);
            });

          Alert.alert('Entregador vinculado e convite reenviado');
        } else {
          console.error(err);
          Alert.alert('Erro ao adicionar entregador');
          return;
        }
      }

      // 🔒 Log da auditoria
      await setDoc(doc(db, 'invites', userId), {
        email,
        invitedBy: user?.email,
        companyId: user?.companyId,
        role: 'delivery',
        createdAt: Timestamp.now(),
        status: 'pending',
      });

      setEmail('');
      fetchDeliverers();
    } catch (err: any) {
      console.error('❌ Erro geral:', err);
      Alert.alert('Erro', 'Não foi possível adicionar entregador.');
    }
  }

  async function toggleBlock(deliverer: any) {
    const ref = doc(db, 'users', deliverer.id);
    await updateDoc(ref, { active: !deliverer.active });
    fetchDeliverers();
  }

  async function removeDeliverer(email: string) {
    const q = query(
      collection(db, 'users'),
      where('email', '==', email),
      where('companyId', '==', user?.companyId)
    );
    const snapshot = await getDocs(q);
    const docRef = snapshot.docs[0].ref;
    await updateDoc(docRef, {
      role: 'customer',
      companyId: null,
      active: true,
    });
    fetchDeliverers();
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.textPrimary }]}>
        Gerenciar Entregadores
      </Text>

      <TextInput
        placeholder="Email do entregador"
        value={email}
        onChangeText={setEmail}
        style={[
          styles.input,
          { color: theme.textPrimary, borderColor: theme.border },
        ]}
        placeholderTextColor={theme.textSecondary}
      />
      <Button title="Adicionar Entregador" onPress={addDeliverer} />

      <FlatList
        data={deliverers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <Text style={[styles.name, { color: !item.active ? theme.red : theme.green  }]}>
              {item.name || 'Sem nome'} ({item.email}) {' '}
              {item.active ? 'Ativo' : 'Bloqueado'} 
            </Text>
            <View style={styles.actions}>
              <Button
                type="icon"
                title={item.active ? 'Bloquear' : 'Reativar'}
                iconName={item.active ? 'lock-closed' : 'lock-open'}
                iconColor={item.active ? theme.red : theme.green}
                onPress={() => toggleBlock(item)}
              />
              <Button
                type="icon"
                title="Remover"
                iconName="trash"
                iconColor={theme.red}
                onPress={() => removeDeliverer(item.email)}
              />
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  card: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});
