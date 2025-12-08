# Android PWA - Mobile Companion App

> Progressive Web App für Quick-Capture unterwegs

## Übersicht

Die Android PWA ist eine **Mobile-Ergänzung** zur Desktop-Anwendung. Sie ermöglicht schnelles Erfassen von Ideen, Fotos und Notizen unterwegs, während komplexe Aufgaben auf dem Desktop erledigt werden.

### Philosophie

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  Desktop (Windows)          Mobile (Android)    │
│  ─────────────────          ────────────────    │
│  • Vollversion              • Quick-Capture     │
│  • Kommandozentrale         • Feldnotizen       │
│  • Komplexe Formulare       • Foto-Upload       │
│  • Rezept-Editor            • Schnell erfassen  │
│  • Excel-Import/Export      • Read-Only Views   │
│  • Git-Remote-Setup         • Favoriten         │
│                                                 │
│         ↕︎ Git-Sync (GitHub) ↕︎                  │
│         Auto-Pull / Auto-Push                   │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Technologie-Stack

### Progressive Web App (PWA)

**Was ist eine PWA?**
- Web-App, die wie native App aussieht und funktioniert
- Installierbar auf Smartphone (Icon auf Startbildschirm)
- Offline-Modus via Service Worker
- Kein App Store nötig

**Tech-Stack:**
- ✅ React 18 (gleicher Code wie Desktop)
- ✅ TypeScript (gleiche Types)
- ✅ TailwindCSS (Mobile-First Responsive)
- ✅ Service Worker (Offline-Caching)
- ✅ LocalStorage (gleiche Datenbasis)
- ✅ Git-Sync (identischer Service)

**Vorteile:**
- 🚀 80% Code-Wiederverwendung
- 🚀 Ein Codebase für beide Plattformen
- 🚀 Auto-Updates (kein Store-Approval)
- 🚀 Keine Store-Gebühren
- 🚀 Schnelle Entwicklung (4-5 Wochen)

---

## Funktionsumfang

### ✅ Quick-Entry Features (Priorität 1)

#### 1. Notizen schnell erfassen
```
┌─────────────────────────┐
│  📝 Neue Notiz          │
├─────────────────────────┤
│ Titel: [___________]    │
│ Typ: [Idee ▼]           │
│ Projekt: [Ohne ▼]       │
│                         │
│ Inhalt:                 │
│ ┌─────────────────────┐ │
│ │                     │ │
│ │                     │ │
│ └─────────────────────┘ │
│                         │
│ 📷 Foto  🏷️ Tags        │
│         [Speichern]     │
└─────────────────────────┘
```

**Use Case:**
- Unterwegs: Idee kommt → Smartphone raus → Notiz tippen → Foto machen → Speichern
- Desktop: Auto-Pull → Notiz ist da → Ausarbeiten

#### 2. Foto-Upload direkt von Kamera
```
Kamera öffnen → Foto schießen → Zu Entität hinzufügen
                                 ↓
                        Base64-Speicherung
                                 ↓
                          Git-Auto-Commit
                                 ↓
                          Desktop sieht Bild
```

#### 3. Schnelles Projekt/Produkt anlegen
```
┌─────────────────────────┐
│  📁 Neues Projekt       │
├─────────────────────────┤
│ Name: [Markttest Graz]  │
│ Status: [Aktiv ▼]       │
│ Beschreibung:           │
│ ┌─────────────────────┐ │
│ │ Kurze Notiz...      │ │
│ └─────────────────────┘ │
│         [Erstellen]     │
└─────────────────────────┘

→ In Desktop weiter vervollständigen
```

**Use Case:**
- Auf Messe/Event: Neuer Kontakt → Projekt anlegen → Notiz dazu
- Desktop: Details ergänzen, Produkte zuordnen, Rezepte entwickeln

#### 4. Voice-Memo (optional - Phase 2)
```
🎤 Aufnahme starten → Sprechen → Stop → Text-Transkription → Als Notiz
```

