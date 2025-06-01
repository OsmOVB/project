export enum StepStatus {
    Pending = 0, //  pendente
    OnTheWay = 1, //  a caminho
    InProgress = 2, //  em progresso
    Checked = 3, //  verificado
    Installed = 4, //  instalado
    Free = 5, //  livre
    Empty = 6, //  vazio
    Canceled = 7 //  cancelado
}

/**
 * Maps each `StepStatus` enum value to its corresponding string representation.
 * 
 * @remarks
 * Utilizado para converter valores do enum `StepStatus` em strings legíveis.
 * 
 * @example
 * // Exemplo de uso:
 * const statusString = stepStatusMap[StepStatus.Pending]; // 'pending'
 * 
 * @see StepStatus
 */
const stepStatusMap: Partial<Record<StepStatus, string>> = {
    [StepStatus.Pending]: 'pending', //  pendente
    [StepStatus.OnTheWay]: 'on the way', //  a caminho
    [StepStatus.InProgress]: 'in progress', //  em progresso
    [StepStatus.Checked]: 'checked', //  verificado
    [StepStatus.Installed]: 'installed', //  instalado
    [StepStatus.Free]: 'free', //  livre
    [StepStatus.Empty]: 'empty', //  vazio
    [StepStatus.Canceled]: 'canceled' //  cancelado
};

export const getStepStatus = (status: number): string => {
    return stepStatusMap[status as StepStatus] ?? 'free';
};

/**
 * Retorna o próximo status na sequência de etapas.
 * Se o status atual for o último (Canceled), retorna o mesmo.
 * 
 * @param status - Status atual (como número)
 * @returns Próximo StepStatus
 */
export const nextStepStatus = (status: number): StepStatus => {
  const max = Math.max(...Object.values(StepStatus).filter((v) => typeof v === 'number')) as number;

  if (status >= max) {
    return status as StepStatus; // Retorna o último se já for o máximo
  }

  return (status + 1) as StepStatus;
};
