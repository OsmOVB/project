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
      const timestamp = data.date?.seconds || 0;
      const date = new Date(timestamp * 1000);
      const formattedDate = date.toLocaleDateString('pt-BR');

      let key = '';
      if (timeRange === 'daily') {
        key = formattedDate;
      } else if (timeRange === 'weekly') {
        const start = new Date(date);
        start.setDate(date.getDate() - date.getDay());
        key = `Semana de ${start.toLocaleDateString('pt-BR')}`;
      } else if (timeRange === 'monthly') {
        key = `${date.getMonth() + 1}/${date.getFullYear()}`;
      }

      grouped[key] = (grouped[key] || 0) + 1;

      detalhados.push({
        data: formattedDate,
        cliente: data.customerName || 'Desconhecido',
        endereco: data.address || 'Não informado',
        total: data.totalLiters || 0,
      });
    });

    // Ordenação das labels para exibição correta no gráfico
    let labels: string[] = [];
    if (timeRange === 'daily') {
      labels = Object.keys(grouped).sort((a, b) => {
        // dd/MM/yyyy
        const [da, ma, ya] = a.split('/').map(Number);
        const [db, mb, yb] = b.split('/').map(Number);
        const dateA = new Date(ya, ma - 1, da);
        const dateB = new Date(yb, mb - 1, db);
        return dateA.getTime() - dateB.getTime();
      });
    } else if (timeRange === 'weekly') {
      labels = Object.keys(grouped).sort((a, b) => {
        // "Semana de dd/MM/yyyy"
        const getDate = (str: string) => {
          const match = str.match(/(\d{2})\/(\d{2})\/(\d{4})/);
          if (!match) return new Date(0);
          const [, d, m, y] = match.map(Number);
          return new Date(y, m - 1, d);
        };
        return getDate(a).getTime() - getDate(b).getTime();
      });
    } else if (timeRange === 'monthly') {
      labels = Object.keys(grouped).sort((a, b) => {
        // MM/YYYY
        const [ma, ya] = a.split('/').map(Number);
        const [mb, yb] = b.split('/').map(Number);
        return ya !== yb ? ya - yb : ma - mb;
      });
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
    color: (opacity = 1) => `${theme.primary}${Math.round(opacity * 255).toString(16)}`,
    labelColor: () => theme.textPrimary,
    style: { borderRadius: 16 },
  };

  const renderChart = () => {
    const hasData = reportData.labels.length > 0 && reportData.datasets[0].data.length > 0;
    if (!hasData) {
      return (
        <Text style={[styles.noData, { color: theme.textSecondary }]}>Sem dados para este intervalo.</Text>
      );
    }

    const commonProps = {
      data: reportData,
      width: screenWidth - 40,
      height: 240,
      chartConfig,
      style: styles.chart,
    };

    return chartType === 'line'
      ? <LineChart {...commonProps} bezier />
      : <BarChart {...commonProps} yAxisLabel="" yAxisSuffix="" />;
  };

  const exportToExcel = async () => {
    try {
      const worksheet = XLSX.utils.json_to_sheet(ordersDetalhados);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Pedidos');

      const wbout = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });
      const uri = FileSystem.cacheDirectory + 'relatorio_completo.xlsx';

      await FileSystem.writeAsStringAsync(uri, wbout, {
        encoding: FileSystem.EncodingType.Base64,
      });
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
      <ScrollView>
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
              <Picker.Item label="Linha" value="line" />
              <Picker.Item label="Barras" value="bar" />
            </Picker>
          </View>
        </View>

        <View style={[styles.chartContainer, { backgroundColor: theme.card }]}>{renderChart()}</View>


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
  filterContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  pickerContainer: { flex: 1, marginHorizontal: 5 },
  label: { fontSize: 14, marginBottom: 5 },
  picker: { borderRadius: 8, height: 50 },
  chartContainer: { borderRadius: 16, padding: 16, elevation: 3, marginBottom: 20 },
  chart: { marginVertical: 8, borderRadius: 16 },
  noData: { textAlign: 'center', fontSize: 16, marginTop: 16 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statCard: { flex: 1, borderRadius: 8, padding: 12, marginHorizontal: 5, alignItems: 'center' },
  statLabel: { fontSize: 12, marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: 'bold' },
  exportButton: { marginTop: 10 },
});
