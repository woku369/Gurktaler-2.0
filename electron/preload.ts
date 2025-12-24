import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
    invoke: (channel: string, ...args: unknown[]) => {
        const validChannels = [
            'db:query', 'db:run', 
            'data:export', 'data:import',
            'app:version',
            'git:status', 'git:commit', 'git:push', 'git:pull', 'git:add-remote', 'git:list-remotes',
            'git:resolve-conflict-remote', 'git:abort-merge',
            'file:select', 'file:open', 'file:show', 'file:exists',
            'logs:open',
            'sync:read', 'sync:write', 'sync:test',
            'file:readJson', 'file:writeJson', 'file:listDirectory',
            'file:uploadImage', 'file:uploadDocument', 'file:deleteFile',
            'file:moveFile', 'file:readImage', 'file:createDirectory'
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

    // Synology Sync
    syncRead: (networkPath: string) => ipcRenderer.invoke('sync:read', networkPath),
    syncWrite: (networkPath: string, content: string) => ipcRenderer.invoke('sync:write', networkPath, content),
    syncTest: (networkPath: string) => ipcRenderer.invoke('sync:test', networkPath),

    // Zentrale NAS-Speicher APIs
    fileReadJson: (filePath: string) => ipcRenderer.invoke('file:readJson', filePath),
    fileWriteJson: (filePath: string, data: unknown) => ipcRenderer.invoke('file:writeJson', filePath, data),
    fileListDirectory: (dirPath: string) => ipcRenderer.invoke('file:listDirectory', dirPath),
    fileUploadImage: (targetPath: string, dataUrl: string) => ipcRenderer.invoke('file:uploadImage', targetPath, dataUrl),
    fileUploadDocument: (targetPath: string, buffer: Buffer) => ipcRenderer.invoke('file:uploadDocument', targetPath, buffer),
    fileDeleteFile: (filePath: string) => ipcRenderer.invoke('file:deleteFile', filePath),
    fileMoveFile: (sourcePath: string, targetPath: string) => ipcRenderer.invoke('file:moveFile', sourcePath, targetPath),
    fileReadImage: (filePath: string) => ipcRenderer.invoke('file:readImage', filePath),
    fileCreateDirectory: (dirPath: string) => ipcRenderer.invoke('file:createDirectory', dirPath),
})
