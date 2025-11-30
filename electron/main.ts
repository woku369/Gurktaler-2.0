import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { execSync } from 'child_process'

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
            execSync(`git commit -m "${message}"`, { cwd: projectRoot })
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
            
            execSync('git pull', { cwd: projectRoot, encoding: 'utf-8' })
            return { success: true }
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
        },
        titleBarStyle: 'hiddenInset',
        title: 'Gurktaler 2.0',
    })

    // In development, load from Vite dev server
    if (process.env.NODE_ENV === 'development') {
        mainWindow.loadURL('http://localhost:3000')
        mainWindow.webContents.openDevTools()
    } else {
        // In production, load the built files
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
    }
}

app.whenReady().then(() => {
    registerGitHandlers()
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
