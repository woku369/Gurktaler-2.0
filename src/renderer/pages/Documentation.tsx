import { useState } from "react";
import {
  BookOpen,
  FolderKanban,
  Package,
  FlaskConical,
  Beaker,
  Archive,
  StickyNote,
  Users,
  Globe,
  Tag,
  Search,
  Settings,
  FileText,
  ChevronDown,
  ChevronRight,
  Smartphone,
  ShieldAlert,
  Clock,
  Database,
} from "lucide-react";

type Section = {
  id: string;
  title: string;
  icon: typeof BookOpen;
  content: {
    subtitle?: string;
    description: string;
    features?: string[];
    howTo?: { title: string; steps: string[] }[];
    tips?: string[];
  };
};

const sections: Section[] = [
  {
    id: "overview",
    title: "Übersicht",
    icon: BookOpen,
    content: {
      subtitle: "Gurktaler 2.0 - Produktentwicklung & Wissensmanagement",
      description:
        "Gurktaler 2.0 ist eine Desktop- und Mobile-Anwendung zur Verwaltung von Produktentwicklungsprojekten, Rezepturen, Notizen und Kontakten. Die App nutzt zentralen NAS-Speicher (Synology) über Tailscale VPN für Multi-Gerät-Synchronisation.",
      features: [
        "Desktop-App (Windows) mit direktem NAS-Zugriff",
        "Mobile PWA (iOS/Android) mit vollständiger Schreibfunktion",
        "Projekt- und Produktverwaltung mit Versionierung",
        "Zeitplanung (Gantt-Chart) mit Abhängigkeiten und Kapazitätsauslastung",
        "Timeline mit Drag & Drop: Strg+Drag für horizontale Verschiebung (Startdatum ändern)",
        "Universelle Drag & Drop Sortierung in allen Card-basierten Ansichten",
        "Listen-Ansichten für Zutaten (mit Kategorie-Sortierung) und Tags",
        "Rezepturverwaltung mit Zutatendatenbank",
        "Gebindeverwaltung (Flaschen, Etiketten, Verschlüsse)",
        "Notizen mit Markdown-Support",
        "Kontakt- und Weblink-Verwaltung",
        "Tag-System zur Organisation",
        "Volltext-Suche über alle Bereiche",
        "Bild-Upload (lokal & URL)",
        "JSON Export/Import & automatisches Backup-System",
        "Automatische Synchronisation zwischen Desktop und Mobile",
      ],
    },
  },
  {
    id: "mobile",
    title: "Mobile PWA",
    icon: Smartphone,
    content: {
      subtitle: "Gurktaler unterwegs - PWA Installation & Nutzung",
      description:
        "Die Progressive Web App (PWA) ermöglicht volle Gurktaler-Funktionalität auf Smartphone und Tablet - mit vollständiger Schreib- und Leseberechtigung. Alle Daten werden über einen Custom API Server (Port 3002) auf dem NAS gespeichert und automatisch mit der Desktop-App synchronisiert.",
      howTo: [
        {
          title: "Installation auf Android/iOS",
          steps: [
            "Verbinde zum Tailscale VPN (wichtig!)",
            "Öffne Chrome/Safari: http://100.121.103.107/gurktaler/",
            'Android: Chrome-Menü → "Zum Startbildschirm hinzufügen"',
            'iOS: Safari-Teilen → "Zum Home-Bildschirm"',
            "PWA-Icon erscheint auf dem Home-Screen",
            "App läuft jetzt wie native App im Vollbild",
          ],
        },
        {
          title: "Erste Schritte mit der PWA",
          steps: [
            "App über Home-Screen-Icon öffnen",
            "Dashboard zeigt Übersicht aller Daten",
            "Navigation über Bottom-Bar oder Burger-Menü",
            "QuickNote-Button (💭) für schnelle Notizen",
            "Alle Daten werden sofort auf NAS gespeichert",
            "Desktop-App zeigt Änderungen automatisch an",
          ],
        },
        {
          title: "Schreib-Operationen testen",
          steps: [
            "Erstelle testweise ein neues Projekt",
            "Oder nutze QuickNote-Button für Notiz",
            "Warte 1-2 Sekunden auf Speicherung",
            "Öffne Desktop-App → Daten sollten sofort sichtbar sein",
            "Bei Problemen: start-server.ps1 -Restart ausführen",
          ],
        },
      ],
      tips: [
        "PWA funktioniert nur über Tailscale VPN (100.121.103.107)",
        "Server läuft auf Port 3002 (Node.js Custom API Server)",
        "Bei Offline-Betrieb: Cached Version wird geladen (Read-Only)",
        "Hard-Refresh: Chrome-Menü → 'App neu laden' (löscht Cache)",
        "Desktop und Mobile nutzen gleiche JSON-Dateien auf NAS",
        "Änderungen sind sofort auf allen Geräten sichtbar",
        'Server-Status prüfen: Windows-Desktop → "check-server.ps1" ausführen',
        'Server neustarten: Windows-Desktop → "start-server.ps1 -Restart"',
      ],
    },
  },
  {
    id: "projects",
    title: "Projekte",
    icon: FolderKanban,
    content: {
      description:
        "Projekte sind Container für zusammenhängende Produkte, Notizen und Kontakte. Sie haben einen Status (In Planung, Aktiv, Pausiert, Abgeschlossen, Archiviert). Mit Timeline-Visualisierung und Workspace-Verwaltung.",
      howTo: [
        {
          title: "Neues Projekt erstellen",
          steps: [
            'Klicke auf "Neues Projekt" Button',
            "Gib Namen und Beschreibung ein",
            "Wähle den Status",
            "Weise Projekt einem Workspace (Ebene) zu",
            "Speichern",
            "Optional: Tags hinzufügen nach Erstellung",
          ],
        },
        {
          title: "Produkte zuordnen",
          steps: [
            "Gehe zu Produkte-Seite",
            "Erstelle oder bearbeite Produkt",
            "Wähle Projekt aus Dropdown",
            "Produkt wird im Projekt verknüpft",
          ],
        },
        {
          title: "Timeline-Ansicht nutzen",
          steps: [
            "Navigation → Timeline",
            "Gantt-Chart zeigt alle Projekte chronologisch",
            "Strg + Drag auf Projekt-Balken: Horizontal verschieben",
            "Projekt wird mit neuem Startdatum aktualisiert",
            "Farbcodierung nach Workspace",
          ],
        },
        {
          title: "Workspaces (Ebenen) filtern",
          steps: [
            'Tab "Alle Ebenen" auswählen',
            "Checkboxen erscheinen über Workspace-Tabs",
            "Checkbox deaktivieren = Workspace ausblenden",
            "Nur aktive Workspaces werden angezeigt",
            "Filter funktioniert auf Projekt- und Timeline-Seite",
          ],
        },
      ],
      tips: [
        "Nutze Tags für projektübergreifende Kategorisierung",
        'Status "Pausiert" für zurückgestellte Projekte',
        "Notizen mit Projekt verknüpfen für Kontext",
        "Workspaces für thematische Gruppierung (z.B. 'Kleinserien', 'Forschung')",
        "Timeline-Drag für schnelle Planungsanpassungen",
        "Workspace-Filter für fokussierte Ansicht",
      ],
    },
  },
  {
    id: "products",
    title: "Produkte",
    icon: Package,
    content: {
      description:
        "Produkte können versioniert werden (X → X1 → X1.1). Jedes Produkt hat Status, Gebinde-Zuordnung und optional Alkoholsteuerberechnung.",
      howTo: [
        {
          title: "Produkt erstellen",
          steps: [
            'Klicke auf "Neues Produkt"',
            "Name, Version, Beschreibung eingeben",
            "Status wählen (Entwurf, In Test, Freigegeben)",
            "Optional: Projekt zuweisen",
            "Optional: Gebinde auswählen (Größe wird übernommen)",
            "Bei Alkohol: Alkoholgehalt eingeben",
            'Checkbox "Alkoholsteuer einbeziehen" aktiviert Berechnung (12€/L)',
          ],
        },
        {
          title: "Neue Version erstellen",
          steps: [
            'In Produkt-Karte auf "Neue Version" klicken',
            "Formular wird mit Daten vorausgefüllt",
            "Versionsnummer anpassen (z.B. X1, X1.1)",
            "Änderungen vornehmen",
            "Speichern - neue Version ist mit Parent verknüpft",
          ],
        },
      ],
      tips: [
        "Alkoholsteuer wird automatisch berechnet: Gebindegröße × Alkohol% × 12€/L",
        "Archivierte Produkte mit Begründung dokumentieren",
        "Tags für Produktmerkmale (Bio, Premium, etc.)",
        "Bilder hochladen oder von URL einfügen",
      ],
    },
  },
  {
    id: "recipes",
    title: "Rezepturen",
    icon: FlaskConical,
    content: {
      description:
        "Rezepturen verwalten Mazerate, Destillate und Ausmischungen mit Zutatenlisten, Anleitung und Ausbeute. Optional mit Produkt verknüpft.",
      howTo: [
        {
          title: "Rezeptur erstellen",
          steps: [
            'Klicke auf "Neue Rezeptur"',
            "Name und Typ wählen (Mazerat/Destillat/Ausmischung)",
            "Optional: Mit Produkt verknüpfen",
            "Anleitung/Herstellungsschritte eingeben",
            "Ausbeute: Menge und Einheit (ml/L)",
            "Speichern",
          ],
        },
        {
          title: "Zutaten hinzufügen",
          steps: [
            "Rezeptur öffnen (bearbeiten)",
            'Im Abschnitt "Zutaten" auf "Zutat hinzufügen"',
            "Zutat aus Dropdown wählen",
            "Menge und Einheit eingeben",
            "Optional: Notiz zur Zutat",
            "Zutaten per Drag & Drop sortieren",
          ],
        },
      ],
      tips: [
        "Erstelle Zutaten-Stammdaten vor Rezepturerstellung",
        "Tags für Rezepttypen (Saisonal, Klassiker, etc.)",
        "Bilder vom Herstellungsprozess hochladen",
        "Anleitung mit Markdown formatieren",
      ],
    },
  },
  {
    id: "ingredients",
    title: "Zutaten",
    icon: Beaker,
    content: {
      description:
        "Zutatendatenbank mit Alkoholgehalt, Kategorie und Preis pro Einheit (Liter/Kilogramm). Basis für Rezepturen.",
      howTo: [
        {
          title: "Zutat anlegen",
          steps: [
            'Klicke auf "Neue Zutat"',
            "Name eingeben",
            "Alkoholgehalt in %vol. (bei alkoholischen Zutaten)",
            "Kategorie (frei wählbar: Spirituose, Gewürz, etc.)",
            "Preis pro Einheit und Einheit (Liter/Kilogramm)",
            "Optional: Bemerkung",
            "Nach Erstellung: Tags und Bilder hinzufügen",
          ],
        },
      ],
      tips: [
        "Kategorien einheitlich benennen für bessere Suche",
        "Preise aktuell halten für Kalkulation",
        "Tags für Lieferanten oder Herkunft",
      ],
    },
  },
  {
    id: "containers",
    title: "Gebinde",
    icon: Archive,
    content: {
      description:
        "Gebindeverwaltung für Flaschen, Etiketten, Verschlüsse, Verpackungen. Wird in Produkten referenziert.",
      howTo: [
        {
          title: "Gebinde erstellen",
          steps: [
            'Klicke auf "Neues Gebinde"',
            "Name eingeben",
            "Typ wählen (Flasche, Etikett, Verschluss, Verpackung)",
            "Volumen in ml (bei Flaschen)",
            "Preis pro Einheit",
            "Optional: Bemerkung",
            "Nach Erstellung: Bilder hochladen, Tags hinzufügen",
          ],
        },
      ],
      tips: [
        "Standardgrößen als Vorlagen anlegen (250ml, 500ml, 1000ml)",
        "Fotos von Flaschen und Etiketten hochladen",
        "Lieferanten-Tags für Bestellverwaltung",
      ],
    },
  },
  {
    id: "notes",
    title: "Notizen",
    icon: StickyNote,
    content: {
      description:
        "Notizen für Ideen, Aufgaben, Recherche. Mit Markdown-Support und Projekt-Zuordnung. Chaosablage für unstrukturierte Gedanken.",
      howTo: [
        {
          title: "Notiz erstellen",
          steps: [
            "Quick-Entry: Titel eingeben und Enter (oben auf Seite)",
            'Oder "Neue Notiz" Button',
            "Titel und Inhalt eingeben (Markdown unterstützt)",
            "Typ wählen (Idee, Notiz, Aufgabe, Recherche)",
            "Optional: Projekt zuweisen",
            "Speichern",
          ],
        },
        {
          title: "Markdown nutzen",
          steps: [
            "Im Edit-Modus schreiben",
            "Toggle zu Preview-Modus für Vorschau",
            "Syntax: # Überschrift, **fett**, *kursiv*, - Liste",
            "Links: [Text](URL)",
          ],
        },
      ],
      tips: [
        "Chaosablage (ohne Projekt) für spontane Ideen",
        "Filter-Tabs nutzen für schnelle Übersicht",
        "Tags für Kategorisierung über Projekte hinweg",
        "Bilder direkt in Notizen einbetten",
      ],
    },
  },
  {
    id: "contacts",
    title: "Kontakte",
    icon: Users,
    content: {
      description:
        "Kontaktverwaltung für Lieferanten, Partner, Kunden. Mit vCard-Import, mehreren Telefonnummern/E-Mails und selbst definierbaren Kategorien.",
      howTo: [
        {
          title: "Kontakt erstellen",
          steps: [
            'Klicke auf "Neuer Kontakt"',
            "Name, Firma eingeben",
            "Typ wählen (Lieferant, Partner, Kunde, oder eigene Kategorie)",
            "E-Mail-Adressen: Mehrere möglich mit Labels (Geschäftlich, Privat, etc.)",
            "Telefonnummern: Mehrere möglich mit Labels (Mobil, Festnetz, Fax)",
            "Mit ★ primäre Kontaktdaten markieren",
            "Adresse, Notizen (optional)",
            "Speichern",
          ],
        },
        {
          title: "Mehrere Telefonnummern/E-Mails verwalten",
          steps: [
            'Im Kontaktformular: Klicke "+ Weitere E-Mail hinzufügen"',
            'Oder: "+ Weitere Telefonnummer hinzufügen"',
            "Wert eingeben + Label (z.B. 'Geschäftlich', 'Mobil')",
            "★-Button: Als primär markieren",
            "Rotes X: Eintrag entfernen",
            "Primäre Kontakte werden in Übersicht hervorgehoben",
          ],
        },
        {
          title: "Kontakt-Kategorien definieren",
          steps: [
            "Settings → Kontakt-Kategorien",
            '"+"-Button für neue Kategorie',
            "Name (Anzeigename) und Wert (interner Key) eingeben",
            "Farbe wählen (Preset oder Farbwähler)",
            "Icon wählen (Emoji-Auswahl verfügbar)",
            "Kategorien bearbeiten oder löschen (mit Warnung)",
            "Eigene Kategorien erscheinen im Kontaktformular",
          ],
        },
        {
          title: "Google Contacts importieren",
          steps: [
            "Google Contacts öffnen → Exportieren als vCard",
            'In Gurktaler: Settings → "vCard importieren"',
            "Datei auswählen",
            "Kontakte selektiv auswählen",
            "Typ zuordnen",
            "Importieren",
          ],
        },
        {
          title: "Zu Projekt zuordnen",
          steps: [
            "Kontakt bearbeiten",
            'Abschnitt "Projekt-Zuordnungen"',
            "Projekt auswählen",
            'Optional: Rolle eingeben (z.B. "Hauptlieferant")',
            "Hinzufügen",
          ],
        },
      ],
      tips: [
        "Filter nach Typ für schnellen Zugriff",
        "Tags für weitere Kategorisierung",
        "Projekt-Rollen dokumentieren",
        "Labels helfen bei Kontextualisierung (z.B. 'Notfall', 'Büro', 'Privat')",
        "Primäre Kontakte (★) werden in Kontaktkarten prominent angezeigt",
        "Eigene Kategorien mit passenden Icons und Farben übersichtlicher",
      ],
    },
  },
  {
    id: "weblinks",
    title: "Weblinks",
    icon: Globe,
    content: {
      description:
        "Sammlung von Weblinks für Recherche, Konkurrenzbeobachtung, Lieferanten. Mit Projekt-Zuordnung.",
      howTo: [
        {
          title: "Weblink erstellen",
          steps: [
            'Klicke auf "Neuer Weblink"',
            "URL eingeben (mit https://)",
            "Titel und Beschreibung",
            "Typ wählen (Konkurrenz, Lieferant, Recherche, Sonstiges)",
            "Optional: Projekt zuweisen",
            "Speichern",
          ],
        },
      ],
      tips: [
        "Domain wird automatisch extrahiert",
        "Tags für Themengebiete",
        "Beschreibung für späteren Kontext",
      ],
    },
  },
  {
    id: "tags",
    title: "Tags",
    icon: Tag,
    content: {
      description:
        "Projektübergreifendes Kategorisierungssystem mit Farben. Funktioniert für alle Entitäten.",
      howTo: [
        {
          title: "Tag erstellen",
          steps: [
            'Seite "Tags" → "Neuer Tag"',
            'Name eingeben (z.B. "Bio", "Premium", "Innovation")',
            "Farbe wählen (vordefiniert oder eigene)",
            "Erstellen",
          ],
        },
        {
          title: "Tag zuweisen",
          steps: [
            "Entität bearbeiten (Projekt, Produkt, etc.)",
            'Im Abschnitt "Tags" auf Tag klicken',
            "Mehrfachauswahl möglich",
            "Automatisch gespeichert",
          ],
        },
        {
          title: "Nach Tags filtern",
          steps: [
            "In Listen-Ansichten: Tag-Dropdown nutzen",
            "Wähle Tag aus",
            "Liste wird gefiltert",
          ],
        },
      ],
      tips: [
        "Konsistente Tag-Namen projektübergreifend",
        "Farben nach Bedeutung vergeben",
        "Nicht zu viele Tags pro Entität (max. 3-5)",
      ],
    },
  },
  {
    id: "search",
    title: "Globale Suche",
    icon: Search,
    content: {
      description:
        "Durchsucht alle 8 Bereiche gleichzeitig: Projekte, Produkte, Notizen, Kontakte, Weblinks, Rezepturen, Zutaten, Gebinde.",
      howTo: [
        {
          title: "Suche nutzen",
          steps: [
            'Sidebar → "Suche" oder Suchfeld oben',
            "Suchbegriff eingeben",
            "Ergebnisse werden live angezeigt (Debounce 300ms)",
            "Nach Typ gefiltert mit Badges",
            "Auf Ergebnis klicken für Navigation",
          ],
        },
      ],
      tips: [
        "Durchsucht Namen, Beschreibungen, Notizen, Anleitungen",
        "Weblinks öffnen sich extern",
        "Kategorien-Badges helfen bei Orientierung",
      ],
    },
  },
  {
    id: "images",
    title: "Bilder",
    icon: Package,
    content: {
      description:
        "Bilder können zu Produkten, Rezepturen, Gebinden, Zutaten und Notizen hinzugefügt werden. Zwei Upload-Methoden: Datei-Upload und URL-Import.",
      howTo: [
        {
          title: "Bild hochladen",
          steps: [
            "Entität bearbeiten",
            'Im Abschnitt "Bilder"',
            "Datei per Drag & Drop oder Click",
            'Oder: "Bild von URL einfügen" klicken',
            "URL eingeben (Google Photos Share Link, Imgur, etc.)",
            'Enter oder "Laden" klicken',
            "Bild wird als Base64 gespeichert",
          ],
        },
      ],
      tips: [
        "Max. Anzahl je nach Typ: Produkte 5, Rezepturen 5, Gebinde 3",
        "Google Photos: Bild teilen → Link kopieren → einfügen",
        "CORS kann manche URLs blockieren",
        "Base64-Speicherung = Git-freundlich",
      ],
    },
  },
  {
    id: "documents",
    title: "Dokumentenverwaltung",
    icon: FileText,
    content: {
      description:
        "Verwalte Dokumente für alle Entitäten (Projekte, Produkte, Rezepte, Zutaten, Gebinde, Kontakte). Spare Speicherplatz durch Pfadverwaltung statt Duplikate. Desktop und mobil optimiert.",
      features: [
        "3 Dokumenttypen: Lokale Dateien, URL-Links, Google Photos",
        "6 Kategorien: Rezeptur, Analyse, Marketing, Etikett, Dokumentation, Sonstiges",
        "Dateitypen: PDF, Excel, Word, Bilder (JPG, PNG, WEBP, GIF)",
        "Aktionen: Öffnen (System-App), Im Explorer zeigen, Löschen",
        "Relative Pfade für Portabilität zwischen Geräten",
        "Hybrid-Speicher: Base64-Bilder (mobil), Pfade (Desktop)",
      ],
      howTo: [
        {
          title: "Dokument hinzufügen (Lokale Datei)",
          steps: [
            "Öffne ein Projekt/Produkt/Rezept/etc. im Edit-Modus",
            'Scrolle zur "Dokumente"-Sektion',
            'Klicke "Dokument hinzufügen" → "Lokale Datei"',
            "Wähle Datei im Datei-Browser",
            "Kategorie auswählen (z.B. Analyse für Lab-Reports)",
            "Optional: Beschreibung hinzufügen",
            'Klicke "Hinzufügen"',
            "Datei wird als relative Pfad gespeichert",
          ],
        },
        {
          title: "Dokument hinzufügen (URL/Link)",
          steps: [
            'Klicke "Dokument hinzufügen" → "URL/Link"',
            "URL eingeben (z.B. Dropbox-Link, Website)",
            "Name vergeben (wird als Anzeigename verwendet)",
            "Kategorie auswählen",
            "Optional: Beschreibung",
            'Klicke "Hinzufügen"',
            "Link wird direkt gespeichert",
          ],
        },
        {
          title: "Dokument hinzufügen (Google Photos)",
          steps: [
            'Klicke "Dokument hinzufügen" → "Google Photos Link"',
            "Google Photos öffnen → Bild auswählen",
            'Klicke "Teilen" → "Link erstellen"',
            "Link kopieren und einfügen",
            "Name vergeben",
            "Kategorie auswählen",
            "⚠️ Hinweis: Link öffnet gesamte Bibliothek, nicht nur das Bild",
          ],
        },
        {
          title: "Dokument öffnen/verwalten",
          steps: [
            "Dokumente werden als Cards mit Icon angezeigt",
            "Icon-Farbe zeigt Dateityp (Rot=PDF, Grün=Excel, Blau=Word, Lila=Bild)",
            "Dateiname, Größe und Kategorie sichtbar",
            'Klicke "Öffnen"-Icon: Öffnet Datei mit System-App',
            'Klicke "Im Explorer zeigen": Zeigt Speicherort',
            'Klicke "Löschen": Entfernt Dokumentreferenz (Datei bleibt erhalten)',
          ],
        },
      ],
      tips: [
        "Relative Pfade: Dokumente bleiben verfügbar wenn Projekt-Ordner verschoben wird",
        "Kategorien: Rezeptur (Formeln), Analyse (Lab-Reports), Marketing (Flyer), Etikett (Designs), Dokumentation (Handbücher), Sonstiges",
        "Google Photos Caveat: Link öffnet gesamte Bibliothek, nicht nur einzelnes Bild - für Einzelzugriff besser: Bild herunterladen und als lokale Datei hinzufügen",
        "Desktop-Optimierung: Große Dateien (PDFs, Excel) als Pfad speichern spart Speicher",
        "Mobil-Optimierung: Bilder als Base64 für offline Zugriff",
        "Organisation: Pro Entität nur relevante Dokumente - z.B. Rezepte = Analysen, Kontakte = Verträge, Produkte = Etiketten",
        "Datei nicht gefunden? Tool validiert Existenz beim Öffnen",
      ],
    },
  },
  {
    id: "settings",
    title: "Einstellungen & Export",
    icon: Settings,
    content: {
      description:
        "Datenexport/-import als JSON, vCard-Import, API-Key-Verwaltung für KI-Assistenten, automatisches Backup-System über Custom API Server (Port 3002). NEU: Automatische Pfadvalidierung und Transparenz über aktive Pfade.",
      howTo: [
        {
          title: "Synology NAS-Synchronisation einrichten",
          steps: [
            "Voraussetzung: Tailscale VPN auf allen Geräten installiert (siehe TAILSCALE_SETUP.md)",
            "Netzlaufwerk Y: auf \\\\100.121.103.107\\Gurktaler mappen",
            "Settings → Synology Netzwerk-Synchronisation",
            "✅ Korrekter Pfad: Y:\\zweipunktnull\\data.json",
            "Alternativ UNC-Pfad: \\\\100.121.103.107\\Gurktaler\\zweipunktnull\\data.json",
            "⚠️ NICHT verwenden: Y:\\zweipunktnull\\zweipunktnull\\data.json (doppelt!)",
            "🔍 Pfad-Validierung: App korrigiert fehlerhafte Pfade automatisch",
            '📂 Nach Verbindung: "Aktive Pfade" zeigt Datenbank-, Backup- und Bild-Pfade an',
            'Klicke "Verbindung testen" - muss ✅ erfolgreich sein',
            'Klicke "Jetzt synchronisieren" für ersten Upload',
            "Aktiviere Auto-Sync (synchronisiert beim App-Start)",
          ],
        },
        {
          title: "Multi-Gerät-Workflow",
          steps: [
            "Gerät 1 (Heim): Daten erstellen/bearbeiten, Sync klicken",
            "Gerät 2 (Büro): App starten - Auto-Sync lädt neueste Daten vom NAS",
            "Gerät 2: Änderungen machen, Sync klicken - schreibt zurück zum NAS",
            "Gerät 1: App neu starten - Auto-Sync holt Änderungen von Gerät 2",
            "Wichtig: Nicht gleichzeitig an denselben Daten arbeiten (noch keine Konfliktauflösung)",
          ],
        },
        {
          title: "Smartphone-Zugriff (unterwegs)",
          steps: [
            "Tailscale VPN auf Smartphone aktivieren",
            "Option A: Synology Drive App - Ordner 'Gurktaler' synchronisieren",
            "Option B: Dateimanager-App mit SMB-Support (z.B. Solid Explorer)",
            "Server: 100.121.103.107, Freigabe: Gurktaler",
            "Zugriff auf Y:\\zweipunktnull\\data.json und Bilddateien",
          ],
        },
        {
          title: "Daten exportieren",
          steps: [
            'Settings → "Daten exportieren"',
            "JSON-Datei wird heruntergeladen",
            "Enthält alle Daten mit Zeitstempel",
            "Nutze Export für lokales Backup vor kritischen Änderungen",
          ],
        },
        {
          title: "Daten importieren",
          steps: [
            'Settings → "Daten importieren"',
            "JSON-Datei auswählen",
            "Warnung bestätigen (überschreibt aktuelle Daten)",
            "Import erfolgt",
          ],
        },
        {
          title: "KI-Assistenten API-Keys",
          steps: [
            "Settings → KI-Assistenten Sektion",
            "Provider wählen (OpenAI, Claude, Qwen, DeepSeek)",
            "API-Key eingeben",
            "Show/Hide Toggle für Sicherheit",
            "Automatisch verschlüsselt gespeichert",
          ],
        },
        {
          title: "Pfad-Probleme beheben (Neue Sicherheitsfunktion)",
          steps: [
            "Problem: Backups werden nicht angezeigt obwohl sie existieren",
            "Ursache: Falscher Pfad in Settings (z.B. doppeltes 'zweipunktnull')",
            "Lösung 1: Settings → Netzwerkpfad prüfen und korrigieren",
            "🔄 Automatische Korrektur: App erkennt Y:\\zweipunktnull\\zweipunktnull und korrigiert zu Y:\\zweipunktnull",
            "✅ Warnung wird angezeigt: 'Pfad wurde korrigiert: Doppeltes zweipunktnull entfernt'",
            "📂 Nach Verbindung: Prüfe 'Aktive Pfade' - alle drei Pfade müssen korrekt sein:",
            "   - Datenbank: Y:\\zweipunktnull\\database",
            "   - Backups: Y:\\zweipunktnull\\backups",
            "   - Bilder: Y:\\zweipunktnull\\images",
            "Lösung 2: Falls Daten in falschem Ordner liegen, mit Windows Explorer verschieben",
            "Tipp: Bei Neuinstallation immer Pfad aus Anleitung kopieren!",
          ],
        },
      ],
      tips: [
        "🔐 Backup-Strategie: Synology NAS = Zentraler Datenspeicher für alle Geräte",
        "📦 Jede Synchronisation → Daten auf NAS aktualisiert → Verfügbar auf allen Geräten",
        "🔄 Auto-Sync beim Start = Immer aktuellste Daten vom NAS",
        "☁️ Tailscale VPN = Sicherer Zugriff von überall (CGNAT-Problem gelöst)",
        "💾 Zusätzlich: JSON-Export als lokales Backup vor kritischen Aktionen",
        "⚠️ Konfliktgefahr: Nicht gleichzeitig auf mehreren Geräten editieren",
        "🏠 Korrekter Pfad: Y:\\zweipunktnull\\data.json (KEIN doppeltes zweipunktnull!)",
        "📂 Backup-Pfad: Y:\\zweipunktnull\\backups (alle Backups hier)",
        "💾 Datenbank-Pfad: Y:\\zweipunktnull\\database (aktive JSON-Dateien)",
        "🌐 UNC-Pfad: \\\\100.121.103.107\\Gurktaler\\zweipunktnull (Alternativer Zugriff)",
        "� NEU: Automatische Pfadvalidierung verhindert fehlerhafte Konfiguration",
        "✅ NEU: Pfad-Anzeige in Settings zeigt alle aktiven Pfade (Transparenz!)",
        "🛡️ NEU: BackupService und NasStorage verwenden denselben Pfad (konsistent!)",
        "�🚫 API-Keys nie teilen oder auf NAS ablegen",
        "📊 Synology NAS-Verbindungsstatus wird in Settings angezeigt",
        "📱 Smartphone: Synology Drive App für Offline-Zugriff nutzen",
        "🔧 Details: Siehe docs/TAILSCALE_SETUP.md und NAS_ARCHITEKTUR.md",
      ],
    },
  },
  {
    id: "keyboard",
    title: "Tastenkombinationen",
    icon: BookOpen,
    content: {
      description: "Nützliche Tastenkombinationen für schnellere Bedienung.",
      features: [
        "Notizen: Strg+Enter = Quick-Entry speichern",
        "KI-Chat: Enter = Nachricht senden, Shift+Enter = Neue Zeile",
        "Bild-URL: Enter = Bild laden",
        "ESC = Modal schließen (überall)",
      ],
      tips: [
        "Quick-Entry immer oben auf Notizen-Seite",
        "Formulare mit Tab navigieren",
      ],
    },
  },
  {
    id: "ui-interactions",
    title: "UI-Interaktionen",
    icon: BookOpen,
    content: {
      subtitle: "Drag & Drop, Listen-Ansichten und Timeline-Bedienung",
      description:
        "Universelle Interaktionsmuster für effizientes Arbeiten mit der Anwendung. Drag & Drop Sortierung, Listen/Grid Toggle und Timeline-Manipulation.",
      howTo: [
        {
          title: "Drag & Drop Sortierung (Universal)",
          steps: [
            "Verfügbar in: Produkte, Rezepte, Zutaten, Notizen, Dokumente, Recherche, Gebinde, Tags",
            "Karte anklicken und halten (oder antippen und halten auf Mobile)",
            "An neue Position ziehen",
            "Loslassen zum Speichern",
            "Sortierreihenfolge wird automatisch in display_order gespeichert",
            "Funktioniert sowohl in Grid- als auch in List-Ansicht",
          ],
        },
        {
          title: "Timeline (Projekt-Timeline) - Horizontale Verschiebung",
          steps: [
            "Navigation → Timeline öffnen",
            "Strg-Taste gedrückt halten",
            "Mit Maus auf Projekt-Balken klicken und halten",
            "Bei gedrückter Strg-Taste horizontal ziehen",
            "Projekt bewegt sich visuell in der Timeline",
            "Maustaste loslassen",
            "Startdatum wird automatisch neu berechnet und gespeichert",
            "Projekt bleibt an neuer Position",
          ],
        },
        {
          title: "Timeline - Vertikale Neuordnung",
          steps: [
            "OHNE Strg-Taste: Projekt-Balken anklicken und halten",
            "Vertikal nach oben oder unten ziehen",
            "Ändert Reihenfolge der Projekte in der Timeline",
            "Keine Datums-Änderung, nur visuelle Sortierung",
          ],
        },
        {
          title: "Listen-Ansicht (Ingredients & Tags)",
          steps: [
            "Seite Zutaten oder Tags öffnen",
            "Oben rechts: Grid/List Toggle-Buttons",
            "Grid-Icon: Karten-Ansicht (Standard)",
            "List-Icon: Kompakte Tabellen-Ansicht",
            "Umschaltung behält Filter und Sortierung",
          ],
        },
        {
          title: "Kategorie-Sortierung (Ingredients)",
          steps: [
            "Zutaten-Seite öffnen",
            'Toggle "Nach Kategorie sortieren" aktivieren',
            "Zutaten werden nach Kategorie gruppiert",
            "Innerhalb jeder Kategorie alphabetisch sortiert",
            "Drag & Drop weiterhin möglich für manuelle Sortierung",
          ],
        },
      ],
      tips: [
        "Timeline-Tooltip zeigt: 'Doppelklick zum Öffnen • Ctrl+Drag zum horizontal Verschieben'",
        "Strg-Taste ist essentiell für horizontale Timeline-Verschiebung",
        "Listen-Ansicht ideal für schnelles Scannen vieler Einträge",
        "Grid-Ansicht bietet mehr Details und Vorschaubilder",
        "Drag & Drop funktioniert überall gleich - einheitliche Bedienung",
        "Display_order wird automatisch verwaltet (Default: 9999)",
        "Workspace-Filter in Timeline beeinflusst auch Projekt-Seite",
      ],
    },
  },
  {
    id: "pwa-deployment",
    title: "PWA Mobile Deployment",
    icon: Smartphone,
    content: {
      subtitle:
        "Gurktaler 2.0 als Progressive Web App auf dem Smartphone nutzen",
      description:
        "Die App kann als PWA (Progressive Web App) auf dem Smartphone genutzt werden. Der Zugriff erfolgt über die Synology FileStation API, die direkt mit dem NAS kommuniziert.",
      howTo: [
        {
          title: "1. Web Station auf Synology aktivieren",
          steps: [
            "DSM öffnen (http://100.121.103.107:5000)",
            "Paket-Zentrum öffnen",
            'Nach "Web Station" suchen und installieren (falls nicht vorhanden)',
            "Web Station öffnen",
            'Unter "Allgemein" → HTTP Backend Server: PHP 8.2 auswählen',
            "Dienst aktivieren",
          ],
        },
        {
          title: "2. Virtuellen Host einrichten",
          steps: [
            'Web Station → "Virtual Host" Tab',
            '"Erstellen" klicken',
            'Typ: "Name-based Virtual Host"',
            "Hostname: gurktaler.local (oder beliebig)",
            "Port: 80 (Standard HTTP)",
            'Root-Verzeichnis: "/web/gurktaler" (wird automatisch angelegt)',
            "PHP: PHP 8.2 auswählen",
            'HTTP Backend Server: "Apache HTTP Server 2.4"',
            "Speichern",
          ],
        },
        {
          title: "3. PWA-Dateien hochladen",
          steps: [
            "In VS Code: npm run build ausführen (erstellt dist/ Ordner)",
            "File Station öffnen",
            'Zu "/web/gurktaler" navigieren (oder erstellen)',
            "Alle Dateien aus dem dist/ Ordner hochladen:",
            "  - index.html",
            "  - assets/ Ordner (CSS und JS)",
            "  - registerSW.js, sw.js, workbox-*.js",
            "  - manifest.webmanifest",
            "  - pwa-192x192.png, pwa-512x512.png",
          ],
        },
        {
          title: "4. Zugriff vom Smartphone (über Tailscale)",
          steps: [
            "Tailscale auf dem Smartphone installieren und mit demselben Account anmelden",
            "Browser öffnen (Chrome, Safari, Edge)",
            "URL eingeben: http://100.121.103.107/gurktaler/ (oder http://gurktaler.local)",
            "App sollte laden",
            "Optional: Als PWA zum Home Screen hinzufügen:",
            '  - Chrome: Menü → "Zum Startbildschirm hinzufügen"',
            '  - Safari: Teilen → "Zum Home-Bildschirm"',
          ],
        },
        {
          title: "5. Synology-Zugangsdaten konfigurieren",
          steps: [
            "In der PWA: F12 (Developer Tools) öffnen",
            "Console Tab → folgende Befehle eingeben:",
            '  localStorage.setItem("synology_username", "admin")',
            '  localStorage.setItem("synology_password", "DeinPasswort")',
            "Seite neu laden",
            "App sollte sich automatisch mit dem NAS verbinden",
            'Console zeigt: "🌐 Using FileStation API Storage" und "🔐 FileStation Login erfolgreich"',
          ],
        },
        {
          title: "6. Testen",
          steps: [
            "Projekt erstellen oder bestehende Daten ansehen",
            "Bilder hochladen (funktioniert über FileStation API)",
            "Notizen erstellen",
            "Änderungen sollten sofort auf dem NAS gespeichert werden",
            "Desktop-App öffnen → Änderungen sind sichtbar (Sync über Y:\\ Laufwerk)",
          ],
        },
      ],
      tips: [
        "🔒 Tailscale VPN muss auf beiden Geräten (NAS + Smartphone) laufen",
        "📡 Ohne Tailscale: Port-Forwarding einrichten (nicht empfohlen, Sicherheitsrisiko)",
        "🔐 localStorage-Zugangsdaten werden im Browser gespeichert (nicht sicher für öffentliche Geräte)",
        "⚡ FileStation API nutzt Session-Cookies (sid Token) für Authentifizierung",
        "🖥️ Desktop-App nutzt Electron IPC mit Y:\\ Laufwerk (SMB)",
        "🌐 Browser-App nutzt FileStation HTTP REST API",
        "📱 PWA funktioniert auch offline (Service Worker cacht Dateien)",
        "🔄 Änderungen werden sofort synchronisiert (Desktop ↔ Mobile)",
        "📝 Kein manueller Sync nötig - beide greifen auf dieselben JSON-Dateien zu",
        "⚠️ Bei Konflikten: Letzte Änderung gewinnt (keine Versionskontrolle)",
      ],
      features: [
        "✅ Plattform-Detection: Desktop (Electron IPC) vs Browser (FileStation API)",
        "✅ Session-Management: Automatischer Login mit localStorage-Credentials",
        "✅ CRUD-Operationen: Lesen, Schreiben, Löschen von JSON-Dateien",
        "✅ Bild-Upload: Base64 DataURL → Blob → FormData → FileStation Upload",
        "✅ Directory-Management: Automatische Ordner-Erstellung (database/, images/, etc.)",
        "✅ Fehlerbehandlung: Retry-Logik bei Session-Ablauf",
        "✅ Offline-Fähigkeit: Service Worker cacht HTML/CSS/JS für PWA",
      ],
    },
  },
  {
    id: "roadmap",
    title: "Roadmap",
    icon: FolderKanban,
    content: {
      description: "Geplante Features und Entwicklungsstand (siehe ROADMAP.md)",
      features: [
        "✅ Phase 1-6: Fundament, UI, Projekte, Produkte, Rezepturen abgeschlossen",
        "✅ Phase 7: Tag-System & Volltext-Suche komplett",
        "✅ Phase 8: Synology NAS-Integration mit Tailscale VPN komplett",
        "✅ Phase 9: Production Build & Installer (NSIS) komplett",
        "✅ Phase 9: Separate Build-System für Desktop & PWA",
        "✅ Phase 10: Zeitplanung (Gantt-Chart) mit Abhängigkeiten",
        "✅ Phase 11: Kapazitätsauslastung quartalsweise",
        "✅ Phase 12: Custom API Server (Port 3002) für PWA",
        "✅ Phase 13: Backup-System (Windows + NAS)",
        "✅ Phase 12: Aufgabenverwaltung & TODO-Listen (v1.5.0) - Dashboard-Widget mit Filter, Export (PDF, iCal, E-Mail)",
        "🔄 Phase B1: NAS-Storage-Layer & Migration (aktiv)",
        "📋 Phase B2: Entity-Services-Refactoring (geplant)",
        "📋 Phase B3: Binäre Bildspeicherung (geplant)",
        "📋 Phase 13: Native Mobile (Capacitor)",
        "📋 Phase 14: Multi-User-Konfliktauflösung",
        "📋 Phase 15: Performance-Optimierung",
      ],
      tips: [
        "Aktuelle Version: 1.5.0 - TODO-Feature mit vollständiger Aufgabenverwaltung (siehe CHANGELOG.md)",
        "Feature-Requests via GitHub Issues",
        "Regelmäßige Updates alle 2-4 Wochen",
        "NAS-Sync über Tailscale macht Multi-Device-Nutzung möglich (Heim, Büro, unterwegs)",
        "Custom API Server (Port 3002) ermöglicht Mobile-Schreibzugriff",
        "Detaillierte Mobile-Dokumentation: docs/MOBILE_API.md",
        "TODO-Feature: Filter, Sortierung, Projekt-Verknüpfung, Export (PDF/iCal/E-Mail)",
      ],
    },
  },
  {
    id: "build",
    title: "Build & Deployment",
    icon: Settings,
    content: {
      subtitle: "Desktop-EXE und Mobile PWA erstellen",
      description:
        "Gurktaler 2.0 unterstützt zwei separate Build-Prozesse: Desktop (Windows EXE) und Mobile (PWA für Browser). Beide Plattformen nutzen unterschiedliche Asset-Pfade.",
      howTo: [
        {
          title: "Desktop-App bauen (Windows EXE)",
          steps: [
            "Terminal öffnen im Projekt-Verzeichnis",
            "Befehl ausführen: npm run build",
            "Oder explizit: npm run build:desktop",
            "Warten (ca. 1-2 Minuten)",
            "Ergebnis: build-output/Gurktaler 2.0-1.1.1-Setup.exe",
            "Installer testen durch Ausführen der EXE",
            "Installer verteilen via E-Mail, USB oder Download-Link",
          ],
        },
        {
          title: "Mobile PWA bauen & deployen",
          steps: [
            "Terminal öffnen im Projekt-Verzeichnis",
            "Nur Build: npm run build:pwa",
            "Build + Auto-Deploy: npm run deploy:pwa",
            "Bei Auto-Deploy: dist/ wird automatisch zum NAS kopiert",
            "Zielverzeichnis: Y:\\web\\html\\gurktaler\\",
            "PWA ist sofort verfügbar: http://100.121.103.107/gurktaler/",
            "Auf Android/iOS: Browser öffnen → URL aufrufen → Als PWA installieren",
          ],
        },
        {
          title: "Beide Builds erstellen",
          steps: [
            "Befehl: npm run build:all",
            "Erstellt Desktop-EXE + PWA nacheinander",
            "Empfohlen für Release-Vorbereitung",
            "Desktop: build-output/, PWA: dist/",
            "PWA manuell deployen mit: .\\deploy-pwa.ps1",
          ],
        },
        {
          title: "Manuelles PWA-Deployment",
          steps: [
            "PowerShell öffnen im Projekt-Verzeichnis",
            "Befehl: .\\deploy-pwa.ps1",
            "Script kopiert dist/* nach \\\\DS124-RockingK\\web\\html\\gurktaler\\",
            "Alle Dateien werden überschrieben",
            "Hinweis erscheint: Zugriff via http://100.121.103.107/gurktaler/",
          ],
        },
      ],
      features: [
        "✅ Separate Builds: Desktop und PWA mit unterschiedlichen Asset-Pfaden",
        "✅ Desktop: Lädt Assets von / (Root)",
        "✅ PWA: Lädt Assets von /gurktaler/ (Subdir)",
        "✅ Auto-Deploy: PWA wird automatisch auf NAS kopiert",
        "✅ cross-env: Plattformübergreifende Environment Variables",
        "✅ Kein manuelles Kopieren mehr nötig (npm run deploy:pwa)",
      ],
      tips: [
        "Standard-Build (npm run build) erstellt Desktop-EXE",
        "PWA-Deploy prüft: NAS muss unter Y:\\ oder UNC-Pfad erreichbar sein",
        "Bei Fehlern: Prüfe Tailscale VPN-Verbindung",
        "Desktop-EXE benötigt Y:\\ gemapptes Laufwerk zur Laufzeit",
        "PWA benötigt Node.js API Server auf Port 3001 (check-server.ps1)",
        "Build-Zeit: Desktop ~2 Min, PWA ~15 Sek",
        "Asset-Pfade sind der einzige Unterschied zwischen Builds",
        "Beide Builds greifen auf dieselben NAS-Daten zu",
      ],
    },
  },
  {
    id: "backup-system",
    title: "🛡️ 4-Ebenen Backup-System",
    icon: Database,
    content: {
      subtitle: "Maximale Datensicherheit mit automatischer Mehrfach-Sicherung",
      description:
        "NEU in v1.7.1: Komplettes Backup-System mit 4 Sicherheitsebenen - automatische Snapshots, stündliche Backups, tägliche Vollsicherung und Read-Only-Fallback. Deine Daten sind bombensicher!",
      howTo: [
        {
          title: "Ebene 1: Automatische Snapshots (immer aktiv)",
          steps: [
            "🔄 Erstellt AUTOMATISCH bei jedem Speichervorgang",
            "📁 Speicherort: Y:\\zweipunktnull\\backups\\snapshots\\",
            "📝 Format: dateiname_2026-02-04_14-30-15.json",
            "⏱️ Retention: Letzte 10 Versionen pro Datei",
            "💾 Keine Einrichtung nötig - läuft sofort!",
            "🎯 Wiederherstellung: Einfach ältere Snapshot-Datei kopieren",
          ],
        },
        {
          title: "Ebene 2: Stündliche Backups (optional)",
          steps: [
            "⏰ Läuft jede Stunde via Task Scheduler",
            "📁 Speicherort: Y:\\zweipunktnull\\backups\\backup_YYYY-MM-DD_HH-mm-ss\\",
            "💾 Sichert: Komplette Database + Images + Documents",
            "⏱️ Retention: 7 Tage (168 Wiederherstellungspunkte)",
            "⚙️ Setup: Task Scheduler konfigurieren (siehe nächste Sektion)",
            "📜 Script: backup-hourly.ps1",
          ],
        },
        {
          title: "Ebene 3: Tägliche Vollsicherung (empfohlen)",
          steps: [
            "🌙 Läuft täglich um 02:00 Uhr via Task Scheduler",
            "📁 Speicherort: Y:\\zweipunktnull\\backups\\full\\backup_YYYY-MM-DD_HH-mm-ss\\",
            "💾 Sichert: ALLES (Database + Images + Documents + Metadata)",
            "⏱️ Retention: 7 Tage (automatische Cleanup)",
            "📊 Erstellt backup-info.json mit Statistiken",
            "⚙️ Setup: Task Scheduler konfigurieren (siehe unten)",
            "📜 Script: backup-full.ps1",
          ],
        },
        {
          title: "Ebene 4: Read-Only Fallback (Notfall)",
          steps: [
            "🔒 Aktiviert sich AUTOMATISCH bei NAS-Ausfall",
            "💾 Speichert Änderungen temporär in LocalStorage",
            "⚠️ Gelbes Banner warnt vor Read-Only-Modus",
            "🔄 Synchronisiert automatisch beim Reconnect",
            "🛡️ Verhindert Datenverlust bei Verbindungsproblemen",
            "✅ Keine Einrichtung nötig - Always-On-Safety",
          ],
        },
      ],
      tips: [
        "🎯 Empfehlung: Aktiviere Ebene 1+3 (Snapshots + Tägliche Vollsicherung)",
        "⚡ Ebene 2 optional für höchste Sicherheit (stündlich)",
        "🔒 Ebene 4 läuft immer automatisch als Sicherheitsnetz",
        "📂 Alle Backups liegen unter: Y:\\zweipunktnull\\backups\\",
        "⏱️ Snapshot-Cleanup: Automatisch (10 neueste behalten)",
        "🧹 Full-Backup-Cleanup: Automatisch nach 7 Tagen",
        "📊 Monitoring: Siehe BACKUP_SYSTEM.md für PowerShell-Befehle",
        "🚀 Startup-Check: App prüft NAS-Verbindung beim Start (3-Phasen-Check)",
      ],
    },
  },
  {
    id: "backup-setup",
    title: "⚙️ Task Scheduler Setup",
    icon: Settings,
    content: {
      subtitle: "Automatische Backups mit Windows Task Scheduler einrichten",
      description:
        "Einmalige Einrichtung für automatische tägliche Vollsicherung (02:00 Uhr) und optionale stündliche Backups. Danach läuft alles automatisch!",
      howTo: [
        {
          title: "Option A: Automatische Einrichtung (PowerShell)",
          steps: [
            "PowerShell als Administrator öffnen (Win+X → Windows PowerShell (Administrator))",
            "cd C:\\Users\\wolfg\\Desktop\\zweipunktnullVS",
            "Tägliche Vollsicherung: .\\backup-full.ps1 -SetupScheduledTask",
            "Optionale Stündliche Backups: .\\backup-hourly.ps1 -SetupScheduledTask",
            "Fertig! Überprüfe in Aufgabenplanung: taskschd.msc",
          ],
        },
        {
          title: "Option B: Manuelle Einrichtung (Vollsicherung)",
          steps: [
            "Windows-Taste → tippe: Aufgabenplanung → Enter",
            "Rechtsklick 'Aufgabenplanungsbibliothek' → Aufgabe erstellen",
            "Name: Gurktaler Vollsicherung (02:00)",
            "Häkchen: 'Mit höchsten Privilegien ausführen'",
            "Tab 'Trigger' → Neu → Täglich um 02:00 Uhr",
            "Tab 'Aktionen' → Neu → Programm starten:",
            "   Programm: powershell.exe",
            '   Argumente: -NoProfile -ExecutionPolicy Bypass -File "C:\\Users\\wolfg\\Desktop\\zweipunktnullVS\\backup-full.ps1"',
            "   Starten in: C:\\Users\\wolfg\\Desktop\\zweipunktnullVS",
            "Tab 'Bedingungen' → Häkchen ENTFERNEN bei 'Nur bei Netzbetrieb'",
            "OK → Passwort eingeben → OK",
          ],
        },
        {
          title: "Backup manuell testen",
          steps: [
            "PowerShell öffnen (nicht Administrator nötig)",
            "cd C:\\Users\\wolfg\\Desktop\\zweipunktnullVS",
            "Test Vollsicherung: .\\backup-full.ps1",
            "Test Stündlich: .\\backup-hourly.ps1",
            "Prüfe Ergebnis: Get-ChildItem Y:\\zweipunktnull\\backups\\full\\ -Directory | Sort-Object Name -Descending | Select-Object -First 1",
          ],
        },
        {
          title: "Monitoring & Troubleshooting",
          steps: [
            "Letzte 5 Backups: Get-ChildItem Y:\\zweipunktnull\\backups\\full\\ -Directory | Sort-Object Name -Descending | Select-Object -First 5",
            "Backup-Größe prüfen: $latest = Get-ChildItem Y:\\zweipunktnull\\backups\\full\\ -Directory | Sort-Object Name -Descending | Select-Object -First 1; (Get-ChildItem $latest.FullName -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB",
            "Task-Status prüfen: Get-ScheduledTask | Where-Object {$_.TaskName -like '*Gurktaler*'}",
            "Task-Historie: Get-ScheduledTask -TaskName 'Gurktaler*' | Get-ScheduledTaskInfo",
          ],
        },
      ],
      tips: [
        "🌙 Empfohlene Zeit: 02:00 Uhr (Nacht, keine Arbeit)",
        "🔋 'Nur bei Netzbetrieb' deaktivieren für Laptops!",
        "📊 backup-info.json enthält Statistiken (Dateien, Größe, Dauer)",
        "🧹 Alte Backups werden automatisch gelöscht (7 Tage Retention)",
        "⚠️ NAS muss verbunden sein: net use Y: \\\\100.121.103.107\\Gurktaler",
        "📂 Vollständige Dokumentation: docs/BACKUP_SYSTEM.md",
        "🔍 Exit-Codes: 0=Erfolg, 1=Fehler, prüfbar in Task-Historie",
      ],
    },
  },
  {
    id: "backup",
    title: "🚨 Notfall-Wiederherstellung",
    icon: ShieldAlert,
    content: {
      subtitle: "Datenrettung bei Datenverlust - Schritt für Schritt",
      description:
        "Falls alle Daten in der App verschwunden sind: KEINE PANIK! Alle Daten werden mehrfach gesichert. Diese Anleitung hilft dir, Daten in wenigen Minuten wiederherzustellen - auch ohne VS Code im Büro.",
      howTo: [
        {
          title: "1. Sofort-Maßnahmen",
          steps: [
            "App SOFORT schließen (keine weiteren Speichervorgänge!)",
            "Windows PowerShell öffnen (Win+X → Windows PowerShell)",
            "Zum Projekt navigieren: cd C:\\Users\\wolfg\\Desktop\\zweipunktnullVS",
            "Backups prüfen: Get-ChildItem 'Y:\\zweipunktnull\\backups' -Directory | Sort-Object Name -Descending | Select-Object -First 5",
          ],
        },
        {
          title: "2. Neuestes Backup prüfen",
          steps: [
            "Ersetze YYYY-MM-DD_HH-mm-ss mit neuestem Backup-Namen!",
            "$backup = 'Y:\\zweipunktnull\\backups\\backup_YYYY-MM-DD_HH-mm-ss'",
            'Inhalt prüfen: Get-ChildItem "$backup\\*.json" | ForEach-Object { $data = Get-Content $_.FullName -Raw | ConvertFrom-Json; Write-Host "$($_.Name): $($data.Count) Einträge" }',
            "Sollte zeigen: projects.json: XX Einträge, products.json: XX Einträge, etc.",
          ],
        },
        {
          title: "3. Daten wiederherstellen (KOPIEREN!)",
          steps: [
            "$backup = 'Y:\\zweipunktnull\\backups\\backup_YYYY-MM-DD_HH-mm-ss'  # ANPASSEN!",
            "$db = 'Y:\\zweipunktnull\\database'",
            'Copy-Item "$backup\\projects.json" "$db\\projects.json" -Force',
            'Copy-Item "$backup\\products.json" "$db\\products.json" -Force',
            'Copy-Item "$backup\\recipes.json" "$db\\recipes.json" -Force',
            'Copy-Item "$backup\\notes.json" "$db\\notes.json" -Force',
            'Copy-Item "$backup\\contacts.json" "$db\\contacts.json" -Force',
            'Copy-Item "$backup\\tasks.json" "$db\\tasks.json" -Force',
            "Write-Host '✅ Daten wiederhergestellt!'",
          ],
        },
        {
          title: "4. Prüfen & App neu starten",
          steps: [
            "@('projects', 'products', 'recipes', 'notes') | ForEach-Object { $count = (Get-Content \"Y:\\zweipunktnull\\database\\$_.json\" -Raw | ConvertFrom-Json).Count; Write-Host \"$_ : $count Einträge\" }",
            "Sollte wieder Einträge zeigen!",
            "App neu starten oder F5 drücken",
            "Daten sollten jetzt wieder sichtbar sein",
          ],
        },
      ],
      tips: [
        "🏢 Im Büro ohne VS Code: Öffne einfach PowerShell und führe die Befehle aus!",
        "🔌 NAS nicht verbunden? net use Y: \\\\100.121.103.107\\Gurktaler",
        "📂 Alle Backups liegen unter: Y:\\zweipunktnull\\backups",
        "💾 Aktive Datenbank liegt unter: Y:\\zweipunktnull\\database",
        "📱 Per Remote Desktop: Verbinde zu Home-Rechner und stelle dort wieder her",
        "⏱️ Backups: Stündlich für 7 Tage = bis zu 168 Wiederherstellungspunkte",
        "💾 Manuelles Backup jederzeit: Einstellungen → Backup & Wiederherstellung → Manuelles Backup",
        "🔒 Neu in v1.6.1: Automatisches Backup VOR jedem Speichern + Leer-Schutz!",
      ],
    },
  },
  {
    id: "backup-automation",
    title: "⏰ Stündliche Backups einrichten",
    icon: Clock,
    content: {
      subtitle: "Task Scheduler für automatische Backups konfigurieren",
      description:
        "Das stündliche Backup-Script muss über Windows Task Scheduler automatisiert werden. Ohne diese Einrichtung laufen nur manuelle Backups beim Speichern!",
      howTo: [
        {
          title: "Einmalige Einrichtung - Task Scheduler",
          steps: [
            "Windows-Taste drücken, tippe: Aufgabenplanung",
            "Rechtsklick 'Aufgabenplanungsbibliothek' → Aufgabe erstellen",
            "Tab 'Allgemein': Name: Gurktaler Stündliches Backup",
            "Häkchen: 'Unabhängig von der Benutzeranmeldung ausführen'",
            "Häkchen: 'Mit höchsten Privilegien ausführen'",
          ],
        },
        {
          title: "Trigger konfigurieren",
          steps: [
            "Tab 'Trigger' → Neu",
            "Aufgabe starten: Bei Anmeldung",
            "Häkchen: 'Wiederholen alle: 1 Stunde'",
            "Dauer: Unbegrenzt",
            "Häkchen: 'Aktiviert'",
            "OK klicken",
          ],
        },
        {
          title: "Aktion konfigurieren",
          steps: [
            "Tab 'Aktionen' → Neu",
            "Aktion: Programm starten",
            "Programm/Skript: powershell.exe",
            'Argumente: -NoProfile -ExecutionPolicy Bypass -File "C:\\Users\\wolfg\\Desktop\\zweipunktnullVS\\backup-hourly.ps1"',
            "Starten in: C:\\Users\\wolfg\\Desktop\\zweipunktnullVS",
            "OK klicken",
          ],
        },
        {
          title: "Bedingungen anpassen",
          steps: [
            "Tab 'Bedingungen'",
            "DEAKTIVIERE: 'Aufgabe nur starten, falls Computer im Netzbetrieb läuft'",
            "DEAKTIVIERE: 'Anhalten, falls Akkubetrieb einsetzt'",
            "So läuft Backup auch auf Laptop!",
          ],
        },
        {
          title: "Einstellungen finalisieren",
          steps: [
            "Tab 'Einstellungen'",
            "Häkchen: 'Aufgabe bei Bedarf ausführen'",
            "Häkchen: 'Aufgabe so schnell wie möglich ausführen, falls Start verpasst'",
            "Falls Aufgabe fehlschlägt, Neustart alle: 1 Minute",
            "Versuche max: 3",
            "OK klicken → ggf. Passwort eingeben",
          ],
        },
        {
          title: "Test & Verifikation",
          steps: [
            "In Aufgabenplanung: Rechtsklick auf 'Gurktaler Stündliches Backup' → Ausführen",
            "PowerShell öffnen: Get-ChildItem 'Y:\\zweipunktnull\\backups' -Directory | Sort-Object Name -Descending | Select-Object -First 1",
            "Sollte ein neues Backup mit aktuellem Zeitstempel zeigen!",
            "Task läuft jetzt automatisch jede Stunde",
          ],
        },
      ],
      features: [
        "✅ Automatische Backups jede Stunde (7 Tage = 168 Backups)",
        "✅ Läuft auch bei Laptop im Akkubetrieb",
        "✅ Automatischer Neustart bei Fehlschlag",
        "✅ Läuft auch wenn du nicht angemeldet bist",
        "✅ Alte Backups werden automatisch nach 7 Tagen gelöscht",
      ],
      tips: [
        "⚡ Sofort-Test: Rechtsklick auf Task → Ausführen",
        "📊 Status prüfen: Task Scheduler → 'Letzte Ausführung' und 'Letztes Ergebnis' ansehen",
        "🔍 Fehlersuche: Ereignisanzeige → Windows-Protokolle → Anwendung",
        "⏰ Erste Ausführung: Bei nächster Anmeldung + jede Stunde danach",
        "🔒 Wichtig: Pfade müssen exakt stimmen (Anführungszeichen bei Leerzeichen!)",
        "💡 Alternative: Script manuell starten: .\\backup-hourly.ps1 in PowerShell",
      ],
    },
  },
  {
    id: "pwa-server",
    title: "🖥️ PWA Server-Monitoring",
    icon: Server,
    content: {
      subtitle: "Node.js API Server Status & Verwaltung",
      description:
        "Die PWA (Progressive Web App) benötigt einen Node.js API Server auf dem Synology NAS, um auf Daten zugreifen zu können. Dieser läuft auf Port 3002 und stellt JSON-Dateien sowie Bilder bereit.",
      howTo: [
        {
          title: "Server-Status in der App prüfen",
          steps: [
            "Öffne Einstellungen in der App",
            "Ganz oben siehst du 'PWA API Server' Section",
            "Status-Anzeige: Grün = Online, Rot = Offline, Gelb = Prüfe...",
            "Button 'Prüfen' klicken für manuellen Check",
            "Automatische Prüfung: Alle 30 Sekunden",
          ],
        },
        {
          title: "Server manuell starten (SSH)",
          steps: [
            "SSH-Verbindung zum NAS: ssh admin@100.121.103.107",
            "Zum Verzeichnis wechseln: cd /volume1/Gurktaler/api",
            "Server starten: nohup node server.js > server.log 2>&1 &",
            "Prozess läuft im Hintergrund",
            "Prüfen: curl http://localhost:3002/api/json?path=/database/projects.json",
          ],
        },
        {
          title: "Automatischer Start beim Boot (Synology Task)",
          steps: [
            "Synology DSM öffnen → Systemsteuerung → Aufgabenplanung",
            "Erstellen → Geplante Aufgabe → Benutzerdefiniertes Script",
            "Aufgabenname: 'Gurktaler API Server'",
            "Benutzer: root (wichtig für Zugriffsrechte!)",
            "Tab 'Zeitplan': Ereignis auswählen → Bei Start",
            "Tab 'Aufgabeneinstellungen':",
            "   Script: cd /volume1/Gurktaler/api && node server.js > server.log 2>&1",
            "Speichern → Server startet automatisch bei NAS-Neustart",
          ],
        },
        {
          title: "Server-Status von Windows prüfen",
          steps: [
            "PowerShell öffnen",
            "cd C:\\Users\\wolfg\\Desktop\\zweipunktnullVS",
            ".\\check-server.ps1",
            "Zeigt: NAS-Erreichbarkeit, Server-Status, Projekt-Count",
            "Bei Offline: Anleitung zum manuellen Start wird angezeigt",
            "Mit -Restart Flag: .\\check-server.ps1 -Restart",
          ],
        },
        {
          title: "Server-Logs ansehen",
          steps: [
            "SSH zum NAS: ssh admin@100.121.103.107",
            "Log-Datei anzeigen: tail -f /volume1/Gurktaler/api/server.log",
            "Alle API-Requests werden geloggt",
            "Backup-Operationen werden dokumentiert",
            "Fehler und Warnungen sichtbar",
            "Ctrl+C zum Beenden",
          ],
        },
      ],
      tips: [
        "🔄 Automatische Prüfung: Sidebar zeigt Live-Status (Wifi/WifiOff Icon)",
        "🖥️ Desktop-App: Nutzt direkten NAS-Zugriff, benötigt KEINEN Server",
        "📱 PWA/Mobile: Benötigt ZWINGEND den Node.js Server auf Port 3002",
        "🌐 Endpoint: http://100.121.103.107/api/json",
        "📂 Server-Code: server.js im Projekt-Root",
        "💾 Backup-System: Server erstellt automatisch Backups vor Schreibvorgängen",
        "🚨 Datenverlust-Schutz: Server blockt leere Arrays über volle Daten",
        "⚠️ Bei Server-Ausfall: App zeigt roten Status, keine Schreibvorgänge möglich",
        "🔧 Server-Port ändern: In server.js PORT-Variable anpassen",
        "📊 Health-Check: /api/json?path=/database/projects.json liefert Projekt-Count",
      ],
    },
  },
];

