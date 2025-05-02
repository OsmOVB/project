/**
 * Options for formatting a decimal input string.
 * @Params {boolean} [replaceComma=true] - If true, replaces commas with dots.
 * @Params {number} [maxDecimalPlaces=2] - The maximum number of decimal places allowed. Set to null for no limit.
 * @Params {boolean} [allowLeadingZero=true] - If true, allows a leading zero for decimals (e.g., "0.5").
 */
interface FormatDecimalOptions {
  replaceComma?: boolean;
  maxDecimalPlaces?: number;
  allowLeadingZero?: boolean;
}

/**
 * 
 * @param valueInput the input value
 * @returns returns the value formatted
 * @example 
 * handleNumberInput("1.2.3") // returns "1.23"
 */
export const handleNumberInput = (valueInput: string) => {
  if (valueInput) {
    // Substitui qualquer caractere que não seja um número ou um ponto por uma string vazia
    const formattedValue = valueInput.replace(/[^0-9.]/g, "");

    // Substitui qualquer ocorrência de dois ou mais pontos por um único ponto
    const singleDecimalValue = formattedValue.replace(/(\..*)\./g, "$1");

    // Verifica se o valor não começa com um ponto
    if (singleDecimalValue.startsWith(".")) {
      return "0" + singleDecimalValue;
    } else {
      return singleDecimalValue;
    }
  } else {
    return "";
  }
};

/**
 * Options for formatting a decimal input string.
 *
 * @typedef {Object} FormatDecimalOptions
 * @property {boolean} [replaceComma=true] - If true, replaces commas with dots.
 * @property {number} [maxDecimalPlaces=2] - The maximum number of decimal places allowed. Set to null for no limit.
 * @property {boolean} [allowLeadingZero=true] - If true, allows a leading zero for decimals (e.g., "0.5").
 */

/**
 * Formats a decimal input string based on the provided options.
 *
 * @param {string} input - The input string to be formatted.
 * @param {FormatDecimalOptions} [options={}] - The options to customize the formatting.
 * @returns {string} The formatted decimal string.
 *
 * @example
 * // Returns "0.5"
 * formatDecimalInput(".5", { allowLeadingZero: true });
 *
 * @example
 * // Returns "1.23"
 * formatDecimalInput("1,23", { replaceComma: true, maxDecimalPlaces: 2 });
 *
 * @example
 * // Returns "123"
 * formatDecimalInput("0123", { allowLeadingZero: false });
 */
export const formatDecimalInput = (
  input: string,
  options: FormatDecimalOptions = {}
): string => {
  const {
    replaceComma = true, 
    maxDecimalPlaces = 2, 
    allowLeadingZero = false, 
  } = options;

  let valueInput = input;

  if (replaceComma) {
    // replace commas with dots
    valueInput = valueInput.replace(",", "."); 
  }
  // Remove characters that are not numbers or dots
  valueInput = valueInput.replace(/[^0-9.]/g, ""); 

  //replace any occurrence of two or more dots with a single dot
  valueInput = valueInput.replace(/(\..*)\./g, "$1");

  //Add zero if the value starts with a dot
  if (valueInput.startsWith(".")) {
    valueInput = "0" + valueInput;
  }

  if (!allowLeadingZero) {
    // Remove zeros of the left side of the number
    valueInput = valueInput.replace(/^0+(?!\.)/, "");
  }

  // Limit the number of decimal places
  if (maxDecimalPlaces !== null && maxDecimalPlaces >= 0) {
    const decimalMatch = RegExp(new RegExp(`(\\.\\d{0,${maxDecimalPlaces}})`)).exec(valueInput);
    if (decimalMatch) {
      valueInput = valueInput.split(".")[0] + decimalMatch[0];
    }
  }

  return valueInput;
};


/**
 * Formats a UUID string by removing the dashes and converting it to uppercase.
 *
 * @param {string} uuid - The UUID string to be formatted.
 * @returns {string} The formatted UUID string.
 *
 * @example
 * // Returns "1234567890ABCDEF1234567890ABCDEF"
 * formatUuid("12345678-90ab-cdef-1234-567890abcdef");
 */

export const formatUuid = (uuid: string) => uuid.replace(/-/g, '').toUpperCase();


/**
 * Unformats a UUID string by adding dashes in the correct positions.
 *
 * @param {string} uuid - The UUID string to be unformatted.
 * @returns {string} The unformatted UUID string.
 *
 * @example
 * // Returns "12345678-90AB-CDEF-1234-567890ABCDEF"
 * unformatUuid("1234567890ABCDEF1234567890ABCDEF");
 */
export const unformatUuid = (uuid: string) => {
  const formattedUuid = uuid.replace(/-/g, '').toUpperCase();
  const lowerCaseUuid = formattedUuid.toLowerCase();
  return `${lowerCaseUuid.slice(0, 8)}-${lowerCaseUuid.slice(8, 12)}-${lowerCaseUuid.slice(12, 16)}-${lowerCaseUuid.slice(16, 20)}-${lowerCaseUuid.slice(20)}`;
};


/**
 * Formats a CPF string by adding dots and a dash in the correct positions.
 *
 * @param {string} value - The CPF string to be formatted.
 * @returns {string} The formatted CPF string.
 *
 * @example
 * // Returns "123.456.789-09"
 * cpfMask("12345678909");
 */

export const cpfMask = (value: string) => {
  return value
    .replace(/\D/g, "") 
    .replace(/(\d{3})(\d)/, "$1.$2") 
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1");
};



/**
 * Formats a CNPJ string by adding dots, a slash, and a dash in the correct positions.
 *
 * @param {string} value - The CNPJ string to be formatted.
 * @returns {string} The formatted CNPJ string.
 *
 * @example
 * // Returns "12.345.678/0001-09"
 * cnpjMask("12345678000109");
 */

export const cnpjMask = (value: string) => {
  return value
    .replace(/\D+/g, "") 
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1");
};


//brazilian telephone mask
/**
 * Formats a Brazilian telephone number string by adding parentheses, a space, and a dash in the correct positions.
 *
 * @param {string} value - The telephone number string to be formatted.
 * @returns {string} The formatted telephone number string.
 *
 * @example
 * // Returns "(12) 34567-8901"
 * telMask("12345678901");
 */

export const telMask = (value: string) => {
  return value
    .replace(/\D/g, "") 
    .replace(/(\d{2})(\d)/, "($1) $2") 
    .replace(/(\d{5})(\d)/, "$1-$2")
    .replace(/(-\d{4})\d+?$/, "$1");
}



