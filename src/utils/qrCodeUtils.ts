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
import { nextStepStatus, StepStatus } from '@/src/utils/kegControl';


export async function assignQrCodeToStock(
  qrCode: string,
  stockId: string,
  companyId: string
): Promise<void> {
  const q = query(
    collection(db, 'qrcodes'),
    where('code', '==', qrCode),
    where('companyId', '==', companyId)
  );

  const snapshot = await getDocs(q);
  console.log('🟡 QR Code escaneado:', qrCode);
  console.log('🔍 Snapshot docs count:', snapshot.docs.length);

  if (snapshot.empty) {
    throw new Error(`⚠️ O QR Code "${qrCode}" não está disponível ou já está ocupado.`);
  }

  const qrDoc = snapshot.docs[0];
  const qrRef = doc(db, 'qrcodes', qrDoc.id);
  const qrData = qrDoc.data();

  // Verifica se já está vinculado a esse mesmo estoque
  if (qrData.usedByStockId === stockId) {
    console.log(`✅ Etapa do QR Code "${qrCode}" atualizada para 'Pending' (stockId já vinculado).`);
    await updateDoc(qrRef, {
      stepStatus: StepStatus.Pending,
    });
    return;
  }

  // Impede vinculação se o status ainda for 'occupied' com outro estoque
  // if (qrData.status === 'occupied') {
  //   throw new Error(`⚠️ Este QR Code já está em uso por outro estoque.`);
  // }

  // Atualiza dados: define como 'occupied' no início do uso
  await updateDoc(qrRef, {
    status: 'occupied',
    usedByStockId: stockId,
    stepStatus: StepStatus.Pending, // inicia o ciclo
  });

  console.log(`✅ QR Code "${qrCode}" vinculado ao estoque ${stockId}.`);
}

/**
 * Libera um QR Code ocupando, definindo status como 'free'.
 */
async function releaseQrCode(qrCode: string, companyId: string): Promise<void> {
  const q = query(
    collection(db, 'qrcodes'),
    where('code', '==', qrCode),
    where('companyId', '==', companyId)
  );

  const snapshot = await getDocs(q);
  console.log('QR Code snapshot:', snapshot);

  if (snapshot.empty) {
    throw new Error(`QR Code "${qrCode}" não encontrado para esta empresa.`);
  }

  const qrDoc = snapshot.docs[0];
  const qrRef = doc(db, 'qrcodes', qrDoc.id);

  await updateDoc(qrRef, {
    status: 'free',
    usedByStockId: null,
    stepStatus: StepStatus.Free,
  });
}

/**
 * Gera um novo QR Code para a empresa e o marca como ocupado.
 */
async function generateNextCompanyQrCode(companyId: string): Promise<string> {
  const q = query(collection(db, 'qrcodes'), where('companyId', '==', companyId));
  const snapshot = await getDocs(q);

  const codes = snapshot.docs
    .map((doc) => doc.data().code)
    .filter((code) => typeof code === 'string');

  const nextNumber = codes.length + 1;
  const nextCode = `QR${nextNumber.toString().padStart(4, '0')}`;

  const newQrCode: QRCode = {
    code: nextCode,
    status: 'occupied',
    companyId,
    createdAt: new Date().toISOString(),
    stepStatus: StepStatus.Pending,
  };

  await addDoc(collection(db, 'qrcodes'), newQrCode);

  return nextCode;
}

/**
 * Libera uma lista de QR Codes relacionados a stockIds.
 */
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
      stepStatus: StepStatus.Free,
    })
  );

  await Promise.all(updates);
}

/**
 * Avança o stepStatus do QR Code, limitado até Installed.
 */
async function advanceQrStep(qrCode: string, companyId: string): Promise<StepStatus> {
  const q = query(
    collection(db, 'qrcodes'),
    where('code', '==', qrCode),
    where('companyId', '==', companyId)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    throw new Error(`QR Code "${qrCode}" não encontrado.`);
  }

  const qrDoc = snapshot.docs[0];
  const qrRef = doc(db, 'qrcodes', qrDoc.id);
  const current = qrDoc.data().stepStatus ?? StepStatus.Pending;

  const next = Math.min(current + 1, StepStatus.Installed); // não passa do final normal
  await updateDoc(qrRef, { stepStatus: next });

  return next;
}

export async function advanceQrCodeStepStatus(code: string, companyId: string) {
  console.log(`🟡 Iniciando avanço de etapa para QR Code: "${code}" da empresa "${companyId}"`);

  const q = query(
    collection(db, 'qrcodes'),
    where('code', '==', code),
    where('companyId', '==', companyId)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    console.warn(`🔴 QR Code "${code}" não encontrado para a empresa "${companyId}"`);
    throw new Error(`QR Code "${code}" não encontrado.`);
  }

  const qrDoc = snapshot.docs[0];
  const qrRef = doc(db, 'qrcodes', qrDoc.id);
  const data = qrDoc.data();

  const currentStep: StepStatus = data.stepStatus ?? StepStatus.Pending;
  const nextStep = nextStepStatus(currentStep);

  console.log(`ℹ️ Etapa atual do QR Code "${code}": '${currentStep}'`);
  console.log(`➡️ Próxima etapa sugerida: '${nextStep}'`);

  if (currentStep === StepStatus.Installed) {
    console.log(`✅ QR Code "${code}" já está na etapa final (${currentStep}). Nenhuma ação necessária.`);
    return;
  }

  if (nextStep <= currentStep) {
    console.log(`⏩ Etapa não atualizada. Etapa atual (${currentStep}) é maior ou igual à próxima (${nextStep}).`);
    return;
  }

  await updateDoc(qrRef, {
    stepStatus: nextStep,
  });

  console.log(`✅ Etapa do QR Code "${code}" atualizada com sucesso para '${nextStep}'`);
}

function shouldReleaseQrCode(step: StepStatus): boolean {
  return step === StepStatus.Empty;
}



export const qrCodeUtils = {
  assignQrCodeToStock,
  releaseQrCode,
  generateNextCompanyQrCode,
  releaseQRCodesByStockIds,
  advanceQrStep,
  advanceQrCodeStepStatus,
  shouldReleaseQrCode,
};