### 📱 Read-Only Features (Priorität 2)

**Was mobil ansehbar ist:**
- ✅ Projekte-Liste (kompakte Cards)
- ✅ Produkte mit Versionen (Tree-View vereinfacht)
- ✅ Rezepte anzeigen (Zutaten + Anleitung)
- ✅ Kontakte durchsuchen
- ✅ Favoriten-Schnellzugriff
- ✅ Global Search (vereinfacht)
- ✅ Tags filtern

**Was NUR auf Desktop bleibt:**
- ❌ Rezept-Editor mit Zutatenverwaltung (zu komplex)
- ❌ Excel-Import/Export
- ❌ Git-Remote-Setup (einmalig auf Desktop)
- ❌ Vollständige Kalkulationen (nur Ergebnis anzeigen)
- ❌ Dokumenten-Pfadverwaltung (nur URLs/Google Photos mobil)
- ❌ KI-Assistenten API-Keys (Sicherheit)

---

## Datentransfer & Synchronisation

### Git-Sync-Workflow

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│  📱 Smartphone          ☁️  GitHub          💻 Desktop│
│  ─────────────          ────────          ────────   │
│  LocalStorage    ←→     Remote      ←→   LocalStorage│
│  (Quick)               (Sync Hub)         (Full)     │
│                                                      │
│  1. App öffnen                           1. App öffnen│
│  2. Auto-Pull  ─────→  Remote  ←────── 2. Auto-Pull  │
│  3. Notiz erstellen                    3. Ausarbeiten│
│  4. Auto-Commit ────→  Push    ←────── 4. Auto-Commit│
│  5. Auto-Push                          5. Auto-Push  │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Synchronisations-Strategie

**Automatisch:**
- 📱 **Mobile öffnet** → Auto-Pull (holt Desktop-Änderungen)
- 📱 **Mobile erstellt/ändert** → Auto-Commit → Auto-Push
- 💻 **Desktop öffnet** → Auto-Pull (holt Mobile-Einträge)
- 💻 **Desktop ändert** → Auto-Commit → Auto-Push

**Konflikt-Vermeidung:**
- Mobile: Hauptsächlich **neue** Einträge (create)
- Mobile: Nur einfache Updates (Notizen, Status)
- Desktop: Komplexe Updates (Rezepte, Kalkulationen)
- Zeitstempel: Neueste Änderung gewinnt

**Bei Konflikten:**
```
┌─────────────────────────┐
│  ⚠️  Merge-Konflikt     │
├─────────────────────────┤
│ Remote und lokal haben  │
│ unterschiedliche        │
│ Änderungen.             │
│                         │
│ [Remote übernehmen]     │  ← Empfohlen
│ [Lokal behalten]        │
└─────────────────────────┘
```

### Offline-Modus

**Service Worker cached:**
- HTML, CSS, JavaScript (alle Assets)
- Daten aus LocalStorage verfügbar
- Neue Einträge in Warteschlange
- Sync sobald online

```javascript
// Offline-Strategie
if (navigator.onLine) {
  await gitPull();  // Neueste Daten holen
} else {
  console.log('Offline - Queue für später');
}
```

---

## Mobile UI Design

### Layout-Struktur

```
┌─────────────────────────┐
│ 🌿 Gurktaler Mobile     │  ← Header (kompakt)
│ ───────────────────────  │
│                         │
│                         │
│    Content Area         │  ← Scrollbar
│    (Bottom Nav frei)    │
│                         │
│                         │
├─────────────────────────┤
│ 🏠 │ ➕ │ ⭐ │ 🔍 │ ⚙️ │  ← Bottom Navigation
│Home│New│Fav│Search│Set│
└─────────────────────────┘
```

### Bottom Navigation

