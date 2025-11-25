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

// Product with versioning
export interface Product extends BaseEntity {
    project_id?: string;
    parent_id?: string; // For versioning: null = original, otherwise = derived from
    name: string;
    version: string;
    description?: string;
    status: ProductStatus;
    archive_reason?: string;
}

// Recipe
export interface Recipe extends BaseEntity {
    product_id: string;
    name: string;
    description?: string;
    instructions?: string;
    yield_amount?: number;
    yield_unit?: string;
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

// Ingredient (master data)
export interface Ingredient extends BaseEntity {
    name: string;
    category: IngredientCategory;
    description?: string;
    supplier?: string;
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
    entity_type: 'project' | 'product' | 'note' | 'recipe';
    entity_id: string;
}

// Contact
export interface Contact extends BaseEntity {
    name: string;
    company?: string;
    email?: string;
    phone?: string;
    notes?: string;
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

// Container (Bottles, Labels etc.)
export interface Container extends BaseEntity {
    name: string;
    type: ContainerType;
    volume?: number;
    description?: string;
    supplier?: string;
}

// Image
export interface Image extends BaseEntity {
    entity_type: string;
    entity_id: string;
    file_path: string;
    caption?: string;
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
        weblinks: Weblink[];
        byproducts: Byproduct[];
        containers: Container[];
        images: Image[];
    };
}
