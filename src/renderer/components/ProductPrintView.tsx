import { useEffect, useState } from "react";
import { Package } from "lucide-react";
import {
  projects as projectsService,
  tags as tagsService,
  tagAssignments as tagAssignmentsService,
} from "@/renderer/services/storage";
import type { Product, Image, Project, Tag } from "@/shared/types";
import ReactDOM from "react-dom";

interface ProductPrintViewProps {
  product: Product;
  image?: Image;
  onClose: () => void;
}

const statusLabels: Record<string, string> = {
  draft: "Entwurf",
  testing: "In Test",
  approved: "Freigegeben",
  archived: "Archiviert",
};

// Separate Komponente für den Druckinhalt
function PrintContent({
  product,
  image,
  project,
  tags,
}: {
  product: Product;
  image?: Image;
  project: Project | null;
  tags: Tag[];
}) {
  return (
    <div className="print-content p-8 bg-white">
      {/* Header */}
      <div className="border-b-2 border-gurktaler-500 pb-4 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gurktaler-900 mb-2">
              {product.name}
            </h1>
            {product.version && (
              <p className="text-xl text-slate-600 mb-2">
                Version {product.version}
              </p>
            )}
            <p className="text-sm text-slate-500">
              Erstellt am:{" "}
              {new Date(product.created_at).toLocaleDateString("de-DE")}
              {product.updated_at &&
                product.updated_at !== product.created_at && (
                  <>
                    {" "}
                    | Aktualisiert:{" "}
                    {new Date(product.updated_at).toLocaleDateString("de-DE")}
                  </>
                )}
            </p>
          </div>
          {/* Logo/Bild Bereich */}
          <div className="w-32 h-32 border-2 border-slate-200 rounded flex items-center justify-center bg-slate-50 flex-shrink-0 ml-4">
            {image ? (
              <img
                src={image.data_url}
                alt={product.name}
                className="w-full h-full object-cover rounded"
              />
            ) : (
              <Package className="w-16 h-16 text-slate-300" />
            )}
          </div>
        </div>
      </div>

      {/* Status & Grundinformationen */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-3 border-b border-slate-200 pb-1">
            Status & Zuordnung
          </h2>
          <div className="space-y-2">
            <div>
              <span className="font-semibold text-slate-700">Status:</span>{" "}
              <span className="inline-block px-3 py-1 bg-slate-100 rounded text-sm">
                {statusLabels[product.status] || product.status}
              </span>
            </div>
            {project && (
              <div>
                <span className="font-semibold text-slate-700">Projekt:</span>{" "}
                {project.name}
              </div>
            )}
            {tags.length > 0 && (
              <div>
                <span className="font-semibold text-slate-700">Tags:</span>{" "}
                {tags.map((tag) => tag.name).join(", ")}
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-3 border-b border-slate-200 pb-1">
            Produktdetails
          </h2>
          <div className="space-y-2">
            {product.container_size && (
              <div>
                <span className="font-semibold text-slate-700">
                  Gebindegröße:
                </span>{" "}
                {product.container_size} ml
              </div>
            )}
            {product.alcohol_percentage && (
              <div>
                <span className="font-semibold text-slate-700">
                  Alkoholgehalt:
                </span>{" "}
                {product.alcohol_percentage}% vol.
              </div>
            )}
            {product.include_alcohol_tax !== undefined && (
              <div>
                <span className="font-semibold text-slate-700">
                  Alkoholsteuer:
                </span>{" "}
                {product.include_alcohol_tax ? "Ja" : "Nein"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Beschreibung */}
      {product.description && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-3 border-b border-slate-200 pb-1">
            Beschreibung
          </h2>
          <p className="text-slate-700 whitespace-pre-wrap">
            {product.description}
          </p>
        </div>
      )}

      {/* Notizen */}
      {product.notes && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-3 border-b border-slate-200 pb-1">
            Notizen
          </h2>
          <p className="text-slate-700 whitespace-pre-wrap">{product.notes}</p>
        </div>
      )}

      {/* Archivierungsgrund */}
      {product.archive_reason && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-red-900 mb-3 border-b border-red-200 pb-1">
            Archivierungsgrund
          </h2>
          <p className="text-red-700 italic">{product.archive_reason}</p>
        </div>
      )}

      {/* Dokumente */}
      {product.documents && product.documents.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-3 border-b border-slate-200 pb-1">
            Dokumente & Links
          </h2>
          <ul className="list-disc list-inside space-y-1">
            {product.documents.map((doc, index) => (
              <li key={index} className="text-slate-700">
                <span className="font-medium">{doc.name}</span>
                {doc.type === "url" && (
                  <span className="text-sm text-slate-500 ml-2">
                    ({doc.path})
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-slate-200 text-center text-sm text-slate-500">
        <p>Gurktaler 2.0 - Produktdatenblatt</p>
        <p>
          Gedruckt am: {new Date().toLocaleDateString("de-DE")} um{" "}
          {new Date().toLocaleTimeString("de-DE")}
        </p>
      </div>
    </div>
  );
}

export default function ProductPrintView({
  product,
  image,
  onClose,
}: ProductPrintViewProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Projekt laden
    if (product.project_id) {
      const proj = await projectsService.getById(product.project_id);
      setProject(proj || null);
    }

    // Tags laden
    const assignments = await tagAssignmentsService.getByEntity(
      "product",
      product.id,
    );
    const allTags = await tagsService.getAll();
    const productTags = allTags.filter((tag) =>
      assignments.some((a) => a.tag_id === tag.id),
    );
    setTags(productTags);
  };

  // Nach dem Drucken: Dialog schließen
  useEffect(() => {
    const handleAfterPrint = () => {
      onClose();
    };

    window.addEventListener("afterprint", handleAfterPrint);
    return () => window.removeEventListener("afterprint", handleAfterPrint);
  }, [onClose]);

  // Print-Only-Bereich als Portal ins <body>
  const printPortal =
    typeof window !== "undefined"
      ? ReactDOM.createPortal(
          <div
            className="print-only fixed top-0 left-0 w-screen h-screen z-[99999] bg-white overflow-auto"
            style={{ display: "none" }}
          >
            <PrintContent
              product={product}
              image={image}
              project={project}
              tags={tags}
            />
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="print-view">
      {/* Screen-Overlay mit Drucken/Abbrechen-Buttons */}
      <div className="no-print fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
          <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-xl font-bold text-slate-900">
              Druckvorschau: {product.name}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-gurktaler-500 text-white rounded hover:bg-gurktaler-600 font-semibold"
              >
                Drucken
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-500 text-white rounded hover:bg-slate-600"
              >
                Abbrechen
              </button>
            </div>
          </div>
          <div className="p-6">
            {/* Vorschau des Druckinhalts */}
            <div className="bg-white border border-slate-200 rounded shadow-sm">
              <PrintContent
                product={product}
                image={image}
                project={project}
                tags={tags}
              />
            </div>
          </div>
        </div>
      </div>
      {/* Print-Only-Portal */}
      {printPortal}
      <style>{`
        @media print {
          .no-print, .print-view > .no-print, .print-view > div:not(.print-only) {
            display: none !important;
          }
          .print-only {
            display: block !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            z-index: 99999 !important;
            background: white !important;
            overflow: auto !important;
          }
          body {
            margin: 0;
            padding: 0;
          }
          .print-content {
            width: 210mm;
            min-height: 297mm;
            padding: 20mm;
            margin: 0 auto;
            background: white;
            font-size: 12pt;
            line-height: 1.5;
          }
          h2 {
            page-break-after: avoid;
          }
          .grid {
            page-break-inside: avoid;
          }
        }
        @media screen {
          .print-only {
            display: none;
          }
          .print-content {
            max-width: 210mm;
          }
        }
      `}</style>
    </div>
  );
}
