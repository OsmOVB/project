import React, { useState } from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AccordionItemProps<T> {
    item: T;
    title: string;
    content: string;
}

export function AccordionItem<T>({ item, title, content }: AccordionItemProps<T>) {
    const [expanded, setExpanded] = useState(false);

    return (
        <View style={styles.card}>
            <TouchableOpacity style={styles.header} onPress={() => setExpanded(!expanded)}>
                <Text style={styles.title}>{title}</Text>
                <Ionicons
                    name={expanded ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color="#666"
                />
            </TouchableOpacity>
            {expanded && (
                <View style={styles.content}>
                    <Text style={styles.text}>{content}</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
    },
    content: {
        marginTop: 8,
    },
    text: {
        fontSize: 14,
        color: '#444',
    },
});
