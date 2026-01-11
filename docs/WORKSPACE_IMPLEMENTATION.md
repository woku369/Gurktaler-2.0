# Project Workspaces - Implementierungs-Checkliste

**Version:** 1.6.0  
**Ziel:** Projekt-Ebenen für strategische Trennung (Standortentwicklung, Produktentwicklung, etc.)  
**Zeitaufwand:** 6-7 Stunden  
**Stand:** ✅ Phase 1-4 abgeschlossen (Jan 10, 2026) | 📝 Phase 5 in Arbeit

---

## ✅ Phase 1: Datenmodell & Storage (60 Min) - ABGESCHLOSSEN

### 1.1 Type Definitions
**Datei:** `src/shared/types/index.ts`

**Tasks:**
- [x] `ProjectWorkspace` Interface erstellen
  ```typescript
  export interface ProjectWorkspace extends BaseEntity {
    name: string;              // Frei definierbarer Name
    description?: string;      // Optional: Beschreibung
    color: string;             // Hex-Color für visuelle Trennung
    icon?: string;             // Optional: Emoji oder Icon-Name
    order: number;             // Sortierung der Tabs (0, 1, 2, ...)
  }
  ```

- [x] `Project` Interface erweitern
  ```typescript
  export interface Project extends BaseEntity {
    // ... bestehende Felder
    workspace_id?: string;     // Zuordnung zu Workspace (optional für Rückwärtskompatibilität)
  }
  ```

- [x] `DatabaseSchema` Interface erweitern
  ```typescript
  export interface DatabaseSchema {
    // ... bestehende Felder
    workspaces: ProjectWorkspace[];
  }
  ```

### 1.2 Storage API
**Datei:** `src/renderer/services/storage.ts`

**Tasks:**
- [x] `workspaces` Export-Objekt erstellen
  ```typescript
  export const workspaces = {
    getAll: async (): Promise<ProjectWorkspace[]> => 
      await nasStorage.readJson<ProjectWorkspace>(
        nasStorage.getJsonFilePath('workspaces')
      ),
    getById: async (id: string): Promise<ProjectWorkspace | undefined> => {
      const all = await workspaces.getAll();
      return all.find(w => w.id === id);
    },
    create: (workspace: Omit<ProjectWorkspace, 'id' | 'created_at'>) => 
      createEntity<ProjectWorkspace>('workspaces', workspace),
    update: (id: string, updates: Partial<ProjectWorkspace>) => 
      updateEntity<ProjectWorkspace>('workspaces', id, updates),
    delete: (id: string) => 
      deleteEntity<ProjectWorkspace>('workspaces', id),
  };
  ```

- [x] Default-Workspaces erstellen (Migration)
  - Funktion `initializeDefaultWorkspaces()` in storage.ts
  - Wird beim ersten Start automatisch ausgeführt
  - Erstellt 3 Standard-Workspaces:
    1. "Standortentwicklung" (Blau, Order: 0)
    2. "Produktentwicklung" (Grün, Order: 1)
    3. "Sonstige" (Grau, Order: 2)

