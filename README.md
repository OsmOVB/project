figma link: 
https://www.figma.com/design/eMraXmMbtcToSoNoOY1Jk7/tcc-figma-com-altera%C3%A7oes-manuais-finais?node-id=2257-2270&t=IdqAUnwiuHmX1eQz-1

vou descrever como deveria funcionar a entrada de produtos no estoque: 
o usuario adm, deve gerar um qrcode com codigo e marcar os produtos que estao entrando, como barris, maquinas, cilindros de gás carregados, pingadeiras e outros, o sistema deve gerar o qrcode quando for adicionar, marcar a quantidade de litros que o barril tem, exemplo 30 litros, 10 litros, 50 litros etc, os produtos devem dar entrada assim.

o proximo passo é o cadastro de pedidos no sistema:
o pedido deve conter as informaçoes de entrega do cliente, como nome endereço  etc,
deve marcar a quantia de chopp, que o cliente quer, e se uma maquina especifica será usada lá, que pode ser reservada de antemão, deve agendar a entrega por data hora e verificar a agenda se há pedidos feitos naquela data ou nao pra facilitar o gerenciamento da agendo como o adm precisa, assim deve ser a criacao do pedido.

o proximo passo é o entregador cadastrar na ordem do pedido, os itens que serao entregues, deve adicionar na ordem os itens lendo o qrcode e vinculando-os ao pedido, o entregador deve finalizar a instalaçao no cliente e o sistema deve gerar uma ordem de retirada com a data informada ao cadastrar o pedido e caso nao seja cadastrada seja gerada a retirada em no maximo 72 horas, essa ordem de retidarada servira de conderencia via qrcode pra que os produtos nao se percam. 
o sistema deve gerar os devidos relatorios e deixar disponivel a agenda de entregas do dia e proximos dias por ordem de data numa tela de listagem.
esse é a regra principal do sistema.

quero que:
o banco tenha essas colunas, pois quero adicionar ao estoque por lotes de tipos, 

loteId: 1, 
data: 14/03/2025,
sequencialote: 1,2,3,4
tipoItem: pilsen
pendenciaImpressao: S
favorite: 5

type TipoItem = {
  id: string;           // ID do tipo cadastrado
  name: string;         // Nome (ex: Pilsen, Barril, CO2)
  size?: string;        // Tamanho (ex: 30L, 50L)
  brand?: string;       // Marca (ex: Heineken)
  favorite: number;     // Nota de 1 a 5 estrelas
  createdAt: string;    // Data de criação
};

type StockItem = {
  id: string;                    // ID do estoque
  tipoItemId: string;            // ID do tipoItem relacionado
  tipoItemName: string;          // Nome do tipo item (para renderização rápida)
  quantity: number;              // Quantidade
  liters?: number;               // Capacidade em litros (se aplicável)
  loteId: number;                // Número do lote
  dataLote: string;              // Data do lote (formato dd/MM/yyyy)
  sequenciaLote: number;         // Sequência do item no lote
  pendenciaImpressao: 'S' | 'N'; // Pendência de impressão
};
