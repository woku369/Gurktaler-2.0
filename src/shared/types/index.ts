// Shared TypeScript Types for Gurktaler 2.0

// Status Types
export type ProjectStatus = 'active' | 'paused' | 'completed' | 'archived';
export type ProductStatus = 'draft' | 'testing' | 'approved' | 'archived';
export type NoteType = 'idea' | 'note' | 'todo' | 'research';
export type IngredientCategory = 'mazerat' | 'destillat' | 'rohstoff' | 'alkohol' | 'sonstiges';
export type WeblinkType = 'competitor' | 'research' | 'supplier' | 'other';
export type ByproductType = 'marketing' | 'packaging' | 'label' | 'other';
export type ContainerType = 'bottle' | 'label' | 'cap' | 'box' | 'other';
export type DocumentType = 'file' | 'url' | 'google-photos';
// Document Categories are now managed as entities, see DocumentCategoryEntity below
export type DocumentCategory = string;
export type TaskStatus = 'open' | 'in-progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

// Project Workspace - Strategische Projekt-Ebenen
export interface ProjectWorkspace extends BaseEntity {
    name: string;              // Frei definierbarer Name (z.B. "Standortentwicklung")
    description?: string;      // Optionale Beschreibung
    color: string;             // Hex-Color für visuelle Trennung (z.B. "#3b82f6")
    icon?: string;             // Optional: Emoji oder Icon (z.B. "📍")
    order: number;             // Sortierung der Tabs (0, 1, 2, ...)
}

// Document Category - Verwaltbare Kategorien für Dokumente
export interface DocumentCategoryEntity extends BaseEntity {
    name: string;           // Angezeigter Name (z.B. "Rezept")
    value: string;          // Technischer Wert (z.B. "recipe")
    color?: string;         // Optional: Hex-Color für Badge
    icon?: string;          // Optional: Icon-Name
    order: number;          // Sortierung
}

// Document - Pfad-basierte Dokumentenverwaltung
export interface Document extends BaseEntity {
    type: DocumentType;
    path: string; // Relativer Pfad oder URL
    name: string;
    category?: DocumentCategory;
    description?: string;
    mime_type?: string;
    file_size?: number; // in bytes
    thumbnail?: string; // Optional: Base64 Mini-Preview
    project_id?: string; // Optional: Zuordnung zu Projekt
}

// Base Entity
export interface BaseEntity {
    id: string;
    created_at: string;
    updated_at?: string;
}

// Timeline for Gantt Chart
export interface ProjectMilestone {
    id: string;
    name: string;
    date: string; // ISO Date
    completed: boolean;
}

export type DependencyType = 
    | 'finish-to-start'   // Start nach Ende von X (klassisch)
    | 'start-to-start'    // Start parallel mit X
    | 'finish-to-finish'  // Ende gleichzeitig mit X
    | 'start-to-finish';  // Start mit Ende von X (selten)

export interface ProjectDependency {
    projectId: string; // Abhängiges Projekt
    type: DependencyType;
}

export interface CapacityQuarter {
    quarter: string; // z.B. "Q1/26", "Q2/26"
    percentage: number; // 0-100%
}

export interface CapacityUtilization {
    enabled: boolean; // Kapazitätsbalken anzeigen
    quarters: CapacityQuarter[]; // Quartalsweise Prozentsätze
}

export interface ProjectTimeline {
    enabled: boolean; // In Timeline aufnehmen
    startDate: string; // ISO Date
    durationWeeks: number; // Geschätzte Dauer in Wochen
    team: string[]; // Contact-IDs der involvierten Personen
    dependencies: ProjectDependency[]; // Projekt-Abhängigkeiten mit Typ
    milestones: ProjectMilestone[];
    progress?: number; // Manueller Fortschritt 0-100%
    sortOrder?: number; // Anzeigereihenfolge im Gantt-Chart
    capacity?: CapacityUtilization; // Kapazitätsauslastungs-Visualisierung (global für alle Projekte)
}

// Project
export interface Project extends BaseEntity {
    name: string;
    description?: string;
    status: ProjectStatus;
    workspace_id?: string;     // Zuordnung zu Workspace (optional für Rückwärtskompatibilität)
    documents?: Document[]; // Pfad-basierte Dokumente
    timeline?: ProjectTimeline; // Gantt-Chart Zeitplanung
    color?: string; // Hex-Farbe für Timeline-Visualisierung (z.B. "#3b82f6")
}

// Product with versioning - Produktdatenbank (versionierbar)
export interface Product extends BaseEntity {
    project_id?: string;
    parent_id?: string; // For versioning: null = original, otherwise = derived from
    name: string;
    version: string;
    description?: string;
    status: ProductStatus;
    archive_reason?: string;
    container_id?: string; // Verknüpfung zu Gebinde
    container_size?: number; // Gebindegröße in ml
    alcohol_percentage?: number; // Alkoholgehalt in %vol.
    include_alcohol_tax?: boolean; // Checkbox: Alkoholsteuer (12€/L) für Preisfindung
    alcohol_tax_amount?: number; // Berechneter Steuerbetrag
    notes?: string; // Bemerkungsfeld
    documents?: Document[]; // Pfad-basierte Dokumente
}

// Recipe with versioning
export type RecipeType = 'macerate' | 'distillate' | 'blend';