**Testing:**
- [x] workspaces.json wird erstellt in `Y:\zweipunktnull\database\`
- [x] Alle CRUD-Operationen funktionieren
- [x] Default-Workspaces werden beim ersten Start angelegt

---

## ✅ Phase 2: WorkspaceTabs Komponente (90 Min) - ABGESCHLOSSEN

### 2.1 Komponente erstellen
**Datei:** `src/renderer/components/WorkspaceTabs.tsx`

**Tasks:**
- [x] Neue Komponente erstellen mit Props:
  ```typescript
  interface WorkspaceTabsProps {
    workspaces: ProjectWorkspace[];
    activeWorkspaceId: string | 'all';
    onWorkspaceChange: (workspaceId: string | 'all') => void;
    onAddWorkspace?: () => void;
    showAllTab?: boolean;  // Optional: "Alle" Tab anzeigen
  }
  ```

- [x] Tab-Layout implementieren:
  - Horizontal scrollbare Tab-Leiste
  - Aktiver Tab: weiß mit farbigem Top-Border
  - Inaktive Tabs: grau, leicht transparent
  - Farbe des Workspace als Border-Top-Color
  - Icon + Name in jedem Tab
  - Optional: "+ Ebene" Button am Ende

- [x] Responsive Design:
  - Desktop: Volle Tab-Leiste horizontal
  - Tablet: Scrollbar bei zu vielen Tabs
  - Mobile: Dropdown statt Tabs

- [x] Hover-Effekte & Transitions
  - Smooth color transitions
  - Hover-State für Tabs
  - Active-State deutlich erkennbar

**Styling-Beispiel:**
```tsx
<div className="flex gap-2 border-b-2 border-distillery-200 mb-6 overflow-x-auto">
  {/* "Alle" Tab (optional) */}
  {showAllTab && (
    <button
      onClick={() => onWorkspaceChange('all')}
      className={`px-4 py-2 rounded-t-vintage border-2 transition-colors ${
        activeWorkspaceId === 'all'
          ? 'bg-white border-distillery-300 border-b-white -mb-0.5 font-semibold'
          : 'bg-distillery-50 border-transparent hover:bg-distillery-100'
      }`}
    >
      📊 Alle
    </button>
  )}

  {/* Workspace Tabs */}
  {workspaces.map(workspace => (
    <button
      key={workspace.id}
      onClick={() => onWorkspaceChange(workspace.id)}
      className={`px-4 py-2 rounded-t-vintage border-2 transition-colors ${
        activeWorkspaceId === workspace.id
          ? 'bg-white border-distillery-300 border-b-white -mb-0.5 font-semibold'
          : 'bg-distillery-50 border-transparent hover:bg-distillery-100'
      }`}
      style={{
        borderTopColor: activeWorkspaceId === workspace.id ? workspace.color : undefined,
        borderTopWidth: activeWorkspaceId === workspace.id ? '3px' : undefined,
      }}
    >
      {workspace.icon && <span className="mr-2">{workspace.icon}</span>}
      {workspace.name}
    </button>
  ))}

  {/* Optional: + Button */}
  {onAddWorkspace && (
    <button
      onClick={onAddWorkspace}
      className="px-3 py-2 text-distillery-400 hover:text-distillery-600 transition-colors"
      title="Neue Ebene hinzufügen"
    >
      + Ebene
    </button>
  )}
