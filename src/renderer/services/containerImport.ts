import * as XLSX from 'xlsx';
import type { Container, ContainerType } from '@/shared/types';

export interface ImportedContainer {
  name: string;
  type?: ContainerType;
  volume?: number;
  price?: number;
  supplier?: string;
  stock_quantity?: number;
  notes?: string;
  row?: number;
}

export interface ValidationError {
  row: number;
  field: string;
  message: string;
  value?: any;
}

export interface ImportResult {
  valid: ImportedContainer[];
  invalid: Array<ImportedContainer & { errors: ValidationError[] }>;
  duplicates: ImportedContainer[];
}

/**
 * Generiert ein Excel-Template für den Gebinde-Import
 */
export function generateTemplate(): void {
  const templateData = [
    {
      'Name *': 'Apothekerflasche 500ml braun',
      'Typ': 'bottle',
      'Volumen (ml)': 500,
      'Preis pro Stück (€)': 2.50,
      'Lieferant': 'Glaswerk GmbH',
      'Lagerbestand': 150,
      'Notizen': 'UV-Schutz, mit Korken'
    },
    {
      'Name *': 'Etikett "Gurktaler Gin" 85x120mm',
      'Typ': 'label',
      'Volumen (ml)': '',
      'Preis pro Stück (€)': 0.35,
      'Lieferant': 'Druckerei Muster',
      'Lagerbestand': 500,
      'Notizen': 'Goldprägung, Naturpapier'
    },
    {
      'Name *': 'Schraubverschluss PP28 schwarz',
      'Typ': 'cap',
      'Volumen (ml)': '',
      'Preis pro Stück (€)': 0.45,
      'Lieferant': 'Verschluss-Handel AG',
      'Lagerbestand': 200,
      'Notizen': 'Mit Ausgießer'
    },
    {
      'Name *': 'Geschenkbox 2er Set',
      'Typ': 'box',
      'Volumen (ml)': '',
      'Preis pro Stück (€)': 4.80,
      'Lieferant': 'Verpackungen Schmidt',
      'Lagerbestand': 50,
      'Notizen': 'Recycling-Karton, bedruckt'
    }
  ];

  const ws = XLSX.utils.json_to_sheet(templateData);
  
  ws['!cols'] = [
    { wch: 35 }, // Name
    { wch: 15 }, // Typ
    { wch: 18 }, // Volumen
    { wch: 22 }, // Preis
    { wch: 25 }, // Lieferant
    { wch: 15 }, // Lagerbestand
    { wch: 40 }  // Notizen
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Gebinde');
  
  XLSX.writeFile(wb, `Gurktaler_Gebinde_Template_${new Date().toISOString().split('T')[0]}.xlsx`);
}

/**
 * Parst eine Excel-Datei und extrahiert Gebinde
 */
export function parseExcelFile(file: File): Promise<ImportedContainer[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });
        
        const containers: ImportedContainer[] = jsonData.map((row: any, index: number) => {
          const typeString = String(row['Typ'] || '').toLowerCase().trim();
          let type: ContainerType = 'other';
          
          // Map verschiedene Schreibweisen auf ContainerType
          if (typeString === 'bottle' || typeString === 'flasche') type = 'bottle';
          else if (typeString === 'label' || typeString === 'etikett') type = 'label';
          else if (typeString === 'cap' || typeString === 'verschluss') type = 'cap';
          else if (typeString === 'box' || typeString === 'verpackung') type = 'box';
          else if (typeString === 'other' || typeString === 'sonstiges') type = 'other';
          
          return {
            name: String(row['Name *'] || row['Name'] || '').trim(),
            type: typeString ? type : undefined,
            volume: parseFloat(row['Volumen (ml)']) || undefined,
            price: parseFloat(row['Preis pro Stück (€)']) || undefined,
            supplier: row['Lieferant'] ? String(row['Lieferant']).trim() : undefined,
            stock_quantity: parseFloat(row['Lagerbestand']) || undefined,
            notes: row['Notizen'] ? String(row['Notizen']).trim() : undefined,
            row: index + 2
          };
        });
        
        resolve(containers);
      } catch (error) {
        reject(new Error('Fehler beim Parsen der Excel-Datei: ' + error));
      }
    };
    
    reader.onerror = () => reject(new Error('Fehler beim Lesen der Datei'));
    reader.readAsBinaryString(file);
  });
}

/**
 * Validiert importierte Gebinde
 */
export function validateContainers(
  containers: ImportedContainer[],
  existingContainers: Container[]
): ImportResult {
  const result: ImportResult = {
    valid: [],
    invalid: [],
    duplicates: []
  };

  const existingNames = new Set(
    existingContainers.map(c => c.name.toLowerCase())
  );

  containers.forEach(container => {
    const errors: ValidationError[] = [];
    
    // Pflichtfeld: Name
    if (!container.name) {
      errors.push({
        row: container.row || 0,
        field: 'Name',
        message: 'Name ist ein Pflichtfeld'
      });
    }
    
    // Validierung: Volumen
    if (container.volume !== undefined && container.volume < 0) {
      errors.push({
        row: container.row || 0,
        field: 'Volumen',
        message: 'Volumen kann nicht negativ sein',
        value: container.volume
      });
    }
    
    // Validierung: Preis
    if (container.price !== undefined && container.price < 0) {
      errors.push({
        row: container.row || 0,
        field: 'Preis',
        message: 'Preis kann nicht negativ sein',
        value: container.price
      });
    }
    
    // Validierung: Lagerbestand
    if (container.stock_quantity !== undefined && container.stock_quantity < 0) {
      errors.push({
        row: container.row || 0,
        field: 'Lagerbestand',
        message: 'Lagerbestand kann nicht negativ sein',
        value: container.stock_quantity
      });
    }
    
    // Duplikat-Check
    const isDuplicate = existingNames.has(container.name.toLowerCase());
    
    if (errors.length > 0) {
      result.invalid.push({ ...container, errors });
    } else if (isDuplicate) {
      result.duplicates.push(container);
    } else {
      result.valid.push(container);
    }
  });

  return result;
}

/**
 * Konvertiert ImportedContainer zu Container (ohne ID)
 */
export function convertToContainer(
  imported: ImportedContainer
): Omit<Container, 'id' | 'created_at' | 'updated_at'> {
  return {
    name: imported.name,
    type: imported.type || 'other',
    volume: imported.volume,
    price: imported.price,
    notes: `${imported.notes || ''}${imported.supplier ? `\nLieferant: ${imported.supplier}` : ''}${imported.stock_quantity ? `\nLagerbestand: ${imported.stock_quantity}` : ''}`
  };
}

/**
 * Exportiert vorhandene Gebinde als Excel-Datei
 */
export function exportContainers(containers: Container[]): void {
  const typeLabels: Record<ContainerType, string> = {
    bottle: 'Flasche',
    label: 'Etikett',
    cap: 'Verschluss',
    box: 'Verpackung',
    other: 'Sonstiges'
  };

  const exportData = containers.map(cont => ({
    'Name': cont.name,
    'Typ': typeLabels[cont.type],
    'Volumen (ml)': cont.volume || '',
    'Preis pro Stück (€)': cont.price || '',
    'Notizen': cont.notes || ''
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  
  ws['!cols'] = [
    { wch: 35 }, { wch: 15 }, { wch: 18 }, { wch: 22 },
    { wch: 25 }, { wch: 15 }, { wch: 40 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Gebinde');
  
  XLSX.writeFile(wb, `Gurktaler_Gebinde_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
}
