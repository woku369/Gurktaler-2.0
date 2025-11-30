// LocalStorage-based data service with JSON persistence
// Perfect for Git synchronization - data is stored as JSON files

import { v4 as uuidv4 } from 'uuid'
import type {
    Project, Product, Recipe, Note, Tag, TagAssignment, Contact, ContactProjectAssignment,
    Weblink, Ingredient, Byproduct, Container, Image, RecipeIngredient, Favorite
} from '@/shared/types'
import { autoCommit } from './git'

const STORAGE_KEY = 'gurktaler_data'

interface AppData {
    projects: Project[]
    products: Product[]
    recipes: Recipe[]
    recipe_ingredients: RecipeIngredient[]
    notes: Note[]
    tags: Tag[]
    tag_assignments: TagAssignment[]
    contacts: Contact[]
    contact_project_assignments: ContactProjectAssignment[]
    weblinks: Weblink[]
    ingredients: Ingredient[]
    byproducts: Byproduct[]
    containers: Container[]
    images: Image[]
    favorites: Favorite[]
}

const defaultData: AppData = {
    projects: [],
    products: [],
    recipes: [],
    recipe_ingredients: [],
    notes: [],
    tags: [],
    tag_assignments: [],
    contacts: [],
    contact_project_assignments: [],
    weblinks: [],
    ingredients: [],
    byproducts: [],
    containers: [],
    images: [],
    favorites: [],
}

// Load data from localStorage
export function loadData(): AppData {
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            return { ...defaultData, ...JSON.parse(stored) }
        }
    } catch (error) {
        console.error('Failed to load data:', error)
    }
    return defaultData
}

// Save data to localStorage
export function saveData(data: AppData): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
        console.error('Failed to save data:', error)
    }
}

// Export data as JSON string (for Git sync)
export function exportData(): string {
    const data = loadData()
    return JSON.stringify({
        export_date: new Date().toISOString(),
        version: '0.1.0',
        data,
    }, null, 2)
}

// Import data from JSON string
export function importData(jsonString: string): boolean {
    try {
        const parsed = JSON.parse(jsonString)
        if (parsed.data) {
            saveData({ ...defaultData, ...parsed.data })
            return true
        }
    } catch (error) {
        console.error('Failed to import data:', error)
    }
    return false
}

// Helper to create timestamps
function now(): string {
    return new Date().toISOString()
}

// Generic CRUD operations
function createEntity<T extends { id: string; created_at: string; name?: string; title?: string }>(
    key: keyof AppData,
    entity: Omit<T, 'id' | 'created_at'>
): T {
    const data = loadData()
    const newEntity = {
        ...entity,
        id: uuidv4(),
        created_at: now(),
    } as T
        ; (data[key] as unknown as T[]).push(newEntity)
    saveData(data)
    
    // Auto-Commit
    const entityName = (newEntity as { name?: string; title?: string }).name || 
                      (newEntity as { name?: string; title?: string }).title
    autoCommit(key, 'created', entityName).catch(console.error)
    
    return newEntity
}

function updateEntity<T extends { id: string; updated_at?: string; name?: string; title?: string }>(
    key: keyof AppData,
    id: string,
    updates: Partial<T>
): T | null {
    const data = loadData()
    const items = data[key] as unknown as T[]
    const index = items.findIndex((item) => item.id === id)
    if (index === -1) return null

    items[index] = { ...items[index], ...updates, updated_at: now() }
    saveData(data)
    
    // Auto-Commit
    const entityName = (items[index] as { name?: string; title?: string }).name || 
                      (items[index] as { name?: string; title?: string }).title
    autoCommit(key, 'updated', entityName).catch(console.error)
    
    return items[index]
}

function deleteEntity<T extends { id: string; name?: string; title?: string }>(key: keyof AppData, id: string): boolean {
    const data = loadData()
    const items = data[key] as unknown as T[]
    const index = items.findIndex((item) => item.id === id)
    if (index === -1) return false

    const entityName = (items[index] as { name?: string; title?: string }).name || 
                      (items[index] as { name?: string; title?: string }).title
    
    items.splice(index, 1)
    saveData(data)
    
    // Auto-Commit
    autoCommit(key, 'deleted', entityName).catch(console.error)
    
    return true
}

// Projects
export const projects = {
    getAll: (): Project[] => loadData().projects,
    getById: (id: string): Project | undefined => loadData().projects.find(p => p.id === id),
    create: (project: Omit<Project, 'id' | 'created_at'>) => createEntity<Project>('projects', project),
    update: (id: string, updates: Partial<Project>) => updateEntity<Project>('projects', id, updates),
    delete: (id: string) => deleteEntity<Project>('projects', id),
}

