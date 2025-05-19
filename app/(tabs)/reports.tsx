import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Text, Dimensions } from 'react-native';
import { Container, Title, Button, ButtonText } from '../../src/components/styled';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Picker } from '@react-native-picker/picker';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/src/firebase/config';

const screenWidth = Dimensions.get('window').width;

export default function Reports() {
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [totalPedidos, setTotalPedidos] = useState(0);
  const [reportData, setReportData] = useState<{ labels: string[]; datasets: { data: number[] }[] }>({
    labels: [],
    datasets: [{ data: [] }],
  });
  
  useEffect(() => {
    const fetchFromOrders = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'orders'));
        const grouped: Record<string, number> = {};
  
        setTotalPedidos(snapshot.size); // 👈 define total de pedidos
  
        snapshot.forEach((doc) => {
          const data = doc.data();
          const date = new Date(data.scheduledDate?.seconds * 1000 || 0);
  
          let key = '';
          if (timeRange === 'daily') {
            key = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1)
              .toString()
              .padStart(2, '0')}`;
          } else if (timeRange === 'weekly') {
            key = `Semana ${Math.ceil(date.getDate() / 7)}`;
          } else if (timeRange === 'monthly') {
            key = date.toLocaleString('default', { month: 'short' });
          }
  
          grouped[key] = (grouped[key] || 0) + 1;
        });
  
        const labels = Object.keys(grouped);
        const values = labels.map((label) => grouped[label]);
  
        setReportData({
          labels,
          datasets: [{ data: values }],
        });
      } catch (error) {
        console.error('Erro ao processar pedidos:', error);
      }
    };
  
    fetchFromOrders();
  }, [timeRange]);
  

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
  };

  const renderChart = () => {
    const hasData = reportData.labels.length > 0 && reportData.datasets[0].data.length > 0;

    if (!hasData) {
      return <Text style={styles.noData}>Sem dados para este intervalo.</Text>;
    }

    return chartType === 'line' ? (
      <LineChart
        data={reportData}
        width={screenWidth - 80}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
      />
    ) : (
      <BarChart
        data={reportData}
        width={screenWidth - 80}
        height={220}
        chartConfig={chartConfig}
        style={styles.chart}
        yAxisLabel="R$"
        yAxisSuffix=""
      />
    );
  };

  return (
    <Container>
      <ScrollView>
        <Title>Relatórios & Análise</Title>

        <View style={styles.filterContainer}>
          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Intervalo de Tempo</Text>
            <Picker selectedValue={timeRange} onValueChange={setTimeRange} style={styles.picker}>
              <Picker.Item label="Diário" value="daily" />
              <Picker.Item label="Semanal" value="weekly" />
              <Picker.Item label="Mensal" value="monthly" />
            </Picker>
          </View>

          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Tipo de Gráfico</Text>
            <Picker selectedValue={chartType} onValueChange={setChartType} style={styles.picker}>
              <Picker.Item label="Gráfico de Linha" value="line" />
              <Picker.Item label="Gráfico de Barras" value="bar" />
            </Picker>
          </View>
        </View>

        <View style={styles.chartContainer}>{renderChart()}</View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total de Pedidos</Text>
            <Text style={styles.statValue}>{totalPedidos}</Text>

          </View>
          {/* <View style={styles.statCard}>
            <Text style={styles.statLabel}>Receita</Text>
            <Text style={styles.statValue}>R$12.345</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Clientes Ativos</Text>
            <Text style={styles.statValue}>89</Text>
          </View> */}
        </View>

        <Button style={styles.exportButton}>
          <ButtonText>Exportar Relatório</ButtonText>
        </Button>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  pickerContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  picker: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    height: 50,
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noData: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  exportButton: {
    marginTop: 10,
    backgroundColor: '#34C759',
  },
});
