import { useState } from 'react';
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
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

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
    id: 'overview',
    title: 'Übersicht',
    icon: BookOpen,
    content: {
      subtitle: 'Gurktaler 2.0 - Produktentwicklung & Wissensmanagement',
      description:
        'Gurktaler 2.0 ist eine Desktop-Anwendung zur Verwaltung von Produktentwicklungsprojekten, Rezepturen, Notizen und Kontakten. Die App verwendet LocalStorage für Git-freundliche Datensynchronisation.',
      features: [
        'Projekt- und Produktverwaltung mit Versionierung',
        'Rezepturverwaltung mit Zutatendatenbank',
        'Gebindeverwaltung (Flaschen, Etiketten, Verschlüsse)',
        'Notizen mit Markdown-Support',
        'Kontakt- und Weblink-Verwaltung',
        'Tag-System zur Organisation',
        'Volltext-Suche über alle Bereiche',
        'Bild-Upload (lokal & URL)',
        'JSON Export/Import',
      ],
    },
  },
  {
    id: 'projects',
    title: 'Projekte',
    icon: FolderKanban,
    content: {
      description:
        'Projekte sind Container für zusammenhängende Produkte, Notizen und Kontakte. Sie haben einen Status (Aktiv, Pausiert, Abgeschlossen, Archiviert).',
      howTo: [
        {
          title: 'Neues Projekt erstellen',
          steps: [
            'Klicke auf "Neues Projekt" Button',
            'Gib Namen und Beschreibung ein',
            'Wähle den Status',
            'Speichern',
            'Optional: Tags hinzufügen nach Erstellung',
          ],
        },
        {
          title: 'Produkte zuordnen',
          steps: [
            'Gehe zu Produkte-Seite',
            'Erstelle oder bearbeite Produkt',
            'Wähle Projekt aus Dropdown',
            'Produkt wird im Projekt verknüpft',
          ],
        },
      ],
      tips: [
        'Nutze Tags für projektübergreifende Kategorisierung',
        'Status "Pausiert" für zurückgestellte Projekte',
        'Notizen mit Projekt verknüpfen für Kontext',
      ],
    },
  },
  {
    id: 'products',
    title: 'Produkte',
    icon: Package,
    content: {
      description:
        'Produkte können versioniert werden (X → X1 → X1.1). Jedes Produkt hat Status, Gebinde-Zuordnung und optional Alkoholsteuerberechnung.',
      howTo: [
        {
          title: 'Produkt erstellen',
          steps: [
            'Klicke auf "Neues Produkt"',
            'Name, Version, Beschreibung eingeben',
            'Status wählen (Entwurf, In Test, Freigegeben)',
            'Optional: Projekt zuweisen',
            'Optional: Gebinde auswählen (Größe wird übernommen)',
            'Bei Alkohol: Alkoholgehalt eingeben',
            'Checkbox "Alkoholsteuer einbeziehen" aktiviert Berechnung (12€/L)',
          ],
        },
        {
          title: 'Neue Version erstellen',
          steps: [
            'In Produkt-Karte auf "Neue Version" klicken',
            'Formular wird mit Daten vorausgefüllt',
            'Versionsnummer anpassen (z.B. X1, X1.1)',
            'Änderungen vornehmen',
            'Speichern - neue Version ist mit Parent verknüpft',
          ],
        },
      ],
      tips: [
        'Alkoholsteuer wird automatisch berechnet: Gebindegröße × Alkohol% × 12€/L',
        'Archivierte Produkte mit Begründung dokumentieren',
        'Tags für Produktmerkmale (Bio, Premium, etc.)',
        'Bilder hochladen oder von URL einfügen',
      ],
    },
  },
  {
    id: 'recipes',
    title: 'Rezepturen',
    icon: FlaskConical,
    content: {
      description:
        'Rezepturen verwalten Mazerate, Destillate und Ausmischungen mit Zutatenlisten, Anleitung und Ausbeute. Optional mit Produkt verknüpft.',
      howTo: [
        {
          title: 'Rezeptur erstellen',
          steps: [
            'Klicke auf "Neue Rezeptur"',
            'Name und Typ wählen (Mazerat/Destillat/Ausmischung)',
            'Optional: Mit Produkt verknüpfen',
            'Anleitung/Herstellungsschritte eingeben',
            'Ausbeute: Menge und Einheit (ml/L)',
            'Speichern',
          ],
        },
        {
          title: 'Zutaten hinzufügen',
          steps: [
            'Rezeptur öffnen (bearbeiten)',
            'Im Abschnitt "Zutaten" auf "Zutat hinzufügen"',
            'Zutat aus Dropdown wählen',
            'Menge und Einheit eingeben',
            'Optional: Notiz zur Zutat',
            'Zutaten per Drag & Drop sortieren',
          ],
        },
      ],
      tips: [
        'Erstelle Zutaten-Stammdaten vor Rezepturerstellung',
        'Tags für Rezepttypen (Saisonal, Klassiker, etc.)',
        'Bilder vom Herstellungsprozess hochladen',
        'Anleitung mit Markdown formatieren',
      ],
    },
  },
  {
    id: 'ingredients',
    title: 'Zutaten',
    icon: Beaker,
    content: {
      description:
        'Zutatendatenbank mit Alkoholgehalt, Kategorie und Preis pro Einheit (Liter/Kilogramm). Basis für Rezepturen.',
      howTo: [
        {
          title: 'Zutat anlegen',
          steps: [
            'Klicke auf "Neue Zutat"',
            'Name eingeben',
            'Alkoholgehalt in %vol. (bei alkoholischen Zutaten)',
            'Kategorie (frei wählbar: Spirituose, Gewürz, etc.)',
            'Preis pro Einheit und Einheit (Liter/Kilogramm)',
            'Optional: Bemerkung',
            'Nach Erstellung: Tags und Bilder hinzufügen',
          ],
        },
      ],
      tips: [
        'Kategorien einheitlich benennen für bessere Suche',
        'Preise aktuell halten für Kalkulation',
        'Tags für Lieferanten oder Herkunft',
      ],
    },
  },
  {
    id: 'containers',
    title: 'Gebinde',
    icon: Archive,
    content: {
      description:
        'Gebindeverwaltung für Flaschen, Etiketten, Verschlüsse, Verpackungen. Wird in Produkten referenziert.',
      howTo: [
        {
          title: 'Gebinde erstellen',
          steps: [
            'Klicke auf "Neues Gebinde"',
            'Name eingeben',
            'Typ wählen (Flasche, Etikett, Verschluss, Verpackung)',
            'Volumen in ml (bei Flaschen)',
            'Preis pro Einheit',
            'Optional: Bemerkung',
            'Nach Erstellung: Bilder hochladen, Tags hinzufügen',
          ],
        },
      ],
      tips: [
        'Standardgrößen als Vorlagen anlegen (250ml, 500ml, 1000ml)',
        'Fotos von Flaschen und Etiketten hochladen',
        'Lieferanten-Tags für Bestellverwaltung',
      ],
    },
  },
  {
    id: 'notes',
    title: 'Notizen',
    icon: StickyNote,
    content: {
      description:
        'Notizen für Ideen, Aufgaben, Recherche. Mit Markdown-Support und Projekt-Zuordnung. Chaosablage für unstrukturierte Gedanken.',
      howTo: [
        {
          title: 'Notiz erstellen',
          steps: [
            'Quick-Entry: Titel eingeben und Enter (oben auf Seite)',
            'Oder "Neue Notiz" Button',
            'Titel und Inhalt eingeben (Markdown unterstützt)',
            'Typ wählen (Idee, Notiz, Aufgabe, Recherche)',
            'Optional: Projekt zuweisen',
            'Speichern',
          ],
        },
        {
          title: 'Markdown nutzen',
          steps: [
            'Im Edit-Modus schreiben',
            'Toggle zu Preview-Modus für Vorschau',
            'Syntax: # Überschrift, **fett**, *kursiv*, - Liste',
            'Links: [Text](URL)',
          ],
        },
      ],
      tips: [
        'Chaosablage (ohne Projekt) für spontane Ideen',
        'Filter-Tabs nutzen für schnelle Übersicht',
        'Tags für Kategorisierung über Projekte hinweg',
        'Bilder direkt in Notizen einbetten',
      ],
    },
  },
  {
    id: 'contacts',
    title: 'Kontakte',
    icon: Users,
    content: {
      description:
        'Kontaktverwaltung für Lieferanten, Partner, Kunden. Mit vCard-Import aus Google Contacts.',
      howTo: [
        {
          title: 'Kontakt erstellen',
          steps: [
            'Klicke auf "Neuer Kontakt"',
            'Name, Firma eingeben',
            'Typ wählen (Lieferant, Partner, Kunde, Sonstiges)',
            'E-Mail, Telefon, Adresse (optional)',
            'Notizen',
            'Speichern',
          ],
        },
        {
          title: 'Google Contacts importieren',
          steps: [
            'Google Contacts öffnen → Exportieren als vCard',
            'In Gurktaler: Settings → "vCard importieren"',
            'Datei auswählen',
            'Kontakte selektiv auswählen',
            'Typ zuordnen',
            'Importieren',
          ],
        },
        {
          title: 'Zu Projekt zuordnen',
          steps: [
            'Kontakt bearbeiten',
            'Abschnitt "Projekt-Zuordnungen"',
            'Projekt auswählen',
            'Optional: Rolle eingeben (z.B. "Hauptlieferant")',
            'Hinzufügen',
          ],
        },
      ],
      tips: [
        'Filter nach Typ für schnellen Zugriff',
        'Tags für weitere Kategorisierung',
        'Projekt-Rollen dokumentieren',
      ],
    },
  },
  {
    id: 'weblinks',
    title: 'Weblinks',
    icon: Globe,
    content: {
      description:
        'Sammlung von Weblinks für Recherche, Konkurrenzbeobachtung, Lieferanten. Mit Projekt-Zuordnung.',
      howTo: [
        {
          title: 'Weblink erstellen',
          steps: [
            'Klicke auf "Neuer Weblink"',
            'URL eingeben (mit https://)',
            'Titel und Beschreibung',
            'Typ wählen (Konkurrenz, Lieferant, Recherche, Sonstiges)',
            'Optional: Projekt zuweisen',
            'Speichern',
          ],
        },
      ],
      tips: [
        'Domain wird automatisch extrahiert',
        'Tags für Themengebiete',
        'Beschreibung für späteren Kontext',
      ],
    },
  },
  {
    id: 'tags',
    title: 'Tags',
    icon: Tag,
    content: {
      description:
        'Projektübergreifendes Kategorisierungssystem mit Farben. Funktioniert für alle Entitäten.',
      howTo: [
        {
          title: 'Tag erstellen',
          steps: [
            'Seite "Tags" → "Neuer Tag"',
            'Name eingeben (z.B. "Bio", "Premium", "Innovation")',
            'Farbe wählen (vordefiniert oder eigene)',
            'Erstellen',
          ],
        },
        {
          title: 'Tag zuweisen',
          steps: [
            'Entität bearbeiten (Projekt, Produkt, etc.)',
            'Im Abschnitt "Tags" auf Tag klicken',
            'Mehrfachauswahl möglich',
            'Automatisch gespeichert',
          ],
        },
        {
          title: 'Nach Tags filtern',
          steps: [
            'In Listen-Ansichten: Tag-Dropdown nutzen',
            'Wähle Tag aus',
            'Liste wird gefiltert',
          ],
        },
      ],
      tips: [
        'Konsistente Tag-Namen projektübergreifend',
        'Farben nach Bedeutung vergeben',
        'Nicht zu viele Tags pro Entität (max. 3-5)',
      ],
    },
  },
  {
    id: 'search',
    title: 'Globale Suche',
    icon: Search,
    content: {
      description:
        'Durchsucht alle 8 Bereiche gleichzeitig: Projekte, Produkte, Notizen, Kontakte, Weblinks, Rezepturen, Zutaten, Gebinde.',
      howTo: [
        {
          title: 'Suche nutzen',
          steps: [
            'Sidebar → "Suche" oder Suchfeld oben',
            'Suchbegriff eingeben',
            'Ergebnisse werden live angezeigt (Debounce 300ms)',
            'Nach Typ gefiltert mit Badges',
            'Auf Ergebnis klicken für Navigation',
          ],
        },
      ],
      tips: [
        'Durchsucht Namen, Beschreibungen, Notizen, Anleitungen',
        'Weblinks öffnen sich extern',
        'Kategorien-Badges helfen bei Orientierung',
      ],
    },
  },
  {
    id: 'images',
    title: 'Bilder',
    icon: Package,
    content: {
      description:
        'Bilder können zu Produkten, Rezepturen, Gebinden, Zutaten und Notizen hinzugefügt werden. Zwei Upload-Methoden: Datei-Upload und URL-Import.',
      howTo: [
        {
          title: 'Bild hochladen',
          steps: [
            'Entität bearbeiten',
            'Im Abschnitt "Bilder"',
            'Datei per Drag & Drop oder Click',
            'Oder: "Bild von URL einfügen" klicken',
            'URL eingeben (Google Photos Share Link, Imgur, etc.)',
            'Enter oder "Laden" klicken',
            'Bild wird als Base64 gespeichert',
          ],
        },
      ],
      tips: [
        'Max. Anzahl je nach Typ: Produkte 5, Rezepturen 5, Gebinde 3',
        'Google Photos: Bild teilen → Link kopieren → einfügen',
        'CORS kann manche URLs blockieren',
        'Base64-Speicherung = Git-freundlich',
      ],
    },
  },
  {
    id: 'settings',
    title: 'Einstellungen & Export',
    icon: Settings,
    content: {
      description:
        'Datenexport/-import als JSON, vCard-Import, API-Key-Verwaltung für KI-Assistenten.',
      howTo: [
        {
          title: 'Daten exportieren',
          steps: [
            'Settings → "Daten exportieren"',
            'JSON-Datei wird heruntergeladen',
            'Enthält alle Daten mit Zeitstempel',
            'Git-freundliches Format',
          ],
        },
        {
          title: 'Daten importieren',
          steps: [
            'Settings → "Daten importieren"',
            'JSON-Datei auswählen',
            'Warnung bestätigen (überschreibt aktuelle Daten)',
            'Import erfolgt',
          ],
        },
        {
          title: 'KI-Assistenten API-Keys',
          steps: [
            'Settings → KI-Assistenten Sektion',
            'Provider wählen (OpenAI, Claude, Qwen, DeepSeek)',
            'API-Key eingeben',
            'Show/Hide Toggle für Sicherheit',
            'Automatisch verschlüsselt gespeichert',
          ],
        },
      ],
      tips: [
        'Regelmäßig exportieren als Backup',
        'Export in Git-Repository committen',
        'API-Keys nie teilen',
        'LocalStorage-Größe wird angezeigt',
      ],
    },
  },
  {
    id: 'keyboard',
    title: 'Tastenkombinationen',
    icon: BookOpen,
    content: {
      description: 'Nützliche Tastenkombinationen für schnellere Bedienung.',
      features: [
        'Notizen: Strg+Enter = Quick-Entry speichern',
        'KI-Chat: Enter = Nachricht senden, Shift+Enter = Neue Zeile',
        'Bild-URL: Enter = Bild laden',
        'ESC = Modal schließen (überall)',
      ],
      tips: [
        'Quick-Entry immer oben auf Notizen-Seite',
        'Formulare mit Tab navigieren',
      ],
    },
  },
  {
    id: 'roadmap',
    title: 'Roadmap',
    icon: FolderKanban,
    content: {
      description: 'Geplante Features und Entwicklungsstand (siehe ROADMAP.md)',
      features: [
        '✅ Phase 1-6: Fundament, UI, Projekte, Produkte, Rezepturen abgeschlossen',
        '✅ Phase 7: Tag-System & Volltext-Suche komplett',
        '📋 Phase 7: Favoriten-System (in Arbeit)',
        '📋 Phase 8: Git-Integration, Google Contacts OAuth',
        '📋 Phase 9: Android PWA',
        '📋 Phase 10: Performance, Backup, Installer',
      ],
      tips: [
        'Aktuelle Version im CHANGELOG.md',
        'Feature-Requests via Git Issues',
        'Regelmäßige Updates geplant',
      ],
    },
  },
];

