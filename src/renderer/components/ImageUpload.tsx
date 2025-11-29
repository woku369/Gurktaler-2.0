import { useState, useRef, useEffect } from "react";
import { Upload, X, Image as ImageIcon, Link2 } from "lucide-react";
import { images as imagesService } from "@/renderer/services/storage";
import type { Image } from "@/shared/types";

interface ImageUploadProps {
  entityType: "project" | "product" | "note" | "recipe";
  entityId: string;
  maxImages?: number;
  onUpload?: () => void;
}

export default function ImageUpload({
  entityType,
  entityId,
  maxImages = 5,
  onUpload,
}: ImageUploadProps) {
  const [images, setImages] = useState<Image[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing images on mount
  useEffect(() => {
    loadImages();
  }, [entityId]);

  const loadImages = () => {
    const existingImages = imagesService.getByEntity(entityType, entityId);
    setImages(existingImages);
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;

    const filesToProcess = Math.min(files.length, maxImages - images.length);
    let processedCount = 0;

    for (let i = 0; i < filesToProcess; i++) {
      const file = files[i];

      // Only accept images
      if (!file.type.startsWith("image/")) continue;

      // Convert to base64 data URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;

        // Save to storage
        imagesService.create({
          entity_type: entityType,
          entity_id: entityId,
          data_url: dataUrl,
          file_name: file.name,
          caption: "",
        });

        processedCount++;
        if (processedCount === filesToProcess) {
          loadImages();
          onUpload?.();
        }
      };
      reader.readAsDataURL(file);
    }
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

  const handleUrlSubmit = async () => {
    if (!imageUrl.trim() || isLoadingUrl) return;

    setIsLoadingUrl(true);
    try {
      // Fetch the image from URL and convert to base64
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;

        // Extract filename from URL or use default
        const urlParts = imageUrl.split("/");
        const fileName = urlParts[urlParts.length - 1] || "image-from-url.jpg";

        imagesService.create({
          entity_type: entityType,
          entity_id: entityId,
          data_url: dataUrl,
          file_name: fileName,
          caption: "",
        });

        loadImages();
        onUpload?.();
        setImageUrl("");
        setShowUrlInput(false);
        setIsLoadingUrl(false);
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error("Failed to load image from URL:", error);
      alert(
        "Bild konnte nicht von der URL geladen werden. Stelle sicher, dass die URL öffentlich zugänglich ist."
      );
      setIsLoadingUrl(false);
    }
  };

  const removeImage = (id: string) => {
    imagesService.delete(id);
    loadImages();
  };

  const updateCaption = (id: string, caption: string) => {
    imagesService.update(id, { caption });
    loadImages();
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        Bilder ({images.length}/{maxImages})
      </label>

      {/* Upload Area */}
      {images.length < maxImages && (
        <>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragging
                ? "border-gurktaler-500 bg-gurktaler-50"
                : "border-slate-300 hover:border-slate-400 bg-slate-50"
            }`}
          >
            <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
            <p className="text-sm text-slate-600 mb-1">
              Bilder hochladen oder hierher ziehen
            </p>
            <p className="text-xs text-slate-500">
              PNG, JPG, GIF bis 5MB pro Bild
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
          </div>

          {/* URL Input Toggle */}
          <div className="mt-3">
            {!showUrlInput ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowUrlInput(true);
                }}
                className="flex items-center gap-2 text-sm text-gurktaler-600 hover:text-gurktaler-700"
              >
                <Link2 className="w-4 h-4" />
                Bild von URL einfügen
              </button>
            ) : (
              <div className="flex gap-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://beispiel.de/bild.jpg"
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gurktaler-500"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleUrlSubmit();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleUrlSubmit}
                  disabled={isLoadingUrl || !imageUrl.trim()}
                  className="px-4 py-2 bg-gurktaler-600 text-white rounded-lg hover:bg-gurktaler-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isLoadingUrl ? "Lädt..." : "Laden"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUrlInput(false);
                    setImageUrl("");
                  }}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm"
                >
                  Abbrechen
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="mt-4 space-y-3">
          {images.map((image) => (
            <div
              key={image.id}
              className="relative border border-slate-200 rounded-lg p-3 bg-white"
            >
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-20 h-20 bg-slate-100 rounded overflow-hidden">
                  <img
                    src={image.data_url}
                    alt={image.caption || "Hochgeladenes Bild"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={image.caption}
                    onChange={(e) => updateCaption(image.id, e.target.value)}
                    placeholder="Bildunterschrift (optional)"
                    className="w-full px-2 py-1 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-gurktaler-500"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    {image.file_name}
                  </p>
                </div>
                <button
                  onClick={() => removeImage(image.id)}
                  className="flex-shrink-0 p-1 hover:bg-red-50 rounded transition-colors"
                  title="Bild entfernen"
                >
                  <X className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Text */}
      {images.length === 0 && (
        <p className="text-xs text-slate-500 mt-2">
          <ImageIcon className="w-3 h-3 inline mr-1" />
          Noch keine Bilder hochgeladen
        </p>
      )}

      {/* Note: In a real implementation, images would be saved to:
          - localStorage as base64 (current simple approach)
          - or file system paths (better for Electron app)
          - or cloud storage (for sync across devices)
      */}
    </div>
  );
}
