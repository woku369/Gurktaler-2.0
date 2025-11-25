import { Database, FolderSync, Info } from 'lucide-react'

function Settings() {
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
                            <p className="text-sm text-slate-500">Datenbank und Speicherort</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-slate-100">
                            <div>
                                <p className="font-medium text-slate-700">Datenbank-Pfad</p>
                                <p className="text-sm text-slate-500">./database/gurktaler.db</p>
                            </div>
                            <button className="px-3 py-1 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">
                                Ändern
                            </button>
                        </div>
                        <div className="flex items-center justify-between py-3">
                            <div>
                                <p className="font-medium text-slate-700">Bilder-Ordner</p>
                                <p className="text-sm text-slate-500">./assets/images</p>
                            </div>
                            <button className="px-3 py-1 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">
                                Ändern
                            </button>
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
                            <h2 className="font-semibold text-slate-800">Synchronisation</h2>
                            <p className="text-sm text-slate-500">Git-basierte Datensynchronisation</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-slate-100">
                            <div>
                                <p className="font-medium text-slate-700">Export-Ordner</p>
                                <p className="text-sm text-slate-500">./data-export</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button className="flex-1 px-4 py-2 bg-gurktaler-600 text-white rounded-lg hover:bg-gurktaler-700 transition-colors">
                                Daten exportieren
                            </button>
                            <button className="flex-1 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                                Daten importieren
                            </button>
                        </div>
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
                        <p><span className="text-slate-500">Version:</span> <span className="font-medium">0.1.0</span></p>
                        <p><span className="text-slate-500">Build:</span> <span className="font-medium">Development</span></p>
                        <p><span className="text-slate-500">Electron:</span> <span className="font-medium">28.0.0</span></p>
                        <p><span className="text-slate-500">React:</span> <span className="font-medium">18.2.0</span></p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Settings
