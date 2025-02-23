import React from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface TimeSlot {
  time: string;
  available: boolean;
}

interface TimeSlotPickerProps {
  slots: TimeSlot[];
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
}

export default function TimeSlotPicker({ slots, selectedTime, onSelectTime }: TimeSlotPickerProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
      {slots.map((slot) => (
        <TouchableOpacity
          key={slot.time}
          onPress={() => slot.available && onSelectTime(slot.time)}
          style={[
            styles.timeSlot,
            !slot.available && styles.unavailable,
            selectedTime === slot.time && styles.selected,
          ]}
          disabled={!slot.available}
        >
          <Text
            style={[
              styles.timeText,
              !slot.available && styles.unavailableText,
              selectedTime === slot.time && styles.selectedText,
            ]}
          >
            {slot.time}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 0,
    marginVertical: 16,
  },
  timeSlot: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  unavailable: {
    backgroundColor: '#f0f0f0',
    opacity: 0.5,
  },
  timeText: {
    fontSize: 16,
    color: '#1c1c1e',
  },
  selectedText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  unavailableText: {
    color: '#999',
  },
});