</div>
```

**Testing:**
- [ ] Tabs rendern korrekt
- [ ] Aktiver Tab visuell unterscheidbar
- [ ] Farben werden korrekt angezeigt
- [ ] Callbacks funktionieren
- [ ] Responsive auf Mobile

---

## ✅ Phase 3: Projects-Seite Integration (60 Min) - ABGESCHLOSSEN

### 3.1 Projects.tsx erweitern
**Datei:** `src/renderer/pages/Projects.tsx`

**Tasks:**
- [x] State für Workspaces hinzufügen:
  ```typescript
  const [workspaces, setWorkspaces] = useState<ProjectWorkspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<string>('all');
  ```

- [ ] Workspaces laden in `useEffect`:
  ```typescript
  useEffect(() => {
    const loadWorkspaces = async () => {
      const ws = await workspaces.getAll();
      const sorted = ws.sort((a, b) => a.order - b.order);
      setWorkspaces(sorted);
    };
    loadWorkspaces();
  }, []);
  ```

- [ ] Projekt-Filter implementieren:
  ```typescript
  const filteredProjects = useMemo(() => {
    if (activeWorkspace === 'all') return projects;
    return projects.filter(p => p.workspace_id === activeWorkspace);
  }, [projects, activeWorkspace]);
  ```

- [ ] WorkspaceTabs einbinden:
  ```tsx
  <WorkspaceTabs
    workspaces={workspaces}
    activeWorkspaceId={activeWorkspace}
    onWorkspaceChange={setActiveWorkspace}
    showAllTab={true}
  />
  ```

- [ ] Projekt-Karte erweitern mit Workspace-Badge:
  ```tsx
  {project.workspace_id && (
    <div 
      className="px-2 py-1 rounded text-xs"
      style={{ 
        backgroundColor: getWorkspaceColor(project.workspace_id),
        color: 'white'
      }}
    >
      {getWorkspaceName(project.workspace_id)}
    </div>
  )}
  ```

- [ ] Projekt-Formular erweitern:
  - Dropdown zur Workspace-Auswahl beim Erstellen/Bearbeiten
  - Aktuell aktiver Workspace als Default

### 3.2 Rückwärtskompatibilität
**Tasks:**
- [ ] Projekte ohne `workspace_id` automatisch zu "Sonstige" zuordnen
- [ ] Migration-Funktion für bestehende Projekte
- [ ] Beim "Alle"-Filter auch Projekte ohne workspace_id anzeigen

**Testing:**
- [ ] Tabs werden angezeigt
- [ ] Filter funktioniert korrekt
- [ ] Projekt-Erstellung mit Workspace
- [ ] Bestehende Projekte ohne Workspace sichtbar
- [ ] Workspace-Badge auf Projektkarten

---

## ✅ Phase 4: Gantt-Chart & Timeline Integration (60 Min) - ABGESCHLOSSEN

### 4.1 ProjectTimeline.tsx erweitern
**Datei:** `src/renderer/pages/ProjectTimeline.tsx`

**Tasks:**
- [x] State für Workspaces und Filter:
  ```typescript
  const [workspaces, setWorkspaces] = useState<ProjectWorkspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('all');
  ```

- [ ] Workspace-Dropdown im Header:
  ```tsx
  <div className="mb-4">
    <label className="block text-sm font-medium mb-2">
      Workspace-Filter:
    </label>
    <select
      value={selectedWorkspace}
      onChange={e => setSelectedWorkspace(e.target.value)}
      className="w-64 px-3 py-2 border-vintage rounded-vintage"
    >
      <option value="all">🔀 Alle Workspaces</option>
      {workspaces.map(ws => (
        <option key={ws.id} value={ws.id}>
          {ws.icon} {ws.name}
        </option>
      ))}
    </select>
  </div>
  ```

- [ ] Timeline-Filter implementieren:
  ```typescript
  const filteredTimelines = useMemo(() => {
    if (selectedWorkspace === 'all') return timelines;
    
    // Projekte des ausgewählten Workspace
    const workspaceProjectIds = projects
      .filter(p => p.workspace_id === selectedWorkspace)
      .map(p => p.id);
    
    // Timelines nur für diese Projekte
    return timelines.filter(t => 
      workspaceProjectIds.includes(t.project_id)
    );
  }, [timelines, projects, selectedWorkspace]);
  ```

- [x] Workspace-Farbe im Gantt-Chart:
  - Projekt-Balken in Workspace-Farbe einfärben
  - Legende mit Workspace-Zuordnung

**Testing:**
- [x] Workspace-Filter funktioniert
- [x] Nur Projekte des Workspace werden angezeigt
- [x] Gantt-Balken in korrekter Farbe
- [x] "Alle"-Filter zeigt alle Projekte

---

## ✅ Phase 5: Exports, Verknüpfungen & Suche (90 Min) - ABGESCHLOSSEN

### 5.0 Settings: Workspace-Verwaltung
**Datei:** `src/renderer/components/WorkspaceManager.tsx` + `src/renderer/pages/Settings.tsx`

**Tasks:**
- [x] WorkspaceManager-Komponente erstellt
- [x] Workspace erstellen (Name, Icon, Farbe, Beschreibung)
- [x] Workspace bearbeiten (alle Felder änderbar)
- [x] Workspace löschen (mit Sicherheitsabfrage + Projekt-Bereinigung)
- [x] Farbpalette (10 Farben)
- [x] Icon-Auswahl (10 Standard-Emojis)
- [x] In Settings integriert
- [x] Order-Management (neue Workspaces am Ende)
- [x] Sichere Löschung (nur Zuordnung entfernen, nie Projekte löschen)

### 5.1 Export-Integration

#### 5.1.1 PDF-Export erweitern
**Datei:** `src/renderer/services/timelineExport.ts`

**Tasks:**
- [x] `exportTimelineToPDF()` erweitert um workspace-Parameter
- [x] Workspace-Name im PDF-Header anzeigen
- [x] Workspace-Info bei aktiver Filterung

**Datei:** `src/renderer/services/taskExport.ts`

**Tasks:**
- [x] `exportTasksToPDF()` erweitert um workspace-Parameter
- [x] Workspace-Name im PDF-Header anzeigen
- [x] Workspace-Info bei Projekt-Filterung

**Hinweis:** Workspace-Farbe als PDF-Akzent und weitere Design-Elemente sind für v1.7.0 vorgesehen.

#### 5.1.2 iCal-Export erweitern
**Datei:** `src/renderer/pages/Dashboard.tsx` (iCal-Funktionen)

**Tasks:**
- [ ] Workspace-Info in LOCATION-Feld der .ics-Datei
- [ ] CATEGORIES-Feld mit Workspace-Name befüllen

#### 5.1.3 Projekt-Export (falls vorhanden)
**Tasks:**
- [ ] Workspace-Name in Projekt-PDF anzeigen
- [ ] Workspace-Farbe als Design-Element

### 5.2 Verknüpfungen erweitern

#### 5.2.1 Notizen
**Datei:** `src/renderer/pages/Notes.tsx`

**Tasks:**
- [ ] Wenn Notiz zu Projekt verknüpft: Workspace anzeigen
- [ ] Filter: Notizen nach Workspace filtern
- [ ] Badge mit Workspace-Name und Farbe

#### 5.2.2 Gebinde/Container
**Datei:** `src/renderer/pages/Containers.tsx`

**Tasks:**
- [ ] Bei Projekt-Verknüpfung: Workspace-Badge anzeigen
- [ ] Filter: Gebinde nach Workspace filtern

#### 5.2.3 Produkte
**Datei:** `src/renderer/pages/Products.tsx`

**Tasks:**
- [ ] Bei Projekt-Verknüpfung: Workspace-Badge anzeigen
- [ ] Filter: Produkte nach Workspace filtern

#### 5.2.4 Rezepte
**Datei:** `src/renderer/pages/Recipes.tsx`

**Tasks:**
- [ ] Bei Projekt-Verknüpfung: Workspace-Badge anzeigen
- [ ] Filter: Rezepte nach Workspace filtern

#### 5.2.5 TODOs/Tasks
**Datei:** `src/renderer/pages/Dashboard.tsx`

**Tasks:**
- [x] Bei Projekt-Zuordnung: Workspace anzeigen
- [x] Workspace-Badge mit Icon, Name und Farbe
- [x] Automatische Anzeige bei projekt-verknüpften Tasks
- [x] Workspaces geladen und durchgereicht

### 5.3 Globale Suche erweitern
**Datei:** `src/renderer/pages/GlobalSearch.tsx`

**Tasks:**
- [x] Workspace-Filter in Suchoptionen (Dropdown)
- [x] Suchergebnisse zeigen Workspace-Zugehörigkeit
- [x] Workspace-Badge in Projekt-Ergebnis-Cards
- [x] Filter funktioniert korrekt (nur Projekte gefiltert)
- [x] workspace_id zu SearchResult hinzugefügt

**Hinweis:** Notizen, Container, Produkte, Rezepte mit Workspace-Badges sind für v1.7.0 vorgesehen.

**Suchergebnis-Beispiel:**
```tsx
<div className="result-card">
  <div className="flex items-center gap-2">
    <h3>Projekt XYZ</h3>
    <span 
      className="workspace-badge"
      style={{ backgroundColor: workspace.color }}
    >
      📍 {workspace.name}
    </span>
  </div>
