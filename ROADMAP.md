# Roadmap - Gurktaler 2.0

> Entwicklungsplan mit Status-Tracking

## Legende

| Symbol | Bedeutung |
|--------|-----------|
| ✅ | Erledigt |
| 🔄 | In Arbeit |
| 📋 | Geplant |
| ❌ | Verworfen/Zurückgestellt |

---

## Phase 1: Fundament (v0.1.x)

### Projektstruktur & Tooling
| Status | Aufgabe | Beschreibung |
|--------|---------|--------------|
| ✅ | Projekt-Setup | package.json, Dependencies |
| ✅ | Vite-Konfiguration | Build-Setup, Hot Reload |
| ✅ | TypeScript-Setup | tsconfig, Typen |
| ✅ | TailwindCSS | Styling-Framework |
| 📋 | ESLint/Prettier | Code-Qualität |

### Dokumentation
| Status | Aufgabe | Beschreibung |
|--------|---------|--------------|
| ✅ | README.md | Projektübersicht |
| ✅ | ROADMAP.md | Diese Datei |
| ✅ | CHANGELOG.md | Versionshistorie |
| ✅ | DATENMODELL.md | Schema-Dokumentation |

### Datenbank
| Status | Aufgabe | Beschreibung |
|--------|---------|--------------|
| ✅ | Schema-Design | Alle Entitäten definieren |
| ✅ | Storage-Service | LocalStorage + JSON für Git-Sync |
| 📋 | Seed-Daten | Testdaten für Entwicklung |

---

## Phase 2: Kern-UI (v0.2.x)

### Layout & Navigation
| Status | Aufgabe | Beschreibung |
|--------|---------|--------------|
| ✅ | App-Shell | Header, Sidebar, Content |
| ✅ | Routing | React Router Setup |
| ✅ | Sidebar-Navigation | Hauptmenü |
| ✅ | Dashboard | Übersichtsseite |

### Basis-Komponenten
| Status | Aufgabe | Beschreibung |
|--------|---------|--------------|
| � | Button, Input, Modal | UI-Grundlagen |
| ✅ | Card-Komponente | Einheitliche Darstellung |
| 📋 | Table-Komponente | Listen-Ansichten |
| 📋 | Form-Komponenten | Formulare |

---

## Phase 3: Projekte & Produkte (v0.3.x)

### Projekt-Verwaltung
| Status | Aufgabe | Beschreibung |
|--------|---------|--------------|
| 📋 | Projekt-Liste | Übersicht aller Projekte |
| 📋 | Projekt erstellen | Neues Projekt anlegen |
| 📋 | Projekt-Detail | Einzelansicht mit Inhalten |
| 📋 | Projekt-Status | Aktiv/Archiviert/Abgeschlossen |

### Produkt-Versionierung
| Status | Aufgabe | Beschreibung |
|--------|---------|--------------|
| 📋 | Produkt-Baum | Hierarchische Ansicht (X → X1) |
| 📋 | Version erstellen | Neue Version aus bestehendem Produkt |
| 📋 | Archivierung | Mit Kommentar archivieren |
| 📋 | Versionsvergleich | Unterschiede anzeigen |

---

## Phase 4: Rezepturen (v0.4.x)

### Zutaten-Stammdaten
| Status | Aufgabe | Beschreibung |
|--------|---------|--------------|
| 📋 | Zutaten-Liste | Mazerate, Destillate, Rohstoffe |
| 📋 | Zutaten-Kategorien | Kräuter, Alkohol, etc. |
| 📋 | Bestandsführung | Optional: Lagerbestand |

### Rezeptur-Editor
| Status | Aufgabe | Beschreibung |
|--------|---------|--------------|
| 📋 | Rezeptur-Formular | Zutaten + Mengen |
| 📋 | Zubereitungsschritte | Anleitung |
| 📋 | Rezeptur-Kalkulation | Mengenberechnung |
| 📋 | Rezeptur-Versionierung | Wie bei Produkten |

---

## Phase 5: Chaosablage & Notizen (v0.5.x)

| Status | Aufgabe | Beschreibung |
|--------|---------|--------------|
| 📋 | Quick-Entry | Schnelle Notiz-Eingabe |
| 📋 | Notiz-Liste | Chronologisch/Nach Tags |
| 📋 | Projekt-Zuordnung | Nachträgliches Zuordnen |
| 📋 | Rich-Text-Editor | Formatierte Notizen |
| 📋 | Bild-Upload | Bilder zu Notizen |

---

## Phase 6: Erweiterungen (v0.6.x)

### Recherche & Links
| Status | Aufgabe | Beschreibung |
|--------|---------|--------------|
| 📋 | Webseiten-Sammlung | URL + Screenshot/Notiz |
| 📋 | Marktbegleiter | Konkurrenzprodukte |
| 📋 | Dokumente | PDF-Ablage |

### Kontakte
| Status | Aufgabe | Beschreibung |
|--------|---------|--------------|
| 📋 | Kontakt-Verwaltung | Name, Firma, Notizen |
| 📋 | Kontakt-Verknüpfung | Zu Projekten zuordnen |

### By-Products
| Status | Aufgabe | Beschreibung |
|--------|---------|--------------|
| 📋 | Marketing-Material | Zu Produkten zugeordnet |
| 📋 | Gebinde-Verwaltung | Flaschen, Etiketten |

---

## Phase 7: Suche & Tags (v0.7.x)

| Status | Aufgabe | Beschreibung |
|--------|---------|--------------|
| 📋 | Volltext-Suche | Über alle Bereiche |
| 📋 | Tag-System | Flexible Kategorisierung |
| 📋 | Filter | Kombinierte Filter |
| 📋 | Favoriten | Schnellzugriff |

---

## Phase 8: Sync & Export (v0.8.x)

| Status | Aufgabe | Beschreibung |
|--------|---------|--------------|
| 📋 | JSON-Export | Alle Daten exportieren |
| 📋 | JSON-Import | Daten importieren |
| 📋 | Git-Integration | Automatischer Sync |
| 📋 | Konflikt-Handling | Bei Sync-Konflikten |

---

## Phase 9: Android-App (v0.9.x)

| Status | Aufgabe | Beschreibung |
|--------|---------|--------------|
| 📋 | PWA-Setup | Manifest, Service Worker |
| 📋 | Mobile UI | Responsive Design |
| 📋 | Quick-Entry | Schnelle Notiz mobil |
| 📋 | Capacitor-Build | APK erstellen |

---

## Phase 10: Polish & Release (v1.0.0)

| Status | Aufgabe | Beschreibung |
|--------|---------|--------------|
| 📋 | Performance | Optimierung |
| 📋 | Error-Handling | Robustheit |
| 📋 | Backup-System | Automatische Backups |
| 📋 | Installer | Windows Setup |
| 📋 | Dokumentation | Vollständig |

---

## Notizen & Ideen (Backlog)

- [ ] Dark Mode
- [ ] Druckansichten für Rezepturen
- [ ] Barcode/QR für Gebinde
- [ ] Kostenkalkulation
- [ ] Produktionsplanung
- [ ] Mehrsprachigkeit (DE/EN)

---

## Changelog-Referenz

Siehe [CHANGELOG.md](./CHANGELOG.md) für detaillierte Versionshistorie.

---

*Letzte Aktualisierung: 25. November 2024*