export default function Documentation() {
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "overview",
  ]);

  const toggleSection = (id: string) => {
    setExpandedSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Anleitungen & Dokumentation
        </h1>
        <p className="text-slate-600">
          Umfassende Dokumentation aller Funktionen und Features von Gurktaler
          2.0
        </p>
      </div>

      <div className="space-y-3">
        {sections.map((section) => {
          const Icon = section.icon;
          const isExpanded = expandedSections.includes(section.id);

          return (
            <div
              key={section.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
            >
              {/* Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gurktaler-100 rounded-lg">
                    <Icon className="w-5 h-5 text-gurktaler-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-slate-800">
                    {section.title}
                  </h2>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                )}
              </button>

              {/* Content */}
              {isExpanded && (
                <div className="px-6 pb-6 space-y-4">
                  {section.content.subtitle && (
                    <h3 className="text-xl font-semibold text-gurktaler-700">
                      {section.content.subtitle}
                    </h3>
                  )}

                  <p className="text-slate-700 leading-relaxed">
                    {section.content.description}
                  </p>

                  {section.content.features && (
                    <div>
                      <h4 className="font-semibold text-slate-800 mb-2">
                        Features:
                      </h4>
                      <ul className="space-y-1">
                        {section.content.features.map((feature, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-slate-700"
                          >
                            <span className="text-gurktaler-600 mt-1">•</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {section.content.howTo && (
                    <div className="space-y-4">
                      {section.content.howTo.map((guide, idx) => (
                        <div key={idx} className="bg-slate-50 rounded-lg p-4">
                          <h4 className="font-semibold text-slate-800 mb-2">
                            {guide.title}
                          </h4>
                          <ol className="space-y-1">
                            {guide.steps.map((step, stepIdx) => (
                              <li
                                key={stepIdx}
                                className="flex items-start gap-2 text-slate-700"
                              >
                                <span className="text-gurktaler-600 font-medium min-w-[20px]">
                                  {stepIdx + 1}.
                                </span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      ))}
                    </div>
                  )}

                  {section.content.tips && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-2">
                        💡 Tipps:
                      </h4>
                      <ul className="space-y-1">
                        {section.content.tips.map((tip, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-blue-800"
                          >
                            <span className="text-blue-600 mt-1">→</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-8 p-6 bg-gurktaler-50 rounded-xl border border-gurktaler-200">
        <h3 className="font-semibold text-gurktaler-800 mb-2">
          📝 Weitere Dokumentation
        </h3>
        <div className="space-y-1 text-sm text-gurktaler-700">
          <p>• README.md - Projektübersicht und Installation</p>
          <p>• docs/MOBILE_API.md - Mobile PWA Setup & Custom API Server</p>
          <p>• ROADMAP.md - Entwicklungsplan und geplante Features</p>
          <p>• CHANGELOG.md - Versionshistorie und Änderungen</p>
          <p>• DATENMODELL.md - Technische Datenbankstruktur</p>
        </div>
      </div>
    </div>
  );
}
