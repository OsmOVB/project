import React from 'react';
import { TouchableOpacity, View, StyleSheet, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeContext } from '@/src/context/ThemeContext';

interface CheckboxProps {
  label?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export default function Checkbox({ label, value, onValueChange }: CheckboxProps) {
  const { darkMode } = useThemeContext();

  return (
    <TouchableOpacity style={styles.container} onPress={() => onValueChange(!value)}>
      <View
        style={[
          styles.checkbox,
          { borderColor: darkMode ? '#6366f1' : '#ccc' },
          value && { backgroundColor: '#6366f1', borderColor: '#6366f1' },
        ]}
      >
        {value && <MaterialIcons name="check" size={18} color="#fff" />}
      </View>
      {label && <Text style={[styles.label, { color: darkMode ? '#fff' : '#111827' }]}>{label}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    marginLeft: 8,
    fontSize: 16,
  },
});
