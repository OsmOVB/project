export type AppStackParamList = {
  HomeMain: undefined;
  OrderCreate: { orderId?: string };
  Batches: undefined;
  LoteDetails: { loteId: string; dataLote: string };
  EditStockItem: { itemId: string };
  ManageDeliveries: undefined;
  HelpCenter: undefined;
  ReportProblem: undefined;
  EditProfile: undefined;

};

export type TabStackParamList = {
  Início: undefined;
  Lotes: undefined;
  Relatórios: undefined;
  Ajustes: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type AllStackRoutes = AuthStackParamList & AppStackParamList;
