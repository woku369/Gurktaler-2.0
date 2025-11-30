import * as XLSX from 'xlsx';
import type { Ingredient } from '@/shared/types';

export interface ImportedIngredient {
  name: string;
  category?: string;
  alcohol_percentage?: number;
  supplier?: string;
  cost_per_unit?: number;
  notes?: string;
  stock_quantity?: number;
  stock_unit?: string;
  reorder_level?: number;
  row?: number; // Original row number for error reporting
}

export interface ValidationError {
  row: number;
  field: string;
  message: string;
  value?: any;
}

export interface ImportResult {
  valid: ImportedIngredient[];
  invalid: Array<ImportedIngredient & { errors: ValidationError[] }>;
  duplicates: ImportedIngredient[];
}

/**
 * Generiert ein Excel-Template für den Zutaten-Import
 */
export function generateTemplate(): void {
  const templateData = [
    {
      'Name *': 'Wacholderbrand 96%',
      'Kategorie': 'Alkohol',
      'Alkoholgehalt (% vol.)': 96,
      'Lieferant': 'Brennerei Muster',
      'Kosten pro Einheit (€)': 45.50,
      'Lagerbestand': 25,
      'Lagereinheit': 'Liter',
      'Mindestbestand': 10,
      'Notizen': 'Hauptzutat für Gin-Produktion'
    },
    {
      'Name *': 'Wacholderbeeren',
      'Kategorie': 'Botanicals',
      'Alkoholgehalt (% vol.)': 0,
      'Lieferant': 'Bio-Kräuter GmbH',
      'Kosten pro Einheit (€)': 12.00,
      'Lagerbestand': 5,
      'Lagereinheit': 'kg',
      'Mindestbestand': 2,
      'Notizen': 'Bio-Qualität, aus Italien'
    },
    {
      'Name *': 'Koriandersamen',
      'Kategorie': 'Botanicals',
      'Alkoholgehalt (% vol.)': 0,
      'Lieferant': 'Gewürzhandel Schmidt',
      'Kosten pro Einheit (€)': 8.50,
      'Lagerbestand': 3,
      'Lagereinheit': 'kg',
      'Mindestbestand': 1,
      'Notizen': 'Frisch gemahlen'
    }
  ];

  const ws = XLSX.utils.json_to_sheet(templateData);
  
  // Spaltenbreiten anpassen
  ws['!cols'] = [
    { wch: 30 }, // Name
    { wch: 20 }, // Kategorie
    { wch: 22 }, // Alkoholgehalt
    { wch: 25 }, // Lieferant
    { wch: 22 }, // Kosten
    { wch: 15 }, // Lagerbestand
    { wch: 15 }, // Lagereinheit
    { wch: 18 }, // Mindestbestand
    { wch: 40 }  // Notizen
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Zutaten');
  
  // Download als Excel-Datei
  XLSX.writeFile(wb, `Gurktaler_Zutaten_Template_${new Date().toISOString().split('T')[0]}.xlsx`);
}

/**
 * Parst eine Excel-Datei und extrahiert Zutaten
 */
export function parseExcelFile(file: File): Promise<ImportedIngredient[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        
        // Erste Sheet verwenden
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });
        
        const ingredients: ImportedIngredient[] = jsonData.map((row: any, index: number) => ({
          name: String(row['Name *'] || row['Name'] || '').trim(),
          category: row['Kategorie'] ? String(row['Kategorie']).trim() : undefined,
          alcohol_percentage: parseFloat(row['Alkoholgehalt (% vol.)']) || undefined,
          supplier: row['Lieferant'] ? String(row['Lieferant']).trim() : undefined,
          cost_per_unit: parseFloat(row['Kosten pro Einheit (€)']) || undefined,
          stock_quantity: parseFloat(row['Lagerbestand']) || undefined,
          stock_unit: row['Lagereinheit'] ? String(row['Lagereinheit']).trim() : undefined,
          reorder_level: parseFloat(row['Mindestbestand']) || undefined,
          notes: row['Notizen'] ? String(row['Notizen']).trim() : undefined,
          row: index + 2 // Excel row number (starting at 2 after header)
        }));
        
        resolve(ingredients);
      } catch (error) {
        reject(new Error('Fehler beim Parsen der Excel-Datei: ' + error));
      }
    };
    
    reader.onerror = () => reject(new Error('Fehler beim Lesen der Datei'));
    reader.readAsBinaryString(file);
  });
}

