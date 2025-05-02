export interface Equipment {
  id: string;
  name: string;
  type: string;
  serialNumber: string;
  condition: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface RentalOrder {
  id: string;
  customerName: string;
  equipmentName: string;
  rentalDate: Date;
  returnDate: Date | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}
