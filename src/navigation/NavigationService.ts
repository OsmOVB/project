import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from './types';

// Cria o ref tipado com as rotas do stack
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

// Função genérica para navegar sem hook
export function navigate<RouteName extends keyof RootStackParamList>(
  name: RouteName,
  params?: RootStackParamList[RouteName]
) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}
