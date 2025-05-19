export interface User {
    id: string;
    name: string;
    email: string;
    phoneNumber?: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
    isActive: boolean;
  }
  