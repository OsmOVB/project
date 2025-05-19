import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import { styles } from './styles';
import { darkTheme, lightTheme } from '@/src/theme';
import TimePicker from '../TimePicker/TimePicker';
import HourSelection from './HourSelection';
import Button from '../Button';
import { useThemeContext } from '@/src/context/ThemeContext';

const getMonthName = (month: number) =>
  [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ][month];

const getDayOfWeek = (day: number) =>
  ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][day];

interface CalendarProps {
  initialDate?: Date;
  minDate?: Date;
  maxDate?: Date;
  mode?: 'date' | 'datetime';
  onDateChange?: (date: Date) => void;
  visible: boolean;
  onClose: () => void;
  theme?: string;
  bookedTimes?: { date: Date; duration: number; orderId: string }[];
}

const Calendar: React.FC<CalendarProps> = ({
  initialDate = new Date(),
  minDate,
  maxDate,
  mode = 'date',
  onDateChange,
  visible,
  onClose,
  theme,
  bookedTimes = [],
}) => {
  const { darkMode } = useThemeContext();
  const appliedTheme = darkMode ? darkTheme.calendar : lightTheme.calendar;
  const textColor = darkMode ? darkTheme.text : lightTheme.text;
  const headerColor = darkMode ? darkTheme.primary : lightTheme.primary;
  const buttonColor = darkMode ? darkTheme.buttonText : lightTheme.buttonText;

  const [currentDate, setCurrentDate] = useState(initialDate);
  const [isYearSelection, setIsYearSelection] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showHourSelection, setShowHourSelection] = useState(false);
  const [selectedTime, setSelectedTime] = useState<{
    hours: number;
    minutes: number;
  }>({ hours: initialDate.getHours(), minutes: initialDate.getMinutes() });

  useEffect(() => {
    setCurrentDate(initialDate);
  }, [initialDate]);

  const changeDate = (direction: number) => {
    const newDate = isYearSelection
      ? new Date(currentDate.setFullYear(currentDate.getFullYear() + direction))
      : new Date(currentDate.setMonth(currentDate.getMonth() + direction));
    setCurrentDate(newDate);
  };

  const handleDateSelect = (date: Date) => {
    setCurrentDate(date);
    if (mode === 'datetime') {
      setShowHourSelection(true);
    } else {
      onDateChange?.(date);
      onClose();
    }
  };

  const handleTimeSelect = (time: number) => {
    const selectedDate = new Date(currentDate);
    selectedDate.setHours(Math.floor(time / (60 * 60 * 1000)));
    selectedDate.setMinutes((time / (60 * 1000)) % 60);
    setSelectedTime({
      hours: selectedDate.getHours(),
      minutes: selectedDate.getMinutes(),
    });
  };

  const confirmTimeSelect = () => {
    const selectedDate = new Date(currentDate);
    selectedDate.setHours(selectedTime.hours);
    selectedDate.setMinutes(selectedTime.minutes);
    onDateChange?.(selectedDate);
    setShowTimePicker(false);
    setShowHourSelection(false);
    onClose();
  };

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: headerColor }]}>
      <TouchableOpacity onPress={() => changeDate(-1)}>
        <Text style={[styles.navButton, { color: buttonColor }]}>{'<'}</Text>
      </TouchableOpacity>
      <View>
        <Text style={[styles.month, { color: buttonColor }]}>
          {getMonthName(currentDate.getMonth())}
        </Text>
        <Text style={[styles.year, { color: buttonColor }]}>
          {currentDate.getFullYear()}
        </Text>
      </View>
      <TouchableOpacity onPress={() => changeDate(1)}>
        <Text style={[styles.navButton, { color: buttonColor }]}>{'>'}</Text>
      </TouchableOpacity>
      <View style={styles.selectionToggle}>
        <TouchableOpacity
          onPress={() => setIsYearSelection(false)}
          style={[
            styles.selectionButton,
            !isYearSelection && {
              ...styles.selectedButton,
              backgroundColor: headerColor,
            },
          ]}
        >
          <Text style={[styles.selectionButtonText, { color: buttonColor }]}>
            Mês
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setIsYearSelection(true)}
          style={[
            styles.selectionButton,
            isYearSelection && {
              ...styles.selectedButton,
              backgroundColor: headerColor,
            },
          ]}
        >
          <Text style={[styles.selectionButtonText, { color: buttonColor }]}>
            Ano
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderDaysOfWeek = () => (
    <View style={[styles.daysOfWeek, { backgroundColor: appliedTheme }]}>
      {Array.from({ length: 7 }, (_, i) => (
        <Text key={i} style={[styles.dayOfWeek, { color: textColor }]}>
          {getDayOfWeek(i)}
        </Text>
      ))}
    </View>
  );

  const renderDays = () => {
    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const lastDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );
    const startDay = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

    const days = [];
    for (let i = 0; i < startDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.day} />);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const dayDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        i
      );
      const isToday = dayDate.toDateString() === new Date().toDateString();
      const isInRange =
        (!minDate || dayDate >= minDate) && (!maxDate || dayDate <= maxDate);
      days.push(
        <TouchableOpacity
          key={i}
          style={styles.day}
          onPress={() => isInRange && handleDateSelect(dayDate)}
          disabled={!isInRange}
        >
          <Text
            style={[
              styles.dayText,
              isToday && [styles.today, { color: darkTheme.primary }],
              !isInRange && styles.disabled,
              { color: textColor },
            ]}
          >
            {i}
          </Text>
        </TouchableOpacity>
      );
    }
    return <View style={styles.days}>{days}</View>;
  };

  const renderDatetime = () => (
    <Modal
      visible={showTimePicker}
      transparent
      animationType="slide"
      onRequestClose={() => setShowTimePicker(false)}
    >
      <View style={styleCalendar.modalContainer}>
        <View style={[styleCalendar.timePickerContainer, { backgroundColor: appliedTheme }]}>
          <Text style={[styleCalendar.timePickerTitle, { color: textColor }]}>
            Selecione a Hora
          </Text>
          <TimePicker
            value={
              selectedTime.hours * 60 * 60 * 1000 +
              selectedTime.minutes * 60 * 1000
            }
            onChange={handleTimeSelect}
            textStyle={{ color: textColor }}
            timeFormat={["hours24", "min"]}
            wheelProps={{
              itemHeight: 30,
              displayCount: 1,
              wheelHeight: 100,
              textStyle: {  color: textColor },
              containerStyle: { backgroundColor: appliedTheme },
              selectedFontSize: 24, 
              defaultFontSize: 20,
            }}
          />
          <Button            
            title="Selecionar"
            onPress={confirmTimeSelect}
            type='primary'
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styleCalendar.modalContainer}>
        <View style={[styleCalendar.calendarContainer, { backgroundColor: appliedTheme }]}>
          <View>
            {renderHeader()} 
            {renderDaysOfWeek()}
            {renderDays()}
            <HourSelection
              currentDate={currentDate}
              bookedTimes={bookedTimes}
              showHourSelection={showHourSelection}
              setShowHourSelection={setShowHourSelection}
              setSelectedTime={setSelectedTime}
              setShowTimePicker={setShowTimePicker}
            />
            {renderDatetime()}
          </View>
          <TouchableOpacity onPress={onClose} style={[styleCalendar.closeButton, { backgroundColor: headerColor }]}>
            <Text style={{ color: '#fff' }}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styleCalendar = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  calendarContainer: {
    width: "90%",
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  timePickerContainer: {
    width: '80%',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  timePickerTitle: {
    fontSize: 22,
    marginBottom: 10,
  },
  okButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
});

export default Calendar;
