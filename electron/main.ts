import { app, BrowserWindow, ipcMain, shell, dialog } from 'electron'
import path from 'path'
import { execSync } from 'child_process'
import http from 'http'
import fs from 'fs'
import { URL } from 'url'

// Logging-Setup für Production
const isDev = process.env.NODE_ENV === 'development'
let logFilePath = ''

function writeLog(level: string, ...args: any[]) {
    if (isDev || !logFilePath) return
    
    const timestamp = new Date().toISOString()
    const message = `[${level} ${timestamp}] ${args.join(' ')}\n`
    
    try {
        fs.appendFileSync(logFilePath, message, 'utf-8')
    } catch (err) {
        // Fallback: Schreibe in Console
        console.error('Log write failed:', err)
    }
}

function setupLogging() {
    if (!isDev) {
        // Log-Datei im userData-Verzeichnis
        const logDir = path.join(app.getPath('userData'), 'logs')
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true })
        }
        
        logFilePath = path.join(logDir, `gurktaler-${new Date().toISOString().split('T')[0]}.log`)
        
        // Überschreibe console.log für Main-Process
        const originalLog = console.log
        const originalError = console.error
        const originalWarn = console.warn
        
        console.log = (...args: any[]) => {
            writeLog('LOG', ...args)
            originalLog(...args)
        }
        
        console.error = (...args: any[]) => {
            writeLog('ERROR', ...args)
            originalError(...args)
        }
        
        console.warn = (...args: any[]) => {
            writeLog('WARN', ...args)
            originalWarn(...args)
        }
        
        console.log('Logging initialisiert:', logFilePath)
    }
}

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

    // Log-Verzeichnis öffnen
    ipcMain.handle('logs:open', async () => {
        try {
            const logDir = path.join(app.getPath('userData'), 'logs')
            if (fs.existsSync(logDir)) {
                shell.openPath(logDir)
                return { success: true }
            }
            return { success: false, error: 'Log-Verzeichnis nicht gefunden' }
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

    // Synology Sync - Daten lesen
    ipcMain.handle('sync:read', async (_event, networkPath: string) => {
        try {
            // Unterstützt: Y:\data.json oder \\192.168.0.9\Gurktaler\data.json
            if (!fs.existsSync(networkPath)) {
                return { success: false, error: 'Datei nicht gefunden' }
            }

            const content = fs.readFileSync(networkPath, 'utf-8')
            return { success: true, data: content }
        } catch (error: any) {
            return { success: false, error: String(error.message || error) }
        }
    })

    // Synology Sync - Daten schreiben
    ipcMain.handle('sync:write', async (_event, networkPath: string, content: string) => {
        try {
            // Ordner erstellen falls nicht vorhanden
            const dir = path.dirname(networkPath)
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true })
            }

            fs.writeFileSync(networkPath, content, 'utf-8')
            return { success: true }
        } catch (error: any) {
            return { success: false, error: String(error.message || error) }
        }
    })

    // Synology Sync - Prüfen ob Pfad erreichbar
    ipcMain.handle('sync:test', async (_event, networkPath: string) => {
        try {
            const dir = path.dirname(networkPath)
            const accessible = fs.existsSync(dir)
            return { success: true, accessible }
        } catch (error: any) {
            return { success: false, error: String(error.message || error) }
        }
    })

    // ===== Zentrale NAS-Speicher-Architektur =====

    // JSON-Datei lesen (optimiert)
    ipcMain.handle('file:readJson', async (_event, filePath: string) => {
        try {
            if (!fs.existsSync(filePath)) {
                // Datei existiert nicht -> leeres Array zurückgeben
                return { success: true, data: [] }
            }
            const content = fs.readFileSync(filePath, 'utf-8')
            const data = JSON.parse(content)
            return { success: true, data }
        } catch (error: any) {
            return { success: false, error: String(error.message || error) }
        }
    })

    // JSON-Datei schreiben (optimiert)
    ipcMain.handle('file:writeJson', async (_event, filePath: string, data: unknown) => {
        try {
            const dir = path.dirname(filePath)
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true })
            }
            const content = JSON.stringify(data, null, 2)
            fs.writeFileSync(filePath, content, 'utf-8')
            return { success: true }
        } catch (error: any) {
            return { success: false, error: String(error.message || error) }
        }
    })

    // Verzeichnis auslesen
    ipcMain.handle('file:listDirectory', async (_event, dirPath: string) => {
        try {
            if (!fs.existsSync(dirPath)) {
                return { success: true, files: [] }
            }
            const files = fs.readdirSync(dirPath)
            const fileInfos = files.map(name => {
                const fullPath = path.join(dirPath, name)
                const stats = fs.statSync(fullPath)
                return {
                    name,
                    path: fullPath,
                    isDirectory: stats.isDirectory(),
                    size: stats.size,
                    modified: stats.mtime.toISOString()
                }
            })
            return { success: true, files: fileInfos }
        } catch (error: any) {
            return { success: false, error: String(error.message || error) }
        }
    })

    // Bild hochladen (Binary)
    ipcMain.handle('file:uploadImage', async (_event, targetPath: string, dataUrl: string) => {
        try {
            // Data URL zu Buffer: data:image/png;base64,iVBORw0KG...
            const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
            if (!matches || matches.length !== 3) {
                return { success: false, error: 'Ungültiges Data-URL Format' }
            }

            const base64Data = matches[2]
            const buffer = Buffer.from(base64Data, 'base64')

            const dir = path.dirname(targetPath)
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true })
            }

            fs.writeFileSync(targetPath, buffer)
            return { success: true, path: targetPath }
        } catch (error: any) {
            return { success: false, error: String(error.message || error) }
        }
    })

    // Dokument hochladen (Binary)
    ipcMain.handle('file:uploadDocument', async (_event, targetPath: string, buffer: Buffer) => {
        try {
            const dir = path.dirname(targetPath)
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true })
            }

            fs.writeFileSync(targetPath, buffer)
            return { success: true, path: targetPath }
        } catch (error: any) {
            return { success: false, error: String(error.message || error) }
        }
    })

    // Datei löschen
    ipcMain.handle('file:deleteFile', async (_event, filePath: string) => {
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath)
            }
            return { success: true }
        } catch (error: any) {
            return { success: false, error: String(error.message || error) }
        }
    })

    // Datei verschieben/umbenennen
    ipcMain.handle('file:moveFile', async (_event, sourcePath: string, targetPath: string) => {
        try {
            const targetDir = path.dirname(targetPath)
            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true })
            }

            fs.renameSync(sourcePath, targetPath)
            return { success: true, path: targetPath }
        } catch (error: any) {
            return { success: false, error: String(error.message || error) }
        }
    })

    // Bild lesen (als Data URL)
    ipcMain.handle('file:readImage', async (_event, filePath: string) => {
        try {
            if (!fs.existsSync(filePath)) {
                return { success: false, error: 'Bild nicht gefunden' }
            }

            const buffer = fs.readFileSync(filePath)
            const base64 = buffer.toString('base64')
            
            // MIME-Type erkennen
            const ext = path.extname(filePath).toLowerCase()
            const mimeTypes: Record<string, string> = {
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.png': 'image/png',
                '.gif': 'image/gif',
                '.webp': 'image/webp',
                '.bmp': 'image/bmp'
            }
            const mimeType = mimeTypes[ext] || 'image/jpeg'

            const dataUrl = `data:${mimeType};base64,${base64}`
            return { success: true, dataUrl }
        } catch (error: any) {
            return { success: false, error: String(error.message || error) }
        }
    })

    // Verzeichnis erstellen
    ipcMain.handle('file:createDirectory', async (_event, dirPath: string) => {
        try {
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true })
            }
            return { success: true }
        } catch (error: any) {
            return { success: false, error: String(error.message || error) }
        }
    })

    // NAS-Handler für Backup Service
    // Datei lesen (raw text)
    ipcMain.handle('nas-read', async (_event, filePath: string) => {
        try {
            if (!fs.existsSync(filePath)) {
                return { success: false, error: 'Datei nicht gefunden' }
            }
            const content = fs.readFileSync(filePath, 'utf-8')
            return { success: true, content }
        } catch (error: any) {
            return { success: false, error: String(error.message || error) }
        }
    })

    // Datei schreiben (raw text)
    ipcMain.handle('nas-write', async (_event, { path: filePath, content }: { path: string, content: string }) => {
        try {
            const dir = path.dirname(filePath)
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true })
            }
            fs.writeFileSync(filePath, content, 'utf-8')
            return { success: true }
        } catch (error: any) {
            return { success: false, error: String(error.message || error) }
        }
    })

    // Verzeichnis auflisten mit Metadaten
    ipcMain.handle('nas-readdir', async (_event, dirPath: string) => {
        try {
            if (!fs.existsSync(dirPath)) {
                return { success: false, error: 'Verzeichnis nicht gefunden' }
            }
            
            const entries = fs.readdirSync(dirPath)
            const files = entries.map(name => {
                const fullPath = path.join(dirPath, name)
                const stats = fs.statSync(fullPath)
                return {
                    name,
                    isDirectory: stats.isDirectory(),
                    size: stats.size,
                    modified: stats.mtime
                }
            })
            
            return { success: true, files }
        } catch (error: any) {
            return { success: false, error: String(error.message || error) }
        }
    })

    // Verzeichnis erstellen
    ipcMain.handle('nas-mkdir', async (_event, dirPath: string) => {
        try {
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true })
            }
            return { success: true }
        } catch (error: any) {
            return { success: false, error: String(error.message || error) }
        }
    })
}

