import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
      width: "100%",
      borderRadius: 4,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: "#ddd",
      backgroundColor: "#fff",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 10,
      width: "100%",
    },
    month: {
      fontSize: 20,
      color: "#fff",
    },
    year: {
      fontSize: 16,
      color: "#fff",
    },
    navButton: {
      fontSize: 26,
      color: "#fff",
      padding: 5,
    },
    okButton: {
      padding: 10,
      backgroundColor: "#428bca",
      borderRadius: 4,
      margin: 10,
    },
    selectionToggle: {
      flexDirection: "row",
      justifyContent: "center",
      paddingVertical: 5,
      backgroundColor: "#efefef",
      borderRadius: 4,
    },
    selectionButton: {
      padding: 10,
      backgroundColor: "#ccc",
      borderRadius: 4,
      marginHorizontal: 5,
    },
    selectedButton: {
      backgroundColor: "#428bca",
    },
    selectionButtonText: {
      color: "#fff",
      fontSize: 16,
    },
    daysOfWeek: {
      flexDirection: "row",
      justifyContent: "space-around",
      backgroundColor: "#efefef",
      paddingVertical: 10,
    },
    dayOfWeek: {
      fontSize: 16,
      color: "#333",
    },
    days: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
    day: {
      width: "14.28%",
      alignItems: "center",
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderColor: "#ddd",
    },
    dayText: {
      fontSize: 16,
      color: "#000",
    },
    today: {
      fontSize: 16,
      fontWeight: "bold",
    },
    disabled: {
      color: "#ddd",
    },
    modalContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    timePickerContainer: {
      width: 300,
      padding: 20,
      borderRadius: 10,
      backgroundColor: "#fff",
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center", // Adicionado para garantir centralização
    },
    timePickerTitle: {
      fontSize: 20,
      marginBottom: 10,
    },
    timePicker: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 10,
    },
    timeText: {
      fontSize: 20,
      marginHorizontal: 10,
    },
    timeButton: {
      fontSize: 20,
      paddingHorizontal: 10,
    },
  });