import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  navButton: {
    fontSize: 18,
    paddingHorizontal: 12,
  },
  month: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  year: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  // Container para o toggle (se houver seleção entre Mês/Ano)
  selectionToggle: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  selectionButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#007AFF',
    backgroundColor: '#fff',
  },
  selectedButton: {
    backgroundColor: '#007AFF',
  },
  selectionButtonText: {
    fontSize: 16,
    color: '#007AFF',
    textAlign: 'center',
  },
  // Estilos para o modal do TimePicker
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timePickerContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  timePickerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  okButton: {
    marginTop: 16,
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
  },
  // Seção para os dias da semana (caso seja utilizada)
  daysOfWeek: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  dayOfWeek: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  // Seção para os dias do mês
  days: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  day: {
    width: '14%', // Aproximadamente 7 colunas
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  dayText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  today: {
    fontWeight: 'bold',
  },
  disabled: {
    opacity: 0.3,
  },
});
