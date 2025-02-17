// import React, { useEffect, useState } from 'react';
// import { View, StyleSheet, Text, Platform } from 'react-native';
// import { Container, Title, Button, ButtonText, Input } from '../../../components/styled';
// import { useRouter } from 'expo-router';
// import { CameraView, useCameraPermissions, CameraType } from 'expo-camera';

// export default function ScanItems() {
//   const [scannedItems, setScannedItems] = useState<string[]>([]);
//   const [manualInput, setManualInput] = useState('');
//   const [scanned, setScanned] = useState(false);
//   const [facing, setFacing] = useState<CameraType>('back');
//   const [permission, requestPermission] = useCameraPermissions();
//   const router = useRouter();

//   useEffect(() => {
//     (async () => {
//       if (!permission?.granted) {
//         await requestPermission();
//       }
//     })();
//   }, [permission]);

//   const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
//     setScanned(true);
//     setScannedItems([...scannedItems, data]);
//     alert(`Código de barras escaneado: ${data}`);
//   };

//   if (!permission) {
//     return <Text>Solicitando permissão para usar a câmera...</Text>;
//   }

//   if (!permission.granted) {
//     return (
//       <View style={styles.container}>
//         <Text style={styles.message}>Precisamos de permissão para acessar a câmera</Text>
//         <Button onPress={requestPermission}>
//           <ButtonText>Conceder permissão</ButtonText>
//         </Button>
//       </View>
//     );
//   }

//   // Web fallback UI
//   if (Platform.OS === 'web') {
//     return (
//       <Container>
//         <Title>Digite o Código do Item</Title>

//         <View style={styles.webInputContainer}>
//           <Input
//             placeholder="Digite o código manualmente"
//             value={manualInput}
//             onChangeText={setManualInput}
//             style={styles.input}
//           />
//           <Button 
//             onPress={() => {
//               if (manualInput.trim()) {
//                 setScannedItems([...scannedItems, manualInput.trim()]);
//                 setManualInput('');
//               }
//             }}
//             style={styles.addButton}
//           >
//             <ButtonText>Adicionar Item</ButtonText>
//           </Button>
//         </View>

//         <View style={styles.itemsContainer}>
//           <Title style={styles.itemsTitle}>Itens Escaneados</Title>
//           {scannedItems.map((item, index) => (
//             <View key={index} style={styles.itemRow}>
//               <Text style={styles.item}>{item}</Text>
//               <Button 
//                 onPress={() => {
//                   const newItems = [...scannedItems];
//                   newItems.splice(index, 1);
//                   setScannedItems(newItems);
//                 }}
//                 style={styles.removeButton}
//               >
//                 <ButtonText>Remover</ButtonText>
//               </Button>
//             </View>
//           ))}
//         </View>

//         <Button onPress={() => router.back()} style={styles.doneButton}>
//           <ButtonText>Concluído</ButtonText>
//         </Button>
//       </Container>
//     );
//   }

