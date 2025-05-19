export interface Rental {
    id: string;
    orderId: string;    // FK para Order
    equipmentId: string; // FK para Equipment
    startDate: Date;
    endDate?: Date | null;
    status: 'reserved' | 'rented' | 'returned' | 'cancelled';
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
    isActive: boolean;
  }
  