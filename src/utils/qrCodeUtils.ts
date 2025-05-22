import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/config";

export async function generateNextQrCode(): Promise<string> {
  const snapshot = await getDocs(collection(db, 'stock'));
  const qrCodes = snapshot.docs
    .map((doc) => doc.data().qrCode)
    .filter((code) => typeof code === 'string' && code.startsWith('I'));

  const numbers = qrCodes.map((code) => parseInt(code.slice(1))).filter(Number.isFinite);
  const max = numbers.length > 0 ? Math.max(...numbers) : 0;

  const next = (max + 1).toString().padStart(3, '0'); // ex: 022
  return `I${next}`; // retorna: I022
}

export async function generateNextQrCodeByAdmin(adminEmail: string): Promise<string> {
  const q = query(collection(db, 'stock'), where('adminEmail', '==', adminEmail));
  const snapshot = await getDocs(q);

  const qrCodes = snapshot.docs
    .map((doc) => doc.data().qrCode)
    .filter((code) => typeof code === 'string' && code.startsWith('I'));

  const numbers = qrCodes.map((code) => parseInt(code.slice(1))).filter(Number.isFinite);
  const max = numbers.length > 0 ? Math.max(...numbers) : 0;

  const next = (max + 1).toString().padStart(3, '0'); // ex: 005
  return `I${next}`; // ex: I005
}
