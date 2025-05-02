export interface Order {
    id: string;
    customerId: string; // FK para User
    rentalDate: Date;
    returnDate?: Date | null;
    totalAmount: number;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
    isActive: boolean;
  }
  