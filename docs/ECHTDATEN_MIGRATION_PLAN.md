# 🎯 Echtdaten-Migration Plan — Multi-Device Zugriff

**Status:** Vorbereitet  
**Ziel:** Sicherer Übergang zu Echtdaten mit zentraler NAS-Speicherung  
**Zeitrahmen:** 2-3 Stunden  
**Datum:** Januar 2026

---

## 📊 IST-Zustand (Status Quo)

### ✅ Bereits implementiert:
- **NAS-Storage-System**: Y:\zweipunktnull\database\*.json
- **Custom API Server**: Port 3002 für PWA-Zugriff
- **Tailscale VPN**: Remote-Zugriff von Office/Mobil
- **Backup-System**: Automatische Snapshots auf NAS
- **Migration-Service**: Automatische Daten-Migration von LocalStorage
- **Image-Upload**: Binary-Speicherung in Y:\zweipunktnull\images\

### 🟡 Teilweise vorhanden:
- **Document-Type**: Interface definiert, aber keine Upload-UI
- **Weblink-Type**: Interface definiert, aber keine Verwaltung
- **Image-Verwaltung**: Backend fertig, aber nur via Product/Recipe

### ❌ Noch fehlend:
- **Zentrale Dokumentenverwaltung-UI**
- **Weblink-Manager**
- **Datei-Browser für Dokumente**
- **Google Photos Integration** (optional)

---

## 🎯 Ziel-Zustand (Echtdaten-Ready)

### Arbeitsplatz-Szenarien:

#### 🏠 Home Office (Hauptrechner)
- **Zugriff**: Direkter LAN-Zugriff auf Y:\zweipunktnull\
- **App**: Desktop App (Electron) mit voller Performance
- **Offline**: ❌ Nicht verfügbar (NAS erforderlich)

#### 🏢 Office (Zweitrechner)
- **Zugriff**: Tailscale VPN → Y:\zweipunktnull\ gemountet
- **App**: Desktop App (Electron) oder PWA
- **Offline**: ❌ Nicht verfügbar (VPN erforderlich)

