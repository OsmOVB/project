export type UserRole = 'admin' | 'delivery' | 'customer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  address?: string;
  createdAt: Date;
}

// export interface StockItem {
//   liters: any;
//   id: string;
//   type: 'barril' | 'co2' | 'torneira' | 'copo';
//   name: string;
//   quantity: number;
// }

export type TipoItem = {
  id: string;           // ID do tipo cadastrado
  name: string;         // Nome (ex: Pilsen, Barril, CO2)
  size?: string;        // Tamanho (ex: 30L, 50L)
  brand?: string;       // Marca (ex: Heineken)
  favorite: number;     // Nota de 1 a 5 estrelas
  createdAt: string;    // Data de criação
};

export type StockItem = {
  id: string;                    // ID do estoque
  tipoItemId: string;            // ID do tipoItem relacionado
  tipoItemName: string;          // Nome do tipo item (para renderização rápida)
  quantity: number;              // Quantidade
  liters?: number;               // Capacidade em litros (se aplicável)
  loteId: number;                // Número do lote
  dataLote: string;              // Data do lote (formato dd/MM/yyyy)
  sequenciaLote: number;         // Sequência do item no lote
  pendenciaImpressao: 'S' | 'N'; // Pendência de impressão
};


export interface OrderItem {
  id: string;
  stockItemId: string;
  name: string;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  items: OrderItem[];
  totalLiters: number;
  status: StatusOrder;
  deliveryPersonId?: string;
  date: Date;
  paymentMethod: paymentMethod;
}

export type paymentMethod = 'crédito' | 'débito' | 'dinheiro' | 'pix';
export type StatusOrder = 'pendente' | 'em progresso' | 'finalizado';