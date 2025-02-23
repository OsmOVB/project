import React from "react";
import { Text, TextStyle, TouchableOpacity, ViewStyle } from "react-native";

type Props = {
  onPress: () => void;
  style?: ViewStyle;
  value?: boolean;
  text: string;
  checkedIcon: React.ReactNode;
  uncheckedIcon: React.ReactNode;
  textStyle?: TextStyle;
}

export const CheckBox = ({ onPress, style, value, text, checkedIcon, uncheckedIcon, textStyle }: Props) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        ...style,
      }}
    >
      {value && checkedIcon}
      {!value && uncheckedIcon}
      <Text
        style={{ maxWidth: "90%", width: "90%", ...textStyle }}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );

}
