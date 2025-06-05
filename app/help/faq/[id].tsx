import { useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { Container, Title } from '@/src/components/styled';

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

export default function HelpAnswerScreen() {
    const { id } = useLocalSearchParams();
    const { theme } = useTheme();

    const topic = helpTopics.find((t) => t.id === id);

    if (!topic) {
        return (
            <Container>
                <Title>Tópico não encontrado</Title>
            </Container>
        );
    }

    return (
        <Container>
            <Title>{topic.title}</Title>
            <Text style={[styles.answer, { color: theme.textPrimary }]}>
                {topic.answer}
            </Text>
        </Container>
    );
}

const styles = StyleSheet.create({
    answer: {
        fontSize: 16,
        marginTop: 20,
        lineHeight: 24,
    },
});
