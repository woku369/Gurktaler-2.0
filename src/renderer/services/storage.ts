// LocalStorage-based data service with JSON persistence
// Perfect for Git synchronization - data is stored as JSON files

import { v4 as uuidv4 } from 'uuid'
import type {
    Project, Product, Recipe, Note, Tag, Contact,
    Weblink, Ingredient, Byproduct, Container
} from '@/shared/types'

const STORAGE_KEY = 'gurktaler_data'

interface AppData {
    projects: Project[]
    products: Product[]
    recipes: Recipe[]
    notes: Note[]
    tags: Tag[]
    contacts: Contact[]
    weblinks: Weblink[]
    ingredients: Ingredient[]
    byproducts: Byproduct[]
    containers: Container[]
}

const defaultData: AppData = {
    projects: [],
    products: [],
    recipes: [],
    notes: [],
    tags: [],
    contacts: [],
    weblinks: [],
    ingredients: [],
    byproducts: [],
    containers: [],
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
function createEntity<T extends { id: string; created_at: string }>(
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
    return newEntity
}

function updateEntity<T extends { id: string; updated_at?: string }>(
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
    return items[index]
}

function deleteEntity<T extends { id: string }>(key: keyof AppData, id: string): boolean {
    const data = loadData()
    const items = data[key] as unknown as T[]
    const index = items.findIndex((item) => item.id === id)
    if (index === -1) return false

    items.splice(index, 1)
    saveData(data)
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
    create: (tag: Omit<Tag, 'id' | 'created_at'>) => createEntity<Tag>('tags', tag),
    delete: (id: string) => deleteEntity<Tag>('tags', id),
}

// Ingredients
export const ingredients = {
    getAll: (): Ingredient[] => loadData().ingredients,
    getById: (id: string): Ingredient | undefined => loadData().ingredients.find(i => i.id === id),
    create: (ingredient: Omit<Ingredient, 'id' | 'created_at'>) => createEntity<Ingredient>('ingredients', ingredient),
    update: (id: string, updates: Partial<Ingredient>) => updateEntity<Ingredient>('ingredients', id, updates),
    delete: (id: string) => deleteEntity<Ingredient>('ingredients', id),
}
