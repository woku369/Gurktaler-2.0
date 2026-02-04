# AI Assistant Rules - Automatische Dokumentation

Diese Regeln MÜSSEN bei JEDER Änderung am Projekt befolgt werden.

## 🔴 KRITISCHE REGEL: Dokumentation ist TEIL der Implementierung!

**Dokumentation aktualisieren ist KEIN optionaler Schritt, sondern PFLICHT!**

### Bei JEDER Feature-Implementierung automatisch aktualisieren:

#### 1. ✅ src/renderer/pages/Documentation.tsx ("Anleitungen"-Sektion)
**IMMER wenn:**
- Neue Benutzer-Features hinzugefügt werden
- UI-Interaktionen geändert werden
- Keyboard-Shortcuts eingeführt werden
- Backup/Restore-Prozeduren erstellt werden
- Setup-Schritte erforderlich sind
- Neue Workflows entstehen

**Format:** Neue Sektion mit `id`, `title`, `icon`, `content` (subtitle, description, howTo, tips)

#### 2. ✅ README.md
**IMMER wenn:**
- Version sich ändert (package.json)
- Neue Features in "Features"-Sektion gehören
- Installation/Setup-Schritte ändern
- Technologie-Stack erweitert wird
- Breaking Changes auftreten

#### 3. ✅ ROADMAP.md
**IMMER wenn:**
- Feature-Phasen abgeschlossen werden (📋 → ✅)
- Neue Features implementiert werden
- Prioritäten sich ändern
- Status-Updates nötig sind

#### 4. ✅ CHANGELOG.md
**IMMER wenn:**
- Version-Nummer erhöht wird
- Features hinzugefügt werden
- Bugs gefixt werden
- Breaking Changes eingeführt werden

## 📋 Checkliste VOR jedem Git-Commit

```bash
# Frage dich IMMER:
□ Ist die Feature-Beschreibung in Documentation.tsx?
□ Ist das Feature in README.md erwähnt (falls user-facing)?
□ Ist ROADMAP.md aktualisiert (Status-Änderung)?
□ Ist CHANGELOG.md mit neuer Version aktualisiert?
□ Sind alle Keyboard-Shortcuts dokumentiert?
□ Sind Setup-Schritte vollständig beschrieben?
```

## 🚫 VERBOTEN: "Ich erwähne es kurz, aber dokumentiere es nicht"

❌ **FALSCH:**
```
Ich habe das Backup-System implementiert.
Die Dokumentation ist in BACKUP_SYSTEM.md.
```

✅ **RICHTIG:**
```
Ich habe das Backup-System implementiert.
1. Code: backup-full.ps1 erstellt
2. Docs: BACKUP_SYSTEM.md erstellt
3. Anleitungen: Documentation.tsx um "4-Ebenen Backup-System" erweitert
4. ROADMAP: Phase 9 als abgeschlossen markiert
5. README: Version 1.7.1 mit Backup-Features aktualisiert
```

## 🎯 Spezielle Regeln für dieses Projekt

### "Anleitungen"-Sektion ist DAS zentrale Benutzer-Manual
- **Zielgruppe:** Wolfgang im Büro, ohne VS Code, nur mit der App
- **Sprache:** Deutsch, klar, Schritt-für-Schritt
- **Format:** howTo mit nummerierten Schritten, tips mit Emoji
- **Beispiele:** PowerShell-Befehle mit echten Pfaden

### Bei Keyboard-Shortcuts:
- SOFORT in Documentation.tsx unter "UI-Interaktionen"
- SOFORT in README.md unter "Bedienung & Interaktionen"
- SOFORT in allen betroffenen Komponenten-Kommentaren

### Bei Backup/Recovery-Features:
- SOFORT in Documentation.tsx (Backup-System + Notfall-Wiederherstellung)
- SOFORT in BACKUP_SYSTEM.md (technisch)
- SOFORT in README.md (Feature-Liste)

### Bei neuen Seiten/Modulen:
- SOFORT in Documentation.tsx (Wie benutzt man es?)
- SOFORT in README.md (Was ist es?)
- SOFORT in ROADMAP.md (Status-Update)

