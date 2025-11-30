# Datenmodell - Gurktaler 2.0

> Dokumentation des Datenbankschemas

## Übersicht

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Projekte   │────<│  Produkte   │────<│  Versionen  │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │
       │            ┌──────┴──────┐
       │            │             │
       ▼            ▼             ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   Notizen   │  │ Rezepturen  │  │ By-Products │
│(Chaosablage)│  └─────────────┘  └─────────────┘
└─────────────┘         │
       │                │
       ▼                ▼
┌─────────────┐  ┌─────────────┐
│    Tags     │  │  Zutaten    │
└─────────────┘  └─────────────┘
```

---

## Entitäten

### 1. Projekte (`projects`)

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| id | TEXT (UUID) | Primärschlüssel |
| name | TEXT | Projektname |
| description | TEXT | Beschreibung |
| status | TEXT | 'active', 'paused', 'completed', 'archived' |
| created_at | DATETIME | Erstelldatum |
| updated_at | DATETIME | Letzte Änderung |

---

### 2. Produkte (`products`)

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| id | TEXT (UUID) | Primärschlüssel |
| project_id | TEXT | FK → projects.id (optional) |
| parent_id | TEXT | FK → products.id (für Versionierung) |
| name | TEXT | Produktname |
| version | TEXT | Versionsbezeichnung (z.B. "1", "1.1") |
| description | TEXT | Beschreibung |
| status | TEXT | 'draft', 'testing', 'approved', 'archived' |
| archive_reason | TEXT | Grund bei Archivierung |
| created_at | DATETIME | Erstelldatum |
| updated_at | DATETIME | Letzte Änderung |

**Versionierung:**
- `parent_id = NULL` → Ursprungsprodukt
- `parent_id = xyz` → Abgeleitete Version
- Beispiel: Produkt X (parent=null) → X1 (parent=X) → X2 (parent=X1)

---

### 3. Rezepturen (`recipes`)

| Feld | Typ | Beschreibung |
|------|-----|--------------||
| id | TEXT (UUID) | Primärschlüssel |
| product_id | TEXT | FK → products.id (optional) |
| parent_id | TEXT | FK → recipes.id (für Versionierung) |
| name | TEXT | Rezepturname |
| version | TEXT | Versionsbezeichnung (z.B. "1.0", "1.1") |
| type | TEXT | 'macerate', 'distillate', 'blend' |
| description | TEXT | Beschreibung/Notizen |
| instructions | TEXT | Zubereitungsanleitung |
| yield_amount | REAL | Ergibt Menge |
| yield_unit | TEXT | Einheit (ml, l, etc.) |
| notes | TEXT | Bemerkungsfeld |
| created_at | DATETIME | Erstelldatum |
| updated_at | DATETIME | Letzte Änderung |

**Versionierung:**
- `parent_id = NULL` → Ursprungsrezeptur
- `parent_id = xyz` → Abgeleitete Version
- Beispiel: Rezeptur A (parent=null) → A v1.1 (parent=A) → A v1.2 (parent=A v1.1)

---

### 4. Rezeptur-Zutaten (`recipe_ingredients`)

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| id | TEXT (UUID) | Primärschlüssel |
| recipe_id | TEXT | FK → recipes.id |
| ingredient_id | TEXT | FK → ingredients.id |
| amount | REAL | Menge |
| unit | TEXT | Einheit |
| notes | TEXT | Anmerkungen |
| sort_order | INTEGER | Reihenfolge |

---

### 5. Zutaten-Stammdaten (`ingredients`)

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| id | TEXT (UUID) | Primärschlüssel |
| name | TEXT | Zutatenname |
| category | TEXT | 'mazerat', 'destillat', 'rohstoff', 'alkohol', 'sonstiges' |
| description | TEXT | Beschreibung |
| supplier | TEXT | Lieferant/Herkunft |
| created_at | DATETIME | Erstelldatum |

---

### 6. Notizen/Chaosablage (`notes`)

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| id | TEXT (UUID) | Primärschlüssel |
| project_id | TEXT | FK → projects.id (optional, NULL = Chaosablage) |
| product_id | TEXT | FK → products.id (optional) |
| title | TEXT | Kurztitel |
| content | TEXT | Inhalt (Markdown) |
| type | TEXT | 'idea', 'note', 'todo', 'research' |
| created_at | DATETIME | Erstelldatum |
| updated_at | DATETIME | Letzte Änderung |

---

### 7. Tags (`tags`)

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| id | TEXT (UUID) | Primärschlüssel |
| name | TEXT | Tag-Name |
| color | TEXT | Farbe (Hex) |

---

### 8. Tag-Zuordnungen (`tag_assignments`)

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| id | TEXT (UUID) | Primärschlüssel |
| tag_id | TEXT | FK → tags.id |
| entity_type | TEXT | 'project', 'product', 'note', 'recipe' |
| entity_id | TEXT | ID der zugeordneten Entität |

---

### 9. Kontakte (`contacts`)

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| id | TEXT (UUID) | Primärschlüssel |
| name | TEXT | Name |
| company | TEXT | Firma |
| email | TEXT | E-Mail |
| phone | TEXT | Telefon |
| notes | TEXT | Notizen |
| created_at | DATETIME | Erstelldatum |

---

### 10. Weblinks/Recherche (`weblinks`)

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| id | TEXT (UUID) | Primärschlüssel |
| project_id | TEXT | FK → projects.id (optional) |
| url | TEXT | URL |
| title | TEXT | Titel |
| description | TEXT | Beschreibung/Notizen |
| type | TEXT | 'competitor', 'research', 'supplier', 'other' |
| created_at | DATETIME | Erstelldatum |

---

### 11. By-Products (`byproducts`)

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| id | TEXT (UUID) | Primärschlüssel |
| product_id | TEXT | FK → products.id |
| name | TEXT | Name (z.B. "Etikett Design V1") |
| type | TEXT | 'marketing', 'packaging', 'label', 'other' |
| description | TEXT | Beschreibung |
| file_path | TEXT | Pfad zu Datei (optional) |
| created_at | DATETIME | Erstelldatum |

---

### 12. Gebinde (`containers`)

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| id | TEXT (UUID) | Primärschlüssel |
| name | TEXT | Bezeichnung |
| type | TEXT | 'bottle', 'label', 'cap', 'box', 'other' |
| volume | REAL | Volumen (bei Flaschen) |
| description | TEXT | Beschreibung |
| supplier | TEXT | Lieferant |
| created_at | DATETIME | Erstelldatum |

---

### 13. Bilder (`images`)

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| id | TEXT (UUID) | Primärschlüssel |
| entity_type | TEXT | 'project', 'product', 'note', 'recipe', etc. |
| entity_id | TEXT | ID der zugeordneten Entität |
| file_path | TEXT | Relativer Pfad |
| caption | TEXT | Bildunterschrift |
| created_at | DATETIME | Erstelldatum |

---

## Indizes

```sql
-- Für schnelle Abfragen
CREATE INDEX idx_products_project ON products(project_id);
CREATE INDEX idx_products_parent ON products(parent_id);
CREATE INDEX idx_notes_project ON notes(project_id);
CREATE INDEX idx_recipe_ingredients_recipe ON recipe_ingredients(recipe_id);
CREATE INDEX idx_tag_assignments_entity ON tag_assignments(entity_type, entity_id);
```

---

## JSON-Export-Format

Für Git-Synchronisation werden die Daten als JSON exportiert:

```json
{
  "export_date": "2024-11-25T10:30:00Z",
  "version": "0.1.0",
  "data": {
    "projects": [...],
    "products": [...],
    "recipes": [...],
    "notes": [...],
    "tags": [...],
    ...
  }
}
```

---

*Letzte Aktualisierung: 30. November 2025*