// Products
export const products = {
    getAll: (): Product[] => loadData().products,
    getById: (id: string): Product | undefined => loadData().products.find(p => p.id === id),
    getByProject: (projectId: string): Product[] => loadData().products.filter(p => p.project_id === projectId),
    getVersions: (parentId: string): Product[] => loadData().products.filter(p => p.parent_id === parentId),
    create: (product: Omit<Product, 'id' | 'created_at'>) => createEntity<Product>('products', product),
    update: (id: string, updates: Partial<Product>) => updateEntity<Product>('products', id, updates),
    delete: (id: string) => deleteEntity<Product>('products', id),
}

// Notes
export const notes = {
    getAll: (): Note[] => loadData().notes,
    getById: (id: string): Note | undefined => loadData().notes.find(n => n.id === id),
    getChaos: (): Note[] => loadData().notes.filter(n => !n.project_id), // Chaosablage
    getByProject: (projectId: string): Note[] => loadData().notes.filter(n => n.project_id === projectId),
    create: (note: Omit<Note, 'id' | 'created_at'>) => createEntity<Note>('notes', note),
    update: (id: string, updates: Partial<Note>) => updateEntity<Note>('notes', id, updates),
    delete: (id: string) => deleteEntity<Note>('notes', id),
}

// Recipes
export const recipes = {
    getAll: (): Recipe[] => loadData().recipes,
    getById: (id: string): Recipe | undefined => loadData().recipes.find(r => r.id === id),
    getByProduct: (productId: string): Recipe[] => loadData().recipes.filter(r => r.product_id === productId),
    create: (recipe: Omit<Recipe, 'id' | 'created_at'>) => createEntity<Recipe>('recipes', recipe),
    update: (id: string, updates: Partial<Recipe>) => updateEntity<Recipe>('recipes', id, updates),
    delete: (id: string) => deleteEntity<Recipe>('recipes', id),
}

// Contacts
export const contacts = {
    getAll: (): Contact[] => loadData().contacts,
    getById: (id: string): Contact | undefined => loadData().contacts.find(c => c.id === id),
    create: (contact: Omit<Contact, 'id' | 'created_at'>) => createEntity<Contact>('contacts', contact),
    update: (id: string, updates: Partial<Contact>) => updateEntity<Contact>('contacts', id, updates),
    delete: (id: string) => deleteEntity<Contact>('contacts', id),
}

// Weblinks
export const weblinks = {
    getAll: (): Weblink[] => loadData().weblinks,
    getById: (id: string): Weblink | undefined => loadData().weblinks.find(w => w.id === id),
    create: (weblink: Omit<Weblink, 'id' | 'created_at'>) => createEntity<Weblink>('weblinks', weblink),
    update: (id: string, updates: Partial<Weblink>) => updateEntity<Weblink>('weblinks', id, updates),
    delete: (id: string) => deleteEntity<Weblink>('weblinks', id),
}

// Tags
export const tags = {
    getAll: (): Tag[] => loadData().tags,
    getById: (id: string): Tag | undefined => loadData().tags.find(t => t.id === id),
    create: (tag: Omit<Tag, 'id' | 'created_at'>) => createEntity<Tag>('tags', tag),
    update: (id: string, updates: Partial<Tag>) => updateEntity<Tag>('tags', id, updates),
    delete: (id: string) => deleteEntity<Tag>('tags', id),
}

// Tag Assignments
export const tagAssignments = {
    getAll: (): TagAssignment[] => loadData().tag_assignments,
    getByEntity: (entityType: string, entityId: string): TagAssignment[] => 
        loadData().tag_assignments.filter(ta => ta.entity_type === entityType && ta.entity_id === entityId),
    getByTag: (tagId: string): TagAssignment[] => 
        loadData().tag_assignments.filter(ta => ta.tag_id === tagId),
    create: (assignment: Omit<TagAssignment, 'id' | 'created_at'>) => createEntity<TagAssignment>('tag_assignments', assignment),
    delete: (id: string) => deleteEntity<TagAssignment>('tag_assignments', id),
    deleteByEntity: (entityType: string, entityId: string) => {
        const data = loadData()
        data.tag_assignments = data.tag_assignments.filter(
            ta => !(ta.entity_type === entityType && ta.entity_id === entityId)
        )
        saveData(data)
    },
}

