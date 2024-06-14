import { Injectable } from '@angular/core';

/**
 * This service handles conversion of data to CSV format and downloading CSV files.
 */
@Injectable({
  providedIn: 'root'
})
export class CsvService {

  /**
   * Converts an array of data objects to a CSV string.
   * 
   * @param data The array of data objects to convert.
   * @param keys The keys to include in the CSV.
   * @returns The CSV string.
   */
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

  /**
   * Downloads a CSV file with the given data and filename.
   * 
   * @param csvData The CSV data as a string.
   * @param filename The name of the file to download.
   */
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
