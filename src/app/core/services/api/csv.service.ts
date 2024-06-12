import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CsvService {

  public convertToCSV(data: any[], keys: string[]): string {
    if (!data.length) {
      return '';
    }

    const csvRows = data.map(doc => keys.map(key => {
      const value = doc[key];
      if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value);
      }
      return JSON.stringify(value || '');
    }).join(','));

    return [keys.join(','), ...csvRows].join('\n');
  }

  public downloadFile(csvData: string, filename: string): void {
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
