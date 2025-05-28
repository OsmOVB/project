const padStartNumber = (num: number, stringLength = 2) =>
  num.toString().padStart(stringLength, '0');

const toISOWithOffset = (date: Date) => {
  const offsetInMinutes = date.getTimezoneOffset();

  const offsetHours = Math.abs(Math.floor(offsetInMinutes / 60));
  const offsetMinutes = Math.abs(offsetInMinutes % 60);
  const offsetSign = offsetInMinutes < 0 ? '+' : '-';
  const formattedOffset = `${offsetSign}${padStartNumber(
    offsetHours
  )}:${padStartNumber(offsetMinutes)}`;

  const year = date.getFullYear();
  const month = padStartNumber(date.getMonth() + 1);
  const day = padStartNumber(date.getDate());
  const hours = padStartNumber(date.getHours());
  const minutes = padStartNumber(date.getMinutes());
  const seconds = padStartNumber(date.getSeconds());
  const milliseconds = date.getMilliseconds().toString().padStart(3, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}${formattedOffset}`;
};

const toUTCDateString = (date: Date) => {
  const currentTimeZoneOffsetInHours = date.getTimezoneOffset() / 60;
  date.setHours(date.getHours() + currentTimeZoneOffsetInHours);

  return date.toISOString();
};

const formatDateString = (dateString: string) => {
  if (!dateString) return 'Data inválida';

  //  cria um Date a partir da string (ISO ou timestamp)
  let date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    return date.toLocaleDateString('pt-BR');
  }

  // dd/MM/yyyy
  const partesBarra = dateString.split('/');
  if (partesBarra.length === 3) {
    const [dia, mes, ano] = partesBarra;
    date = new Date(Number(ano), Number(mes) - 1, Number(dia));
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('pt-BR');
    }
  }

  // yyyy-MM-dd
  const partesHifen = dateString.split('-');
  if (partesHifen.length === 3) {
    const [ano, mes, dia] = partesHifen;
    date = new Date(Number(ano), Number(mes) - 1, Number(dia));
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('pt-BR');
    }
  }

  return 'Data inválida';
};

function parseFirestoreDate(input: any): Date | null {
  if (!input) {
    console.warn('⚠️ scheduledDate está ausente');
    return null;
  }

  if (typeof input.seconds === 'number') {
    return new Date(input.seconds * 1000);
  }

  if (input instanceof Date && !isNaN(input.getTime())) {
    return input;
  }

  if (typeof input === 'string') {
    console.warn('⚠️ scheduledDate veio como string antiga:', input);
    const parts = input.split(' ');
    if (parts.length >= 7) {
      const [dia, , mesStr, , ano, , horaStr] = parts;
      const meses: Record<string, number> = {
        janeiro: 0, fevereiro: 1, março: 2, abril: 3, maio: 4, junho: 5,
        julho: 6, agosto: 7, setembro: 8, outubro: 9, novembro: 10, dezembro: 11,
      };
      const [h, m, s] = horaStr.split(':').map(Number);
      const mes = meses[mesStr.toLowerCase()];
      return new Date(Number(ano), mes, Number(dia), h, m, s);
    }
  }

  console.warn('⚠️ scheduledDate com formato inesperado:', input);
  return null;
}

export const dateUtils = {
  padStartNumber,
  toISOWithOffset,
  toUTCDateString,
  formatDateString,
  parseFirestoreDate,
};
