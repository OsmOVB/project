import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '@/src/firebase/config';
import { Container, Title, Input, ErrorText } from '@/src/components/styled';
import Button from '@/src/components/Button';

// 🔒 Validação com Zod
const schema = z.object({
  name: z.string().min(2, 'Nome da empresa obrigatório'),
});

type CompanyForm = z.infer<typeof schema>;

export default function RegisterCompany() {
  const router = useRouter();
  const { control, handleSubmit, formState: { errors } } = useForm<CompanyForm>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: CompanyForm) => {
    try {
      // 🧠 Recupera o usuário logado
       const currentUser = auth.currentUser;

    if (!currentUser) {
      Alert.alert('Erro', 'Usuário não autenticado.');
      return;
    }
      // 🏢 Cria a empresa
      const companyRef = await addDoc(collection(db, 'companies'), {
        name: data.name,
        createdAt: new Date().toISOString(),
        ownerId: currentUser.uid,
      });

      // 🔁 Atualiza o user com companyId
      await updateDoc(doc(db, 'users', currentUser.uid), {
        companyId: companyRef.id,
      });

      // 💾 Atualiza o localStorage
      const updatedUser = { ...currentUser, companyId: companyRef.id };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

      // ✅ Redireciona para home
      router.replace('/');
    } catch (err) {
      console.error(err);
      Alert.alert('Erro', 'Não foi possível registrar a empresa.');
    }
  };

  return (
    <Container>
      <View style={styles.formContainer}>
        <Title>Cadastro da Empresa</Title>

        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <Input placeholder="Nome da empresa" value={value} onChangeText={onChange} />
          )}
        />
        {errors.name && <ErrorText>{errors.name.message}</ErrorText>}

        <Button title="Salvar" onPress={handleSubmit(onSubmit)} />
        <Button title="Cancelar" type="outline" onPress={() => router.back()} />
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
});
