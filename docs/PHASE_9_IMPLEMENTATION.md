# Phase 9 Implementation Plan: NAS-Storage Vollintegration

**Version:** v1.7.0  
**Status:** 📋 Geplant  
**Priorität:** 🚀 NÄCHSTE (nach v1.6.0 Workspace-Feature)  
**Geschätzter Aufwand:** 7-10 Arbeitstage

---

## 🎯 Ziel

Vollständige Migration aller App-Services von LocalStorage auf zentrale NAS-Speicherung.

### Was bereits funktioniert (v1.1.x):
✅ Infrastruktur (Tailscale, SMB, IPC-Handlers, NAS-Storage-Provider)  
✅ Migration-Service (einmalige Daten-Übertragung)  
✅ Setup-Service (Verbindungstest, Verzeichnisse)

### Was fehlt:
❌ Entity-Services nutzen noch LocalStorage  
❌ Bilder als Base64 in JSON (statt Binary Files)  
❌ Document-Service nicht implementiert  
❌ Multi-User-Konflikte nicht gelöst

---

## 📋 Phase 9a: Entity Services Refactoring

**Aufwand:** 3-4 Tage | **Risiko:** Mittel

### Betroffen: 10 Services
1. `src/renderer/services/storage.ts` (projects)
2. `src/renderer/services/storage.ts` (products)
3. `src/renderer/services/storage.ts` (recipes)
4. `src/renderer/services/storage.ts` (notes)
5. `src/renderer/services/storage.ts` (ingredients)
6. `src/renderer/services/storage.ts` (containers)
7. `src/renderer/services/storage.ts` (contacts)
8. `src/renderer/services/storage.ts` (research)
9. `src/renderer/services/storage.ts` (tasks)
10. `src/renderer/services/storage.ts` (workspaces)

### Änderungen pro Service:

#### Vorher (LocalStorage):
```typescript
// storage.ts
export const projects = {
  getAll: async (): Promise<Project[]> => {
    const data = localStorage.getItem('persist:gurktaler');
    const parsed = JSON.parse(data || '{}');
    return JSON.parse(parsed.projects || '[]');
  },
  
  create: async (project: Omit<Project, 'id'>): Promise<Project> => {
    const allProjects = await projects.getAll();
    const newProject = { ...project, id: generateId() };
    allProjects.push(newProject);
    
    const data = localStorage.getItem('persist:gurktaler');
    const parsed = JSON.parse(data || '{}');
    parsed.projects = JSON.stringify(allProjects);
    localStorage.setItem('persist:gurktaler', JSON.stringify(parsed));
    
    return newProject;
  }
};
```

#### Nachher (NAS-Storage):
```typescript
// storage.ts
import { nasStorage } from './nas-storage';

export const projects = {
  getAll: async (): Promise<Project[]> => {
    try {
      const data = await nasStorage.readJSON<Project[]>('database/projects.json');
      return data || [];
    } catch (error) {
      console.error('NAS read failed, using cache:', error);
      return getCachedProjects(); // Fallback
    }
  },
  
  create: async (project: Omit<Project, 'id'>): Promise<Project> => {
    const allProjects = await projects.getAll();
    const newProject = { ...project, id: generateId() };
    allProjects.push(newProject);
    
    await nasStorage.writeJSON('database/projects.json', allProjects);
    updateCache('projects', allProjects); // Update In-Memory-Cache
    
    return newProject;
  }
};
```

### Aufgaben:

- [ ] **Cache-System implementieren**
  - In-Memory-Cache für alle Entities
  - Cache-Invalidierung bei Writes
  - Cache-Warmup beim App-Start
  - Fallback auf Cache wenn NAS offline

- [ ] **Error-Handling verbessern**
  - NAS offline → Cache-Fallback
  - Netzwerk-Timeouts (5s Timeout)
  - Retry-Mechanismus (3 Versuche)
  - User-Benachrichtigung bei Fehlern

- [ ] **Race-Condition-Prevention**
  - Write-Queue implementieren (sequentiell statt parallel)
  - Debounce für häufige Updates (z.B. AutoSave)
  - Lock-Mechanismus für kritische Operationen

- [ ] **UI-Komponenten anpassen**
  - Alle `useEffect` mit async Service-Calls
  - Loading-States während NAS-Zugriff
  - Error-Boundaries für NAS-Fehler
  - Offline-Indicator in UI

### Kritische Dateien:
```
src/renderer/services/storage.ts          (Hauptdatei, ~500 Zeilen)
src/renderer/services/nas-storage.ts      (existiert, erweitern)
src/renderer/components/*.tsx             (~30 Komponenten anpassen)
src/renderer/pages/*.tsx                  (~15 Pages anpassen)
```

---

## 📋 Phase 9b: Binäre Bildspeicherung

**Aufwand:** 2-3 Tage | **Risiko:** Mittel

### Problem:
Aktuell: `product.images = ["data:image/png;base64,iVBORw0KGgoAAAANS..."]` (30 KB)  
Ziel: `product.images = ["abc123.jpg"]` (3 KB Binary File auf NAS)

