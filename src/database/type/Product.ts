export interface Product {
    id: string;
    name: string;
    description?: string;
    quantityInStock: number;
    unitPrice: number;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
    isActive: boolean;
  }
  