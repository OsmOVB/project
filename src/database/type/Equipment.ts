export interface Equipment {
    id: string;
    name: string;
    type: string;
    serialNumber: string;
    condition: 'new' | 'good' | 'fair' | 'poor';
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
    isActive: boolean;
  }
  