//   // Native platforms UI
//   return (
//     <Container>
//       <Title>Escanear Itens</Title>
//       <CameraView
//         style={styles.camera}
//         facing={facing}
//         onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
//         barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
//       >
//         {scanned && (
//           <Button onPress={() => setScanned(false)} style={styles.button}>
//             <ButtonText>Escanear Novamente</ButtonText>
//           </Button>
//         )}
//       </CameraView>
//     </Container>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//   },
//   message: {
//     fontSize: 16,
//     color: '#FF3B30',
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   webInputContainer: {
//     marginBottom: 20,
//   },
//   input: {
//     marginBottom: 10,
//   },
//   itemsContainer: {
//     flex: 1,
//     width: '100%',
//     backgroundColor: '#f5f5f5',
//     borderRadius: 12,
//     padding: 15,
//     marginBottom: 20,
//   },
//   itemsTitle: {
//     fontSize: 20,
//     marginBottom: 10,
//   },
//   itemRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 10,
//     paddingVertical: 5,
//     borderBottomWidth: 1,
//     borderBottomColor: '#e0e0e0',
//   },
//   item: {
//     fontSize: 16,
//     color: '#007AFF',
//     flex: 1,
//   },
//   camera: {
//     flex: 1,
//     width: '100%',
//   },
//   button: {
//     marginBottom: 10,
//   },
//   addButton: {
//     backgroundColor: '#007AFF',
//   },
//   removeButton: {
//     backgroundColor: '#FF3B30',
//     width: 100,
//     height: 40,
//   },
//   doneButton: {
//     backgroundColor: '#34C759',
//     marginTop: 10,
//   },
// });


// import React, { useEffect, useState } from 'react';
// import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
// import { useRouter } from 'expo-router';
// import { CameraView, useCameraPermissions } from 'expo-camera';
// import { Ionicons } from '@expo/vector-icons';

// export default function ScanItems() {
//   const router = useRouter();
//   const [permission, requestPermission] = useCameraPermissions();
//   const [scanned, setScanned] = useState(false);

//   useEffect(() => {
//     if (!permission?.granted) {
//       requestPermission();
//     }
//   }, [permission]);

//   const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
//     setScanned(true);
//     alert(`Código QR escaneado: ${data}`);
//   };

//   if (!permission) {
//     return <View />;
//   }

//   if (!permission.granted) {
//     return (
//       <View style={styles.container}>
//         <Text style={styles.message}>Precisamos de permissão para acessar a câmera.</Text>
//         <TouchableOpacity onPress={requestPermission} style={styles.button}>
//           <Text style={styles.buttonText}>Conceder Permissão</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>📷 Leitura de QR Code</Text>
//       <View style={styles.cameraContainer}>
//         <CameraView
//           style={styles.camera}
//           onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
//         />
//       </View>
//       <Text style={styles.instructions}>📷 Aponte a câmera para o QR Code</Text>
//       {scanned && (
//         <TouchableOpacity onPress={() => setScanned(false)} style={styles.scanAgainButton}>
//           <Text style={styles.buttonText}>Escanear Novamente</Text>
//         </TouchableOpacity>
//       )}
//       <TouchableOpacity onPress={() => router.back()} style={styles.button}>
//         <Ionicons name="arrow-back" size={18} color="#fff" />
//         <Text style={styles.buttonText}>Voltar</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#F4F4F4',
//     paddingHorizontal: 20,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 20,
//   },
//   cameraContainer: {
//     width: 250,
//     height: 250,
//     backgroundColor: '#D9D9D9',
//     borderRadius: 10,
//     overflow: 'hidden',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   camera: {
//     flex: 1,
//     width: '100%',
//   },
//   instructions: {
//     fontSize: 14,
//     color: '#555',
//     marginBottom: 20,
//   },
//   button: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#007AFF',
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 5,
//   },
//   scanAgainButton: {
//     backgroundColor: '#34C759',
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 5,
//     marginBottom: 10,
//   },
//   buttonText: {
//     color: '#FFF',
//     fontSize: 16,
//     marginLeft: 5,
//   },
//   message: {
//     fontSize: 16,
//     textAlign: 'center',
//     marginBottom: 20,
//   },
// });

import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Camera, CameraView } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

export default function ScanItems() {
  const router = useRouter();
  const cameraRef = useRef<Camera | null>(null);
  const [permission, setPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cameraType, setCameraType] = useState<'back' | 'front'>('back'); // Alterado para uma string

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setPermission(status === 'granted');
      setLoading(false);
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (!scanned) {
      setScanned(true);
      alert(`Código QR escaneado: ${data}`);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200EE" />
        <Text style={styles.loadingText}>Carregando câmera...</Text>
      </View>
    );
  }

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Precisamos de permissão para acessar a câmera.</Text>
        <TouchableOpacity onPress={() => Camera.requestCameraPermissionsAsync()} style={styles.button}>
          <Text style={styles.buttonText}>Conceder Permissão</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📷 Leitura de QR Code</Text>
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={styles.camera}
          ratio="1:1"
        />
      </View>
      <Text style={styles.instructions}>📷 Aponte a câmera para o QR Code</Text>
      {scanned && (
        <TouchableOpacity onPress={() => setScanned(false)} style={styles.scanAgainButton}>
          <Text style={styles.buttonText}>Escanear Novamente</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity onPress={() => router.back()} style={styles.button}>
        <Ionicons name="arrow-back" size={18} color="#fff" />
        <Text style={styles.buttonText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F4F4',
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6200EE',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  cameraContainer: {
    width: 250,
    height: 250,
    backgroundColor: '#000',
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  instructions: {
    fontSize: 14,
    color: '#555',
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
  },
  scanAgainButton: {
    backgroundColor: '#34C759',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    marginLeft: 5,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
});
