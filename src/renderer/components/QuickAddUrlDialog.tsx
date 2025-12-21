import { useState } from "react";
import { ExternalLink, X } from "lucide-react";

interface QuickAddUrlDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (url: string, name: string) => void;
  entityName: string; // z.B. "Budelle"
}

export default function QuickAddUrlDialog({
  isOpen,
  onClose,
  onAdd,
  entityName,
}: QuickAddUrlDialogProps) {
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    onAdd(url, name || url);
    setUrl("");
    setName("");
    onClose();
  };

  const handleClose = () => {
    setUrl("");
    setName("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-vintage shadow-vintage w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-distillery-200">
          <div className="flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-gurktaler-600" />
            <h2 className="text-lg font-heading font-bold text-distillery-900">
              URL hinzufügen
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-distillery-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-distillery-600" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-distillery-700 mb-1 font-body">
              URL / Link *
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 border-vintage border-distillery-300 rounded-vintage focus:outline-none focus:ring-2 focus:ring-gurktaler-500 font-body"
              required
              autoFocus
            />
            <p className="text-xs text-distillery-500 mt-1 font-body">
              z.B. Lieferanten-Website, Produktseite, etc.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-distillery-700 mb-1 font-body">
              Name (optional)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`z.B. "Lieferant ${entityName}"`}
              className="w-full px-3 py-2 border-vintage border-distillery-300 rounded-vintage focus:outline-none focus:ring-2 focus:ring-gurktaler-500 font-body"
            />
            <p className="text-xs text-distillery-500 mt-1 font-body">
              Wird als URL verwendet, wenn leer gelassen
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 bg-distillery-100 text-distillery-700 rounded-vintage hover:bg-distillery-200 transition-all font-body font-semibold"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gurktaler-500 text-white rounded-vintage hover:bg-gurktaler-600 transition-all font-body font-semibold"
            >
              Hinzufügen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
