import React, { useState, useEffect } from "react";
import { StyleSheet, View, TouchableOpacity, Modal } from "react-native";
import { IconName } from "../Icon/types";
import { Icon } from "../Icon";
import Calendar from "../Calendar";
import { Text } from "@styles/global";

interface PickerProps {
  iconName: IconName;
  date: Date;
  minDate?: Date;
  maxDate?: Date;
  onDateChange: (date: Date) => void;
  theme: string;
  color: string;
  disabled?: boolean;
}

const formatDateToBrazilian = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day}/${month}/${year}`;
};

export const DatePicker: React.FC<PickerProps> = ({ iconName, date, minDate, maxDate, onDateChange, theme, color, disabled }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(date);

  useEffect(() => {
    setSelectedDate(date);
  }, [date]);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    onDateChange(date);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.inputContainer, disabled && styles.disabledInputContainer]} 
        onPress={() => !disabled && setModalVisible(true)}
        disabled={disabled}
      >
        <Text style={{
          ...styles.inputText,
          color: disabled ? '#A9A9A9' : color,
        }}>{formatDateToBrazilian(selectedDate)}</Text>
        <Icon name={iconName} size={24} color={disabled ? '#A9A9A9' : "#909090"}/>
      </TouchableOpacity>
      
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.calendarContainer}>
            <Calendar
              visible={modalVisible}
              onClose={() => setModalVisible(false)}
              onDateChange={(date) => {
                handleDateChange(date);
                setModalVisible(false);
              }}
              initialDate={selectedDate}
              minDate={minDate}
              maxDate={maxDate}
              mode="date"
              theme={theme}
            />
            <TouchableOpacity style={[styles.closeButton, {backgroundColor: theme || '#0048B6'}]} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  disabledInputContainer: {
    backgroundColor: '#f0f0f0',
  },
  icon: {
    marginRight: 10,
  },
  inputText: {
    color: "#000",
    fontSize: 15,
    paddingHorizontal: 5,
    paddingRight: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  calendarContainer: {
    width: '90%',
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  closeButton: {
    padding: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#fff',
  },
});