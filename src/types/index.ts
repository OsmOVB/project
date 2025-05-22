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

// Produto cadastrado pela empresa
export type Product = {
  id: string;           // ID do tipo cadastrado
  name: string;         // Nome (ex: Pilsen, Barril, CO2)
  size?: string;        // Tamanho (ex: 30L, 50L)
  brand?: string;       // Marca (ex: Heineken)
  favorite: number;     // Nota de 1 a 5 estrelas
  createdAt: string;    // Data de criação
  companyId: string;    // ID da empresa que criou o produto
  unity: string;      // Unidade de medida (ex: L, mL, m³)
};


// Itens no estoque (relacionados ao produto)
export type Stock = {
  id: string;
  tipoItemId: string;
  tipoItemName: string;
  quantity: number;
  liters?: number;
  loteId: number;
  dataLote: string; // formato: dd/MM/yyyy
  sequenciaLote: number;
  pendenciaImpressao: 'S' | 'N';
  adminEmail: string;     // para filtro de empresa
  qrCode?: string;        // código único, sequencial (ex: I001, I002)
  companyId: string;
};


// export type Stock = {
//   id: string;                    // ID do estoque
//   tipoItemId: string;            // ID do tipoItem relacionado
//   tipoItemName: string;          // Nome do tipo item (para renderização rápida)
//   quantity: number;              // Quantidade
//   liters?: number;               // Capacidade em litros (se aplicável)
//   loteId: number;                // Número do lote
//   dataLote: string;              // Data do lote (formato dd/MM/yyyy)
//   sequenciaLote: number;         // Sequência do item no lote
//   pendenciaImpressao: 'S' | 'N'; // Pendência de impressão
// };


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

// QR Code opcional como entidade separada (caso deseje mapear)
export interface QRCode {
  id: string;
  stockId: string;
  code: string; // Ex: I001, I002
  used: boolean;
  companyId: string;
}

// Métodos de pagamento
export type PaymentMethod = 'crédito' | 'débito' | 'dinheiro' | 'pix';

// Status do pedido
export type StatusOrder = 'pendente' | 'em progresso' | 'finalizado';
