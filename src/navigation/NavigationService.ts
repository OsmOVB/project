import {
  createNavigationContainerRef,
  StackActions,
  CommonActions,
  NavigationState,
} from '@react-navigation/native';
import type { AllStackRoutes } from './types';

// Cria a referência global da navegação
export const navigationRef = createNavigationContainerRef<AllStackRoutes>();

export const navigate = {
  /**
   * Navega para uma tela com nome e parâmetros opcionais
   */
  to<RouteName extends keyof AllStackRoutes>(
    name: RouteName,
    params?: AllStackRoutes[RouteName]
  ) {
    if (navigationRef.isReady()) {
      navigationRef.navigate(name, params);
    }
  },

  /**
   * Volta para a tela anterior
   */
  back() {
    if (navigationRef.isReady() && navigationRef.canGoBack()) {
      navigationRef.goBack();
    }
  },

  /**
   * Reseta a pilha de navegação para uma nova rota
   */
  reset<RouteName extends keyof AllStackRoutes>(
    name: RouteName,
    params?: AllStackRoutes[RouteName]
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
   * Empilha uma nova rota
   */
  push<RouteName extends keyof AllStackRoutes>(
    name: RouteName,
    params?: AllStackRoutes[RouteName]
  ) {
    if (navigationRef.isReady()) {
      navigationRef.dispatch(StackActions.push(name, params));
    }
  },

  /**
   * Substitui a rota atual
   */
  replace<RouteName extends keyof AllStackRoutes>(
    name: RouteName,
    params?: AllStackRoutes[RouteName]
  ) {
    if (navigationRef.isReady()) {
      navigationRef.dispatch(StackActions.replace(name, params));
    }
  },

  /**
   * Obtém a rota atual
   */
  getCurrentRoute() {
    return navigationRef.getCurrentRoute(); // { name, key, params }
  },

  /**
   * Verifica se é possível voltar
   */
  canGoBack(): boolean {
    return navigationRef.isReady() && navigationRef.canGoBack();
  },

  /**
   * Obtém o estado raiz da navegação
   */
  getRootState(): NavigationState | undefined {
    return navigationRef.getRootState();
  },
};
