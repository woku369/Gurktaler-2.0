import { app, BrowserWindow, ipcMain, shell, dialog } from 'electron'
import path from 'path'
import { execSync } from 'child_process'
import http from 'http'
import fs from 'fs'
import { URL } from 'url'

// Git-Handler registrieren
function registerGitHandlers() {
    const projectRoot = path.join(__dirname, '..')

    // Git Status
    ipcMain.handle('git:status', async () => {
        try {
            const status = execSync('git status --porcelain --branch', { 
                cwd: projectRoot,
                encoding: 'utf-8' 
            })
            
            const lines = status.split('\n').filter(l => l.trim())
            const branchLine = lines.find(l => l.startsWith('##'))
            const branch = branchLine?.match(/##\s+(\S+)/)?.[1] || 'unknown'
            
            const modified = lines.filter(l => l.startsWith(' M')).map(l => l.substring(3))
            const untracked = lines.filter(l => l.startsWith('??')).map(l => l.substring(3))
            const staged = lines.filter(l => l.startsWith('M ')).map(l => l.substring(3))
            
            // Remote prüfen
            let hasRemote = false
            try {
                const remotes = execSync('git remote', {
                    cwd: projectRoot,
                    encoding: 'utf-8'
                }).trim()
                hasRemote = remotes.length > 0
            } catch {
                hasRemote = false
            }
            
            // Letzter Commit
            let lastCommit
            try {
                const log = execSync('git log -1 --format="%H|%s|%an|%ai"', {
                    cwd: projectRoot,
                    encoding: 'utf-8'
                }).trim()
                const [hash, message, author, date] = log.split('|')
                lastCommit = { hash, message, author, date }
            } catch {
                lastCommit = undefined
            }
            
            return {
                success: true,
                data: {
                    branch,
                    ahead: 0,
                    behind: 0,
                    modified,
                    untracked,
                    staged,
                    hasUncommitted: modified.length + untracked.length + staged.length > 0,
                    hasRemote,
                    lastCommit
                }
            }
        } catch (error) {
            return { success: false, error: String(error) }
        }
    })

    // Git Commit
    ipcMain.handle('git:commit', async (_event, { message }) => {
        try {
            execSync('git add .', { cwd: projectRoot })
            // Escape Anführungszeichen und Backslashes in der Commit-Message
            const escapedMessage = message.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
            execSync(`git commit -m "${escapedMessage}"`, { cwd: projectRoot })
            return { success: true }
        } catch (error) {
            return { success: false, error: String(error) }
        }
    })

    // Git Push
    ipcMain.handle('git:push', async () => {
        try {
            // Prüfe Remote
            const remotes = execSync('git remote', { cwd: projectRoot, encoding: 'utf-8' }).trim()
            if (!remotes) {
                return { 
                    success: false, 
                    error: 'Kein Remote-Repository konfiguriert.\n\nBitte führe aus:\ngit remote add origin <url>\ngit push -u origin master' 
                }
            }
            
            execSync('git push', { cwd: projectRoot, encoding: 'utf-8' })
            return { success: true }
        } catch (error: any) {
            const errorMsg = String(error.stderr || error.message || error)
            if (errorMsg.includes('No configured push destination')) {
                return { 
                    success: false, 
                    error: 'Kein Remote-Repository konfiguriert.\n\nBitte führe aus:\ngit remote add origin <url>\ngit push -u origin master' 
                }
            }
            return { success: false, error: errorMsg }
        }
    })

    // Git Pull
    ipcMain.handle('git:pull', async () => {
        try {
            // Prüfe Remote
            const remotes = execSync('git remote', { cwd: projectRoot, encoding: 'utf-8' }).trim()
            if (!remotes) {
                return { 
                    success: false, 
                    error: 'Kein Remote-Repository konfiguriert.\n\nBitte führe aus:\ngit remote add origin <url>\ngit branch --set-upstream-to=origin/master master' 
                }
            }
            
            // Prüfe ob es lokale Änderungen gibt
            const status = execSync('git status --porcelain', { cwd: projectRoot, encoding: 'utf-8' }).trim()
            if (status) {
                // Lokale Änderungen vorhanden - automatisch committen
                try {
                    execSync('git add .', { cwd: projectRoot })
                    execSync('git commit -m "[Auto-Sync] Lokale Änderungen vor Pull"', { cwd: projectRoot })
                } catch {
                    // Commit fehlgeschlagen, trotzdem versuchen zu pullen
                }
            }
            
            // Versuche normalen Pull
            try {
                execSync('git pull', { cwd: projectRoot, encoding: 'utf-8' })
                return { success: true }
            } catch (pullError: any) {
                const pullErrorMsg = String(pullError.stderr || pullError.message || pullError)
                
                // Merge-Konflikt erkannt
                if (pullErrorMsg.includes('CONFLICT') || pullErrorMsg.includes('Automatic merge failed')) {
                    return { 
                        success: false, 
                        error: 'MERGE-KONFLIKT! Lokale und Remote-Änderungen überschneiden sich.\n\n' +
                               'Du hast 2 Optionen:\n' +
                               '1. Lokale Änderungen behalten: git merge --abort\n' +
                               '2. Remote-Änderungen übernehmen: git reset --hard origin/master\n\n' +
                               'Empfehlung: Öffne ein Terminal und löse den Konflikt manuell.'
                    }
                }
                
                throw pullError
            }
        } catch (error: any) {
            const errorMsg = String(error.stderr || error.message || error)
            if (errorMsg.includes('no tracking information')) {
                return { 
                    success: false, 
                    error: 'Branch hat kein Remote-Tracking.\n\nBitte führe aus:\ngit branch --set-upstream-to=origin/master master' 
                }
            }
            return { success: false, error: errorMsg }
        }
    })

    // Git Add Remote
    ipcMain.handle('git:add-remote', async (_event, { name, url }) => {
        try {
            // Prüfe ob Remote schon existiert
            try {
                const existing = execSync(`git remote get-url ${name}`, { 
                    cwd: projectRoot, 
                    encoding: 'utf-8' 
                }).trim()
                if (existing) {
                    // Remote existiert, aktualisiere URL
                    execSync(`git remote set-url ${name} ${url}`, { cwd: projectRoot })
                    return { success: true, updated: true }
                }
            } catch {
                // Remote existiert nicht, füge hinzu
            }
            
            execSync(`git remote add ${name} ${url}`, { cwd: projectRoot })
            
            // Versuche Upstream zu setzen für aktuellen Branch
            try {
                const branch = execSync('git branch --show-current', { 
                    cwd: projectRoot, 
                    encoding: 'utf-8' 
                }).trim()
                execSync(`git branch --set-upstream-to=${name}/${branch} ${branch}`, { 
                    cwd: projectRoot 
                })
            } catch {
                // Upstream setzen fehlgeschlagen (Branch existiert noch nicht remote)
            }
            
            return { success: true, updated: false }
        } catch (error: any) {
            return { success: false, error: String(error.stderr || error.message || error) }
        }
    })

    // Git List Remotes
    ipcMain.handle('git:list-remotes', async () => {
        try {
            const output = execSync('git remote -v', { 
                cwd: projectRoot, 
                encoding: 'utf-8' 
            }).trim()
            
            const remotes: Array<{ name: string; url: string; type: string }> = []
            if (output) {
                output.split('\n').forEach(line => {
                    const match = line.match(/^(\S+)\s+(\S+)\s+\((\S+)\)/)
                    if (match) {
                        remotes.push({
                            name: match[1],
                            url: match[2],
                            type: match[3]
                        })
                    }
                })
            }
            
            return { success: true, data: remotes }
        } catch (error: any) {
            return { success: false, error: String(error.stderr || error.message || error) }
        }
    })

    // Git Resolve Conflict - Übernimmt Remote-Version
    ipcMain.handle('git:resolve-conflict-remote', async () => {
        try {
            // Merge abbrechen
            try {
                execSync('git merge --abort', { cwd: projectRoot })
            } catch {
                // Kein Merge aktiv
            }
            
            // Lokale Änderungen verwerfen und Remote übernehmen
            execSync('git fetch origin', { cwd: projectRoot })
            execSync('git reset --hard origin/master', { cwd: projectRoot })
            
            return { success: true }
        } catch (error: any) {
            return { success: false, error: String(error.stderr || error.message || error) }
        }
    })

    // Git Abort Merge - Behält lokale Änderungen
    ipcMain.handle('git:abort-merge', async () => {
        try {
            execSync('git merge --abort', { cwd: projectRoot })
            return { success: true }
        } catch (error: any) {
            return { success: false, error: String(error.stderr || error.message || error) }
        }
    })
}

// File-Handler registrieren
function registerFileHandlers() {
    const projectRoot = path.join(__dirname, '..')

    // Datei-Dialog öffnen
    ipcMain.handle('file:select', async () => {
        try {
            const result = await dialog.showOpenDialog({
                properties: ['openFile'],
                filters: [
                    { name: 'Alle Dateien', extensions: ['*'] },
                    { name: 'Dokumente', extensions: ['pdf', 'docx', 'xlsx', 'txt', 'doc', 'xls', 'pptx'] },
                    { name: 'Bilder', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'] },
                    { name: 'Tabellen', extensions: ['xlsx', 'xls', 'csv'] }
                ]
            })

            if (result.canceled || result.filePaths.length === 0) {
                return { success: false, canceled: true }
            }

            const filePath = result.filePaths[0]
            
            // Relativen Pfad berechnen (vom Projektroot aus)
            const relativePath = path.relative(projectRoot, filePath)
            
            // Datei-Info abrufen
            const stats = fs.statSync(filePath)
            const fileName = path.basename(filePath)
            const ext = path.extname(filePath).toLowerCase()

            // MIME-Type ermitteln
            const mimeTypes: Record<string, string> = {
                '.pdf': 'application/pdf',
                '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                '.doc': 'application/msword',
                '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                '.xls': 'application/vnd.ms-excel',
                '.txt': 'text/plain',
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.png': 'image/png',
                '.gif': 'image/gif',
                '.webp': 'image/webp'
            }

            return {
                success: true,
                file: {
                    path: relativePath,
                    absolutePath: filePath,
                    name: fileName,
                    size: stats.size,
                    mimeType: mimeTypes[ext] || 'application/octet-stream'
                }
            }
        } catch (error: any) {
            return { success: false, error: String(error.message || error) }
        }
    })

    // Datei mit Standard-App öffnen
    ipcMain.handle('file:open', async (_event, relativePath: string) => {
        try {
            const absolutePath = path.isAbsolute(relativePath)
                ? relativePath
                : path.join(projectRoot, relativePath)

            // Prüfe ob Datei existiert
            if (!fs.existsSync(absolutePath)) {
                return { success: false, error: 'Datei nicht gefunden' }
            }

            await shell.openPath(absolutePath)
            return { success: true }
        } catch (error: any) {
            return { success: false, error: String(error.message || error) }
        }
    })

    // Im Explorer zeigen
    ipcMain.handle('file:show', async (_event, relativePath: string) => {
        try {
            const absolutePath = path.isAbsolute(relativePath)
                ? relativePath
                : path.join(projectRoot, relativePath)

            // Prüfe ob Datei existiert
            if (!fs.existsSync(absolutePath)) {
                return { success: false, error: 'Datei nicht gefunden' }
            }

            shell.showItemInFolder(absolutePath)
            return { success: true }
        } catch (error: any) {
            return { success: false, error: String(error.message || error) }
        }
    })

    // Prüfe ob Datei existiert
    ipcMain.handle('file:exists', async (_event, relativePath: string) => {
        try {
            const absolutePath = path.isAbsolute(relativePath)
                ? relativePath
                : path.join(projectRoot, relativePath)

            const exists = fs.existsSync(absolutePath)
            return { success: true, exists }
        } catch (error: any) {
            return { success: false, error: String(error.message || error) }
        }
    })
}

let localServer: http.Server | null = null

function startLocalServer(): Promise<number> {
    return new Promise((resolve) => {
        const distPath = app.isPackaged 
            ? path.join(process.resourcesPath, 'app', 'dist')
            : path.join(__dirname, '..', 'dist')
        
        localServer = http.createServer((req, res) => {
            let filePath = new URL(req.url || '/', 'http://localhost').pathname
            
            // Root -> index.html
            if (filePath === '/') {
                filePath = '/index.html'
            }
            
            let fullPath = path.join(distPath, filePath)
            
            // Prüfe ob Datei existiert
            if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) {
                // Fallback zu index.html für Client-Side Routing (SPA)
                fullPath = path.join(distPath, 'index.html')
            }
            
            // Content-Type basierend auf Extension
            const ext = path.extname(fullPath)
            const contentTypes: Record<string, string> = {
                '.html': 'text/html',
                '.js': 'application/javascript',
                '.css': 'text/css',
                '.json': 'application/json',
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.svg': 'image/svg+xml',
            }
            
            const contentType = contentTypes[ext] || 'application/octet-stream'
            
            res.writeHead(200, { 'Content-Type': contentType })
            fs.createReadStream(fullPath).pipe(res)
        })
        
        localServer.listen(0, () => {
            const port = (localServer!.address() as any).port
            console.log('Local server started on port:', port)
            resolve(port)
        })
    })
}

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1000,
        minHeight: 700,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
            webSecurity: false,
        },
        titleBarStyle: 'hiddenInset',
        title: 'Gurktaler 2.0',
    })

    // In development, load from Vite dev server
    if (process.env.NODE_ENV === 'development') {
        mainWindow.loadURL('http://localhost:3000')
        mainWindow.webContents.openDevTools()
    } else {
        // In production, starte lokalen HTTP Server
        startLocalServer().then(async (port) => {
            console.log('Loading from localhost:', port)
            
            // Warte kurz damit der Server vollständig bereit ist
            await new Promise(resolve => setTimeout(resolve, 500))
            
            mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
                console.error('Failed to load:', errorCode, errorDescription)
            })
            
            mainWindow.webContents.on('did-finish-load', () => {
                console.log('Page finished loading')
            })
            
            mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
                console.log('Console:', message, 'at line', line, 'in', sourceId)
            })
            
            mainWindow.loadURL(`http://localhost:${port}`).catch(err => {
                console.error('Failed to load:', err)
            })
            
            mainWindow.webContents.on('before-input-event', (event, input) => {
                if (input.key === 'F12') {
                    mainWindow.webContents.toggleDevTools()
                    event.preventDefault()
                }
            })
            
            mainWindow.webContents.openDevTools()
        })
    }
}

app.whenReady().then(() => {
    registerGitHandlers()
    registerFileHandlers()
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (localServer) {
        localServer.close()
    }
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
