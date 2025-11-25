import { useState } from 'react'
import { Database, FolderSync, Info, Download, Upload, CheckCircle, AlertCircle } from 'lucide-react'
import { exportData, importData } from '@/renderer/services/storage'

function Settings() {
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [statusMessage, setStatusMessage] = useState('')

  const handleExport = () => {
    try {
      const data = exportData()
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `gurktaler-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setExportStatus('success')
      setStatusMessage('Daten erfolgreich exportiert!')
      setTimeout(() => {
        setExportStatus('idle')
        setStatusMessage('')
      }, 3000)
    } catch (error) {
      setExportStatus('error')
      setStatusMessage('Fehler beim Exportieren der Daten.')
      setTimeout(() => {
        setExportStatus('idle')
        setStatusMessage('')
      }, 3000)
    }
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const jsonData = event.target?.result as string
          importData(jsonData)
          setImportStatus('success')
          setStatusMessage('Daten erfolgreich importiert! Seite wird neu geladen...')
          setTimeout(() => {
            window.location.reload()
          }, 2000)
        } catch (error) {
          setImportStatus('error')
          setStatusMessage('Fehler beim Importieren der Daten. Überprüfe das Dateiformat.')
          setTimeout(() => {
            setImportStatus('idle')
            setStatusMessage('')
          }, 3000)
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const getLocalStorageSize = () => {
    let total = 0
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length
      }
    }
    return (total / 1024).toFixed(2) + ' KB'
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Einstellungen</h1>
        <p className="text-slate-500">App-Konfiguration und Datenverwaltung</p>
      </div>

      <div className="space-y-6">
        {/* Data Management */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">Datenverwaltung</h2>
              <p className="text-sm text-slate-500">LocalStorage & Browser-Speicher</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <div>
                <p className="font-medium text-slate-700">Speicher-Typ</p>
                <p className="text-sm text-slate-500">Browser LocalStorage (JSON-basiert)</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-slate-700">Aktuelle Größe</p>
                <p className="text-sm text-slate-500">{getLocalStorageSize()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sync Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FolderSync className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">Datensicherung</h2>
              <p className="text-sm text-slate-500">JSON-Export & Import für Git-Sync</p>
            </div>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
              exportStatus === 'success' || importStatus === 'success'
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            }`}>
              {(exportStatus === 'success' || importStatus === 'success') ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span className="text-sm font-medium">{statusMessage}</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="py-3 border-b border-slate-100">
              <p className="text-sm text-slate-600 mb-2">
                Exportiere deine Daten als JSON-Datei zum Backup oder zur Synchronisation mit Git.
              </p>
              <p className="text-xs text-slate-500">
                💡 Tipp: Speichere die Export-Datei im Git-Repository für Geräte-übergreifenden Zugriff.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleExport}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gurktaler-600 text-white rounded-lg hover:bg-gurktaler-700 transition-colors"
              >
                <Download className="w-5 h-5" />
                Daten exportieren
              </button>
              <button
                onClick={handleImport}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Upload className="w-5 h-5" />
                Daten importieren
              </button>
            </div>
            <p className="text-xs text-amber-600">
              ⚠️ Warnung: Beim Import werden alle aktuellen Daten überschrieben!
            </p>
          </div>
        </div>

        {/* About */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Info className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">Über Gurktaler 2.0</h2>
              <p className="text-sm text-slate-500">Version und Informationen</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <p><span className="text-slate-500">Version:</span> <span className="font-medium">0.3.0</span></p>
            <p><span className="text-slate-500">Build:</span> <span className="font-medium">Development</span></p>
            <p><span className="text-slate-500">Electron:</span> <span className="font-medium">28.0.0</span></p>
            <p><span className="text-slate-500">React:</span> <span className="font-medium">18.2.0</span></p>
            <p><span className="text-slate-500">Storage:</span> <span className="font-medium">LocalStorage + JSON</span></p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
