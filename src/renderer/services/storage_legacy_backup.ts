// NAS-based data service with JSON persistence on Synology NAS
// Data is stored as separate JSON files per entity type on Y:\zweipunktnull\database\

import { v4 as uuidv4 } from 'uuid'
import type {
    Project, Product, Recipe, Note, Tag, TagAssignment, Contact, ContactProjectAssignment,
    Weblink, Ingredient, Byproduct, Container, Image, RecipeIngredient, Favorite
} from '@/shared/types'
import { nasStorage } from './nasStorage'

const STORAGE_KEY = 'gurktaler_data' // Legacy key for migration only

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

// Load data from NAS (async)
async function loadFromNas<T>(entityType: keyof AppData): Promise<T[]> {
    try {
        const data = await nasStorage.readJson<T>(
            nasStorage.getJsonFilePath(entityType as string)
        )
        return data
    } catch (error) {
        console.error(`Failed to load ${entityType} from NAS:`, error)
        return []
    }
}

// Save data to NAS (async)
async function saveToNas<T>(entityType: keyof AppData, data: T[]): Promise<void> {
    try {
        await nasStorage.writeJson(
            nasStorage.getJsonFilePath(entityType as string),
            data
        )
    } catch (error) {
        console.error(`Failed to save ${entityType} to NAS:`, error)
        throw error
    }
}

// Export data as JSON string (for backup)
export async function exportData(): Promise<string> {
    const allData: Partial<AppData> = {}
    
    // Load all entity types from NAS
    for (const key of Object.keys(defaultData) as (keyof AppData)[]) {
        allData[key] = await loadFromNas(key) as never
    }
    
    return JSON.stringify({
        export_date: new Date().toISOString(),
        version: '1.1.0',
        storage_type: 'nas',
        data: allData,
    }, null, 2)
}

// Import data from JSON string
export async function importData(jsonString: string): Promise<boolean> {
    try {
        const parsed = JSON.parse(jsonString)
        if (parsed.data) {
            // Write each entity type to separate NAS file
            for (const [key, value] of Object.entries(parsed.data)) {
                if (key in defaultData) {
                    await saveToNas(key as keyof AppData, value as never[])
                }
            }
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

// Generic CRUD operations (async)
async function createEntity<T extends { id: string; created_at: string; name?: string; title?: string }>(
    key: keyof AppData,
    entity: Omit<T, 'id' | 'created_at'>
): Promise<T> {
    const data = await loadFromNas<T>(key)
    const newEntity = {
        ...entity,
        id: uuidv4(),
        created_at: now(),
    } as T
    
    data.push(newEntity)
    await saveToNas(key, data)
    
    return newEntity
}

async function updateEntity<T extends { id: string; updated_at?: string; name?: string; title?: string }>(
    key: keyof AppData,
    id: string,
    updates: Partial<T>
): Promise<T | null> {
    const data = await loadFromNas<T>(key)
    const index = data.findIndex((item) => item.id === id)
    if (index === -1) return null

    data[index] = { ...data[index], ...updates, updated_at: now() }
    await saveToNas(key, data)
    
    return data[index]
}

async function deleteEntity<T extends { id: string }>(
    key: keyof AppData, 
    id: string
): Promise<boolean> {
    const data = await loadFromNas<T>(key)
    const index = data.findIndex((item) => item.id === id)
    if (index === -1) return false

    data.splice(index, 1)
    await saveToNas(key, data)
    
    return true
}

// Projects
export const projects = {
    getAll: async (): Promise<Project[]> => await loadFromNas<Project>('projects'),
    getById: async (id: string): Promise<Project | undefined> => {
        const all = await loadFromNas<Project>('projects')
        return all.find(p => p.id === id)
    },
    create: (project: Omit<Project, 'id' | 'created_at'>) => createEntity<Project>('projects', project),
    update: (id: string, updates: Partial<Project>) => updateEntity<Project>('projects', id, updates),
    delete: (id: string) => deleteEntity<Project>('projects', id),
}

// Products
export const products = {
    getAll: async (): Promise<Product[]> => await loadFromNas<Product>('products'),
    getById: async (id: string): Promise<Product | undefined> => {
        const all = await loadFromNas<Product>('products')
        return all.find(p => p.id === id)
    },
    getByProject: async (projectId: string): Promise<Product[]> => {
        const all = await loadFromNas<Product>('products')
        return all.filter(p => p.project_id === projectId)
    },
    getVersions: async (parentId: string): Promise<Product[]> => {
        const all = await loadFromNas<Product>('products')
        return all.filter(p => p.parent_id === parentId)
    },
    create: (product: Omit<Product, 'id' | 'created_at'>) => createEntity<Product>('products', product),
    update: (id: string, updates: Partial<Product>) => updateEntity<Product>('products', id, updates),
    delete: (id: string) => deleteEntity<Product>('products', id),
}

// Notes
export const notes = {
    getAll: async (): Promise<Note[]> => await loadFromNas<Note>('notes'),
    getById: async (id: string): Promise<Note | undefined> => {
        const all = await loadFromNas<Note>('notes')
        return all.find(n => n.id === id)
    },
    getChaos: async (): Promise<Note[]> => {
        const all = await loadFromNas<Note>('notes')
        return all.filter(n => !n.project_id)
    },
    getByProject: async (projectId: string): Promise<Note[]> => {
        const all = await loadFromNas<Note>('notes')
        return all.filter(n => n.project_id === projectId)
    },
    create: (note: Omit<Note, 'id' | 'created_at'>) => createEntity<Note>('notes', note),
    update: (id: string, updates: Partial<Note>) => updateEntity<Note>('notes', id, updates),
    delete: (id: string) => deleteEntity<Note>('notes', id),
}

// Recipes
export const recipes = {
    getAll: async (): Promise<Recipe[]> => await loadFromNas<Recipe>('recipes'),
    getById: async (id: string): Promise<Recipe | undefined> => {
        const all = await loadFromNas<Recipe>('recipes')
        return all.find(r => r.id === id)
    },
    getByProduct: async (productId: string): Promise<Recipe[]> => {
        const all = await loadFromNas<Recipe>('recipes')
        return all.filter(r => r.product_id === productId)
    },
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
            createEntity<Favorite>('favorites', { entity_type: entityType as 'project' | 'product' | 'note' | 'recipe' | 'ingredient' | 'container' | 'contact' | 'weblink', entity_id: entityId })
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
