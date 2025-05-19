import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { darkTheme, lightTheme } from '@/src/theme';
import Button from '../Button';
import { useThemeContext } from '@/src/context/ThemeContext';

interface HourSelectionProps {
  currentDate: Date;
  bookedTimes: { date: Date; duration: number; orderId: string }[];
  showHourSelection: boolean;
  setShowHourSelection: (show: boolean) => void;
  setSelectedTime: (time: { hours: number; minutes: number }) => void;
  setShowTimePicker: (show: boolean) => void;
}

const HourSelection: React.FC<HourSelectionProps> = ({
  currentDate,
  bookedTimes,
  showHourSelection,
  setShowHourSelection,
  setSelectedTime,
  setShowTimePicker,
}) => {
  const { darkMode } = useThemeContext();
  const appliedTheme = darkMode ? darkTheme.calendar : lightTheme.calendar;
  const textColor = darkMode ? darkTheme.text : lightTheme.text;
  const headerColor = darkMode ? darkTheme.primary : lightTheme.primary;

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const bookedHours = bookedTimes
    .filter((bt) => bt.date.toDateString() === currentDate.toDateString())
    .map((bt) => ({ hour: bt.date.getHours(), orderId: bt.orderId }));

  return (
    <Modal
      visible={showHourSelection}
      transparent
      animationType="slide"
      onRequestClose={() => setShowHourSelection(false)}
    >
      <View style={styles.modalContainer}>
        <View
          style={[
            styles.hourSelectionContainer,
            { backgroundColor: appliedTheme },
          ]}
        >
          <Text style={[styles.hourSelectionTitle, { color: textColor }]}>
            Verifique a agenda
          </Text>
          <ScrollView contentContainerStyle={styles.hourScrollView}>
            {hours.map((hour, index) => {
              const bookedHour = bookedHours.find((bh) => bh.hour === hour);
              const isFirst = index === 0;
              const isLast = index === hours.length - 1;

              return (
                <TouchableOpacity
                  key={hour}
                  style={[
                    styles.hourButton,
                    isFirst && styles.firstHourButton,
                    isLast && styles.lastHourButton,
                    !isFirst && styles.hourButtonNotFirst,
                    bookedHour && styles.bookedHour,
                  ]}
                  onPress={() => {
                    if (!bookedHour) {
                      setSelectedTime({ hours: hour, minutes: 0 });
                      setShowTimePicker(true);
                      setShowHourSelection(false);
                    }
                  }}
                  disabled={!!bookedHour}
                >
                  <Text
                    style={[
                      styles.hourText,
                      { color: bookedHour ? '#fff' : textColor },
                    ]}
                  >
                    {hour.toString().padStart(2, '0')}:00
                    {bookedHour && ` - Pedido: ${bookedHour.orderId}`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Button
            title="Fechar"
            onPress={() => setShowHourSelection(false)}
            type="secondary"
            fullWidth
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    width: '100%',
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  hourSelectionContainer: {
    width: '90%',
    maxHeight: '70%',
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#F9F9F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  hourSelectionTitle: {
    fontSize: 22,
    marginBottom: 15,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  hourScrollView: {
    flexGrow: 1,
    width: '100%',
    paddingVertical: 10,
  },
  hourButton: {
    paddingVertical: 15,
    borderRadius: 0, 
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowRadius: 1,
    elevation: 0.3,
    borderWidth: 0.7,
    borderColor: '#E0E0E0',
  },

  firstHourButton: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },

  lastHourButton: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },

  hourButtonNotFirst: {
    borderTopWidth: 0, // Remove a borda entre os itens
  },

  bookedHour: {
    backgroundColor: '#FF3B30',
    borderColor: '#FF3B30',
  },
  hourText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#007AFF',
  },

  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HourSelection;
