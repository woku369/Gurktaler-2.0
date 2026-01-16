// NAS-based data service with JSON persistence on Synology NAS
// Data is stored as separate JSON files per entity type on Y:\zweipunktnull\database\

import { v4 as uuidv4 } from 'uuid'
import type {
    Project, Product, Recipe, Note, Tag, TagAssignment, Contact, ContactCategoryEntity, ContactProjectAssignment,
    Weblink, Document, DocumentCategoryEntity, Ingredient, Byproduct, Container, Image, RecipeIngredient, Favorite, CapacityUtilization,
    Task, TaskStatus, ProjectWorkspace
} from '@/shared/types'
import { nasStorage } from './nasStorage'

// Helper to create timestamps
function now(): string {
    return new Date().toISOString()
}

// Generic CRUD operations (async)
async function createEntity<T extends { id: string; created_at: string }>(
    entityType: string,
    entity: Omit<T, 'id' | 'created_at'>
): Promise<T> {
    const filePath = nasStorage.getJsonFilePath(entityType)
    const data = await nasStorage.readJson<T>(filePath)
    
    const newEntity = {
        ...entity,
        id: uuidv4(),
        created_at: now(),
    } as T
    
    data.push(newEntity)
    await nasStorage.writeJson(filePath, data)
    
    console.log(`✅ Created ${entityType}:`, newEntity.id)
    return newEntity
}

async function updateEntity<T extends { id: string; updated_at?: string }>(
    entityType: string,
    id: string,
    updates: Partial<T>
): Promise<T | null> {
    const filePath = nasStorage.getJsonFilePath(entityType)
    const data = await nasStorage.readJson<T>(filePath)
    const index = data.findIndex((item) => item.id === id)
    if (index === -1) return null

    data[index] = { ...data[index], ...updates, updated_at: now() }
    await nasStorage.writeJson(filePath, data)
    
    console.log(`✅ Updated ${entityType}:`, id)
    return data[index]
}

async function deleteEntity<T extends { id: string }>(
    entityType: string,
    id: string
): Promise<boolean> {
    const filePath = nasStorage.getJsonFilePath(entityType)
    const data = await nasStorage.readJson<T>(filePath)
    const index = data.findIndex((item) => item.id === id)
    if (index === -1) return false

    data.splice(index, 1)
    await nasStorage.writeJson(filePath, data)
    
    console.log(`✅ Deleted ${entityType}:`, id)
    return true
}

// Projects
export const projects = {
    getAll: async (): Promise<Project[]> => await nasStorage.readJson<Project>(nasStorage.getJsonFilePath('projects')),
    getById: async (id: string): Promise<Project | undefined> => {
        const all = await nasStorage.readJson<Project>(nasStorage.getJsonFilePath('projects'))
        return all.find(p => p.id === id)
    },
    create: (project: Omit<Project, 'id' | 'created_at'>) => createEntity<Project>('projects', project),
    update: (id: string, updates: Partial<Project>) => updateEntity<Project>('projects', id, updates),
    delete: (id: string) => deleteEntity<Project>('projects', id),
}

// Products
export const products = {
    getAll: async (): Promise<Product[]> => await nasStorage.readJson<Product>(nasStorage.getJsonFilePath('products')),
    getById: async (id: string): Promise<Product | undefined> => {
        const all = await nasStorage.readJson<Product>(nasStorage.getJsonFilePath('products'))
        return all.find(p => p.id === id)
    },
    getByProject: async (projectId: string): Promise<Product[]> => {
        const all = await nasStorage.readJson<Product>(nasStorage.getJsonFilePath('products'))
        return all.filter(p => p.project_id === projectId)
    },
    getVersions: async (parentId: string): Promise<Product[]> => {
        const all = await nasStorage.readJson<Product>(nasStorage.getJsonFilePath('products'))
        return all.filter(p => p.parent_id === parentId)
    },
    create: (product: Omit<Product, 'id' | 'created_at'>) => createEntity<Product>('products', product),
    update: (id: string, updates: Partial<Product>) => updateEntity<Product>('products', id, updates),
    delete: (id: string) => deleteEntity<Product>('products', id),
}

