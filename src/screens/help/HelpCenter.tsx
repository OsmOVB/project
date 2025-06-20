import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { AccordionItem } from '@/src/components/AccordionItem'; // ajuste o caminho
import { Container, Title } from '@/src/components/styled';

type HelpTopic = {
    id: string;
    title: string;
    answer: string;
};

const helpTopics: HelpTopic[] = [
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

export default function HelpCenterScreen() {
    return (
        <Container>
            <Title>Central de Ajuda</Title>
            <FlatList
                data={helpTopics}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <AccordionItem<HelpTopic>
                        item={item}
                        title={item.title}
                        content={item.answer}
                    />
                )}
            />
        </Container>
    );
}