export default function Documentation() {
  const [expandedSections, setExpandedSections] = useState<string[]>(['overview']);

  const toggleSection = (id: string) => {
    setExpandedSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Anleitungen & Dokumentation</h1>
        <p className="text-slate-600">
          Umfassende Dokumentation aller Funktionen und Features von Gurktaler 2.0
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
                  <h2 className="text-lg font-semibold text-slate-800">{section.title}</h2>
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

                  <p className="text-slate-700 leading-relaxed">{section.content.description}</p>

                  {section.content.features && (
                    <div>
                      <h4 className="font-semibold text-slate-800 mb-2">Features:</h4>
                      <ul className="space-y-1">
                        {section.content.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-slate-700">
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
                          <h4 className="font-semibold text-slate-800 mb-2">{guide.title}</h4>
                          <ol className="space-y-1">
                            {guide.steps.map((step, stepIdx) => (
                              <li key={stepIdx} className="flex items-start gap-2 text-slate-700">
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
                      <h4 className="font-semibold text-blue-900 mb-2">💡 Tipps:</h4>
                      <ul className="space-y-1">
                        {section.content.tips.map((tip, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-blue-800">
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
        <h3 className="font-semibold text-gurktaler-800 mb-2">📝 Weitere Dokumentation</h3>
        <div className="space-y-1 text-sm text-gurktaler-700">
          <p>• README.md - Projektübersicht und Installation</p>
          <p>• ROADMAP.md - Entwicklungsplan und geplante Features</p>
          <p>• CHANGELOG.md - Versionshistorie und Änderungen</p>
          <p>• DATENMODELL.md - Technische Datenbankstruktur</p>
        </div>
      </div>
    </div>
  );
}
