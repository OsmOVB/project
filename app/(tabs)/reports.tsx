import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Text, Dimensions } from 'react-native';
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

const screenWidth = Dimensions.get('window').width;

export default function Reports() {
  const { theme } = useTheme();
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>(
    'daily'
  );
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [totalPedidos, setTotalPedidos] = useState(0);
  const [reportData, setReportData] = useState<{
    labels: string[];
    datasets: { data: number[] }[];
  }>({
    labels: [],
    datasets: [{ data: [] }],
  });

  useEffect(() => {
    const fetchFromOrders = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'orders'));
        const grouped: Record<string, number> = {};

        setTotalPedidos(snapshot.size);

        snapshot.forEach((doc) => {
          const data = doc.data();
          const date = new Date(data.scheduledDate?.seconds * 1000 || 0);

          let key = '';
          if (timeRange === 'daily') {
            key = `${date.getDate().toString().padStart(2, '0')}/${(
              date.getMonth() + 1
            )
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
    backgroundColor: theme.card,
    backgroundGradientFrom: theme.card,
    backgroundGradientTo: theme.card,
    decimalPlaces: 0,
    color: (opacity = 1) =>
      theme.primary + Math.round(opacity * 255).toString(16),
    style: {
      borderRadius: 16,
    },
  };

  const renderChart = () => {
    const hasData =
      reportData.labels.length > 0 && reportData.datasets[0].data.length > 0;

    if (!hasData) {
      return (
        <Text style={[styles.noData, { color: theme.textSecondary }]}>
          Sem dados para este intervalo.
        </Text>
      );
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
        yAxisLabel=""
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
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              Intervalo de Tempo
            </Text>
            <Picker
              selectedValue={timeRange}
              onValueChange={setTimeRange}
              style={[
                styles.picker,
                { backgroundColor: theme.inputBg, color: theme.textPrimary },
              ]}
            >
              <Picker.Item label="Diário" value="daily" />
              <Picker.Item label="Semanal" value="weekly" />
              <Picker.Item label="Mensal" value="monthly" />
            </Picker>
          </View>

          <View style={styles.pickerContainer}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              Tipo de Gráfico
            </Text>
            <Picker
              selectedValue={chartType}
              onValueChange={setChartType}
              style={[
                styles.picker,
                { backgroundColor: theme.inputBg, color: theme.textPrimary },
              ]}
            >
              <Picker.Item label="Gráfico de Linha" value="line" />
              <Picker.Item label="Gráfico de Barras" value="bar" />
            </Picker>
          </View>
        </View>

        <View style={[styles.chartContainer, { backgroundColor: theme.card }]}>
          {renderChart()}
        </View>

        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: theme.inputBg }]}>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Total de Pedidos
            </Text>
            <Text style={[styles.statValue, { color: theme.primary }]}>
              {totalPedidos}
            </Text>
          </View>
        </View>

        <Button style={[styles.exportButton, { backgroundColor: theme.green }]}>
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
    marginBottom: 5,
  },
  picker: {
    borderRadius: 8,
    height: 50,
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
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noData: {
    textAlign: 'center',
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
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  exportButton: {
    marginTop: 10,
  },
});
// import React, { useEffect, useState } from 'react';
// import { View, ScrollView, StyleSheet, Text, Dimensions } from 'react-native';
// import {
//   Container,
//   Title,
//   Button,
//   ButtonText,
// } from '../../src/components/styled';
// import { LineChart, BarChart } from 'react-native-chart-kit';
// import { Picker } from '@react-native-picker/picker';
// import { collection, getDocs } from 'firebase/firestore';
// import { db } from '@/src/firebase/config';
// import { useTheme } from '@/src/context/ThemeContext';

// const screenWidth = Dimensions.get('window').width;

// export default function Reports() {
//   const { theme } = useTheme();
//   const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('daily');
//   const [chartType, setChartType] = useState<'line' | 'bar'>('line');
//   const [totalPedidos, setTotalPedidos] = useState(0);
//   const [reportData, setReportData] = useState<{ labels: string[]; datasets: { data: number[] }[] }>({
//     labels: [],
//     datasets: [{ data: [] }],
//   });
//   const [auditResults, setAuditResults] = useState<any[]>([]);

//   useEffect(() => {
//     const fetchFromOrders = async () => {
//       try {
//         const snapshot = await getDocs(collection(db, 'orders'));
//         const grouped: Record<string, number> = {};

//         setTotalPedidos(snapshot.size);

//         snapshot.forEach((doc) => {
//           const data = doc.data();
//           const date = new Date(data.scheduledDate?.seconds * 1000 || 0);

//           let key = '';
//           if (timeRange === 'daily') {
//             key = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
//           } else if (timeRange === 'weekly') {
//             key = `Semana ${Math.ceil(date.getDate() / 7)}`;
//           } else if (timeRange === 'monthly') {
//             key = date.toLocaleString('default', { month: 'short' });
//           }

//           grouped[key] = (grouped[key] || 0) + 1;
//         });

//         const labels = Object.keys(grouped);
//         const values = labels.map((label) => grouped[label]);

//         setReportData({ labels, datasets: [{ data: values }] });
//       } catch (error) {
//         console.error('Erro ao processar pedidos:', error);
//       }
//     };

//     fetchFromOrders();
//   }, [timeRange]);

//   useEffect(() => {
//     const fetchInventoryAudit = async () => {
//       const stockSnap = await getDocs(collection(db, 'stock'));
//       const ordersSnap = await getDocs(collection(db, 'orders'));

//       const stockMap = new Map<string, number>();
//       stockSnap.forEach((doc) => {
//         const data = doc.data();
//         const key = data.ProductItemId;
//         stockMap.set(key, (stockMap.get(key) || 0) + data.quantity);
//       });

//       const usageMap = new Map<string, number>();
//       ordersSnap.forEach((doc) => {
//         const order = doc.data();
//         order.items.forEach((item: any) => {
//           usageMap.set(item.id, (usageMap.get(item.id) || 0) + item.quantity);
//         });
//       });

//       const results: any[] = [];
//       stockMap.forEach((estoque, productId) => {
//         const usado = usageMap.get(productId) || 0;
//         const saldo = estoque - usado;
//         results.push({ productId, estoque, usado, saldo, status: saldo >= 0 ? 'ok' : 'furo' });
//       });

//       setAuditResults(results);
//     };

//     fetchInventoryAudit();
//   }, []);

//   const chartConfig = {
//     backgroundColor: theme.card,
//     backgroundGradientFrom: theme.card,
//     backgroundGradientTo: theme.card,
//     decimalPlaces: 0,
//     color: (opacity = 1) => theme.primary + Math.round(opacity * 255).toString(16),
//     style: {
//       borderRadius: 16,
//     },
//   };

//   const renderChart = () => {
//     const hasData = reportData.labels.length > 0 && reportData.datasets[0].data.length > 0;

//     if (!hasData) {
//       return <Text style={[styles.noData, { color: theme.textSecondary }]}>Sem dados para este intervalo.</Text>;
//     }

//     return chartType === 'line' ? (
//       <LineChart
//         data={reportData}
//         width={screenWidth - 80}
//         height={220}
//         chartConfig={chartConfig}
//         bezier
//         style={styles.chart}
//       />
//     ) : (
//       <BarChart
//         data={reportData}
//         width={screenWidth - 80}
//         height={220}
//         chartConfig={chartConfig}
//         style={styles.chart}
//         yAxisLabel=""
//         yAxisSuffix=""
//       />
//     );
//   };

//   return (
//     <Container>
//       <ScrollView>
//         <Title>Relatórios & Análise</Title>

//         <View style={styles.filterContainer}>
//           <View style={styles.pickerContainer}>
//             <Text style={[styles.label, { color: theme.textSecondary }]}>Intervalo de Tempo</Text>
//             <Picker
//               selectedValue={timeRange}
//               onValueChange={setTimeRange}
//               style={[styles.picker, { backgroundColor: theme.inputBg, color: theme.textPrimary }]}
//             >
//               <Picker.Item label="Diário" value="daily" />
//               <Picker.Item label="Semanal" value="weekly" />
//               <Picker.Item label="Mensal" value="monthly" />
//             </Picker>
//           </View>

//           <View style={styles.pickerContainer}>
//             <Text style={[styles.label, { color: theme.textSecondary }]}>Tipo de Gráfico</Text>
//             <Picker
//               selectedValue={chartType}
//               onValueChange={setChartType}
//               style={[styles.picker, { backgroundColor: theme.inputBg, color: theme.textPrimary }]}
//             >
//               <Picker.Item label="Gráfico de Linha" value="line" />
//               <Picker.Item label="Gráfico de Barras" value="bar" />
//             </Picker>
//           </View>
//         </View>

//         <View style={[styles.chartContainer, { backgroundColor: theme.card }]}>
//           {renderChart()}
//         </View>

//         <View style={styles.statsContainer}>
//           <View style={[styles.statCard, { backgroundColor: theme.inputBg }]}>
//             <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total de Pedidos</Text>
//             <Text style={[styles.statValue, { color: theme.primary }]}>{totalPedidos}</Text>
//           </View>
//         </View>

//         <View style={[styles.auditContainer, { backgroundColor: theme.card }]}>
//           <Text style={[styles.auditTitle, { color: theme.textPrimary }]}>Auditoria de Estoque</Text>
//           {auditResults.length === 0 ? (
//             <Text style={{ color: theme.textSecondary }}>Nenhuma inconsistência detectada.</Text>
//           ) : (
//             auditResults.map((item) => (
//               <View key={item.productId} style={styles.auditRow}>
//                 <Text style={{ color: theme.textPrimary }}>{item.productId}</Text>
//                 <Text style={{ color: theme.textSecondary }}>Estoque: {item.estoque} | Usado: {item.usado} | Saldo: {item.saldo}</Text>
//                 <Text style={{ color: item.status === 'ok' ? theme.green : theme.red }}>
//                   {item.status === 'ok' ? '✔ Sem perdas' : '⚠ Furo'}
//                 </Text>
//               </View>
//             ))
//           )}
//         </View>

//         <Button style={[styles.exportButton, { backgroundColor: theme.green }]}>
//           <ButtonText>Exportar Relatório</ButtonText>
//         </Button>
//       </ScrollView>
//     </Container>
//   );
// }

// const styles = StyleSheet.create({
//   filterContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 20,
//   },
//   pickerContainer: {
//     flex: 1,
//     marginHorizontal: 5,
//   },
//   label: {
//     fontSize: 14,
//     marginBottom: 5,
//   },
//   picker: {
//     borderRadius: 8,
//     height: 50,
//   },
//   chartContainer: {
//     borderRadius: 16,
//     padding: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//     marginBottom: 20,
//   },
//   chart: {
//     marginVertical: 8,
//     borderRadius: 16,
//   },
//   noData: {
//     textAlign: 'center',
//     fontSize: 16,
//     marginTop: 16,
//   },
//   statsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 20,
//   },
//   statCard: {
//     flex: 1,
//     borderRadius: 8,
//     padding: 12,
//     marginHorizontal: 5,
//     alignItems: 'center',
//   },
//   statLabel: {
//     fontSize: 12,
//     marginBottom: 4,
//   },
//   statValue: {
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   auditContainer: {
//     borderRadius: 8,
//     padding: 12,
//     marginVertical: 12,
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   auditTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginBottom: 8,
//   },
//   auditRow: {
//     borderBottomWidth: 1,
//     borderBottomColor: '#ccc',
//     paddingVertical: 8,
//   },
//   exportButton: {
//     marginTop: 10,
//   },
// });