| Icon | Label | Funktion |
|------|-------|----------|
| 🏠 | Home | Dashboard mit Favoriten + Statistik |
| ➕ | New | Quick-Entry (Notiz/Projekt/Foto) |
| ⭐ | Favorites | Favoriten-Schnellzugriff |
| 🔍 | Search | Global Search (vereinfacht) |
| ⚙️ | Settings | Git-Status, Sync, Export |

### Dashboard (Home)

```
┌─────────────────────────┐
│ 🌿 Gurktaler Mobile     │
│ ───────────────────────  │
│                         │
│ ⭐ Favoriten (3)        │
│ ┌─────────────────────┐ │
│ │ 🍾 Gurktaler Classic│ │
│ │ Status: In Test     │ │
│ │ Version: X2         │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ 📁 Markttest Graz   │ │
│ │ 5 Produkte, 3 Notizen│ │
│ └─────────────────────┘ │
│                         │
│ 📝 Schnell erfassen     │
│ [➕ Notiz] [📷 Foto]   │
│                         │
│ 📊 Übersicht            │
│ 📂 12 Projekte          │
│ 🍾 28 Produkte          │
│ 📋 15 Rezepte           │
│ 👥  8 Kontakte          │
└─────────────────────────┘
```

### Quick-Entry Modal

```
┌─────────────────────────┐
│ ✕              Neu      │
├─────────────────────────┤
│ [📝 Notiz            ] │
│ [📁 Projekt          ] │
│ [🍾 Produkt (minimal)] │
│ [📷 Foto hochladen   ] │
└─────────────────────────┘
```

### Compact Cards

```
┌─────────────────────────┐
│ 🍾 Gurktaler Reserve    │  ← Icon + Name
│ ─────────────────────    │
│ Projekt: Markttest Graz │
│ Status: 🟢 In Test      │
│ Version: X1.2           │
│                         │
│ [Öffnen]         ⭐     │  ← Action + Favorite
└─────────────────────────┘
```

---

## Entwicklungsplan

### Phase 1: PWA Basis (2 Wochen)

**Woche 1:**
- [ ] Responsive CSS ergänzen (TailwindCSS Mobile-First)
  - Breakpoints: sm (640px), md (768px), lg (1024px)
  - Bottom Navigation Komponente
  - Compact Card Design
- [ ] PWA Manifest (`public/manifest.json`)
  ```json
  {
    "name": "Gurktaler Mobile",
    "short_name": "Gurktaler",
    "icons": [
      { "src": "/icon-192.png", "sizes": "192x192" },
      { "src": "/icon-512.png", "sizes": "512x512" }
    ],
    "start_url": "/",
    "display": "standalone",
    "theme_color": "#B87333",
    "background_color": "#F8F6F3"
  }
  ```
- [ ] Service Worker Setup (`src/sw.ts`)
  - Asset-Caching
  - Offline-Strategie
- [ ] Quick-Entry Komponente
  - Notiz-Formular (vereinfacht)
  - Foto-Upload via Camera API
  - Projekt-Quick-Create

**Woche 2:**
- [ ] Bottom Navigation implementieren
- [ ] Dashboard (Home) mit Favoriten
- [ ] Compact Cards für alle Entitäten
- [ ] Mobile-Ansichten für Projekte/Produkte/Rezepte
- [ ] Testing auf Android Chrome

### Phase 2: Git-Sync Mobile (1 Woche)

- [ ] Git-Service auf Mobile portieren
  - Identischer Code wie Desktop
  - UI-Anpassungen für Mobile
- [ ] Auto-Pull beim App-Start
- [ ] Auto-Commit/Push bei Änderungen
- [ ] Konflikt-Dialog (vereinfacht)
- [ ] Offline-Queue für Sync

### Phase 3: Read-Only Views (1 Woche)

- [ ] Projekte-Liste (kompakt)
- [ ] Produkte mit Tree-View (vereinfacht)
- [ ] Rezepte-Ansicht (nur lesen)
- [ ] Kontakte durchsuchen
- [ ] Global Search (Filter reduziert)
- [ ] Favoriten-Management

