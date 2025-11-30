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
            execSync('git push', { cwd: projectRoot })
            return { success: true }
        } catch (error) {
            return { success: false, error: String(error) }
        }
    })

    // Git Pull
    ipcMain.handle('git:pull', async () => {
        try {
            execSync('git pull', { cwd: projectRoot })
            return { success: true }
        } catch (error) {
            return { success: false, error: String(error) }
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
