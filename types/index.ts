export type UserRole = 'admin' | 'delivery' | 'customer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  address?: string;
  createdAt: Date;
}

export interface StockItem {
  liters: any;
  id: string;
  type: 'barril' | 'co2' | 'torneira' | 'copo';
  name: string;
  quantity: number;
}

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