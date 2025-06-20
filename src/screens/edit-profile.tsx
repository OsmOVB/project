import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/src/firebase/config';
import Button from '@/src/components/Button';
import { useAuth } from '../context/AuthContext';
import { navigate } from '../navigation/NavigationService';

export default function EditProfile() {
    // const router = useRouter();
    const { theme } = useTheme();
    const { user } = useAuth();

    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');

    const handleSave = async () => {
        if (user?.uid) {
            await updateDoc(doc(db, 'users', user.uid), {
                name,
                email,
            });
            navigate.back();
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Text style={[styles.title, { color: theme.textPrimary }]}>
                Editar Informações
            </Text>

            <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Nome"
                style={[styles.input, { backgroundColor: theme.inputBg, color: theme.textPrimary }]}
                placeholderTextColor={theme.textSecondary}
            />

            <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="E-mail"
                keyboardType="email-address"
                style={[styles.input, { backgroundColor: theme.inputBg, color: theme.textPrimary }]}
                placeholderTextColor={theme.textSecondary}
            />

            <Button title="Salvar" onPress={handleSave} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 24,
    },
    input: {
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 16,
    },
});
