import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Database operations
  dbQuery: (sql: string, params?: unknown[]) => ipcRenderer.invoke('db:query', sql, params),
  dbRun: (sql: string, params?: unknown[]) => ipcRenderer.invoke('db:run', sql, params),
  
  // File operations
  exportData: () => ipcRenderer.invoke('data:export'),
  importData: (data: string) => ipcRenderer.invoke('data:import', data),
  
  // App info
  getVersion: () => ipcRenderer.invoke('app:version'),
})