### Vorteile:
- 90% Speichereinsparung
- Schnellere JSON-Reads (kleinere Dateien)
- Thumbnail-Generierung möglich
- Standard-File-Format (exportierbar)

### Aufgaben:

- [ ] **ImageUpload Component Refactor**
  - `saveImage()` ruft `nasStorage.saveImage()` auf
  - Return: Filename statt Base64
  - Upload-Progress-Bar für große Bilder

- [ ] **gallery.ts Refactor**
  - `loadImage()` lädt Binary File von NAS
  - Lazy-Loading (nur sichtbare Bilder laden)
  - Thumbnail-Cache im Browser

- [ ] **Migration Script**
  ```typescript
  // migration/base64-to-binary.ts
  async function migrateImages() {
    const allProducts = await products.getAll();
    
    for (const product of allProducts) {
      const newImageRefs: string[] = [];
      
      for (const base64Image of product.images || []) {
        if (base64Image.startsWith('data:image/')) {
          // Base64 → Binary File
          const filename = await nasStorage.saveImage(
            base64Image, 
            'products',
            product.id
          );
          newImageRefs.push(filename);
        }
      }
      
      // Update product.images
      await products.update(product.id, { images: newImageRefs });
    }
  }
  ```

- [ ] **Thumbnail-Generierung**
  - Automatische Verkleinerung großer Bilder (>1 MB)
  - Thumbnail: 300x300px für Listen
  - Full-Size: Original für Detail-Ansicht

- [ ] **Cleanup Service**
  - Alte Base64-Daten aus JSON löschen
  - Nicht-referenzierte Bilder löschen (Garbage Collection)

### Kritische Dateien:
```
src/renderer/components/ImageUpload.tsx
src/renderer/services/gallery.ts
src/renderer/services/nas-storage.ts
migration/base64-to-binary.ts (neu)
```

---

## 📋 Phase 9c: Document Service

**Aufwand:** 1-2 Tage | **Risiko:** Niedrig

### Features:
- PDF/Excel/Word Upload
- Dokumente zu Projekten/Produkten zuordnen
- Download-Funktion
- Vorschau-Integration (optional)

### Aufgaben:

- [ ] **DocumentManager Component**
  ```typescript
  // components/DocumentManager.tsx
  - Upload (Drag & Drop)
  - Liste (Grid/List-View)
  - Download
  - Löschen
  - Filter nach Typ
  - Suche
  ```

- [ ] **documents.ts Service**
  ```typescript
  interface Document {
    id: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    uploadedAt: string;
    project_id?: string;
    product_id?: string;
    tags: string[];
  }
  
  export const documents = {
    getAll: async (): Promise<Document[]>
    upload: async (file: File, entityId?: string): Promise<Document>
    download: async (id: string): Promise<Blob>
    delete: async (id: string): Promise<boolean>
  }
  ```

- [ ] **Upload-Progress-Bar**
  - Für Dateien >5 MB
  - Abbrechen-Button
  - Geschwindigkeits-Anzeige

- [ ] **MIME-Type-Icons**
  - PDF: 📄
  - Excel: 📊
  - Word: 📝
  - Unbekannt: 📎

### Kritische Dateien:
```
src/renderer/components/DocumentManager.tsx (neu)
src/renderer/services/documents.ts (neu)
src/renderer/services/nas-storage.ts (erweitern)
```

---

## 📋 Phase 9d: Deployment-Automatisierung

**Aufwand:** 1 Tag | **Risiko:** Niedrig

### Ziel:
`npm run build` → Automatisch auf NAS deployen

### Aufgaben:

- [ ] **package.json Scripts**
  ```json
  {
    "scripts": {
      "build:pwa": "vite build",
      "deploy:pwa": "npm run build:pwa && node scripts/deploy.js",
      "build:desktop": "electron-builder && node scripts/deploy.js"
    }
  }
  ```

- [ ] **Cross-Platform Deploy Script**
  ```javascript
  // scripts/deploy.js
  const fs = require('fs-extra');
  const path = require('path');
  
  const isWindows = process.platform === 'win32';
  const nasPath = isWindows 
    ? 'Y:\\Gurktaler\\zweipunktnull\\pwa\\'
    : '/mnt/nas/Gurktaler/zweipunktnull/pwa/';
  
  async function deploy() {
    console.log('📦 Deploying to NAS...');
    await fs.copy('./dist', nasPath);
    console.log('✅ Deployment successful!');
  }
  
  deploy().catch(console.error);
  ```

- [ ] **Build-Validierung**
  - Check ob dist/ existiert
  - Check ob NAS erreichbar
  - Backup vor Überschreiben

---

## ⏸️ Phase 9e: Multi-User Konfliktlösung (v1.8.0)

**VERSCHOBEN** - Zu komplex für v1.7.0

### Warum verschoben?
1. **Hohe Komplexität:** JSON-Merge-Logik ist nicht trivial
2. **Edge Cases:** Viele Szenarien müssen bedacht werden
3. **Testing-Aufwand:** Simultan-Testing mit 2+ Geräten
4. **Design-Phase nötig:** Braucht separates Konzept-Dokument