// Notes
export const notes = {
    getAll: async (): Promise<Note[]> => await nasStorage.readJson<Note>(nasStorage.getJsonFilePath('notes')),
    getById: async (id: string): Promise<Note | undefined> => {
        const all = await nasStorage.readJson<Note>(nasStorage.getJsonFilePath('notes'))
        return all.find(n => n.id === id)
    },
    getChaos: async (): Promise<Note[]> => {
        const all = await nasStorage.readJson<Note>(nasStorage.getJsonFilePath('notes'))
        return all.filter(n => !n.project_id)
    },
    getByProject: async (projectId: string): Promise<Note[]> => {
        const all = await nasStorage.readJson<Note>(nasStorage.getJsonFilePath('notes'))
        return all.filter(n => n.project_id === projectId)
    },
    create: (note: Omit<Note, 'id' | 'created_at'>) => createEntity<Note>('notes', note),
    update: (id: string, updates: Partial<Note>) => updateEntity<Note>('notes', id, updates),
    delete: (id: string) => deleteEntity<Note>('notes', id),
}

// Recipes
export const recipes = {
    getAll: async (): Promise<Recipe[]> => await nasStorage.readJson<Recipe>(nasStorage.getJsonFilePath('recipes')),
    getById: async (id: string): Promise<Recipe | undefined> => {
        const all = await nasStorage.readJson<Recipe>(nasStorage.getJsonFilePath('recipes'))
        return all.find(r => r.id === id)
    },
    getByProduct: async (productId: string): Promise<Recipe[]> => {
        const all = await nasStorage.readJson<Recipe>(nasStorage.getJsonFilePath('recipes'))
        return all.filter(r => r.product_id === productId)
    },
    create: (recipe: Omit<Recipe, 'id' | 'created_at'>) => createEntity<Recipe>('recipes', recipe),
    update: (id: string, updates: Partial<Recipe>) => updateEntity<Recipe>('recipes', id, updates),
    delete: (id: string) => deleteEntity<Recipe>('recipes', id),
}

// Contacts
export const contacts = {
    getAll: async (): Promise<Contact[]> => await nasStorage.readJson<Contact>(nasStorage.getJsonFilePath('contacts')),
    getById: async (id: string): Promise<Contact | undefined> => {
        const all = await nasStorage.readJson<Contact>(nasStorage.getJsonFilePath('contacts'))
        return all.find(c => c.id === id)
    },
    create: (contact: Omit<Contact, 'id' | 'created_at'>) => createEntity<Contact>('contacts', contact),
    update: (id: string, updates: Partial<Contact>) => updateEntity<Contact>('contacts', id, updates),
    delete: (id: string) => deleteEntity<Contact>('contacts', id),
}

// Contact Categories
export const contactCategories = {
    getAll: async (): Promise<ContactCategoryEntity[]> => {
        try {
            return await nasStorage.readJson<ContactCategoryEntity>(nasStorage.getJsonFilePath('contact_categories'));
        } catch {
            // Fallback zu Standard-Kategorien, wenn noch keine existieren
            return await contactCategories.initializeDefaults();
        }
    },
    getById: async (id: string): Promise<ContactCategoryEntity | undefined> => {
        const all = await contactCategories.getAll();
        return all.find(c => c.id === id);
    },
    create: (category: Omit<ContactCategoryEntity, 'id' | 'created_at'>) => createEntity<ContactCategoryEntity>('contact_categories', category),
    update: (id: string, updates: Partial<ContactCategoryEntity>) => updateEntity<ContactCategoryEntity>('contact_categories', id, updates),
    delete: (id: string) => deleteEntity<ContactCategoryEntity>('contact_categories', id),
    initializeDefaults: async (): Promise<ContactCategoryEntity[]> => {
        const defaults: Omit<ContactCategoryEntity, 'id' | 'created_at'>[] = [
            { name: 'Lieferant', value: 'supplier', color: '#10b981', icon: '🏭', order: 0 },
            { name: 'Partner', value: 'partner', color: '#3b82f6', icon: '🤝', order: 1 },
            { name: 'Kunde', value: 'customer', color: '#8b5cf6', icon: '👥', order: 2 },
            { name: 'Sonstiges', value: 'other', color: '#6b7280', icon: '📎', order: 3 },
        ];
        
        for (const category of defaults) {
            await contactCategories.create(category);
        }
        
        return await contactCategories.getAll();
    }
}

