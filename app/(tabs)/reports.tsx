import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Dimensions,
  Alert,
} from 'react-native';
import {
  Container,
  Title,
  Button,
  ButtonText,
} from '../../src/components/styled';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Picker } from '@react-native-picker/picker';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/src/firebase/config';
import { useTheme } from '@/src/context/ThemeContext';
import * as XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const screenWidth = Dimensions.get('window').width;

export default function Reports() {
  const { theme } = useTheme();
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [totalPedidos, setTotalPedidos] = useState(0);
  const [ordersDetalhados, setOrdersDetalhados] = useState<
    { data: string; cliente: string; endereco: string; total: number }[]
  >([]);
  const [reportData, setReportData] = useState({
    labels: [] as string[],
    datasets: [{ data: [] as number[] }],
  });
useEffect(() => {
  const fetchFromOrders = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'orders'));
      const grouped: Record<string, number> = {};
      const detalhados: typeof ordersDetalhados = [];

      setTotalPedidos(snapshot.size);

      snapshot.forEach((doc) => {
        const data = doc.data();
        const date = new Date(data.scheduledDate?.seconds * 1000 || 0);
        const formattedDate = date.toLocaleDateString('pt-BR');

        let key = '';
        if (timeRange === 'daily') {
          key = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        } else if (timeRange === 'weekly') {
          key = `Semana ${Math.ceil(date.getDate() / 7)}`;
        } else if (timeRange === 'monthly') {
          key = date.toLocaleString('default', { month: 'short' });
        }

        grouped[key] = (grouped[key] || 0) + 1;

        const totalPedido = (data.items || []).reduce(
          (acc: number, item: any) => acc + (item.price || 0) * (item.quantity || 0),
          0
        );

        detalhados.push({
          data: formattedDate,
          cliente: data.customerName || 'Desconhecido',
          endereco: data.address || 'Não informado',
          total: totalPedido,
        });
      });

      // Ordenação das labels para exibição correta no gráfico
      let labels: string[] = [];
      if (timeRange === 'daily') {
        labels = Object.keys(grouped).sort((a, b) => {
          // Ordena por dia e mês
          const [diaA, mesA] = a.split('/').map(Number);
          const [diaB, mesB] = b.split('/').map(Number);
          return mesA !== mesB ? mesA - mesB : diaA - diaB;
        });
      } else if (timeRange === 'weekly') {
        labels = Object.keys(grouped).sort((a, b) => {
          // Ordena por número da semana
          const numA = parseInt(a.replace(/\D/g, ''), 10);
          const numB = parseInt(b.replace(/\D/g, ''), 10);
          return numA - numB;
        });
      } else if (timeRange === 'monthly') {
        // Ordena pelos meses do ano
        const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
        labels = Object.keys(grouped).sort(
          (a, b) => meses.indexOf(a.toLowerCase().slice(0, 3)) - meses.indexOf(b.toLowerCase().slice(0, 3))
        );
      }

      const values = labels.map((label) => grouped[label]);

      setReportData({ labels, datasets: [{ data: values }] });
      setOrdersDetalhados(detalhados);
    } catch (error) {
      console.error('Erro ao processar pedidos:', error);
    }
  };

  fetchFromOrders();
}, [timeRange]);
  const chartConfig = {
    backgroundColor: theme.card,
    backgroundGradientFrom: theme.card,
    backgroundGradientTo: theme.card,
    decimalPlaces: 0,
    color: (opacity = 1) => theme.primary + Math.round(opacity * 255).toString(16),
    style: { borderRadius: 16 },
  };

  const chartWidth = screenWidth - 32; // 16 padding de cada lado

  const renderChart = () => {
    const hasData = reportData.labels.length > 0 && reportData.datasets[0].data.length > 0;
    if (!hasData) {
      return <Text style={[styles.noData, { color: theme.textSecondary }]}>Sem dados para este intervalo.</Text>;
    }

    return chartType === 'line' ? (
      <LineChart
        data={reportData}
        width={chartWidth}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
      />
    ) : (
      <BarChart
        data={reportData}
        width={chartWidth}
        height={220}
        chartConfig={chartConfig}
        style={styles.chart}
        yAxisLabel=""
        yAxisSuffix=""
      />
    );
  };

  const exportToExcel = async () => {
    try {
      const worksheet = XLSX.utils.json_to_sheet(ordersDetalhados);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Pedidos');

      const wbout = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });
      const uri = FileSystem.cacheDirectory + 'relatorio_completo.xlsx';

      await FileSystem.writeAsStringAsync(uri, wbout, { encoding: FileSystem.EncodingType.Base64 });
      await Sharing.shareAsync(uri, {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dialogTitle: 'Compartilhar Relatório Detalhado',
        UTI: 'com.microsoft.excel.xlsx',
      });
    } catch (err) {
      console.error('Erro ao exportar relatório:', err);
      Alert.alert('Erro', 'Não foi possível exportar o relatório.');
    }
  };

  return (
    <Container>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <Title>Relatórios & Análise</Title>

        <View style={styles.filterContainer}>
          <View style={styles.pickerContainer}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Intervalo de Tempo</Text>
            <Picker
              selectedValue={timeRange}
              onValueChange={setTimeRange}
              style={[styles.picker, { backgroundColor: theme.inputBg, color: theme.textPrimary }]}
            >
              <Picker.Item label="Diário" value="daily" />
              <Picker.Item label="Semanal" value="weekly" />
              <Picker.Item label="Mensal" value="monthly" />
            </Picker>
          </View>

          <View style={styles.pickerContainer}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Tipo de Gráfico</Text>
            <Picker
              selectedValue={chartType}
              onValueChange={setChartType}
              style={[styles.picker, { backgroundColor: theme.inputBg, color: theme.textPrimary }]}
            >
              <Picker.Item label="Gráfico de Linha" value="line" />
              <Picker.Item label="Gráfico de Barras" value="bar" />
            </Picker>
          </View>
        </View>

        <View style={[styles.chartContainer, { backgroundColor: theme.card, alignItems: 'center' }]}>
          {renderChart()}
        </View>

        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: theme.inputBg }]}>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total de Pedidos</Text>
            <Text style={[styles.statValue, { color: theme.primary }]}>{totalPedidos}</Text>
          </View>
        </View>

        <Button style={[styles.exportButton, { backgroundColor: theme.green }]} onPress={exportToExcel}>
          <ButtonText>Exportar Relatório</ButtonText>
        </Button>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  filterContainer: {
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20,
  },
  pickerContainer: {
    flex: 1, marginHorizontal: 5,
  },
  label: {
    fontSize: 14, marginBottom: 5,
  },
  picker: {
    borderRadius: 8, height: 50,
  },
  chartContainer: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
    alignItems: 'center', // centraliza o gráfico
  },
  chart: {
    marginVertical: 8, borderRadius: 16,
  },
  noData: {
    textAlign: 'center', fontSize: 16, marginTop: 16,
  },
  statsContainer: {
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20,
  },
  statCard: {
    flex: 1, borderRadius: 8, padding: 12, marginHorizontal: 5, alignItems: 'center',
  },
  statLabel: {
    fontSize: 12, marginBottom: 4,
  },
  statValue: {
    fontSize: 18, fontWeight: 'bold',
  },
  exportButton: {
    marginTop: 10,
  },
});