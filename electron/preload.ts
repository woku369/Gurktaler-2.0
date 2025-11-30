import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
    invoke: (channel: string, ...args: unknown[]) => {
        const validChannels = [
            'db:query', 'db:run', 
            'data:export', 'data:import',
            'app:version',
            'git:status', 'git:commit', 'git:push', 'git:pull'
        ];
        if (validChannels.includes(channel)) {
            return ipcRenderer.invoke(channel, ...args);
        }
        throw new Error(`Invalid IPC channel: ${channel}`);
    }
})

// Legacy API (deprecated, use window.electron.invoke instead)
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
