import { Plus, Search, GitBranch } from 'lucide-react'

// Mock data with versioning
const products = [
    {
        id: '1',
        name: 'Kräuter-Bitter Classic',
        version: '1.0',
        status: 'approved',
        parent_id: null,
        children: [
            { id: '1a', name: 'Kräuter-Bitter Classic', version: '1.1', status: 'testing' },
        ]
    },
    {
        id: '2',
        name: 'Minz-Likör Frisch',
        version: '1.0',
        status: 'draft',
        parent_id: null,
        children: []
    },
    {
        id: '3',
        name: 'Zimt-Spezial Winter',
        version: '1.0',
        status: 'archived',
        archive_reason: 'Zu süß, Rezeptur überarbeiten',
        parent_id: null,
        children: [
            { id: '3a', name: 'Zimt-Spezial Winter', version: '2.0', status: 'testing' },
        ]
    },
]

const statusColors = {
    draft: 'bg-slate-100 text-slate-700',
    testing: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    archived: 'bg-red-100 text-red-700',
}

const statusLabels = {
    draft: 'Entwurf',
    testing: 'In Test',
    approved: 'Freigegeben',
    archived: 'Archiviert',
}

function Products() {
    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Produkte</h1>
                    <p className="text-slate-500">Produktentwicklung mit Versionierung</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-gurktaler-600 text-white rounded-lg hover:bg-gurktaler-700 transition-colors">
                    <Plus className="w-5 h-5" />
                    Neues Produkt
                </button>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative max-w-md">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Produkte durchsuchen..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Product Tree */}
            <div className="space-y-4">
                {products.map((product) => (
                    <div key={product.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        {/* Main Product */}
                        <div className="p-6 hover:bg-slate-50 cursor-pointer transition-colors">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-semibold text-slate-800">{product.name}</h3>
                                        <span className="text-sm text-slate-500">v{product.version}</span>
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[product.status as keyof typeof statusColors]}`}>
                                            {statusLabels[product.status as keyof typeof statusLabels]}
                                        </span>
                                    </div>
                                    {product.archive_reason && (
                                        <p className="text-sm text-red-600 italic">Archiviert: {product.archive_reason}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {product.children.length > 0 && (
                                        <span className="flex items-center gap-1 text-sm text-slate-500">
                                            <GitBranch className="w-4 h-4" />
                                            {product.children.length} Version(en)
                                        </span>
                                    )}
                                    <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                                        <Plus className="w-5 h-5 text-slate-500" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Child Versions */}
                        {product.children.length > 0 && (
                            <div className="border-t border-slate-200 bg-slate-50">
                                {product.children.map((child) => (
                                    <div key={child.id} className="p-4 pl-12 hover:bg-slate-100 cursor-pointer transition-colors border-b border-slate-200 last:border-b-0">
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 border-l-2 border-b-2 border-slate-300 rounded-bl-lg -ml-4 -mt-4"></div>
                                            <span className="font-medium text-slate-700">{child.name}</span>
                                            <span className="text-sm text-slate-500">v{child.version}</span>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[child.status as keyof typeof statusColors]}`}>
                                                {statusLabels[child.status as keyof typeof statusLabels]}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Products