// Weblinks
export const weblinks = {
    getAll: async (): Promise<Weblink[]> => await nasStorage.readJson<Weblink>(nasStorage.getJsonFilePath('weblinks')),
    getById: async (id: string): Promise<Weblink | undefined> => {
        const all = await nasStorage.readJson<Weblink>(nasStorage.getJsonFilePath('weblinks'))
        return all.find(w => w.id === id)
    },
    create: (weblink: Omit<Weblink, 'id' | 'created_at'>) => createEntity<Weblink>('weblinks', weblink),
    update: (id: string, updates: Partial<Weblink>) => updateEntity<Weblink>('weblinks', id, updates),
    delete: (id: string) => deleteEntity<Weblink>('weblinks', id),
}

// Documents
export const documents = {
    getAll: async (): Promise<Document[]> => await nasStorage.readJson<Document>(nasStorage.getJsonFilePath('documents')),
    getById: async (id: string): Promise<Document | undefined> => {
        const all = await nasStorage.readJson<Document>(nasStorage.getJsonFilePath('documents'))
        return all.find(d => d.id === id)
    },
    getByProject: async (projectId: string): Promise<Document[]> => {
        const all = await nasStorage.readJson<Document>(nasStorage.getJsonFilePath('documents'))
        return all.filter(d => d.project_id === projectId)
    },
    create: (document: Omit<Document, 'id' | 'created_at'>) => createEntity<Document>('documents', document),
    update: (id: string, updates: Partial<Document>) => updateEntity<Document>('documents', id, updates),
    delete: (id: string) => deleteEntity<Document>('documents', id),
}

// Document Categories
export const documentCategories = {
    getAll: async (): Promise<DocumentCategoryEntity[]> => {
        try {
            return await nasStorage.readJson<DocumentCategoryEntity>(nasStorage.getJsonFilePath('document_categories'));
        } catch {
            // Fallback zu Standard-Kategorien, wenn noch keine existieren
            return await documentCategories.initializeDefaults();
        }
    },
    getById: async (id: string): Promise<DocumentCategoryEntity | undefined> => {
        const all = await documentCategories.getAll();
        return all.find(c => c.id === id);
    },
    create: (category: Omit<DocumentCategoryEntity, 'id' | 'created_at'>) => createEntity<DocumentCategoryEntity>('document_categories', category),
    update: (id: string, updates: Partial<DocumentCategoryEntity>) => updateEntity<DocumentCategoryEntity>('document_categories', id, updates),
    delete: (id: string) => deleteEntity<DocumentCategoryEntity>('document_categories', id),
    initializeDefaults: async (): Promise<DocumentCategoryEntity[]> => {
        const defaults: Omit<DocumentCategoryEntity, 'id' | 'created_at'>[] = [
            { name: 'Rezept', value: 'recipe', color: '#10b981', icon: '📋', order: 0 },
            { name: 'Analyse', value: 'analysis', color: '#3b82f6', icon: '🔬', order: 1 },
            { name: 'Marketing', value: 'marketing', color: '#8b5cf6', icon: '📢', order: 2 },
            { name: 'Etikett', value: 'label', color: '#f59e0b', icon: '🏷️', order: 3 },
            { name: 'Dokumentation', value: 'documentation', color: '#6366f1', icon: '📄', order: 4 },
            { name: 'Sonstiges', value: 'other', color: '#6b7280', icon: '📎', order: 5 },
        ];
        
        for (const category of defaults) {
            await documentCategories.create(category);
        }
        
        return await documentCategories.getAll();
    }
}

// Tags
export const tags = {
    getAll: async (): Promise<Tag[]> => await nasStorage.readJson<Tag>(nasStorage.getJsonFilePath('tags')),
    getById: async (id: string): Promise<Tag | undefined> => {
        const all = await nasStorage.readJson<Tag>(nasStorage.getJsonFilePath('tags'))
        return all.find(t => t.id === id)
    },
    create: (tag: Omit<Tag, 'id' | 'created_at'>) => createEntity<Tag>('tags', tag),
    update: (id: string, updates: Partial<Tag>) => updateEntity<Tag>('tags', id, updates),
    delete: (id: string) => deleteEntity<Tag>('tags', id),
}