### Wird v1.7.0 ohne Multi-User funktionieren?
✅ **JA** - Solange nur 1 Gerät gleichzeitig nutzt:
- NAS-Speicherung funktioniert einwandfrei
- Mehrere Geräte nacheinander: kein Problem
- Nur gleichzeitige Edits sind problematisch (Last-Write-Wins)

### Nächster Schritt für v1.8.0:
- Separates Design-Dokument: `MULTI_USER_DESIGN.md`
- Evaluierung von Locking-Strategien
- Prototyp für Konflikt-Dialog

---

## 🚀 Umsetzungsplan v1.7.0

### Woche 1 (5 Tage):
**Tag 1-3:** Phase 9a - Entity Services Refactoring
- Tag 1: Cache-System + Error-Handling
- Tag 2: 5 Services umstellen (projects, products, recipes, notes, tasks)
- Tag 3: 5 Services umstellen (ingredients, containers, contacts, research, workspaces)

**Tag 4-5:** Phase 9a - UI-Komponenten anpassen
- Tag 4: Pages (Dashboard, Projects, Products, Recipes, etc.)
- Tag 5: Components (Forms, Lists, Cards, etc.)

### Woche 2 (2-3 Tage):
**Tag 6-7:** Phase 9b - Binäre Bildspeicherung
- Tag 6: ImageUpload + gallery.ts Refactor
- Tag 7: Migration Script + Thumbnail-Generierung

**Tag 8:** Phase 9c - Document Service
- DocumentManager Component + documents.ts

**Tag 9:** Phase 9d - Deployment-Automatisierung
- package.json Scripts + deploy.js

**Tag 10:** Testing & Bugfixes
- Edge Cases testen
- Performance-Optimierung
- Dokumentation

---

## 📊 Erfolgskriterien

### Phase 9a (Entity Services):
- [ ] Alle 10 Services nutzen NAS statt LocalStorage
- [ ] Cache-System funktioniert (Performance <100ms)
- [ ] Offline-Fallback funktioniert
- [ ] Keine Race-Conditions bei parallelen Writes
- [ ] Keine TypeScript-Fehler

### Phase 9b (Bilder):
- [ ] Alle bestehenden Base64-Bilder migriert
- [ ] Neue Bilder als Binary Files gespeichert
- [ ] Thumbnails automatisch generiert
- [ ] Speichereinsparung messbar (>80%)

### Phase 9c (Dokumente):
- [ ] Upload funktioniert (PDF, Excel, Word)
- [ ] Download funktioniert
- [ ] Dokumente zugeordnet zu Projekten/Produkten
- [ ] Upload-Progress-Bar funktioniert

### Phase 9d (Deployment):
- [ ] `npm run build` deployt automatisch auf NAS
- [ ] Cross-Platform (Windows + Linux)
- [ ] Backup vor Überschreiben

---

## 🔧 Technische Details

### Cache-System Design:
```typescript
// cache.ts
const cache = new Map<string, { data: any, timestamp: number }>();

export function getCached<T>(key: string, maxAge = 60000): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  
  if (Date.now() - entry.timestamp > maxAge) {
    cache.delete(key);
    return null;
  }
  
  return entry.data as T;
}

export function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

export function invalidateCache(key: string): void {
  cache.delete(key);
}
```

### Write-Queue Design:
```typescript
// write-queue.ts
const queue: Array<() => Promise<void>> = [];
let isProcessing = false;

export async function enqueue(operation: () => Promise<void>): Promise<void> {
  return new Promise((resolve, reject) => {
    queue.push(async () => {
      try {
        await operation();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
    
    processQueue();
  });
}

async function processQueue(): Promise<void> {
  if (isProcessing || queue.length === 0) return;
  
  isProcessing = true;
  
  while (queue.length > 0) {
    const operation = queue.shift()!;
    await operation();
  }
  
  isProcessing = false;
}
```

---

## 📝 Notizen & Learnings

### Entscheidungen:
1. **Multi-User auf v1.8.0 verschoben:** Zu komplex, braucht eigenes Design
2. **Cache-System Pflicht:** Ohne Cache ist Performance inakzeptabel
3. **Write-Queue essentiell:** Race-Conditions sind reales Problem
4. **Offline-Fallback wichtig:** NAS kann offline sein (z.B. unterwegs)

### Risiken:
- ⚠️ Async/Await-Kaskade könnte komplizierter werden als gedacht
- ⚠️ Cache-Invalidierung muss wasserdicht sein
- ⚠️ Migration bestehender Bilder könnte lange dauern (viele Bilder)

### Chancen:
- ✅ Performance-Gewinn durch Binary Files
- ✅ Unlimitierter Speicher (2-3 TB NAS)
- ✅ Bessere Backup-Strategie (NAS Snapshots)
- ✅ Grundlage für Multi-User in v1.8.0

---

**Letzte Aktualisierung:** 11. Januar 2026  
**Nächster Review:** Nach v1.6.0 Testing abgeschlossen
