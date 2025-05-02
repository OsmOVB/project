import React, { useCallback, useState } from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import Wheel, { WheelStyleProps } from './Wheel';
import { useThemeContext } from '@/src/context/ThemeContext';
import { darkTheme, lightTheme } from '@/src/theme';

const MILLISECONDS_PER_MINUTE = 60 * 1000;
const MILLISECONDS_PER_HOUR = MILLISECONDS_PER_MINUTE * 60;
const MILLISECONDS_PER_DAY = MILLISECONDS_PER_HOUR * 24;

export enum TimeType {
  hours24 = 'hours24',
  hours12 = 'hours12',
  min = 'min',
  sec = 'sec',
  ampm = 'am/pm',
}

const DEFAULT_TYPE_TYPES = [
  TimeType.hours24,
  ':',
  TimeType.min,
  ':',
  TimeType.sec,
];

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
    height: 120,
    overflow: 'hidden',
    borderRadius: 12,
  },
});

function createNumberList(num: number) {
  return new Array(num)
    .fill(0)
    .map((_, index) => (index < 10 ? `0${index}` : `${index}`));
}

const TWENTY_FOUR_LIST = createNumberList(24);
const SIXTY_LIST = createNumberList(60);

interface Props {
  value?: number | null;
  onChange: (value: number) => void;
  containerStyle?: StyleProp<ViewStyle>;
  onScroll?: (scrollState: boolean) => void;
  textStyle?: TextStyle;
  wheelProps?: WheelStyleProps;
  timeFormat?: (string | TimeType)[];
}

export default function TimePicker({
  value,
  onChange,
  onScroll,
  containerStyle,
  textStyle,
  wheelProps = {},
  timeFormat = DEFAULT_TYPE_TYPES,
}: Props): React.ReactElement {
  const { darkMode } = useThemeContext();
  const appliedTheme = darkMode ? darkTheme.background : lightTheme.background;
  const textColor = darkMode ? '#fff' : lightTheme.text;

  const [current, setCurrent] = useState(
    (value ?? Date.now()) % MILLISECONDS_PER_DAY
  );
  const [hour, setHour] = useState(Math.floor(current / MILLISECONDS_PER_HOUR));
  const [minute, setMinute] = useState(
    Math.floor(current / MILLISECONDS_PER_MINUTE) % 60
  );
  const [second, setSecond] = useState(Math.floor(current / 1000) % 60);

  const changeTimeValue = useCallback(
    (type: 'hour' | 'minute' | 'second', newValue: number) => {
      let newHour = hour;
      let newMinute = minute;
      let newSecond = second;
      switch (type) {
        case 'hour':
          setHour(newValue);
          newHour = newValue;
          break;
        case 'minute':
          setMinute(newValue);
          newMinute = newValue;
          break;
        case 'second':
          setSecond(newValue);
          newSecond = newValue;
          break;
      }
      const newCurrent =
        newHour * MILLISECONDS_PER_HOUR +
        newMinute * MILLISECONDS_PER_MINUTE +
        newSecond * 1000;
      setCurrent(newCurrent);
      onChange && onChange(newCurrent);
    },
    [hour, minute, onChange, second]
  );

  return (
    <View style={[styles.container, containerStyle, { backgroundColor: appliedTheme, flexDirection: "row", alignItems: "center" }]}>
    <Wheel
      key={'hour'}
      value={hour < 10 ? `0${hour}` : `${hour}`}
      values={TWENTY_FOUR_LIST}
      setValue={(newValue) => changeTimeValue('hour', parseInt(newValue))}
      onScroll={onScroll}
      textStyle={StyleSheet.flatten([textStyle, { color: textColor }])}
      {...wheelProps}
    />
  
    {/* 🔹 Adiciona ":" entre os seletores de hora e minuto */}
    <Text style={{ fontSize: 24, color: textColor, fontWeight: "bold", marginHorizontal: 5 }}>:</Text> 
  
    <Wheel
      key={'min'}
      value={minute < 10 ? `0${minute}` : `${minute}`}
      values={SIXTY_LIST}
      setValue={(newValue) => changeTimeValue('minute', parseInt(newValue))}
      onScroll={onScroll}
      textStyle={StyleSheet.flatten([textStyle, { color: textColor }])}
      {...wheelProps}
    />
  </View>
  
  );
}
