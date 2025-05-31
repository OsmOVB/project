import { runTransaction, doc, collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/src/firebase/config';

export const createOrderWithIncrementalNumber = async (companyId: string, orderData: any) => {
  const counterRef = doc(db, 'counters', companyId); // 👈 exemplo: counters/choppgo

  const newOrderNumber = await runTransaction(db, async (transaction) => {
    const counterSnap = await transaction.get(counterRef);
    const lastOrderNumber = counterSnap.exists() ? counterSnap.data().lastOrderNumber : 0;
    const newNumber = lastOrderNumber + 1;

    transaction.set(counterRef, { lastOrderNumber: newNumber });

    return newNumber;
  });

  const formattedOrderNumber = String(newOrderNumber).padStart(4, '0'); // ex: 0001

  const orderRef = await addDoc(collection(db, 'orders'), {
    ...orderData,
    companyId,
    orderNumber: formattedOrderNumber,
    date: Timestamp.now(),
  });

  return orderRef.id;
};
