import { useState, FormEvent, useEffect } from "react";
import TagSelector from "./TagSelector";
import ImageUpload from "./ImageUpload";
import DocumentManager from "./DocumentManager";
import { containers as containersService } from "@/renderer/services/storage";
import type {
  Product,
  ProductStatus,
  Project,
  Container,
  Document,
} from "@/shared/types";

interface ProductFormProps {
  product?: Product;
  projects: Project[];
  parentProduct?: Product; // For creating versions
  onSubmit: (data: Omit<Product, "id" | "created_at" | "updated_at">) => void;
  onCancel: () => void;
}

const statusOptions: { value: ProductStatus; label: string }[] = [
  { value: "draft", label: "Entwurf" },
  { value: "testing", label: "In Test" },
  { value: "approved", label: "Freigegeben" },
  { value: "archived", label: "Archiviert" },
];

export default function ProductForm({
  product,
  projects,
  parentProduct,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const [name, setName] = useState(product?.name || parentProduct?.name || "");
  const [version, setVersion] = useState(
    product?.version || (parentProduct ? "" : "1.0")
  );
  const [description, setDescription] = useState(product?.description || "");
  const [status, setStatus] = useState<ProductStatus>(
    product?.status || "draft"
  );
  const [projectId, setProjectId] = useState(product?.project_id || "");
  const [archiveReason, setArchiveReason] = useState(
    product?.archive_reason || ""
  );
  const [containerSize, setContainerSize] = useState(
    product?.container_size?.toString() || ""
  );
  const [alcoholPercentage, setAlcoholPercentage] = useState(
    product?.alcohol_percentage?.toString() || ""
  );
  const [includeAlcoholTax, setIncludeAlcoholTax] = useState(
    product?.include_alcohol_tax || false
  );
  const [containerId, setContainerId] = useState(product?.container_id || "");
  const [notes, setNotes] = useState(product?.notes || "");
  const [containers, setContainers] = useState<Container[]>([]);
  const [documents, setDocuments] = useState<Document[]>(
    product?.documents || []
  );

  const isVersioning = !!parentProduct;

  // Load containers on mount
  useEffect(() => {
    setContainers(containersService.getAll());
  }, []);

  // Calculate alcohol tax: 12 EUR per liter of pure alcohol
  const calculateAlcoholTax = (): number => {
    const size = parseFloat(containerSize) || 0;
    const alcohol = parseFloat(alcoholPercentage) || 0;
    if (size <= 0 || alcohol <= 0) return 0;
    const liters = size / 1000; // Convert ml to liters
    const pureAlcohol = liters * (alcohol / 100);
    return pureAlcohol * 12;
  };

  const alcoholTax = calculateAlcoholTax();

  const handleAddDocument = (doc: Omit<Document, "id" | "created_at">) => {
    const newDoc: Document = {
      ...doc,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    setDocuments([...documents, newDoc]);
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments(documents.filter((d) => d.id !== id));
  };

  const handleOpenDocument = async (doc: Document) => {
    if (doc.type === "file") {
      await window.electron.invoke("file:open", doc.path);
    } else {
      // URL oder Google Photos - öffne im Browser
      window.open(doc.path, "_blank");
    }
  };

  const handleShowInFolder = async (doc: Document) => {
    await window.electron.invoke("file:show", doc.path);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !version.trim()) return;

    onSubmit({
      name: name.trim(),
      version: version.trim(),
      description: description.trim() || undefined,
      status,
      project_id: projectId || undefined,
      parent_id: parentProduct?.id || product?.parent_id || undefined,
      archive_reason:
        status === "archived" && archiveReason.trim()
          ? archiveReason.trim()
          : undefined,
      container_size: containerSize ? parseFloat(containerSize) : undefined,
      alcohol_percentage: alcoholPercentage
        ? parseFloat(alcoholPercentage)
        : undefined,
      include_alcohol_tax: includeAlcoholTax,
      container_id: containerId || undefined,
      notes: notes.trim() || undefined,
      documents: documents.length > 0 ? documents : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Parent Product Info (when versioning) */}
      {isVersioning && parentProduct && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-800">
            <strong>Neue Version von:</strong> {parentProduct.name} (v
            {parentProduct.version})
          </p>
        </div>
      )}

      {/* Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Produktname *
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500 focus:border-transparent"
          placeholder="z.B. Kräuter-Bitter Classic"
          required
        />
      </div>

      {/* Version */}
      <div>
        <label
          htmlFor="version"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Version *
        </label>
        <input
          id="version"
          type="text"
          value={version}
          onChange={(e) => setVersion(e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500 focus:border-transparent"
          placeholder="z.B. 1.0, 1.1, 2.0"
          required
        />
        <p className="text-xs text-slate-500 mt-1">
          Empfehlung: 1.0 für Erstversion, 1.1 für kleine Änderungen, 2.0 für
          größere Überarbeitungen
        </p>
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Beschreibung
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500 focus:border-transparent resize-none"
          placeholder="Kurze Beschreibung des Produkts..."
        />
      </div>

      {/* Project Assignment */}
      <div>
        <label
          htmlFor="project"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Projekt (optional)
        </label>
        <select
          id="project"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500 focus:border-transparent"
        >
          <option value="">Kein Projekt</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      {/* Status */}
      <div>
        <label
          htmlFor="status"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Status
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as ProductStatus)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500 focus:border-transparent"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Archive Reason (only when archived) */}
      {status === "archived" && (
        <div>
          <label
            htmlFor="archiveReason"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Grund für Archivierung
          </label>
          <textarea
            id="archiveReason"
            value={archiveReason}
            onChange={(e) => setArchiveReason(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500 focus:border-transparent resize-none"
            placeholder="z.B. Zu süß, Rezeptur überarbeiten"
          />
        </div>
      )}

      {/* Container Selection */}
      <div>
        <label
          htmlFor="container"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Gebinde (optional)
        </label>
        <select
          id="container"
          value={containerId}
          onChange={(e) => {
            const selectedId = e.target.value;
            setContainerId(selectedId);
            // Auto-fill container size if container is selected
            if (selectedId) {
              const container = containers.find((c) => c.id === selectedId);
              if (container?.volume) {
                setContainerSize(container.volume.toString());
              }
            }
          }}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500 focus:border-transparent"
        >
          <option value="">Kein Gebinde</option>
          {containers.map((container) => (
            <option key={container.id} value={container.id}>
              {container.name}
              {container.volume ? ` (${container.volume} ml)` : ""}
              {container.price ? ` - €${container.price.toFixed(2)}` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Container Size (manual override) */}
      <div>
        <label
          htmlFor="containerSize"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Gebindegröße (ml)
        </label>
        <input
          id="containerSize"
          type="number"
          step="1"
          min="0"
          value={containerSize}
          onChange={(e) => setContainerSize(e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500 focus:border-transparent"
          placeholder="z.B. 700"
        />
        <p className="text-xs text-slate-500 mt-1">
          Wird automatisch ausgefüllt, wenn ein Gebinde gewählt wird
        </p>
      </div>

      {/* Alcohol Percentage */}
      <div>
        <label
          htmlFor="alcoholPercentage"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Alkoholgehalt (%vol.)
        </label>
        <input
          id="alcoholPercentage"
          type="number"
          step="0.1"
          min="0"
          max="100"
          value={alcoholPercentage}
          onChange={(e) => setAlcoholPercentage(e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500 focus:border-transparent"
          placeholder="z.B. 40.0"
        />
      </div>

      {/* Alcohol Tax Calculation */}
      {alcoholTax > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">
              Alkoholsteuer (12 €/L reiner Alkohol)
            </span>
            <span className="text-lg font-bold text-blue-900">
              €{alcoholTax.toFixed(2)}
            </span>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeAlcoholTax}
              onChange={(e) => setIncludeAlcoholTax(e.target.checked)}
              className="w-4 h-4 text-gurktaler-600 border-slate-300 rounded focus:ring-2 focus:ring-gurktaler-500"
            />
            <span className="text-sm text-blue-800">
              Alkoholsteuer in Preisfindung berücksichtigen
            </span>
          </label>
        </div>
      )}

      {/* Notes */}
      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Bemerkung
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500 focus:border-transparent resize-none"
          placeholder="Weitere Notizen zum Produkt..."
        />
      </div>

      {/* Tags */}
      {product && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Tags
          </label>
          <TagSelector entityType="product" entityId={product.id} />
        </div>
      )}

      {/* Images */}
      {product && (
        <div>
          <ImageUpload
            entityType="product"
            entityId={product.id}
            maxImages={5}
          />
        </div>
      )}

      {/* Documents */}
      {product && (
        <div>
          <DocumentManager
            documents={documents}
            onAdd={handleAddDocument}
            onDelete={handleDeleteDocument}
            onOpen={handleOpenDocument}
            onShowInFolder={handleShowInFolder}
          />
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Abbrechen
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-gurktaler-600 text-white rounded-lg hover:bg-gurktaler-700 transition-colors"
        >
          {product
            ? "Speichern"
            : isVersioning
            ? "Version erstellen"
            : "Erstellen"}
        </button>
      </div>
    </form>
  );
}
