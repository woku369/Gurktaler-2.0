import { useState, useRef } from "react";
import { Plus, X, Save, Camera } from "lucide-react";
import { notes as notesService } from "@/renderer/services/storage";

export default function QuickNoteButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Nur auf Mobile anzeigen (Browser, nicht Electron)
  const isElectron =
    typeof window !== "undefined" && (window as any).electron !== undefined;

  if (isElectron) return null;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Convert zu Base64 und zur Liste hinzufügen
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setSelectedImages((prev) => [...prev, dataUrl]);
      };
      reader.readAsDataURL(file);
    });

    // Input resetten für erneute Auswahl
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!title.trim() && !content.trim() && selectedImages.length === 0) return;

    setIsSaving(true);
    try {
      // Note erstellen
      const note = await notesService.create({
        title: title.trim() || "Schnelle Notiz",
        content: content.trim(),
        type: "note",
        project_id: undefined,
      });

      // Bilder speichern (wenn vorhanden)
      if (selectedImages.length > 0 && note) {
        const { images: imagesService } = await import(
          "@/renderer/services/storage"
        );
        for (const [index, dataUrl] of selectedImages.entries()) {
          await imagesService.create({
            entity_type: "note",
            entity_id: note.id,
            data_url: dataUrl,
            file_name: `quick-note-${Date.now()}-${index}.jpg`,
            caption: "",
          });
        }
      }

      // Reset & Close
      setTitle("");
      setContent("");
      setSelectedImages([]);
      setIsOpen(false);
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="md:hidden fixed bottom-6 right-6 z-30 w-14 h-14 bg-gurktaler-500 text-white rounded-full shadow-lg hover:bg-gurktaler-600 transition-all active:scale-95 flex items-center justify-center"
          aria-label="Schnelle Notiz erstellen"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* Quick Entry Modal */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex items-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Content */}
          <div className="relative w-full bg-white rounded-t-3xl shadow-2xl p-6 max-h-[80vh] overflow-y-auto animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-heading font-bold text-distillery-800">
                Schnelle Notiz
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Schließen"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Titel (optional)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-gurktaler-500 text-lg"
                autoFocus
              />

              <textarea
                placeholder="Was möchtest du notieren?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-gurktaler-500 resize-none"
              />

              {/* Foto-Upload */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-4 py-3 border-2 border-dashed border-gurktaler-300 rounded-lg text-gurktaler-600 hover:border-gurktaler-500 hover:bg-gurktaler-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Camera className="w-5 h-5" />
                  Foto hinzufügen
                </button>
                {selectedImages.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedImages.length} Foto
                    {selectedImages.length !== 1 ? "s" : ""} ausgewählt
                  </p>
                )}
              </div>

              {/* Bild-Vorschau */}
              {selectedImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {selectedImages.map((dataUrl, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={dataUrl}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Foto entfernen"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleSave}
                  disabled={
                    isSaving ||
                    (!title.trim() &&
                      !content.trim() &&
                      selectedImages.length === 0)
                  }
                  className="flex-1 px-6 py-3 bg-gurktaler-500 text-white rounded-lg font-semibold hover:bg-gurktaler-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {isSaving ? "Speichere..." : "Speichern"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