// Tag Assignments
export const tagAssignments = {
    getAll: async (): Promise<TagAssignment[]> => await nasStorage.readJson<TagAssignment>(nasStorage.getJsonFilePath('tag_assignments')),
    getByEntity: async (entityType: string, entityId: string): Promise<TagAssignment[]> => {
        const all = await nasStorage.readJson<TagAssignment>(nasStorage.getJsonFilePath('tag_assignments'))
        return all.filter(ta => ta.entity_type === entityType && ta.entity_id === entityId)
    },
    getByTag: async (tagId: string): Promise<TagAssignment[]> => {
        const all = await nasStorage.readJson<TagAssignment>(nasStorage.getJsonFilePath('tag_assignments'))
        return all.filter(ta => ta.tag_id === tagId)
    },
    create: (assignment: Omit<TagAssignment, 'id' | 'created_at'>) => createEntity<TagAssignment>('tag_assignments', assignment),
    delete: (id: string) => deleteEntity<TagAssignment>('tag_assignments', id),
    deleteByEntity: async (entityType: string, entityId: string) => {
        const filePath = nasStorage.getJsonFilePath('tag_assignments')
        let data = await nasStorage.readJson<TagAssignment>(filePath)
        data = data.filter(ta => !(ta.entity_type === entityType && ta.entity_id === entityId))
        await nasStorage.writeJson(filePath, data)
    },
}

// Contact-Project Assignments
export const contactProjectAssignments = {
    getAll: async (): Promise<ContactProjectAssignment[]> => await nasStorage.readJson<ContactProjectAssignment>(nasStorage.getJsonFilePath('contact_project_assignments')),
    getByContact: async (contactId: string): Promise<ContactProjectAssignment[]> => {
        const all = await nasStorage.readJson<ContactProjectAssignment>(nasStorage.getJsonFilePath('contact_project_assignments'))
        return all.filter(cpa => cpa.contact_id === contactId)
    },
    getByProject: async (projectId: string): Promise<ContactProjectAssignment[]> => {
        const all = await nasStorage.readJson<ContactProjectAssignment>(nasStorage.getJsonFilePath('contact_project_assignments'))
        return all.filter(cpa => cpa.project_id === projectId)
    },
    create: (assignment: Omit<ContactProjectAssignment, 'id' | 'created_at'>) => 
        createEntity<ContactProjectAssignment>('contact_project_assignments', assignment),
    update: (id: string, updates: Partial<ContactProjectAssignment>) => 
        updateEntity<ContactProjectAssignment>('contact_project_assignments', id, updates),
    delete: (id: string) => deleteEntity<ContactProjectAssignment>('contact_project_assignments', id),
    deleteByContact: async (contactId: string) => {
        const filePath = nasStorage.getJsonFilePath('contact_project_assignments')
        let data = await nasStorage.readJson<ContactProjectAssignment>(filePath)
        data = data.filter(cpa => cpa.contact_id !== contactId)
        await nasStorage.writeJson(filePath, data)
    },
}

// Ingredients
export const ingredients = {
    getAll: async (): Promise<Ingredient[]> => await nasStorage.readJson<Ingredient>(nasStorage.getJsonFilePath('ingredients')),
    getById: async (id: string): Promise<Ingredient | undefined> => {
        const all = await nasStorage.readJson<Ingredient>(nasStorage.getJsonFilePath('ingredients'))
        return all.find(i => i.id === id)
    },
    create: (ingredient: Omit<Ingredient, 'id' | 'created_at'>) => createEntity<Ingredient>('ingredients', ingredient),
    update: (id: string, updates: Partial<Ingredient>) => updateEntity<Ingredient>('ingredients', id, updates),
    delete: (id: string) => deleteEntity<Ingredient>('ingredients', id),
}

