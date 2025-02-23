import { HarvestOrder, HarvestOrderField } from '../modules/harvest/types/harvest';
import { HarvestOrderPrintData } from '../types/hooks/printing';

type ClassificationKey = 
  Pick<HarvestOrderPrintData, 'productId' | 'licensePlate' | 'sequenceNumber' | 'tetrazolium'> &
  Pick<HarvestOrderField, 'destinationPropertyId'>;

type HarvestOrderKey =
  Pick<HarvestOrder, 'productId' | 'licensePlate' | 'fieldId' | 'unclassifiedFieldId' |
    'cropId' | 'plotId'>;

const createCode128Barcode = (key: string) => `<barcode type='128'>${key}</barcode>`;

const createClassificationKeyBarcode = ({
  productId,
  sequenceNumber,
  destinationPropertyId,
  licensePlate,
  tetrazolium
}: ClassificationKey) => {
  const code =
    'C' +
    productId.toString().padStart(2, '0') +
    licensePlate + 
    destinationPropertyId +
    sequenceNumber.toString().padStart(3, '0') +
    tetrazolium[0];

  return createCode128Barcode(code);
};

const createOrderKeyBarcode = ({
  productId,
  plotId,
  cropId,
  fieldId,
  unclassifiedFieldId,
  licensePlate
}: HarvestOrderKey) => {
  const code = 
    unclassifiedFieldId.toString().padStart(3, '0') + 
    fieldId.toString().padStart(2, '0') + 
    plotId.toString().padStart(3, '0') + 
    cropId.toString().padStart(2 , '0') + 
    licensePlate + 
    productId.toString().padStart(2, '0');
    
  return createCode128Barcode(code);
};

export const buildHarvestOrder = ({
  productId,
  productName,
  printingDate,
  mobileDeviceId,
  sequenceNumber,
  driverName,
  licensePlate,
  field,
  username,
  hasShipping,
  tetrazolium
}: HarvestOrderPrintData) => {
  const {
    siloId,
    siloName,
    fieldId,
    unclassifiedFieldId,
    plotId,
    cropId,
    farmProducerName,
    fieldCropName,
    fieldCropVarietyName,
    sourcePropertyName,
    destinationPropertyId,
    destinationPropertyName,
  } = field;

  const harvestOrder =
    "[C]<font size='big'>Agropecuaria IPE LTDA</font>\n\n" + 
    `[L]Nr. Seq. Impressao: ${sequenceNumber}\n` +
    `[L]Id. Dispositivo: ${mobileDeviceId}\n` + 
    `[L]Data: ${printingDate}\n` + 
    `[L]Silo: ${siloId} - ${siloName}\n` +
    `[L]Produtor: ${farmProducerName}\n` + 
    `[L]Cultura: ${fieldCropName}\n` +
    `[L]Cultivar: ${fieldCropVarietyName}\n` +
    `[L]Produto: ${productName}\n` + 
    `[L]Talhao: ${plotId}\n` + 
    `[L]Emitente: ${sourcePropertyName}\n` +
    '[L]Operacao: PRODUCAO\n'+
    `[L]Destino: ${destinationPropertyName}\n\n` +
    "[C]<b>CLASSIFICACAO</b>\n" + 
    '[C]---------------------------------------------\n\n' +
    '[L](-) Umidade: ______________% ______________Kg\n\n' + 
    '[L](-) Impureza: _____________% ______________Kg\n\n' + 
    '[L](-) Bandinha: _____________% ______________Kg\n\n' + 
    '[L](-) Triguilho: ____________% ______________Kg\n\n' + 
    '[L](-) Ardido: _______________% ______________Kg\n\n' + 
    '[L](-) _____________:_________% ______________Kg\n\n' + 
    '[L]Bruto:________ Tara:________ Liquido:________\n\n' +
    '[L]PH INICIAL: _____ PH FINAL: _____ MOEGA: ____\n\n' +
    '[C]---------------------------------------------\n\n' + 
    `[L]Frete: ( ${hasShipping ? 'X' : ''} ) SIM  ( ${!hasShipping ? 'X' : ''} ) NAO\n` +
    `[L]Motorista: ${driverName}\n` +
    `[L]Placa: ${licensePlate}\n` +
    `[L]Nr. Classificacao: _________\n` +
    `[L]Assinatura Apontador: ${username}\n\n\n` + 
    '[L]---------------------------------------------\n\n' +
    `[L]Assinatura Balanca: _________________________\n\n` +
    "[C]<font size='wide'>Codigo de Classificacao</font>\n\n" + 
    `[C]${createClassificationKeyBarcode({
        productId,
        destinationPropertyId,
        tetrazolium,
        sequenceNumber,
        licensePlate
      })}\n\n\n` + 
    "[C]<font size='wide'>Codigo de Romaneio</font>\n\n" + 
    `[C]${createOrderKeyBarcode({
        productId,
        cropId,
        plotId,
        unclassifiedFieldId,
        fieldId,
        licensePlate
      })}`;

  return harvestOrder;
};

