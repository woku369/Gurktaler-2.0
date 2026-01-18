import { useState, useEffect } from 'react'

interface NasMountDialogProps {
  onClose: () => void
  onSuccess: () => void
}

interface TailscalePeer {
  hostname: string
  ip: string
  online: boolean
  os: string
}

export function NasMountDialog({ onClose, onSuccess }: NasMountDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tailscaleRunning, setTailscaleRunning] = useState(false)
  const [peers, setPeers] = useState<TailscalePeer[]>([])
  
  // Form State
  const [ip, setIp] = useState('100.121.103.107')
  const [share, setShare] = useState('zweipunktnull')
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)

  useEffect(() => {
    checkTailscale()
  }, [])

  const checkTailscale = async () => {
    if (!window.electron) return
    
    try {
      const result = await window.electron.invoke('nas:tailscale-status') as { success: boolean; running: boolean; peers?: TailscalePeer[] }
      if (result.success && result.running) {
        setTailscaleRunning(true)
        setPeers(result.peers || [])
        
        // Finde Synology NAS in der Liste
        const synology = result.peers?.find((p: TailscalePeer) => 
          p.hostname.toLowerCase().includes('synology') || 
          p.hostname.toLowerCase().includes('nas')
        )
        
        if (synology) {
          setIp(synology.ip)
        }
      }
    } catch (err) {
      console.error('Tailscale-Status fehlgeschlagen:', err)
    }
  }

  const handleMount = async () => {
    setLoading(true)
    setError('')

    try {
      if (!window.electron) {
        setError('Electron API nicht verfügbar (PWA-Modus)')
        return
      }

      const result = await window.electron.invoke('nas:mount', {
        ip,
        share,
        username: username || undefined,
        password: password || undefined
      }) as { success: boolean; error?: string; alreadyMounted?: boolean }

      if (result.success) {
        console.log('✅ NAS erfolgreich verbunden!')
        onSuccess()
      } else {
        setError(result.error || 'Verbindung fehlgeschlagen')
      }
    } catch (err: any) {
      setError(err.message || 'Unbekannter Fehler')
    } finally {
      setLoading(false)
    }
  }

  const selectPeer = (peer: TailscalePeer) => {
    setIp(peer.ip)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-vintage shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800">
            🔌 NAS-Laufwerk verbinden
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Laufwerk Y: ist nicht verfügbar. Verbinde dein Synology NAS über Tailscale.
          </p>
        </div>

        <div className="p-6 space-y-4">
          {/* Tailscale Status */}
          {tailscaleRunning && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-vintage">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">✅</span>
                <span className="font-semibold text-green-800">Tailscale aktiv</span>
              </div>
              
              {peers.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm text-green-700 mb-2">
                    Gefundene Geräte in deinem Tailnet:
                  </p>
                  <div className="space-y-1">
                    {peers.map((peer, idx) => (
                      <button
                        key={idx}
                        onClick={() => selectPeer(peer)}
                        className={`w-full text-left px-3 py-2 rounded border transition-colors ${
                          peer.ip === ip
                            ? 'bg-green-100 border-green-300 text-green-900'
                            : 'bg-white border-green-200 text-green-800 hover:bg-green-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium">{peer.hostname}</span>
                            <span className="text-xs text-green-600 ml-2">{peer.os}</span>
                          </div>
                          <code className="text-xs bg-white px-2 py-0.5 rounded border border-green-200">
                            {peer.ip}
                          </code>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!tailscaleRunning && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-vintage">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">⚠️</span>
                <span className="font-semibold text-yellow-800">Tailscale nicht erkannt</span>
              </div>
              <p className="text-sm text-yellow-700 mb-2">
                Tailscale ist nicht installiert oder läuft nicht.
              </p>
              <a 
                href="https://tailscale.com/download" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                → Tailscale herunterladen
              </a>
            </div>
          )}

          {/* Fehler anzeigen */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-vintage">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">❌</span>
                <span className="font-semibold text-red-800">Verbindung fehlgeschlagen</span>
              </div>
              <pre className="text-sm text-red-700 whitespace-pre-wrap mt-2">
                {error}
              </pre>
            </div>
          )}

          {/* NAS-IP Eingabe */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              NAS Tailscale-IP
            </label>
            <input
              type="text"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              placeholder="100.121.103.107"
              className="w-full px-3 py-2 border border-slate-300 rounded-vintage focus:outline-none focus:ring-2 focus:ring-gurktaler-500"
            />
            <p className="text-xs text-slate-500 mt-1">
              💡 Tipp: Öffne Tailscale und kopiere die IP deines NAS
            </p>
          </div>

          {/* Share Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Freigabe-Name
            </label>
            <input
              type="text"
              value={share}
              onChange={(e) => setShare(e.target.value)}
              placeholder="zweipunktnull"
              className="w-full px-3 py-2 border border-slate-300 rounded-vintage focus:outline-none focus:ring-2 focus:ring-gurktaler-500"
            />
            <p className="text-xs text-slate-500 mt-1">
              Der Name der Synology-Freigabe (wie in DSM angelegt)
            </p>
          </div>

          {/* Erweiterte Einstellungen */}
          <div>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-gurktaler-600 hover:text-gurktaler-700 font-medium"
            >
              {showAdvanced ? '▼' : '▶'} Erweiterte Einstellungen
            </button>

            {showAdvanced && (
              <div className="mt-3 space-y-3 pl-4 border-l-2 border-slate-200">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Benutzername
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                    className="w-full px-3 py-2 border border-slate-300 rounded-vintage focus:outline-none focus:ring-2 focus:ring-gurktaler-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Passwort
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Dein Synology-Passwort"
                    className="w-full px-3 py-2 border border-slate-300 rounded-vintage focus:outline-none focus:ring-2 focus:ring-gurktaler-500"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Optional: Nur nötig wenn Windows-Passwort anders ist
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Aktionen */}
        <div className="p-6 border-t border-slate-200 flex gap-3">
          <button
            onClick={handleMount}
            disabled={loading || !ip || !share}
            className="flex-1 px-4 py-2 bg-gurktaler-600 text-white rounded-vintage hover:bg-gurktaler-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '🔄 Verbinde...' : '🔌 Jetzt verbinden'}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-vintage hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Abbrechen
          </button>
        </div>

        {/* Hilfe */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 text-sm text-slate-600">
          <p className="font-medium mb-2">💡 Hilfe:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Stelle sicher dass Tailscale auf diesem PC läuft</li>
            <li>Stelle sicher dass dein Synology NAS mit Tailscale verbunden ist</li>
            <li>Die Freigabe "{share}" muss in DSM existieren</li>
            <li>Nach erfolgreicher Verbindung ist das Laufwerk Y: verfügbar</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