### Phase 4: Testing & Deployment (1 Woche)

- [ ] Android Chrome Testing
- [ ] iOS Safari Testing (optional)
- [ ] Offline-Sync validieren
- [ ] Performance-Optimierung
  - Lazy Loading
  - Image-Optimization
  - Code-Splitting
- [ ] Deployment zu GitHub Pages

**Gesamt: 4-5 Wochen für vollständige PWA**

---

## Deployment

### GitHub Pages Setup

**1. Build-Konfiguration:**
```json
// package.json
{
  "scripts": {
    "build:mobile": "vite build --base=/gurktaler-mobile/",
    "deploy:mobile": "gh-pages -d dist"
  },
  "devDependencies": {
    "gh-pages": "^6.0.0"
  }
}
```

**2. Deployment:**
```bash
# Build erstellen
npm run build:mobile

# Zu GitHub Pages deployen
npm run deploy:mobile

# Oder manuell:
gh-pages -d dist
```

**3. GitHub Repository Settings:**
- Repository → Settings → Pages
- Source: gh-pages branch
- URL: `https://woku369.github.io/gurktaler-mobile`

### Installation auf Smartphone

**Android (Chrome):**
1. Smartphone → Chrome öffnen
2. URL eingeben: `https://woku369.github.io/gurktaler-mobile`
3. Chrome-Menü (⋮) → "App installieren" oder "Zum Startbildschirm"
4. Icon erscheint auf Startbildschirm
5. App öffnet sich wie native App (ohne Browser-UI)

**iOS (Safari) - optional:**
1. Safari öffnen → URL eingeben
2. Teilen-Button → "Zum Home-Bildschirm"
3. Icon hinzufügen

---

## Technische Details

### Service Worker

```javascript
// src/sw.ts
const CACHE_NAME = 'gurktaler-mobile-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/index.css',
  '/assets/index.js',
];

// Install: Cache Assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Fetch: Cache-First-Strategie
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// Activate: Alte Caches löschen
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});
```

### Responsive Breakpoints

```css
/* TailwindCSS Config */
module.exports = {
  theme: {
    screens: {
      'sm': '640px',   // Mobile groß
      'md': '768px',   // Tablet
      'lg': '1024px',  // Desktop klein
      'xl': '1280px',  // Desktop
      '2xl': '1536px', // Desktop groß
    }
  }
}
```

**Verwendung:**
```tsx
<div className="
  w-full           /* Mobile: Full Width */
  md:w-1/2         /* Tablet: Half Width */
  lg:w-1/3         /* Desktop: Third Width */
">
  ...
</div>
```

### Camera API

```typescript
// Foto von Kamera
async function capturePhoto(): Promise<string> {
  const stream = await navigator.mediaDevices.getUserMedia({ 
    video: { facingMode: 'environment' } // Rückkamera
  });
  
  const video = document.createElement('video');
  video.srcObject = stream;
  await video.play();
  
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d')!.drawImage(video, 0, 0);
  
  stream.getTracks().forEach(track => track.stop());
  
  return canvas.toDataURL('image/jpeg', 0.8); // Base64
}
```

---

## Sicherheit & Datenschutz

### Datenschutz

**Lokale Speicherung:**
- ✅ Alle Daten in LocalStorage (lokal auf Gerät)
- ✅ Keine Cloud-Anbieter außer GitHub
- ✅ Private GitHub-Repository = volle Kontrolle

**Git-Übertragung:**
- ✅ HTTPS verschlüsselt
- ✅ Personal Access Token (nicht Passwort)
- ✅ Keine Daten an Dritte

### Sicherheit

**API-Keys:**
- ❌ NICHT in Mobile-App speichern
- ✅ Nur auf Desktop (verschlüsselt)
- ✅ Mobile: KI-Features deaktiviert

**LocalStorage:**
- ✅ Android 6+: Verschlüsselt
- ✅ iOS: Keychain-geschützt

