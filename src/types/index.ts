export type UserRole = 'admin' | 'delivery' | 'customer';
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  address?: string;
  createdAt: Date;
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

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  address?: string;
  createdAt: Date;
  companyId?: string; // opcional, mas recomendado
}

// Empresa / companhia associada ao admin
export interface Company {
  id: string;
  name: string;
  adminEmail: string; // facilita consultas por e-mail
  createdAt: Date;
}

export type Product = {
  id: string;
  type: string;
  name: string;
  size?: string;
  brand?: string;
  favorite: number;
  createdAt: string;
  companyId: string;
  unity: string;
};
export type QrCodeStatus = 'free' | 'occupied';

export interface QRCode {
  id?: string;
  code: string;
  status: QrCodeStatus;
  companyId: string;
  createdAt: string;
  usedByStockId?: string;
}


export interface Stock {
  id?: string; // Optional, assigned by Firestore
  productItemId: string;
  batchId: number;
  companyId: string;
  adminEmail: string;
  volumeLiters: number;
  batchDate: string; // format: YYYY-MM-DD
  pendingPrint: 'Y' | 'N';
  price: number;
  qrCode: string;
  quantity?: number; // optional, used only in aggregated mode
  batchSequence?: number; // optional, if you want to keep a sequence
}

// Item de um pedido (referencia um Stock específico)
export interface OrderItem {
  id: string;
  stockItemId: string;
  name: string;
  quantity: number;
}

// Pedido de entrega
export interface Order {
  id: string;
  customerName: string;
  items: OrderItem[];
  totalLiters: number;
  status: StatusOrder;
  deliveryPersonId?: string;
  date: Date;
  paymentMethod: PaymentMethod;
  companyId: string;
  adminEmail: string;
}

// Métodos de pagamento
export type PaymentMethod = 'crédito' | 'débito' | 'dinheiro' | 'pix';

// Status do pedido
export type StatusOrder = 'pendente' | 'cancelado' | 'a caminho' | 'em progresso' | 'finalizado';
export interface Address {
  id: string;
  name: string; // nome do local ou do cliente
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  reference?: string;
  companyId: string;
  createdAt: string;
}

export type GroupedProduct = {
  productItemId: string;
  productItemName: string;
  name: string;
  companyId: string;
  batchDate: string;
  totalQuantity: number;
  averagePrice: number;
  volumeLiters: number;
  brand?: string;
  size?: string;
  type?: string;
  unity?: string;
};

export type SelectableProduct = {
  id: string;
  name: string;
  quantity: number;
  size?: string;
  unity?: string;
  brand?: string;
  price?: number;
  type?: string;
  companyId: string;
};