## 🤖 Für AI-Assistenten: Implementierungs-Workflow

```
1. Feature implementieren (Code schreiben)
2. Documentation.tsx aktualisieren (SOFORT, nicht auf Nachfrage!)
3. README.md prüfen & ggf. aktualisieren
4. ROADMAP.md Status aktualisieren
5. CHANGELOG.md neue Version hinzufügen (falls nötig)
6. Alle Dateien in einem Commit zusammenfassen
7. Commit-Message: "feat: [Feature] inkl. vollständiger Dokumentation"
```

## 🔍 Selbst-Check vor Abschluss

Frage dich bei JEDEM abgeschlossenen Feature:

1. **Kann Wolfgang dieses Feature ohne meine Hilfe nutzen?**
   - Wenn NEIN → Documentation.tsx fehlt!

2. **Sind alle Schritte dokumentiert (Setup, Verwendung, Troubleshooting)?**
   - Wenn NEIN → howTo ergänzen!

3. **Sind alle Keyboard-Shortcuts / Interaktionen erklärt?**
   - Wenn NEIN → UI-Interaktionen Sektion ergänzen!

4. **Würde Wolfgang im Notfall (ohne VS Code) damit zurechtkommen?**
   - Wenn NEIN → PowerShell-Befehle hinzufügen!

## ⚡ Quick Reference: Was gehört wohin?

| Änderung | Documentation.tsx | README.md | ROADMAP.md | CHANGELOG.md |
|----------|-------------------|-----------|------------|--------------|
| Neues UI-Feature | ✅ JA | ✅ JA | ✅ JA | ✅ JA |
| Keyboard-Shortcut | ✅ JA | ✅ JA | ❌ NEIN | ✅ JA |
| Bugfix | ❌ NEIN | ❌ NEIN | ❌ NEIN | ✅ JA |
| Backup-Feature | ✅ JA | ✅ JA | ✅ JA | ✅ JA |
| API-Änderung | ⚠️ FALLS User-sichtbar | ⚠️ FALLS Breaking | ✅ JA | ✅ JA |
| Refactoring | ❌ NEIN | ❌ NEIN | ❌ NEIN | ⚠️ FALLS Breaking |
| Setup-Prozedur | ✅ JA | ✅ JA | ❌ NEIN | ✅ JA |

## 💡 Beispiele aus der Vergangenheit (lernen!)

### ❌ SCHLECHT (was passiert ist):
```
Commit: "feat: 4-Ebenen Backup-System implementiert"
Dateien: backup-full.ps1, BACKUP_SYSTEM.md, App.tsx, nasStorage.ts
Problem: Documentation.tsx NICHT aktualisiert → User fragte nach
```

### ✅ GUT (wie es sein sollte):
```
Commit: "feat: 4-Ebenen Backup-System inkl. vollständiger Dokumentation"
Dateien:
  - backup-full.ps1 (Code)
  - BACKUP_SYSTEM.md (technisch)
  - Documentation.tsx (Anleitungen für Wolfgang)
  - README.md (Feature-Liste aktualisiert)
  - ROADMAP.md (Phase 9 abgeschlossen)
  - CHANGELOG.md (v1.7.1)
```

## 🎓 Lernziel für AI-Assistenten

**"Dokumentation ist nicht das letzte, sondern das ERSTE an das du denkst!"**

Wenn du Code schreibst, frage dich SOFORT:
- Wo würde Wolfgang nachschauen, um das zu benutzen? → Da muss die Doku hin!
- Welche Schritte muss er ausführen? → howTo schreiben!
- Was kann schiefgehen? → Troubleshooting ergänzen!
- Gibt es Shortcuts/Tricks? → tips hinzufügen!

## 📌 Diese Datei ist PFLICHTLEKTÜRE

Jeder AI-Assistant sollte diese Datei VOR der ersten Änderung lesen und die Regeln internalisieren.

**Erinnerung:** Wolfgang hat die "Anleitungen"-Sektion EXTRA dafür erstellt, dass solche Dinge automatisch dokumentiert werden. Respektiere diese Arbeit und nutze sie!