#### 📱 Mobil (Tablet/Handy)
- **Zugriff**: PWA via Tailscale (https://gurktaler.tail...)
- **App**: Browser (Safari/Chrome)
- **Offline**: ⚠️ Nur Lese-Cache (Service Worker)

### Datenspeicherung:

```
Y:\zweipunktnull\
├─ database\
│   ├─ projects.json          ✅ Funktioniert
│   ├─ products.json          ✅ Funktioniert
│   ├─ recipes.json           ✅ Funktioniert
│   ├─ notes.json             ✅ Funktioniert
│   ├─ tasks.json             ✅ Neu (v1.5.0)
│   ├─ documents.json         🟡 Interface fertig, UI fehlt
│   ├─ weblinks.json          🟡 Interface fertig, UI fehlt
│   └─ ...
│
├─ images\
│   ├─ products\
│   │   ├─ abc123_0.jpg       ✅ Funktioniert
│   │   └─ abc123_1.png
│   ├─ recipes\
│   │   └─ xyz789_0.jpg       ✅ Funktioniert
│   ├─ notes\                 🟡 Backend fertig, UI fehlt
│   └─ projects\              🟡 Backend fertig, UI fehlt
│
├─ documents\
│   ├─ recipes\
│   │   ├─ gurktaler_x2_rezept.pdf    ❌ Upload-UI fehlt
│   │   └─ destillat_analyse.xlsx
│   ├─ products\
│   │   └─ etikett_design.ai
│   ├─ marketing\
│   │   └─ pressetext.docx
│   └─ analysis\
│       └─ laborwerte_2025.pdf
│
└─ backups\
    ├─ daily\                 ✅ Automatisch via NAS
    └─ weekly\
```

---

## 🚀 Umsetzungsplan (Schritt für Schritt)

### Phase 1: Vorbereitung (15 Min) ⏱️

**Ziel:** Sicherstellen, dass Basis-Infrastruktur funktioniert

```bash
# 1. NAS-Verbindung testen (von allen Geräten)
# Home: ping 192.168.1.XXX
# Office/Mobil: ping gurktaler-nas.tail...

# 2. Verzeichnisse prüfen
dir Y:\zweipunktnull\database\
dir Y:\zweipunktnull\images\
dir Y:\zweipunktnull\documents\

# 3. Backup erstellen (Sicherheit!)
# Synology Control Panel → Backup & Replication → Snapshot

# 4. Tailscale-Status prüfen (Office/Mobil)
tailscale status
```

**Checkliste:**
- [ ] NAS erreichbar von Home
- [ ] NAS erreichbar von Office (Tailscale)
- [ ] Custom API Server läuft (Port 3002)
- [ ] Snapshot erstellt (vor Migration)

---

### Phase 2: Dokumentenverwaltung implementieren (60 Min) ⏱️

**2.1 Document Manager UI (30 Min)**

Neue Seite: `src/renderer/pages/Documents.tsx`

```typescript
// Features:
- Datei-Upload (PDF, DOCX, XLSX, AI, etc.)
- Kategorie-Zuordnung (Recipe, Analysis, Marketing, Label, Documentation, Other)
- Verknüpfung mit Projekten/Produkten/Rezepten
- Vorschau (PDF Thumbnail)
- Download-Button
- Löschen mit Bestätigung
- Filter nach Kategorie
```

**2.2 Document Service erweitern (15 Min)**

`src/renderer/services/storage.ts` erweitern:

```typescript
export const documents = {
  getAll: async (): Promise<Document[]> => {...},
  getByCategory: async (category: string): Promise<Document[]> => {...},
  getByEntity: async (entityType: string, entityId: string): Promise<Document[]> => {...},
  create: (doc: Omit<Document, 'id' | 'created_at'>) => {...},
  update: (id: string, updates: Partial<Document>) => {...},
  delete: (id: string) => {...},
  upload: async (file: File, category: string): Promise<string> => {...},
};
```

**2.3 File-Upload Component (15 Min)**

`src/renderer/components/FileUpload.tsx`

```typescript
// Features:
- Drag & Drop
- File-Size Limit (z.B. 50 MB)
- Supported Types: .pdf, .docx, .xlsx, .ai, .png, .jpg
- Progress Bar
- Error Handling
```

---

### Phase 3: Weblink-Manager implementieren (30 Min) ⏱️

**3.1 Weblink Manager UI**

Neue Seite: `src/renderer/pages/Weblinks.tsx`

```typescript
// Features:
- URL eingeben + automatische Vorschau (Open Graph)
- Kategorien: Competitor, Research, Supplier, Other
- Tags-System
- Favicon anzeigen
- Öffnen in neuem Tab
- Filter nach Typ
```

**3.2 Weblink Service**

`src/renderer/services/storage.ts` erweitern:

```typescript
export const weblinks = {
  getAll: async (): Promise<Weblink[]> => {...},
  getByType: async (type: WeblinkType): Promise<Weblink[]> => {...},
  create: (link: Omit<Weblink, 'id' | 'created_at'>) => {...},
  update: (id: string, updates: Partial<Weblink>) => {...},
  delete: (id: string) => {...},
};
```

---

### Phase 4: Google Photos Integration (Optional, 45 Min) ⏱️

**Nur wenn gewünscht** - Bilder direkt aus Google Photos verlinken statt hochladen.

`src/renderer/services/googlePhotos.ts`

```typescript
// Features:
- OAuth2 Login
- Album-Auswahl
- Foto-Link statt Upload (spart Speicherplatz)
- Thumbnail-Cache
```

---

### Phase 5: Echtdaten-Migration (30 Min) ⏱️

**5.1 Testdaten entfernen (Optional)**

```bash
# Backup erstellen VORHER!
cd Y:\zweipunktnull\database\
ren projects.json projects_OLD.json
ren products.json products_OLD.json
# etc.
```

**5.2 Erste Echtdaten eingeben**

```
1. Produkt anlegen: "Gurktaler X2 (50ml)"
2. Rezept hinzufügen: "Gurktaler X2 Mazerat-Rezeptur"
3. Projekt erstellen: "Etikettendesign Gurktaler X2"
4. Dokument hochladen: etikett_design.ai
5. Weblink hinzufügen: Konkurrenz-Produkt URL
6. Notiz erstellen: "Verkostungsnotizen 12.01.2026"
```

**5.3 Multi-Device Test**

```
1. Home: Produkt bearbeiten
2. Office (Tailscale): Änderung sichtbar? ✅
3. Mobil (PWA): Daten korrekt? ✅
```

---

### Phase 6: Backup-Strategie aktivieren (15 Min) ⏱️

**Automatische Backups konfigurieren:**

```bash
# Synology Hyper Backup einrichten:
1. Täglich: Snapshot um 23:00 Uhr
2. Wöchentlich: Backup auf externe USB-Disk
3. Monatlich: Cloud-Backup (optional)

# Retention:
- Daily Snapshots: 7 Tage
- Weekly Backups: 4 Wochen
- Monthly Backups: 12 Monate
```

**Backup-Monitoring:**

`package.json` Script hinzufügen:

```json
"scripts": {
  "backup:check": "node scripts/checkBackupStatus.js",
  "backup:manual": "node scripts/manualBackup.js"
}
```

---

## 🔒 Datensicherheit & Risikomanagement

### Backup-Strategie (3-2-1 Regel)

✅ **3 Kopien:**
1. Live-Daten: Y:\zweipunktnull\database\
2. NAS Snapshot: Y:\@snapshot\
3. Externe USB-Disk: Wöchentlich

✅ **2 verschiedene Medien:**
- NAS (SSD/HDD)
- USB-Disk (extern)

✅ **1 Kopie offsite:**
- Optional: Synology Cloud Backup
- Oder: Monatlicher Export zu OneDrive

### Disaster Recovery Szenarien

| Szenario | Lösung | Recovery Time |
|----------|--------|---------------|
| Versehentliches Löschen | Snapshot wiederherstellen | 5 Min |
| NAS Festplatten-Crash | USB-Backup wiederherstellen | 30 Min |
| Komplettausfall NAS | Neue NAS + USB-Backup | 2 Std |
| Datei-Korruption | Snapshot von gestern | 10 Min |
| Netzwerk-Problem | Desktop App funktioniert weiter (Home) | 0 Min |

### Zugriffsrechte

```
Y:\zweipunktnull\
├─ database\          (Lesen/Schreiben für "gurktaler-user")
├─ images\            (Lesen/Schreiben für "gurktaler-user")
├─ documents\         (Lesen/Schreiben für "gurktaler-user")
└─ backups\           (Nur Lesen für "gurktaler-user", Schreiben für Admin)
```

---

## 🧪 Test-Checkliste vor Echtdaten

### Desktop App (Home)
- [ ] Produkt anlegen → Speichern → JSON in Y:\database\ vorhanden
- [ ] Bild hochladen → Binary in Y:\images\products\ vorhanden
- [ ] Rezept erstellen → Verknüpfung zu Produkt funktioniert
- [ ] Notiz mit Bild → Image-Upload funktioniert
- [ ] Dokument hochladen → PDF in Y:\documents\ vorhanden
- [ ] Weblink hinzufügen → URL in Y:\database\weblinks.json

### PWA (Office/Mobil via Tailscale)
- [ ] Login funktioniert
- [ ] Daten laden (GET von Custom API Server)
- [ ] Produkt bearbeiten (PUT Request)
- [ ] Bild hochladen (Base64 → Binary Conversion)
- [ ] Dokument herunterladen
- [ ] Filter & Suche funktioniert

### Multi-Device Synchronisation
- [ ] Home: Produkt anlegen
- [ ] Office: Produkt sichtbar (ohne Reload)
- [ ] Mobil: Produkt sichtbar
- [ ] Office: Bild hochladen
- [ ] Home: Bild wird angezeigt
- [ ] Keine Duplikate bei parallelem Schreiben

### Backup & Recovery
- [ ] Snapshot erstellen (Synology GUI)
- [ ] Snapshot wiederherstellen (Test!)
- [ ] USB-Backup läuft automatisch
- [ ] Backup-Status-Check via Script

---

## 🎯 Erfolgs-Kriterien

### Must-Have (Vor Echtdaten-Start):
✅ Alle Testdaten funktionieren einwandfrei  
✅ Backup-System aktiviert (mindestens Snapshots)  
✅ Multi-Device Zugriff getestet (Home + Office)  
✅ Kein Datenverlust bei Tests  

### Nice-to-Have (Iterativ ergänzen):
🟡 Google Photos Integration  
🟡 Offline-Mode für PWA  
🟡 Versionierung von Dokumenten  
🟡 Volltextsuche in PDFs  

---

## 📅 Zeitplan (Empfehlung)

### Heute (Setup & Test):
- 15:00-15:15: Phase 1 (Vorbereitung)
- 15:15-16:15: Phase 2 (Document Manager)
- 16:15-16:45: Phase 3 (Weblink Manager)
- 16:45-17:00: Phase 6 (Backup aktivieren)
- 17:00-17:30: Test-Checkliste durchgehen

### Morgen (Echtdaten):
- Erstes Produkt mit Echtdaten anlegen
- 1 Woche parallel mit Testdaten laufen lassen
- Falls stabil: Komplett auf Echtdaten umstellen

### Nächste Woche (Optimierung):
- Google Photos (optional)
- Offline-Modus (optional)
- Performance-Tuning

---

## 🆘 Support & Troubleshooting

### Häufige Probleme:

**Problem:** NAS nicht erreichbar von Office  
**Lösung:** Tailscale Status prüfen, ggf. neu verbinden

**Problem:** Bilder werden nicht angezeigt  
**Lösung:** Custom API Server läuft? `npm run server` in Terminal

**Problem:** Upload schlägt fehl (>50MB)  
**Lösung:** File-Size Limit in `server.js` erhöhen

**Problem:** Duplikate bei parallelem Schreiben  
**Lösung:** JSON-Locking implementieren (falls Problem auftritt)

### Kontakt:
- **GitHub Issues:** Für Bugs/Feature Requests
- **Docs:** Siehe NAS_ARCHITEKTUR.md, MOBILE_API.md
- **Logs:** Browser Console (F12) + Server-Logs (Terminal)

---

## ✅ Nächste Schritte

**Jetzt:**
1. Diesen Plan durchlesen & Fragen klären
2. Phase 1 starten (Vorbereitung)
3. Snapshot erstellen (Sicherheit!)

**Dann:**
4. Phase 2-3 implementieren (Document/Weblink Manager)
5. Test-Checkliste durchgehen
6. Erste Echtdaten eingeben (1 Produkt als Test)

**Später:**
7. 1 Woche Probebetrieb
8. Bei Stabilität: Vollständig auf Echtdaten umstellen
9. Optional: Google Photos, Offline-Mode

---

**Fragen? Unklarheiten? Lass uns Schritt für Schritt vorgehen! 🚀**
