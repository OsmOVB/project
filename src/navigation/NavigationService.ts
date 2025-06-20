import {
  createNavigationContainerRef,
  StackActions,
  CommonActions,
  NavigationState,
} from '@react-navigation/native';
import type { RootStackParamList } from './types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export const navigate = {
  /**
   * Navega para uma tela com nome e parâmetros opcionais
   */
  to<RouteName extends keyof RootStackParamList>(
    name: RouteName,
    params?: RootStackParamList[RouteName]
  ) {
    if (navigationRef.isReady()) {
      navigationRef.navigate(name, params);
    }
  },

  /**
   * Volta para a tela anterior, se possível
   */
  back() {
    if (navigationRef.isReady() && navigationRef.canGoBack()) {
      navigationRef.goBack();
    }
  },

  /**
   * Substitui toda a pilha de navegação por uma nova rota
   */
  reset<RouteName extends keyof RootStackParamList>(
    name: RouteName,
    params?: RootStackParamList[RouteName]
  ) {
    if (navigationRef.isReady()) {
      navigationRef.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name, params }],
        })
      );
    }
  },

  /**
   * Empilha uma nova rota no topo da stack
   */
  push<RouteName extends keyof RootStackParamList>(
    name: RouteName,
    params?: RootStackParamList[RouteName]
  ) {
    if (navigationRef.isReady()) {
      navigationRef.dispatch(StackActions.push(name, params));
    }
  },

  /**
   * Substitui a rota atual por uma nova
   */
  replace<RouteName extends keyof RootStackParamList>(
    name: RouteName,
    params?: RootStackParamList[RouteName]
  ) {
    if (navigationRef.isReady()) {
      navigationRef.dispatch(StackActions.replace(name, params));
    }
  },

  /**
   * Retorna o nome e params da rota atual
   */
  getCurrentRoute() {
    return navigationRef.getCurrentRoute(); // { name, key, params }
  },

  /**
   * Verifica se há tela anterior na pilha
   */
  canGoBack(): boolean {
    return navigationRef.isReady() && navigationRef.canGoBack();
  },

  /**
   * Obtém o estado atual da navegação
   */
  getRootState(): NavigationState | undefined {
    return navigationRef.getRootState();
  }
};