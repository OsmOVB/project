import { Text } from "@modules/agricultural/screens/service-agricultural/style";
import { useEffect, useRef, useState } from "react";
import { Animated, View } from "react-native";
import { StylesAlert } from "./styles";

export const SuccessAlert = ({ 
    message,
    bgColor,
    borderColor,
    onClose
   }: { message: string, 
    bgColor: string,
    borderColor: string,
    onClose: () => void
}) => {
    const [visible, setVisible] = useState(true);
    const fadeAnim = useRef(new Animated.Value(1)).current;
  
    useEffect(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 3000, 
        useNativeDriver: true,
      }).start(() => {
        setVisible(false);
        onClose();
      });
    }, [fadeAnim]);
  
    if (!visible) return null;
  
    return (
      <View style={StylesAlert.overlay}>
        <Animated.View style={[StylesAlert.alertBox, { 
            opacity: fadeAnim, 
            backgroundColor: bgColor,
            borderColor: borderColor,
             }]}>
          <Text style={[
                StylesAlert.alertText,
                { color: borderColor },
          ]}>{message}</Text>
        </Animated.View>
      </View>
    );
  };