/**
 * Validiert importierte Zutaten
 */
export function validateIngredients(
  ingredients: ImportedIngredient[],
  existingIngredients: Ingredient[]
): ImportResult {
  const result: ImportResult = {
    valid: [],
    invalid: [],
    duplicates: []
  };

  const existingNames = new Set(
    existingIngredients.map(i => i.name.toLowerCase())
  );

  ingredients.forEach(ingredient => {
    const errors: ValidationError[] = [];
    
    // Pflichtfeld: Name
    if (!ingredient.name) {
      errors.push({
        row: ingredient.row || 0,
        field: 'Name',
        message: 'Name ist ein Pflichtfeld'
      });
    }
    
    // Validierung: Alkoholgehalt
    if (ingredient.alcohol_percentage !== undefined) {
      if (ingredient.alcohol_percentage < 0 || ingredient.alcohol_percentage > 100) {
        errors.push({
          row: ingredient.row || 0,
          field: 'Alkoholgehalt',
          message: 'Alkoholgehalt muss zwischen 0 und 100% liegen',
          value: ingredient.alcohol_percentage
        });
      }
    }
    
    // Validierung: Kosten
    if (ingredient.cost_per_unit !== undefined && ingredient.cost_per_unit < 0) {
      errors.push({
        row: ingredient.row || 0,
        field: 'Kosten',
        message: 'Kosten können nicht negativ sein',
        value: ingredient.cost_per_unit
      });
    }
    
    // Validierung: Lagerbestand
    if (ingredient.stock_quantity !== undefined && ingredient.stock_quantity < 0) {
      errors.push({
        row: ingredient.row || 0,
        field: 'Lagerbestand',
        message: 'Lagerbestand kann nicht negativ sein',
        value: ingredient.stock_quantity
      });
    }
    
    // Duplikat-Check
    const isDuplicate = existingNames.has(ingredient.name.toLowerCase());
    
    if (errors.length > 0) {
      result.invalid.push({ ...ingredient, errors });
    } else if (isDuplicate) {
      result.duplicates.push(ingredient);
    } else {
      result.valid.push(ingredient);
    }
  });

  return result;
}

/**
 * Konvertiert ImportedIngredient zu Ingredient (ohne ID)
 */
export function convertToIngredient(
  imported: ImportedIngredient
): Omit<Ingredient, 'id' | 'created_at' | 'updated_at'> {
  return {
    name: imported.name,
    category: imported.category,
    alcohol_percentage: imported.alcohol_percentage,
    price_per_unit: imported.cost_per_unit,
    unit: 'liter',
    notes: `${imported.notes || ''}${imported.supplier ? `\nLieferant: ${imported.supplier}` : ''}${imported.stock_quantity ? `\nLagerbestand: ${imported.stock_quantity} ${imported.stock_unit}` : ''}${imported.reorder_level ? `\nMindestbestand: ${imported.reorder_level}` : ''}`
  };
}

/**
 * Exportiert vorhandene Zutaten als Excel-Datei
 */
export function exportIngredients(ingredients: Ingredient[]): void {
  const exportData = ingredients.map(ing => ({
    'Name': ing.name,
    'Kategorie': ing.category || '',
    'Alkoholgehalt (% vol.)': ing.alcohol_percentage || 0,
    'Preis pro Einheit (€)': ing.price_per_unit || 0,
    'Einheit': ing.unit || 'liter',
    'Notizen': ing.notes || ''
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  
  // Spaltenbreiten anpassen
  ws['!cols'] = [
    { wch: 30 }, { wch: 20 }, { wch: 22 }, { wch: 25 },
    { wch: 22 }, { wch: 15 }, { wch: 15 }, { wch: 18 }, { wch: 40 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Zutaten');
  
  XLSX.writeFile(wb, `Gurktaler_Zutaten_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
}
