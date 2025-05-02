import { db } from '@/src/firebase/config';
import { collection, addDoc, getDocs, query, limit } from 'firebase/firestore';
import { Equipment, User, Rental } from '@/src/database/type';

export async function up() {
  console.log('Running 001_initial_setup...');

  // Criar equipamentos se não existir
  const equipmentsQuery = query(collection(db, 'equipments'), limit(1));
  const equipmentsSnapshot = await getDocs(equipmentsQuery);
  if (equipmentsSnapshot.empty) {
    const equipment: Equipment = {
      id: '1',
      name: 'Chopeira Padrão',
      type: 'manual',
      serialNumber: 'SN001',
      condition: 'new',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };
    await addDoc(collection(db, 'equipments'), equipment);
    console.log('Equipments collection initialized.');
  }

  // Criar usuários se não existir
  const usersQuery = query(collection(db, 'users'), limit(1));
  const usersSnapshot = await getDocs(usersQuery);
  if (usersSnapshot.empty) {
    const user: User = {
      id: '1',
      name: 'Usuário Teste',
      email: 'teste@example.com',
      phoneNumber: '11999999999',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };
    await addDoc(collection(db, 'users'), user);
    console.log('Users collection initialized.');
  }

  // Criar pedidos de aluguel se não existir
  const rentalsQuery = query(collection(db, 'rentals'), limit(1));
  const rentalsSnapshot = await getDocs(rentalsQuery);
  if (rentalsSnapshot.empty) {
    const rental: Rental = {
      id: '1',
      orderId: '1',
      equipmentId: '1',
      startDate: new Date(),
      endDate: null,
      status: 'reserved',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      isActive: true,
    };
    await addDoc(collection(db, 'rentals'), rental);
    console.log('Rentals collection initialized.');
  }

  console.log('001_initial_setup completed.');
}
