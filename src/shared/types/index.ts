// Shared TypeScript Types for Gurktaler 2.0

// Status Types
export type ProjectStatus = 'active' | 'paused' | 'completed' | 'archived';
export type ProductStatus = 'draft' | 'testing' | 'approved' | 'archived';
export type NoteType = 'idea' | 'note' | 'todo' | 'research';
export type IngredientCategory = 'mazerat' | 'destillat' | 'rohstoff' | 'alkohol' | 'sonstiges';
export type WeblinkType = 'competitor' | 'research' | 'supplier' | 'other';
export type ByproductType = 'marketing' | 'packaging' | 'label' | 'other';
export type ContainerType = 'bottle' | 'label' | 'cap' | 'box' | 'other';

// Base Entity
export interface BaseEntity {
    id: string;
    created_at: string;
    updated_at?: string;
}

// Project
export interface Project extends BaseEntity {
    name: string;
    description?: string;
    status: ProjectStatus;
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
}

// Recipe
export type RecipeType = 'macerate' | 'distillate' | 'blend';

export interface Recipe extends BaseEntity {
    product_id?: string; // Optional: Rezeptur kann auch ohne Produkt existieren
    name: string;
    type: RecipeType;
    description?: string;
    instructions?: string; // Zubereitungsschritte
    yield_amount?: number; // Ausgabemenge
    yield_unit?: string; // Einheit (ml, liter)
    notes?: string; // Bemerkungsfeld
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
}

// Note / Chaos Storage
export interface Note extends BaseEntity {
    project_id?: string; // null = chaos storage
    product_id?: string;
    title: string;
    content?: string;
    type: NoteType;
}

// Tag
export interface Tag extends BaseEntity {
    name: string;
    color: string;
}


// Tag Assignment
export interface TagAssignment extends BaseEntity {
    tag_id: string;
    entity_type: 'project' | 'product' | 'note' | 'recipe' | 'ingredient' | 'container';
    entity_id: string;
}

// Contact
export type ContactType = 'supplier' | 'partner' | 'customer' | 'other';

export interface Contact extends BaseEntity {
    name: string;
    type: ContactType;
    company?: string;
    email?: string;
    phone?: string;
    address?: string;
    notes?: string;
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
}

// Image
export interface Image extends BaseEntity {
    entity_type: 'project' | 'product' | 'note' | 'recipe' | 'ingredient' | 'container';
    entity_id: string;
    data_url: string; // Base64 encoded image
    file_name: string;
    caption?: string;
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
    };
}