// Byproducts
export const byproducts = {
    getAll: async (): Promise<Byproduct[]> => await nasStorage.readJson<Byproduct>(nasStorage.getJsonFilePath('byproducts')),
    getById: async (id: string): Promise<Byproduct | undefined> => {
        const all = await nasStorage.readJson<Byproduct>(nasStorage.getJsonFilePath('byproducts'))
        return all.find(b => b.id === id)
    },
    create: (byproduct: Omit<Byproduct, 'id' | 'created_at'>) => createEntity<Byproduct>('byproducts', byproduct),
    update: (id: string, updates: Partial<Byproduct>) => updateEntity<Byproduct>('byproducts', id, updates),
    delete: (id: string) => deleteEntity<Byproduct>('byproducts', id),
}

// Containers
export const containers = {
    getAll: async (): Promise<Container[]> => await nasStorage.readJson<Container>(nasStorage.getJsonFilePath('containers')),
    getById: async (id: string): Promise<Container | undefined> => {
        const all = await nasStorage.readJson<Container>(nasStorage.getJsonFilePath('containers'))
        return all.find(c => c.id === id)
    },
    create: (container: Omit<Container, 'id' | 'created_at'>) => createEntity<Container>('containers', container),
    update: (id: string, updates: Partial<Container>) => updateEntity<Container>('containers', id, updates),
    delete: (id: string) => deleteEntity<Container>('containers', id),
}

// Recipe Ingredients (Junction table)
export const recipeIngredients = {
    getAll: async (): Promise<RecipeIngredient[]> => await nasStorage.readJson<RecipeIngredient>(nasStorage.getJsonFilePath('recipe_ingredients')),
    getById: async (id: string): Promise<RecipeIngredient | undefined> => {
        const all = await nasStorage.readJson<RecipeIngredient>(nasStorage.getJsonFilePath('recipe_ingredients'))
        return all.find(ri => ri.id === id)
    },
    getByRecipe: async (recipeId: string): Promise<RecipeIngredient[]> => {
        const all = await nasStorage.readJson<RecipeIngredient>(nasStorage.getJsonFilePath('recipe_ingredients'))
        return all.filter(ri => ri.recipe_id === recipeId)
    },
    create: (recipeIngredient: Omit<RecipeIngredient, 'id' | 'created_at'>) => 
        createEntity<RecipeIngredient>('recipe_ingredients', recipeIngredient),
    update: (id: string, updates: Partial<RecipeIngredient>) => 
        updateEntity<RecipeIngredient>('recipe_ingredients', id, updates),
    delete: (id: string) => deleteEntity<RecipeIngredient>('recipe_ingredients', id),
}

// Images
export const images = {
    getAll: async (): Promise<Image[]> => await nasStorage.readJson<Image>(nasStorage.getJsonFilePath('images')),
    getById: async (id: string): Promise<Image | undefined> => {
        const all = await nasStorage.readJson<Image>(nasStorage.getJsonFilePath('images'))
        return all.find(i => i.id === id)
    },
    getByEntity: async (entityType: string, entityId: string): Promise<Image[]> => {
        const all = await nasStorage.readJson<Image>(nasStorage.getJsonFilePath('images'))
        return all.filter(i => i.entity_type === entityType && i.entity_id === entityId)
    },
    create: (image: Omit<Image, 'id' | 'created_at'>) => createEntity<Image>('images', image),
    update: (id: string, updates: Partial<Image>) => updateEntity<Image>('images', id, updates),
    delete: (id: string) => deleteEntity<Image>('images', id),
    deleteByEntity: async (entityType: string, entityId: string) => {
        const filePath = nasStorage.getJsonFilePath('images')
        let data = await nasStorage.readJson<Image>(filePath)
        data = data.filter(i => !(i.entity_type === entityType && i.entity_id === entityId))
        await nasStorage.writeJson(filePath, data)
    },
}

