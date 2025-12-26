// Temporary compatibility layer for storage migration
// This allows gradual migration from sync to async storage calls
// TODO: Remove this once all components are migrated to async/await

import * as storage from './storage'

// Create sync wrappers that throw helpful errors
const createDeprecatedSyncMethod = (methodName: string) => {
  return () => {
    throw new Error(
      `❌ ${methodName}() ist jetzt asynchron!\n` +
      `Verwende stattdessen: await ${methodName}()\n` +
      `Siehe storage.ts für Details.`
    )
  }
}

// Export all async methods as-is
export const projects = storage.projects
export const products = storage.products  
export const recipes = storage.recipes
export const notes = storage.notes
export const contacts = storage.contacts
export const weblinks = storage.weblinks
export const tags = storage.tags
export const tagAssignments = storage.tagAssignments
export const contactProjectAssignments = storage.contactProjectAssignments
export const ingredients = storage.ingredients
export const byproducts = storage.byproducts
export const containers = storage.containers
export const recipeIngredients = storage.recipeIngredients
export const images = storage.images
export const favorites = storage.favorites

export const exportData = storage.exportData
export const importData = storage.importData
