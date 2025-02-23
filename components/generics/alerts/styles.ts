import { StyleSheet } from "react-native";



export const StylesAlert = StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: "center",
      alignItems: "center",
    },
    alertBox: {
      width: '70%',
      opacity: 0.8,
      height: '20%',
      padding: 10,
      borderRadius: 10,
      borderWidth: 3,
      flexDirection: 'column', // Ensure the children are arranged in a column
      justifyContent: 'center', // Align children to the top
    },
    alertText: {
      fontSize: 18,
      textAlign: "center",
    },
  });