// NAS-Mount-Handler registrieren
function registerNasMountHandlers() {
    // Prüfe ob Laufwerk Y: verfügbar ist
    ipcMain.handle('nas:check-drive', async () => {
        try {
            const drivePath = 'Y:\\'
            const exists = fs.existsSync(drivePath)
            
            if (!exists) {
                return { success: true, available: false }
            }
            
            // Prüfe ob zweipunktnull Ordner existiert
            const basePath = 'Y:\\zweipunktnull'
            const baseExists = fs.existsSync(basePath)
            
            return { 
                success: true, 
                available: true,
                configured: baseExists 
            }
        } catch (error: any) {
            return { success: false, error: String(error.message || error) }
        }
    })
    
    // Mount NAS-Laufwerk über Tailscale
    ipcMain.handle('nas:mount', async (_event, { ip, share, username, password }: { 
        ip: string, 
        share: string, 
        username?: string, 
        password?: string 
    }) => {
        try {
            // Baue UNC-Pfad
            const uncPath = `\\\\${ip}\\${share}`
            
            // net use Befehl
            let command = `net use Y: "${uncPath}" /persistent:yes`
            
            // Mit Credentials
            if (username && password) {
                command = `net use Y: "${uncPath}" /user:${username} "${password}" /persistent:yes`
            }
            
            console.log('🔧 Mounting NAS:', uncPath)
            
            try {
                execSync(command, { 
                    encoding: 'utf-8',
                    stdio: 'pipe'
                })
                
                // Warte kurz und prüfe
                await new Promise(resolve => setTimeout(resolve, 1000))
                
                if (fs.existsSync('Y:\\')) {
                    console.log('✅ NAS-Laufwerk Y: erfolgreich verbunden')
                    return { success: true }
                } else {
                    return { success: false, error: 'Laufwerk nach Mount nicht verfügbar' }
                }
            } catch (mountError: any) {
                const errorMsg = String(mountError.stderr || mountError.message || mountError)
                
                // Parse bekannte Fehler
                if (errorMsg.includes('Systemfehler 53')) {
                    return { 
                        success: false, 
                        error: 'NAS nicht erreichbar.\n\nPrüfe:\n• Ist Tailscale aktiv?\n• Ist die IP korrekt?\n• Läuft das NAS?'
                    }
                } else if (errorMsg.includes('Systemfehler 86')) {
                    return {
                        success: false,
                        error: 'Falsches Passwort oder unzureichende Berechtigungen'
                    }
                } else if (errorMsg.includes('Systemfehler 85')) {
                    // Laufwerk bereits verbunden - das ist OK!
                    return { success: true, alreadyMounted: true }
                }
                
                return { 
                    success: false, 
                    error: `Mount fehlgeschlagen:\n${errorMsg}`
                }
            }
        } catch (error: any) {
            return { success: false, error: String(error.message || error) }
        }
    })
    
    // Unmount NAS-Laufwerk
    ipcMain.handle('nas:unmount', async () => {
        try {
            execSync('net use Y: /delete /yes', { 
                encoding: 'utf-8',
                stdio: 'pipe'
            })
            return { success: true }
        } catch (error: any) {
            // Fehler ignorieren wenn Laufwerk nicht verbunden
            return { success: true }
        }
    })
    
    // Hole Tailscale-Status und IPs
    ipcMain.handle('nas:tailscale-status', async () => {
        try {
            // Versuche Tailscale Status abzufragen
            const status = execSync('tailscale status --json', { 
                encoding: 'utf-8',
                stdio: 'pipe'
            })
            
            const data = JSON.parse(status)
            
            // Extrahiere alle Peers (andere Geräte im Tailnet)
            const peers = Object.values(data.Peer || {}).map((peer: any) => ({
                hostname: peer.HostName,
                ip: peer.TailscaleIPs?.[0] || '',
                online: peer.Online,
                os: peer.OS
            }))
            
            return { 
                success: true, 
                running: true,
                peers 
            }
        } catch (error: any) {
            // Tailscale nicht installiert oder nicht laufend
            return { 
                success: true, 
                running: false,
                error: 'Tailscale nicht verfügbar'
            }
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
        
        // KRITISCHER FIX: Fester Port für persistentes localStorage
        // Random-Port (listen(0)) ändert sich bei jedem Start
        // → Neue Origin → Neuer LocalStorage → DATENVERLUST!
        const FIXED_PORT = 3456  // Port geändert (58888/58889 waren blockiert)
        localServer.listen(FIXED_PORT, '127.0.0.1', () => {
            console.log('Local server started on FIXED port:', FIXED_PORT)
            resolve(FIXED_PORT)
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
            partition: 'persist:gurktaler', // KRITISCH: Persistentes LocalStorage!
        },
        titleBarStyle: 'hiddenInset',
        title: 'Gurktaler 2.0',
    })

    // Console-Logging für beide Modi - KRITISCH: Renderer-Logs erfassen!
    mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
        const levelNames = ['VERBOSE', 'INFO', 'WARNING', 'ERROR']
        const levelName = levelNames[level]
        
        // Log in Datei (wenn Production) UND Console
        if (levelName === 'ERROR') {
            console.error(`[Renderer ${levelName}]`, message)
        } else if (levelName === 'WARNING') {
            console.warn(`[Renderer ${levelName}]`, message)
        } else {
            console.log(`[Renderer ${levelName}]`, message)
        }
        
        if (line && sourceId) {
            const location = `  at line ${line} in ${sourceId}`
            console.log(location)
        }
    })

    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        console.error('[LOAD ERROR]', errorCode, errorDescription)
    })

    mainWindow.webContents.on('did-finish-load', () => {
        console.log('[LOAD SUCCESS] Page finished loading')
    })

    // F12 für DevTools
    mainWindow.webContents.on('before-input-event', (event, input) => {
        if (input.key === 'F12') {
            mainWindow.webContents.toggleDevTools()
            event.preventDefault()
        }
    })

    // In development, load from Vite dev server
    if (process.env.NODE_ENV === 'development') {
        mainWindow.loadURL('http://localhost:3000')
        mainWindow.webContents.openDevTools()
    } else {
        // In production, starte lokalen HTTP Server
        startLocalServer().then(async (port) => {
            console.log('[SERVER] Starting on port:', port)
            
            // Warte kurz damit der Server vollständig bereit ist
            await new Promise(resolve => setTimeout(resolve, 500))
            
            mainWindow.loadURL(`http://localhost:${port}`).catch(err => {
                console.error('[LOAD ERROR] Failed to load:', err)
            })
            
            mainWindow.webContents.openDevTools()
        })
    }
}