// Contact-Project Assignments
export const contactProjectAssignments = {
    getAll: (): ContactProjectAssignment[] => loadData().contact_project_assignments,
    getByContact: (contactId: string): ContactProjectAssignment[] =>
        loadData().contact_project_assignments.filter(cpa => cpa.contact_id === contactId),
    getByProject: (projectId: string): ContactProjectAssignment[] =>
        loadData().contact_project_assignments.filter(cpa => cpa.project_id === projectId),
    create: (assignment: Omit<ContactProjectAssignment, 'id' | 'created_at'>) => 
        createEntity<ContactProjectAssignment>('contact_project_assignments', assignment),
    update: (id: string, updates: Partial<ContactProjectAssignment>) => 
        updateEntity<ContactProjectAssignment>('contact_project_assignments', id, updates),
    delete: (id: string) => deleteEntity<ContactProjectAssignment>('contact_project_assignments', id),
    deleteByContact: (contactId: string) => {
        const data = loadData()
        data.contact_project_assignments = data.contact_project_assignments.filter(
            cpa => cpa.contact_id !== contactId
        )
        saveData(data)
    },
}

// Ingredients
export const ingredients = {
    getAll: (): Ingredient[] => loadData().ingredients,
    getById: (id: string): Ingredient | undefined => loadData().ingredients.find(i => i.id === id),
    create: (ingredient: Omit<Ingredient, 'id' | 'created_at'>) => createEntity<Ingredient>('ingredients', ingredient),
    update: (id: string, updates: Partial<Ingredient>) => updateEntity<Ingredient>('ingredients', id, updates),
    delete: (id: string) => deleteEntity<Ingredient>('ingredients', id),
}

// Containers
export const containers = {
    getAll: (): Container[] => loadData().containers,
    getById: (id: string): Container | undefined => loadData().containers.find(c => c.id === id),
    create: (container: Omit<Container, 'id' | 'created_at'>) => createEntity<Container>('containers', container),
    update: (id: string, updates: Partial<Container>) => updateEntity<Container>('containers', id, updates),
    delete: (id: string) => deleteEntity<Container>('containers', id),
}

// Recipe Ingredients (Junction table)
export const recipeIngredients = {
    getAll: (): RecipeIngredient[] => loadData().recipe_ingredients,
    getById: (id: string): RecipeIngredient | undefined => loadData().recipe_ingredients.find(ri => ri.id === id),
    getByRecipe: (recipeId: string): RecipeIngredient[] => 
        loadData().recipe_ingredients.filter(ri => ri.recipe_id === recipeId),
    create: (recipeIngredient: Omit<RecipeIngredient, 'id' | 'created_at'>) => 
        createEntity<RecipeIngredient>('recipe_ingredients', recipeIngredient),
    update: (id: string, updates: Partial<RecipeIngredient>) => 
        updateEntity<RecipeIngredient>('recipe_ingredients', id, updates),
    delete: (id: string) => deleteEntity<RecipeIngredient>('recipe_ingredients', id),
}

// Images
export const images = {
    getAll: (): Image[] => loadData().images,
    getById: (id: string): Image | undefined => loadData().images.find(i => i.id === id),
    getByEntity: (entityType: string, entityId: string): Image[] =>
        loadData().images.filter(i => i.entity_type === entityType && i.entity_id === entityId),
    create: (image: Omit<Image, 'id' | 'created_at'>) => createEntity<Image>('images', image),
    update: (id: string, updates: Partial<Image>) => updateEntity<Image>('images', id, updates),
    delete: (id: string) => deleteEntity<Image>('images', id),
    deleteByEntity: (entityType: string, entityId: string) => {
        const data = loadData()
        data.images = data.images.filter(
            i => !(i.entity_type === entityType && i.entity_id === entityId)
        )
        saveData(data)
    },
}

// Favorites
export const favorites = {
    getAll: (): Favorite[] => loadData().favorites.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)),
    getById: (id: string): Favorite | undefined => loadData().favorites.find(f => f.id === id),
    getByEntity: (entityType: string, entityId: string): Favorite | undefined =>
        loadData().favorites.find(f => f.entity_type === entityType && f.entity_id === entityId),
    isFavorite: (entityType: string, entityId: string): boolean =>
        loadData().favorites.some(f => f.entity_type === entityType && f.entity_id === entityId),
    create: (favorite: Omit<Favorite, 'id' | 'created_at'>) => createEntity<Favorite>('favorites', favorite),
    toggle: (entityType: string, entityId: string): boolean => {
        const existing = loadData().favorites.find(
            f => f.entity_type === entityType && f.entity_id === entityId
        )
        if (existing) {
            deleteEntity<Favorite>('favorites', existing.id)
            return false // Removed from favorites
        } else {
            createEntity<Favorite>('favorites', { entity_type: entityType, entity_id: entityId })
            return true // Added to favorites
        }
    },
    update: (id: string, updates: Partial<Favorite>) => updateEntity<Favorite>('favorites', id, updates),
    delete: (id: string) => deleteEntity<Favorite>('favorites', id),
    deleteByEntity: (entityType: string, entityId: string) => {
        const data = loadData()
        data.favorites = data.favorites.filter(
            f => !(f.entity_type === entityType && f.entity_id === entityId)
        )
        saveData(data)
    },
}
