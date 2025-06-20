import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { Container, Title } from '@/src/components/styled';
import { useAuth } from '@/src/context/AuthContext';
import { navigate } from '@/src/navigation/NavigationService';

const helpTopics = [
    {
        id: '1',
        title: 'Como alterar minha senha?',
        answer: 'Vá até a tela de perfil, toque em "Editar informações" e selecione a opção de alterar senha.',
    },
    {
        id: '2',
        title: 'Como editar meus dados cadastrais?',
        answer: 'Na tela de perfil, toque em "Editar informações" e altere os dados desejados.',
    },
    {
        id: '3',
        title: 'Não consigo fazer login, o que fazer?',
        answer: 'Verifique sua conexão com a internet, tente reiniciar o app ou redefina sua senha.',
    },
    {
        id: '4',
        title: 'Como entrar em contato com o suporte?',
        answer: 'Você pode usar o botão "Falar com o suporte" ou enviar um e-mail para suporte@exemplo.com.',
    },
    {
        id: '5',
        title: 'Onde encontro meus pedidos anteriores?',
        answer: 'Vá até a aba de pedidos no menu principal e veja seu histórico completo.',
    },
];

export default function HelpCenter() {
    const { theme } = useTheme();
    const router = useAuth();

    return (
        <Container>
            <Title>Central de Ajuda</Title>
            <FlatList
                data={helpTopics}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.topic}
                        onPress={() =>
                      navigate.push('EditStockItem', { itemId: item.id })

     //                       navigate.push({
    //                            pathname: '/help/faq/[id]',
    //                            params: { id: item.id },
    //                        })
                        }
                    >
                        <Text style={[styles.topicText, { color: theme.textPrimary }]}>{item.title}</Text>
                    </TouchableOpacity>
                )}
            />
        </Container>
    );
}

const styles = StyleSheet.create({
    topic: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    topicText: {
        fontSize: 16,
    },
});