app.whenReady().then(() => {
    // Logging-Setup ZUERST
    setupLogging()
    
    // Setze expliziten userData-Path für konsistente Speicherung
    const userDataPath = path.join(app.getPath('appData'), 'Gurktaler-2.0')
    app.setPath('userData', userDataPath)
    console.log('[ELECTRON] userData path:', userDataPath)
    console.log('[ELECTRON] App ready, starting...')
    
    registerGitHandlers()
    registerFileHandlers()
    registerNasMountHandlers()
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    // 💾 Backup beim Beenden der App
    try {
        console.log('🔄 Erstelle Abschluss-Backup...')
        const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0]
        const backupScript = path.join('Y:', 'zweipunktnull', 'backup-hourly.ps1')
        
        // Nur wenn NAS verfügbar ist
        if (fs.existsSync(backupScript)) {
            execSync(`powershell.exe -ExecutionPolicy Bypass -File "${backupScript}" -Once`, {
                encoding: 'utf-8',
                timeout: 30000
            })
            console.log('✅ Abschluss-Backup erfolgreich!')
        } else {
            console.warn('⚠️ Backup-Script nicht gefunden, überspringe Backup')
        }
    } catch (error) {
        console.error('❌ Abschluss-Backup fehlgeschlagen:', error)
        // Fortfahren trotz Fehler
    }
    
    if (localServer) {
        localServer.close()
    }
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