export interface Recipe extends BaseEntity {
    product_id?: string; // Optional: Rezeptur kann auch ohne Produkt existieren
    parent_id?: string; // For versioning: null = original, otherwise = derived from
    name: string;
    version?: string; // Version number (e.g., "1.0", "1.1")
    type: RecipeType;
    description?: string;
    instructions?: string; // Zubereitungsschritte
    yield_amount?: number; // Ausgabemenge
    yield_unit?: string; // Einheit (ml, liter)
    notes?: string; // Bemerkungsfeld
    documents?: Document[]; // Pfad-basierte Dokumente
}

// Alkoholsteuer-Konstante: 12 Euro pro Liter reinem Alkohol
export const ALCOHOL_TAX_PER_LITER = 12;

/**
 * Berechnet die Alkoholsteuer für ein Produkt
 * @param containerSizeML Gebindegröße in Millilitern
 * @param alcoholPercentage Alkoholgehalt in %vol.
 * @returns Steuerbetrag in Euro
 */
export function calculateAlcoholTax(containerSizeML: number, alcoholPercentage: number): number {
    const liters = containerSizeML / 1000;
    const pureAlcoholLiters = liters * (alcoholPercentage / 100);
    return pureAlcoholLiters * ALCOHOL_TAX_PER_LITER;
}

// Recipe Ingredient (junction table)
export interface RecipeIngredient extends BaseEntity {
    recipe_id: string;
    ingredient_id: string;
    amount: number;
    unit: string;
    notes?: string;
    sort_order: number;
}

// Ingredient (master data) - Zutatendatenbank
export interface Ingredient extends BaseEntity {
    name: string;
    alcohol_percentage?: number; // Alkoholgehalt in %vol.
    category?: string; // Kategorie (optional, frei wählbar)
    price_per_unit?: number; // Liter- oder Kilopreis
    unit: 'liter' | 'kilogram'; // Einheit für Preis
    notes?: string; // Bemerkung
    documents?: Document[]; // Pfad-basierte Dokumente
}

// Note / Chaos Storage
export interface Note extends BaseEntity {
    project_id?: string; // null = chaos storage
    product_id?: string;
    title: string;
    content?: string;
    type: NoteType;
    url?: string; // Optional URL reference
    documents?: Document[]; // Pfad-basierte Dokumente
}

// Tag
export interface Tag extends BaseEntity {
    name: string;
    color: string;
}


// Tag Assignment
export interface TagAssignment extends BaseEntity {
    tag_id: string;
    entity_type: 'project' | 'product' | 'note' | 'recipe' | 'ingredient' | 'container' | 'contact' | 'image';
    entity_id: string;
}

// Contact Categories are now managed as entities, see ContactCategoryEntity below
export type ContactType = string;

export interface ContactCategoryEntity extends BaseEntity {
    name: string;           // Angezeigter Name (z.B. "Lieferant")
    value: string;          // Technischer Wert (z.B. "supplier")
    color?: string;         // Optional: Hex-Color für Badge
    icon?: string;          // Optional: Icon-Name
    order: number;          // Sortierung
}

export interface Contact extends BaseEntity {
    name: string;
    last_name?: string;     // Nachname für Sortierung
    type: ContactType;
    company?: string;
    email?: string;
    phone?: string;
    address?: string;
    notes?: string;
    documents?: Document[]; // Pfad-basierte Dokumente
}

// Contact-Project Assignment (junction table)
export interface ContactProjectAssignment extends BaseEntity {
    contact_id: string;
    project_id: string;
    role?: string; // Optional: role description like "Hauptlieferant", "Berater", etc.
}

// Weblink / Research
export interface Weblink extends BaseEntity {
    project_id?: string;
    url: string;
    title: string;
    description?: string;
    type: WeblinkType;
}

// By-Product (Marketing materials etc.)
export interface Byproduct extends BaseEntity {
    product_id: string;
    name: string;
    type: ByproductType;
    description?: string;
    file_path?: string;
}

// Container (Bottles, Labels etc.) - Gebindedatenbank
export interface Container extends BaseEntity {
    name: string;
    type: ContainerType;
    volume?: number; // in ml
    notes?: string; // Bemerkung
    price?: number; // Preis pro Einheit
    documents?: Document[]; // Pfad-basierte Dokumente
}

// Image
export interface Image extends BaseEntity {
    entity_type: 'project' | 'product' | 'note' | 'recipe' | 'ingredient' | 'container' | 'contact';
    entity_id: string;
    data_url: string; // Base64 encoded image
    file_name: string;
    caption?: string;
}

// Task - TODO-Liste
export interface Task extends BaseEntity {
    title: string;
    description?: string;
    assignee?: string; // Name der zuständigen Person
    due_date?: string; // ISO Date
    status: TaskStatus;
    priority: TaskPriority;
    project_id?: string; // Optional: Verknüpfung mit Projekt
    completed_at?: string; // ISO Date when marked as completed
}

// Favorite
export interface Favorite extends BaseEntity {
    entity_type: 'project' | 'product' | 'note' | 'recipe' | 'ingredient' | 'container' | 'contact' | 'weblink';
    entity_id: string;
    sort_order?: number; // Optional: Für benutzerdefinierte Sortierung
}

// Export Format
export interface DataExport {
    export_date: string;
    version: string;
    data: {
        projects: Project[];
        products: Product[];
        recipes: Recipe[];
        recipe_ingredients: RecipeIngredient[];
        ingredients: Ingredient[];
        notes: Note[];
        tags: Tag[];
        tag_assignments: TagAssignment[];
        contacts: Contact[];
        contact_project_assignments: ContactProjectAssignment[];
        weblinks: Weblink[];
        byproducts: Byproduct[];
        containers: Container[];
        images: Image[];
        favorites: Favorite[];
        tasks: Task[];
        workspaces: ProjectWorkspace[];
    };
}
