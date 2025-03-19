import * as Print from 'expo-print';

const handlePrint = async (uri: string) => {
  try {
    const htmlContent = `
      <html>
        <body style="text-align: center; padding: 50px">
          <img src="${uri}" width="300" height="300" />
        </body>
      </html>
    `;

    await Print.printAsync({
      html: htmlContent,
    });
  } catch (err) {
    console.error('Erro ao imprimir:', err);
  }
};

export default handlePrint;