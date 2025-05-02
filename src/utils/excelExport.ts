import * as XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

export async function exportToExcel(data: any[], filename: string) {
  try {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    
    const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
    
    if (Platform.OS === 'web') {
      // For web, create and trigger download
      const blob = new Blob([s2ab(atob(wbout))], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // For mobile platforms
      const filePath = `${FileSystem.documentDirectory}${filename}.xlsx`;
      await FileSystem.writeAsStringAsync(filePath, wbout, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      await Sharing.shareAsync(filePath, {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dialogTitle: 'Exportar para Excel',
      });
    }
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw error;
  }
}

// Helper function to convert string to array buffer
function s2ab(s: string) {
  const buf = new ArrayBuffer(s.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
  return buf;
}