---

## Testing-Strategie

### Vor Entwicklungsstart

**1. Responsive-Test (Desktop-App):**
```bash
npm run electron:dev
# Chrome DevTools → Device Toolbar (Strg+Shift+M)
# Gerät: Pixel 7, iPhone 12 Pro
```

**Check:**
- [ ] Layout bricht nicht um
- [ ] Buttons erreichbar
- [ ] Forms nutzbar
- [ ] Navigation funktioniert

**2. LocalStorage-Kompatibilität:**
```javascript
// Testen: Mobile kann Desktop-Daten lesen
const data = localStorage.getItem('gurktaler_data');
console.log(JSON.parse(data));
```

### Während Entwicklung

**1. Chrome DevTools:**
- Application Tab → Service Worker Status
- Application Tab → Cache Storage
- Network Tab → Offline-Modus simulieren

**2. Android Chrome Remote Debugging:**
```bash
# Android-Gerät via USB verbinden
# Chrome → chrome://inspect → Devices
# → Inspect auf Smartphone-Browser
```

### Beta-Testing

**1. Woche: Real-World-Test:**
- Unterwegs nutzen (Bus, Café, Laden)
- Notizen erfassen
- Fotos hochladen
- Offline-Modus testen
- Sync-Verhalten prüfen

**2. Woche: Feedback-Runde:**
- Geschwindigkeit OK?
- UI verständlich?
- Features fehlen?
- Bugs gefunden?

---

## Nächste Schritte (nach Desktop v1.0)

### Sofort nach v1.0 Desktop-Release:

1. **Responsive-Audit** (1 Tag)
   - Desktop-App in Chrome Mobile-View testen
   - Liste: Welche Komponenten brauchen Anpassung?
   - Priorität: Bottom Nav, Compact Cards, Quick-Entry

2. **Minimal-PWA** (3 Tage)
   - Service Worker + Manifest
   - Bottom Navigation
   - Quick-Entry für Notizen
   - Foto-Upload
   - → Auf eigenem Smartphone installieren & testen

3. **Git-Sync Mobile** (3 Tage)
   - Git-Service identisch übernehmen
   - UI für Mobile anpassen
   - Konflikt-Dialog vereinfachen
   - → Sync zwischen Desktop & Mobile testen

4. **Beta-Phase** (1 Woche)
   - Im Alltag nutzen
   - Feedback sammeln
   - Bugfixes
   - Performance-Tuning

5. **Production-Deployment** (1 Tag)
   - GitHub Pages Setup
   - Domain (optional): `mobile.gurktaler.app`
   - Dokumentation finalisieren

**Zeitplan:**
- Desktop v1.0: Diese Woche
- Android PWA Beta: 2-3 Wochen nach Desktop-Release
- Android PWA Production: 4-5 Wochen nach Desktop-Release

---

## Offene Fragen & Entscheidungen

### Vor Start klären:

- [ ] Domain: GitHub Pages oder eigene Domain?
- [ ] iOS-Support: Auch für Safari optimieren?
- [ ] Kamera: Vorder- oder Rückkamera default?
- [ ] Voice-Memo: Priorität in Phase 1 oder 2?
- [ ] Dark Mode: Auch mobil?

### Während Entwicklung:

- [ ] Welche Features wirklich mobil nötig?
- [ ] Wie viel Offline-Speicher (LocalStorage-Limit)?
- [ ] Push-Notifications für Sync-Status?

---

## Kontakt & Support

**Entwickler:** GitHub Copilot  
**Repository:** woku369/Gurktaler-2.0  
**Dokumentation:** `/docs/ANDROID_PWA.md`

**Bei Fragen:**
1. ROADMAP.md → Phase 9 checken
2. Dieser Dokumentation folgen
3. GitHub Issues erstellen

---

**Letzte Aktualisierung:** 8. Dezember 2025  
**Status:** 📋 Geplant für nach Desktop v1.0