// Favorites
export const favorites = {
    getAll: async (): Promise<Favorite[]> => {
        const all = await nasStorage.readJson<Favorite>(nasStorage.getJsonFilePath('favorites'))
        return all.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    },
    getById: async (id: string): Promise<Favorite | undefined> => {
        const all = await nasStorage.readJson<Favorite>(nasStorage.getJsonFilePath('favorites'))
        return all.find(f => f.id === id)
    },
    getByEntity: async (entityType: string, entityId: string): Promise<Favorite | undefined> => {
        const all = await nasStorage.readJson<Favorite>(nasStorage.getJsonFilePath('favorites'))
        return all.find(f => f.entity_type === entityType && f.entity_id === entityId)
    },
    isFavorite: async (entityType: string, entityId: string): Promise<boolean> => {
        const all = await nasStorage.readJson<Favorite>(nasStorage.getJsonFilePath('favorites'))
        return all.some(f => f.entity_type === entityType && f.entity_id === entityId)
    },
    create: (favorite: Omit<Favorite, 'id' | 'created_at'>) => createEntity<Favorite>('favorites', favorite),
    toggle: async (entityType: string, entityId: string): Promise<boolean> => {
        const all = await nasStorage.readJson<Favorite>(nasStorage.getJsonFilePath('favorites'))
        const existing = all.find(f => f.entity_type === entityType && f.entity_id === entityId)
        
        if (existing) {
            await deleteEntity<Favorite>('favorites', existing.id)
            return false // Removed from favorites
        } else {
            await createEntity<Favorite>('favorites', { 
                entity_type: entityType as 'project' | 'product' | 'note' | 'recipe' | 'ingredient' | 'container' | 'contact' | 'weblink', 
                entity_id: entityId 
            })
            return true // Added to favorites
        }
    },
    update: (id: string, updates: Partial<Favorite>) => updateEntity<Favorite>('favorites', id, updates),
    delete: (id: string) => deleteEntity<Favorite>('favorites', id),
    deleteByEntity: async (entityType: string, entityId: string) => {
        const filePath = nasStorage.getJsonFilePath('favorites')
        let data = await nasStorage.readJson<Favorite>(filePath)
        data = data.filter(f => !(f.entity_type === entityType && f.entity_id === entityId))
        await nasStorage.writeJson(filePath, data)
    },
}

// Export/Import functions
export async function exportData(): Promise<string> {
    const allData: Record<string, unknown[]> = {}
    
    const entityTypes = [
        'projects', 'products', 'recipes', 'notes', 'contacts', 'contact_categories', 'weblinks', 'documents', 'document_categories',
        'tags', 'tag_assignments', 'contact_project_assignments',
        'ingredients', 'byproducts', 'containers', 'recipe_ingredients',
        'images', 'favorites', 'tasks', 'workspaces'
    ]
    
    for (const entityType of entityTypes) {
        allData[entityType] = await nasStorage.readJson(nasStorage.getJsonFilePath(entityType))
    }
    
    return JSON.stringify({
        export_date: new Date().toISOString(),
        version: '1.1.0',
        storage_type: 'nas',
        data: allData,
    }, null, 2)
}

export async function importData(jsonString: string): Promise<boolean> {
    try {
        const parsed = JSON.parse(jsonString)
        if (parsed.data) {
            for (const [entityType, data] of Object.entries(parsed.data)) {
                const filePath = nasStorage.getJsonFilePath(entityType)
                await nasStorage.writeJson(filePath, data as unknown[])
            }
            console.log('✅ Import erfolgreich')
            return true
        }
    } catch (error) {
        console.error('❌ Import fehlgeschlagen:', error)
    }
    return false
}

// Capacity Utilization (global timeline setting)
export const capacity = {
    async get(): Promise<CapacityUtilization> {
        const filePath = nasStorage.getJsonFilePath('capacity')
        try {
            const dataArray = await nasStorage.readJson<CapacityUtilization>(filePath)
            // Falls das Array ein Element hat, nehme das erste, sonst default
            if (Array.isArray(dataArray) && dataArray.length > 0) {
                return dataArray[0]
            }
            return { enabled: false, quarters: [] }
        } catch {
            return { enabled: false, quarters: [] }
        }
    },
    async update(data: CapacityUtilization): Promise<void> {
        const filePath = nasStorage.getJsonFilePath('capacity')
        // Wrappe Objekt in Array für writeJson
        await nasStorage.writeJson(filePath, [data])
        console.log('✅ Capacity settings updated')
    }
}