</div>
```

### 5.4 Settings - Workspace-Manager
**Datei:** `src/renderer/pages/Settings.tsx`

**Tasks:**
- [ ] Neuer Tab "Workspaces" in Settings
- [ ] Liste aller Workspaces mit:
  - Name (editierbar)
  - Farbe (Color Picker)
  - Icon (Emoji Picker oder Text-Input)
  - Reihenfolge (Drag & Drop oder Up/Down Buttons)
  - Löschen-Button (mit Bestätigung)
- [ ] "Neue Ebene"-Button
- [ ] Warnung beim Löschen: "X Projekte sind diesem Workspace zugeordnet"
- [ ] Beim Löschen: Projekte zu "Sonstige" verschieben

**UI-Mockup:**
```tsx
<div className="workspace-settings">
  <h2>Projekt-Ebenen verwalten</h2>
  
  <div className="workspace-list space-y-4">
    {workspaces.map((ws, index) => (
      <div key={ws.id} className="workspace-item">
        <div className="flex items-center gap-4">
          {/* Reihenfolge */}
          <div className="order-controls">
            <button disabled={index === 0}>↑</button>
            <button disabled={index === workspaces.length - 1}>↓</button>
          </div>
          
          {/* Farbe */}
          <input
            type="color"
            value={ws.color}
            onChange={e => handleUpdateWorkspace(ws.id, { color: e.target.value })}
          />
          
          {/* Icon */}
          <input
            value={ws.icon}
            placeholder="📁"
            className="w-12 text-center"
            onChange={e => handleUpdateWorkspace(ws.id, { icon: e.target.value })}
          />
          
          {/* Name */}
          <input
            value={ws.name}
            className="flex-1"
            onChange={e => handleUpdateWorkspace(ws.id, { name: e.target.value })}
          />
          
          {/* Löschen */}
          <button
            onClick={() => handleDeleteWorkspace(ws.id)}
            className="text-red-500 hover:text-red-700"
          >
            🗑️ Löschen
          </button>
        </div>
        
        {/* Projekt-Anzahl */}
        <div className="text-sm text-gray-600 ml-16">
          {getProjectCount(ws.id)} Projekte
        </div>
      </div>
    ))}
  </div>
  
  <button
    onClick={handleAddWorkspace}
    className="btn-primary mt-4"
  >
    + Neue Ebene
  </button>
