export interface Inventory {
    id: string;
    productId: string; // FK para Product
    quantity: number;
    location: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
    isActive: boolean;
  }
  