import {
  doc,
  updateDoc,
  getDocs,
  query,
  collection,
  where,
  addDoc,
} from 'firebase/firestore';
import { db } from '@/src/firebase/config';
import { QRCode } from '../types';

/**
 * Assign a free QR Code to a stock item.
 * @throws Error if QR code is not available or already occupied.
 */
async function assignQrCodeToStock(
  qrCode: string,
  stockId: string,
  companyId: string
): Promise<void> {
  const q = query(
    collection(db, 'qrcodes'),
    where('code', '==', qrCode),
    where('status', '==', 'free'),
    where('companyId', '==', companyId)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    throw new Error(`O QR Code "${qrCode}" não está disponível ou já está ocupado.`);
  }

  const qrDoc = snapshot.docs[0];
  const qrRef = doc(db, 'qrcodes', qrDoc.id);

  await updateDoc(qrRef, {
    status: 'occupied',
    usedByStockId: stockId,
  });
}

/**
 * Release a QR Code (set to free).
 * @throws Error if QR code is not found.
 */
async function releaseQrCode(qrCode: string, companyId: string): Promise<void> {
  const q = query(
    collection(db, 'qrcodes'),
    where('code', '==', qrCode),
    where('companyId', '==', companyId)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    throw new Error(`QR Code "${qrCode}" not found for this company.`);
  }

  const qrDoc = snapshot.docs[0];
  const qrRef = doc(db, 'qrcodes', qrDoc.id);

  await updateDoc(qrRef, {
    status: 'free',
    usedByStockId: null,
  });
}

async function generateNextCompanyQrCode(companyId: string): Promise<string> {
  const q = query(
    collection(db, 'qrcodes'),
    where('companyId', '==', companyId)
  );

  const snapshot = await getDocs(q);

  const codes = snapshot.docs
    .map((doc) => doc.data().code)
    .filter((code) => typeof code === 'string');

  const nextNumber = codes.length + 1;
  const nextCode = `QR${nextNumber.toString().padStart(4, '0')}`; // ex: QR0001, QR0002

  const newQrCode: QRCode = {
    code: nextCode,
    status: 'occupied',
    companyId,
    createdAt: new Date().toISOString(),
  };

  await addDoc(collection(db, 'qrcodes'), newQrCode);

  return nextCode;
}

async function releaseQRCodesByStockIds(stockIds: string[], companyId: string) {
  if (!stockIds.length) return;

  const q = query(
    collection(db, 'qrcodes'),
    where('companyId', '==', companyId),
    where('usedByStockId', 'in', stockIds)
  );

  const qrSnapshot = await getDocs(q);

  const updates = qrSnapshot.docs.map((qrDoc) =>
    updateDoc(doc(db, 'qrcodes', qrDoc.id), {
      status: 'free',
      usedByStockId: null,
    })
  );

  await Promise.all(updates);
}

export const qrCodeUtils = {
  assignQrCodeToStock,
  releaseQrCode,
  generateNextCompanyQrCode,
  releaseQRCodesByStockIds,
};
