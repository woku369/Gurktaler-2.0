# Rezeptur-Verwaltung

## Übersicht

Die Rezeptur-Verwaltung wurde mit drei Haupt-Datenbanken implementiert:

1. **Zutatendatenbank** - Verwaltung von Rohstoffen und Zutaten
2. **Gebindedatenbank** - Verwaltung von Flaschen, Verschraubungen, Packmittel etc.
3. **Produktdatenbank** - Erweiterte Produktverwaltung mit Alkoholsteuerberechnung

## 1. Zutatendatenbank

### Features
- Name der Zutat (Pflichtfeld)
- Alkoholgehalt in %vol. (optional)
- Kategorie (optional, frei wählbar)
- Preis pro Einheit (Liter oder Kilogramm)
- Einheit: Liter oder Kilogramm
- Bemerkungsfeld
- Unterstützung für Bilder (via image_ids)

### Navigation
**Route:** `/ingredients`  
**Icon:** Beaker  
**Label:** Zutaten

### Funktionen
- Zutaten erstellen, bearbeiten und löschen
- Durchsuchen aller Zutaten
- Tabellarische Übersicht mit allen wichtigen Informationen
- Formular-Modal für Eingabe

## 2. Gebindedatenbank

### Features
- Name (Pflichtfeld)
- Typ: Flasche, Etikett, Verschluss, Verpackung, Sonstiges
- Volumen in ml (optional)
- Preis in € (optional)
- Bemerkungsfeld
- Unterstützung für Bilder (via image_ids)

### Navigation
**Route:** `/containers`  
**Icon:** Box  
**Label:** Gebinde

### Funktionen
- Gebinde erstellen, bearbeiten und löschen
- Durchsuchen aller Gebinde
- Karten-Ansicht mit Typ-Badges
- Formular-Modal für Eingabe

## 3. Produktdatenbank (erweitert)

### Neue Features
- **Gebindegröße** in ml
- **Alkoholgehalt** in %vol.
- **Alkoholsteuerberechnung**:
  - Fixe Berechnung: 12 € pro Liter reinem Alkohol
  - Automatische Berechnung basierend auf Gebindegröße und Alkoholgehalt
  - Formel: (Volumen in L) × (Alkohol %vol. / 100) × 12 EUR
  - Anzeige des berechneten Betrags
- **Checkbox**: Alkoholsteuer in Preisfindung berücksichtigen
- **Bemerkungsfeld** (zusätzlich zur Beschreibung)
- **Bildverwaltung** (bestehend)

### Navigation
**Route:** `/products`  
**Icon:** Package  
**Label:** Produkte

### Alkoholsteuer-Berechnung

Die Alkoholsteuer wird automatisch berechnet, wenn:
1. Gebindegröße (in ml) angegeben ist
2. Alkoholgehalt (%vol.) angegeben ist

**Beispielrechnung:**
- Flasche: 700 ml = 0,7 L
- Alkoholgehalt: 40 %vol.
- Reiner Alkohol: 0,7 L × 0,4 = 0,28 L
- Alkoholsteuer: 0,28 L × 12 € = 3,36 €

Die Checkbox "Alkoholsteuer in Preisfindung berücksichtigen" ermöglicht es, 
diesen Betrag bei der Preiskalkulation zu berücksichtigen oder zu ignorieren.

## Technische Implementierung

### Neue/Aktualisierte Dateien

1. **Types** (`src/shared/types/index.ts`):
   - `Ingredient` Interface erweitert
   - `Container` Interface erweitert
   - `Product` Interface erweitert

2. **Pages**:
   - `src/renderer/pages/Ingredients.tsx` (neu)
   - `src/renderer/pages/Containers.tsx` (neu)

3. **Components**:
   - `src/renderer/components/ProductForm.tsx` (erweitert)

4. **Services** (`src/renderer/services/storage.ts`):
   - `containers` CRUD-Operationen hinzugefügt
   - `ingredients` bereits vorhanden

5. **Navigation**:
   - `src/renderer/App.tsx` - Routen hinzugefügt
   - `src/renderer/components/Layout.tsx` - Navigation erweitert

### Datenstruktur

Alle Daten werden im localStorage gespeichert und sind Git-synchronisierbar:

```typescript
interface AppData {
  ingredients: Ingredient[]
  containers: Container[]
  products: Product[]
  // ... weitere Entities
}
```

## Verwendung

### Zutaten verwalten
1. Navigieren Sie zu "Zutaten" in der Sidebar
2. Klicken Sie auf "Neue Zutat"
3. Füllen Sie das Formular aus
4. Speichern Sie die Zutat

### Gebinde verwalten
1. Navigieren Sie zu "Gebinde" in der Sidebar
2. Klicken Sie auf "Neues Gebinde"
3. Wählen Sie den Typ aus
4. Füllen Sie das Formular aus
5. Speichern Sie das Gebinde

### Produkte mit Alkoholsteuer
1. Navigieren Sie zu "Produkte"
2. Erstellen oder bearbeiten Sie ein Produkt
3. Geben Sie Gebindegröße und Alkoholgehalt ein
4. Die Alkoholsteuer wird automatisch berechnet
5. Aktivieren Sie die Checkbox, um die Steuer in die Preisfindung einzubeziehen

## Zukünftige Erweiterungen

- Direkte Verknüpfung von Rezepturen mit Zutaten
- Mengenberechnung für Rezepturen basierend auf Zutatenpreisen
- Kostenrechnung pro Produkt inkl. Gebinde
- Import/Export von Zutaten und Gebinden
- Bildupload direkt in der Tabelle/Karten-Ansicht
- Lieferanten-Verwaltung für Zutaten und Gebinde