// Tasks
export const tasks = {
    getAll: async (): Promise<Task[]> => await nasStorage.readJson<Task>(nasStorage.getJsonFilePath('tasks')),
    getById: async (id: string): Promise<Task | undefined> => {
        const all = await nasStorage.readJson<Task>(nasStorage.getJsonFilePath('tasks'))
        return all.find(t => t.id === id)
    },
    getByProject: async (projectId: string): Promise<Task[]> => {
        const all = await nasStorage.readJson<Task>(nasStorage.getJsonFilePath('tasks'))
        return all.filter(t => t.project_id === projectId)
    },
    getByStatus: async (status: TaskStatus): Promise<Task[]> => {
        const all = await nasStorage.readJson<Task>(nasStorage.getJsonFilePath('tasks'))
        return all.filter(t => t.status === status)
    },
    create: (task: Omit<Task, 'id' | 'created_at'>) => createEntity<Task>('tasks', task),
    update: (id: string, updates: Partial<Task>) => updateEntity<Task>('tasks', id, updates),
    delete: (id: string) => deleteEntity<Task>('tasks', id),
}

// Project Workspaces - Strategische Projekt-Ebenen
export const workspaces = {
    getAll: async (): Promise<ProjectWorkspace[]> => {
        const ws = await nasStorage.readJson<ProjectWorkspace>(nasStorage.getJsonFilePath('workspaces'))
        return ws.sort((a, b) => a.order - b.order) // Sortiert nach order
    },
    getById: async (id: string): Promise<ProjectWorkspace | undefined> => {
        const all = await nasStorage.readJson<ProjectWorkspace>(nasStorage.getJsonFilePath('workspaces'))
        return all.find(w => w.id === id)
    },
    create: (workspace: Omit<ProjectWorkspace, 'id' | 'created_at'>) => 
        createEntity<ProjectWorkspace>('workspaces', workspace),
    update: (id: string, updates: Partial<ProjectWorkspace>) => 
        updateEntity<ProjectWorkspace>('workspaces', id, updates),
    delete: async (id: string): Promise<boolean> => {
        // WICHTIG: Zuerst alle Projekt-Referenzen entfernen (Projekte bleiben erhalten!)
        const allProjects = await projects.getAll()
        const affectedProjects = allProjects.filter(p => p.workspace_id === id)
        
        console.log(`⚠️ Workspace-Löschung: ${affectedProjects.length} Projekte verlieren ihre Zuordnung`)
        
        // Entferne workspace_id aus allen betroffenen Projekten
        for (const project of affectedProjects) {
            await projects.update(project.id, { workspace_id: undefined })
        }
        
        // Erst dann den Workspace selbst löschen
        const result = await deleteEntity<ProjectWorkspace>('workspaces', id)
        
        if (result) {
            console.log(`✅ Workspace gelöscht. ${affectedProjects.length} Projekte behalten, Zuordnung entfernt.`)
        }
        
        return result
    },
}

// Initialize Default Workspaces (wird beim ersten Start aufgerufen)
export async function initializeDefaultWorkspaces(): Promise<void> {
    try {
        const existing = await workspaces.getAll()
        
        // Wenn schon Workspaces existieren, nichts tun
        if (existing.length > 0) {
            console.log('✅ Workspaces bereits initialisiert:', existing.length)
            return
        }
        
        console.log('🛠️ Erstelle Default-Workspaces...')
        
        // Default-Workspaces erstellen
        const defaultWorkspaces = [
            {
                name: 'Standortentwicklung',
                description: 'Strategische Projekte zur Standortentwicklung',
                color: '#3b82f6', // Blau
                icon: '📍',
                order: 0,
            },
            {
                name: 'Produktentwicklung',
                description: 'Projekte zur Entwicklung neuer Produkte',
                color: '#10b981', // Grün
                icon: '🧪',
                order: 1,
            },
            {
                name: 'Sonstige',
                description: 'Alle weiteren Projekte',
                color: '#6b7280', // Grau
                icon: '📁',
                order: 2,
            },
        ]
        
        for (const ws of defaultWorkspaces) {
            await workspaces.create(ws)
            console.log(`  ✅ ${ws.icon} ${ws.name}`)
        }
        
        console.log('✅ Default-Workspaces erfolgreich erstellt')
    } catch (error) {
        console.error('❌ Fehler beim Initialisieren der Workspaces:', error)
    }
}
