import { create } from 'zustand';
import { User, UserRole } from '../types';

interface AuthState {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    name: string;
    role: UserRole;
  }) => Promise<void>;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  login: async (email, password) => {
    // Mock authentication
    const mockUser: User = {
      id: '1',
      email,
      name: 'John Doe',
      role: 'customer',
      createdAt: new Date(),
    };
    set({ user: mockUser });
  },
  register: async (data) => {
    const mockUser: User = {
      id: '1',
      ...data,
      createdAt: new Date(),
    };
    set({ user: mockUser });
  },
  logout: () => set({ user: null }),
}));