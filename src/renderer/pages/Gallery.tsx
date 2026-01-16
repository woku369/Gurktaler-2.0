import { useState, useEffect, useRef } from "react";
import {
  Image as ImageIcon,
  Upload,
  Edit2,
  Trash2,
  Search,
} from "lucide-react";
import {
  getAllGalleryImages,
  getFilteredImages,
  uploadToGallery,
  deleteGalleryImage,
  type GalleryImage,
  type GalleryFilter,
} from "@/renderer/services/gallery";
import { tags as tagsService } from "@/renderer/services/storage";
import type { Tag } from "@/shared/types";
import GalleryImageModal from "@/renderer/components/GalleryImageModal";

function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [filteredImages, setFilteredImages] = useState<GalleryImage[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [filter, setFilter] = useState<GalleryFilter>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [images, filter, searchTerm]);

  const loadData = async () => {
    console.log("[Gallery] 🔄 loadData gestartet...");
    try {
      const [allImages, allTags] = await Promise.all([
        getAllGalleryImages(),
        tagsService.getAll(),
      ]);
      console.log("[Gallery] ✅ Daten geladen:", {
        imageCount: allImages.length,
        tagCount: allTags.length,
        firstImage: allImages[0]
          ? {
              id: allImages[0].id,
              fileName: allImages[0].file_name,
              hasDataUrl: !!allImages[0].data_url,
              dataUrlLength: allImages[0].data_url?.length || 0,
            }
          : "keine Bilder",
      });
      setImages(allImages);
      setTags(allTags);
    } catch (error) {
      console.error("[Gallery] ❌ Fehler beim Laden:", error);
    }
  };

  const applyFilters = async () => {
    console.log("[Gallery] 🔍 Filter anwenden:", {
      filter,
      searchTerm,
      totalImages: images.length,
    });
    try {
      const filtered = await getFilteredImages({
        ...filter,
        searchTerm: searchTerm || undefined,
      });
      console.log("[Gallery] ✅ Gefilterte Bilder:", filtered.length);
      setFilteredImages(filtered);
    } catch (error) {
      console.error("[Gallery] ❌ Fehler beim Filtern:", error);
    }
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;

      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        await uploadToGallery(dataUrl, file.name);
      };
      reader.readAsDataURL(file);
    }

    await loadData();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleImageClick = (image: GalleryImage) => {
    setSelectedImage(image);
    setIsModalOpen(true);
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm("Bild wirklich löschen?")) return;
    await deleteGalleryImage(imageId);
    await loadData();
  };

  const handleModalClose = async () => {
    setIsModalOpen(false);
    setSelectedImage(null);
    await loadData();
  };

  const entityTypeLabels: Record<string, string> = {
    project: "Projekt",
    product: "Produkt",
    recipe: "Rezeptur",
    ingredient: "Zutat",
    container: "Gebinde",
    contact: "Kontakt",
    note: "Notiz",
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-distillery-900">
            Bildergalerie
          </h1>
          <p className="text-distillery-600 font-body">
            Zentrale Verwaltung aller {images.length} Bilder mit Tagging und
            Kategoriezuordnung
          </p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-5 py-2.5 bg-gurktaler-500 text-white rounded-vintage hover:bg-gurktaler-600 transition-all shadow-md font-body font-semibold"
        >
          <Upload className="w-5 h-5" />
          Bilder hochladen
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Filter & Search */}
      <div className="bg-white rounded-vintage shadow-vintage border-vintage border-distillery-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-distillery-400" />
              <input
                type="text"
                placeholder="Suche nach Dateinamen oder Beschreibung..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-vintage border-distillery-200 rounded-vintage focus:outline-none focus:ring-2 focus:ring-gurktaler-500 font-body"
              />
            </div>
          </div>
          <select
            value={filter.entityType || ""}
            onChange={(e) =>
              setFilter({ ...filter, entityType: e.target.value || undefined })
            }
            className="px-4 py-2 border-vintage border-distillery-200 rounded-vintage focus:outline-none focus:ring-2 focus:ring-gurktaler-500 font-body"
          >
            <option value="">Alle Kategorien</option>
            {Object.entries(entityTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select
            value={filter.tagIds?.[0] || ""}
            onChange={(e) =>
              setFilter({
                ...filter,
                tagIds: e.target.value ? [e.target.value] : undefined,
              })
            }
            className="px-4 py-2 border-vintage border-distillery-200 rounded-vintage focus:outline-none focus:ring-2 focus:ring-gurktaler-500 font-body"
          >
            <option value="">Alle Tags</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </select>
        </div>
        {(filter.entityType || filter.tagIds || searchTerm) && (
          <button
            onClick={() => {
              setFilter({});
              setSearchTerm("");
            }}
            className="mt-3 text-sm text-gurktaler-600 hover:text-gurktaler-700 font-body"
          >
            Filter zurücksetzen
          </button>
        )}
      </div>

      {/* Drag & Drop Zone (when empty) */}
      {images.length === 0 && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`bg-white rounded-vintage shadow-vintage border-vintage border-distillery-200 p-12 text-center transition-colors ${
            isDragging ? "bg-gurktaler-50 border-gurktaler-400" : ""
          }`}
        >
          <ImageIcon className="w-16 h-16 mx-auto text-distillery-300 mb-4" />
          <h3 className="text-lg font-heading font-semibold text-distillery-900 mb-2">
            Noch keine Bilder
          </h3>
          <p className="text-distillery-600 font-body mb-6">
            Lade Bilder hoch oder sammle sie automatisch aus deinen Projekten,
            Produkten und Rezepturen.
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-2 bg-gurktaler-500 text-white rounded-vintage hover:bg-gurktaler-600 transition-colors font-body font-semibold"
          >
            Erste Bilder hochladen
          </button>
        </div>
      )}

      {/* Grid */}
      {filteredImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredImages.map((image) => (
            <div
              key={image.id}
              className="bg-white rounded-vintage shadow-vintage border-vintage border-distillery-200 overflow-hidden group cursor-pointer hover:shadow-lg transition-all"
              onClick={() => handleImageClick(image)}
            >
              <div className="aspect-square relative overflow-hidden bg-slate-100">
                <img
                  src={image.data_url}
                  alt={image.file_name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleImageClick(image);
                      }}
                      className="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-gurktaler-600" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteImage(image.id);
                      }}
                      className="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-3">
                <p className="text-sm font-body font-medium text-distillery-900 truncate">
                  {image.file_name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 bg-gurktaler-100 text-gurktaler-700 rounded-full font-body">
                    {entityTypeLabels[image.entity_type] || image.entity_type}
                  </span>
                  {image.tags && image.tags.length > 0 && (
                    <span className="text-xs text-distillery-500 font-body">
                      {image.tags.length} Tag{image.tags.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {images.length > 0 && filteredImages.length === 0 && (
        <div className="bg-white rounded-vintage shadow-vintage border-vintage border-distillery-200 p-12 text-center">
          <ImageIcon className="w-16 h-16 mx-auto text-distillery-300 mb-4" />
          <h3 className="text-lg font-heading font-semibold text-distillery-900 mb-2">
            Keine Ergebnisse
          </h3>
          <p className="text-distillery-600 font-body">
            Keine Bilder gefunden für deine Filterkriterien.
          </p>
        </div>
      )}

      {/* Image Edit Modal */}
      {selectedImage && (
        <GalleryImageModal
          image={selectedImage}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          allTags={tags}
        />
      )}
    </div>
  );
}

export default Gallery;