</div>
```

**Testing:**
- [ ] Workspace erstellen funktioniert
- [ ] Name, Farbe, Icon editierbar
- [ ] Reihenfolge ändern funktioniert
- [ ] Löschen mit Warnung funktioniert
- [ ] Projekte werden beim Löschen verschoben

---

## 🧪 Testing-Checkliste

### Funktionale Tests
- [ ] **Workspace CRUD:**
  - [ ] Erstellen, Bearbeiten, Löschen funktioniert
  - [ ] Änderungen werden persistiert (Y:\zweipunktnull\database\workspaces.json)
  - [ ] Reihenfolge wird korrekt gespeichert

- [ ] **Projekt-Zuordnung:**
  - [ ] Projekt kann Workspace zugeordnet werden
  - [ ] Zuordnung ändern funktioniert
  - [ ] Projekte ohne Workspace werden korrekt behandelt

- [ ] **Filter & Navigation:**
  - [ ] Workspace-Tabs funktionieren auf Projects-Seite
  - [ ] "Alle"-Tab zeigt alle Projekte
  - [ ] Gantt-Chart-Filter funktioniert
  - [ ] Suche filtert nach Workspace

- [ ] **Verknüpfungen:**
  - [ ] Workspace-Badge bei Notizen mit Projekt
  - [ ] Workspace-Badge bei Gebinden mit Projekt
  - [ ] Workspace-Badge bei Produkten mit Projekt
  - [ ] Workspace-Badge bei TODOs mit Projekt

- [ ] **Exports:**
  - [ ] PDF zeigt Workspace-Name
  - [ ] iCal enthält Workspace-Info
  - [ ] Workspace-Farbe in Exports sichtbar

### UI/UX Tests
- [ ] Tabs sind visuell unterscheidbar
- [ ] Farben sind konsistent überall sichtbar
- [ ] Workspace-Badges sind gut lesbar
- [ ] Responsive Design funktioniert (Mobile/Tablet/Desktop)
- [ ] Hover-Effekte funktionieren
- [ ] Transitions sind smooth

### Performance Tests
- [ ] Filter mit vielen Projekten performant
- [ ] Gantt-Chart mit vielen Einträgen performant
- [ ] Suche bleibt schnell

### Rückwärtskompatibilität
- [ ] Bestehende Projekte ohne workspace_id funktionieren
- [ ] Alle Features in v1.5.0 funktionieren weiterhin
- [ ] Migration von Alt-Daten funktioniert
- [ ] Keine Breaking Changes

---

## 📝 Wichtige Hinweise für Implementierung

### 1. Rückwärtskompatibilität
- Projekte ohne `workspace_id` werden nicht gelöscht
- "Sonstige"-Workspace als Fallback
- Alle bestehenden Features MÜSSEN in allen Workspaces funktionieren

### 2. Performance
- Workspace-Liste cachen (wenige Einträge, ändern selten)
- Filter-Operationen mit `useMemo()` optimieren
- Keine unnötigen Re-Renders

### 3. UX-Prinzipien
- Workspace-Name immer sichtbar machen (nie verstecken)
- Farben konsistent verwenden
- Icons optional (nicht erzwingen)
- Klare visuelle Hierarchie

### 4. Daten-Integrität
- Beim Löschen eines Workspace: Projekte umhängen
- Foreign-Key-Logik: workspace_id referenziert immer gültige Workspace
- Validierung: Workspace-Name nicht leer

### 5. Export-Qualität
- Workspace-Name prominent im PDF
- Farben druckfreundlich (nicht zu hell)
- Alle Export-Formate einheitlich

---

## 🚀 Nächste Schritte nach Testing v1.5.0

1. **Testing abschließen:**
   - EXE und PWA auf Fehler prüfen
   - Kleinigkeiten bereinigen
   - v1.5.0 als stabil markieren

2. **Branch erstellen:**
   ```bash
   git checkout -b feature/workspace-system
   ```

3. **Phase 1 starten:**
   - Datenmodell implementieren (types/index.ts)
   - Storage API erstellen (storage.ts)
   - Default-Workspaces anlegen

4. **Inkrementell testen:**
   - Nach jeder Phase: manueller Test
   - Erst zur nächsten Phase, wenn vorherige funktioniert

5. **Nach Phase 5:**
   - Vollständiger Test aller Features
   - Dokumentation aktualisieren (CHANGELOG.md)
   - Merge in main
   - Release v1.6.0

---

## 📊 Zeitplan (Empfehlung)

| Phase | Zeitaufwand | Kumulativ |
|-------|-------------|-----------|
| Phase 1: Datenmodell & Storage | 60 Min | 1h |
| Phase 2: WorkspaceTabs Komponente | 90 Min | 2.5h |
| Phase 3: Projects-Seite | 60 Min | 3.5h |
| Phase 4: Gantt-Chart | 60 Min | 4.5h |
| Phase 5: Exports & Verknüpfungen | 90 Min | 6h |
| Testing & Bugfixes | 60 Min | 7h |
| **Gesamt** | **7 Stunden** | |

**Empfohlene Aufteilung:**
- Tag 1: Phase 1 + 2 (2.5h)
- Tag 2: Phase 3 + 4 (2h)
- Tag 3: Phase 5 + Testing (2.5h)

---

## ✅ Success Criteria

Feature gilt als erfolgreich implementiert, wenn:

1. ✅ Mindestens 3 Workspaces vorhanden und funktional
2. ✅ Projekte können Workspaces zugeordnet werden
3. ✅ Filter auf Projects-Seite funktioniert
4. ✅ Gantt-Chart filtert nach Workspace
5. ✅ Workspace-Name auf allen Exports sichtbar
6. ✅ Workspace-Badge bei allen Verknüpfungen sichtbar
7. ✅ Suche berücksichtigt Workspace
8. ✅ Settings-Manager funktioniert vollständig
9. ✅ Alle v1.5.0-Features funktionieren in allen Workspaces
10. ✅ Rückwärtskompatibilität gewährleistet

---

**Status:** 📋 Bereit für Umsetzung nach v1.5.0 Testing  
**Nächster Schritt:** EXE und PWA testen → Faden nicht verloren! 🎯
