import { PermissionsAndroid } from 'react-native';
import Geolocation, { GeolocationResponse } from '@react-native-community/geolocation';
import { displayErrorAlert } from './showAlert';

const requestLocationPermission = async () => {
  try {
    const permissionStatus = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );

    return permissionStatus;
  } catch (error) {
    throw new Error(`Error while requesting location permission: ${JSON.stringify(error)}`);
  }
};

const getPositionAsync = async () => {
  return new Promise<GeolocationResponse>((resolve, reject) => {
    Geolocation.getCurrentPosition(
      position => resolve(position),
      error => {
        const errorMessage = `Error while getting the current position: ${JSON.stringify(error)}`;
        displayErrorAlert({ message: "Erro ao salvar pulverização, verifique se o GPS está ativado ou se o dispositivo possui permissão de localização."});
        reject(new Error(errorMessage))
      },
      {
        maximumAge: 0,
        distanceFilter: 0
      }
    );
  });
};

/**
 * Obtém a posição atual do dispositivo.
 * @returns {Promise<GeolocationResponse>} Retorna a posição atual.
 */
const getPositionAsync1 = async (): Promise<GeolocationResponse> => {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (position) => resolve(position),
      (error) => reject(new Error(`Erro ao obter a posição atual: ${JSON.stringify(error)}`)),
      { maximumAge: 0, enableHighAccuracy: true }
    );
  });
};

/**
 * Inicia o monitoramento contínuo da localização.
 * @param {Function} onPositionUpdate - Callback chamado sempre que a localização é atualizada.
 * @returns {number} Retorna o ID do watcher para controle.
 */
const startWatchingPosition = (
  onPositionUpdate: (position: GeolocationResponse) => void
): number => {
  // console.log("Iniciando monitoramento de localização...");
  return Geolocation.watchPosition(
    (position) => {
      // console.log("Nova posição recebida (Real):", position); // Log detalhado da posição
      onPositionUpdate(position);
    },
    (error) => {
      console.error("Erro ao monitorar a localização:", error);
      // Log de erro com mais detalhes
    },
    { enableHighAccuracy: true, distanceFilter: 5, interval: 1000 } // Configuração de alta precisão
  );
};


// Parar monitoramento contínuo
const stopWatchingPosition = (watchId: number) => {
  Geolocation.clearWatch(watchId);
};

const handleLocationUpdates = async (): Promise<void> => {
  const hasPermission = await requestLocationPermission();
  if (!hasPermission) return;

  try {
    const currentPosition = await getPositionAsync();
    // console.log('Posição atual:', currentPosition);

    // Iniciar monitoramento contínuo
    const watchId = startWatchingPosition((position) => {
      // console.log('Nova posição:', position);
    });

    // Parar monitoramento após 60 segundos (apenas exemplo)
    setTimeout(() => {
      stopWatchingPosition(watchId);
      // console.log('Monitoramento de localização interrompido.');
    }, 60000);
  } catch (error) {
    console.error('Erro ao obter localização:', error);
  }
};

export const geolocationUtils = {
  requestLocationPermission,
  getPositionAsync,
  startWatchingPosition,
  stopWatchingPosition,
};


//testes em captura de localização

  // const [watchId, setWatchId] = useState<number | null>(null);
  // const [currentPosition, setCurrentPosition] = useState<GeolocationResponse | null>(null);

  // const startTracking = async () => {
  //   console.log("Solicitando permissão de localização...");
  //   const hasPermission = await geolocationUtils.requestLocationPermission();

  //   if (!hasPermission) {
  //     console.log("Permissão negada para localização.");
  //     return;
  //   }

  //   console.log("Permissão concedida. Iniciando monitoramento...");
  //   const id = geolocationUtils.startWatchingPosition((position) => {
  //     console.log("Posição atualizada recebida:", position); // Confirmar que o callback está funcionando
  //     setCurrentPosition(position);
  //   });
  //   setWatchId(id); // Armazena o ID do watcher para controle
  // };

  // const stopTracking = () => {
  //   if (watchId !== null) {
  //     geolocationUtils.stopWatchingPosition(watchId);
  //     setWatchId(null);
  //     console.log("Monitoramento interrompido.");
  //   }
  // };

  // useEffect(() => {
  //   return () => {
  //     if (watchId !== null) {
  //       geolocationUtils.stopWatchingPosition(watchId);
  //       console.log("Monitoramento interrompido no desmontar.");
  //     }
  //   };
  // }, [watchId]);
