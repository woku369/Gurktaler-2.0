import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { X } from "lucide-react";
import {
  products as productsService,
  images as imagesService,
  projects as projectsService,
  tags as tagsService,
  tagAssignments as tagAssignmentsService,
} from "@/renderer/services/storage";
import type { Product, Image, Project, Tag } from "@/shared/types";

interface BatchPrintViewProps {
  productIds: string[];
  onClose: () => void;
}

const statusLabels: Record<string, string> = {
  draft: "Entwurf",
  testing: "In Test",
  approved: "Freigegeben",
  archived: "Archiviert",
};

// Einzelne Produktkarte für den Druck
function PrintCard({
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
    <div className="print-card bg-white border-2 border-slate-300 rounded-lg p-6 break-inside-avoid mb-6">
      {/* Header mit Bild */}
      <div className="flex gap-4 mb-4">
        {image && (
          <div className="flex-shrink-0 w-32 h-32 bg-slate-100 rounded-lg overflow-hidden">
            <img
              src={image.data_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-slate-900 mb-1">
            {product.name}
          </h2>
          {product.version && (
            <p className="text-lg text-slate-600 mb-2">
              Version {product.version}
            </p>
          )}
          <span className="inline-block px-3 py-1 text-sm font-semibold rounded-full bg-slate-100 text-slate-700">
            {statusLabels[product.status] || product.status}
          </span>
        </div>
      </div>

      {/* Beschreibung */}
      {product.description && (
        <div className="mb-4">
          <h3 className="text-sm font-bold text-slate-700 mb-1">
            Beschreibung:
          </h3>
          <p className="text-sm text-slate-600">{product.description}</p>
        </div>
      )}

      {/* Technische Details */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        {product.alcohol_percentage !== undefined && (
          <div>
            <span className="font-bold text-slate-700">Alkohol:</span>{" "}
            {product.alcohol_percentage}%
          </div>
        )}
        {product.container_size !== undefined && (
          <div>
            <span className="font-bold text-slate-700">Größe:</span>{" "}
            {product.container_size}L
          </div>
        )}
        {product.include_alcohol_tax &&
          product.alcohol_tax_amount !== undefined && (
            <div>
              <span className="font-bold text-slate-700">Alkoholsteuer:</span> €
              {product.alcohol_tax_amount.toFixed(2)}
            </div>
          )}
      </div>

      {/* Projekt */}
      {project && (
        <div className="mb-4 text-sm">
          <span className="font-bold text-slate-700">Projekt:</span>{" "}
          {project.name}
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-bold text-slate-700 mb-2">Tags:</h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag.id}
                className="inline-block px-2 py-1 text-xs rounded-full bg-slate-200 text-slate-700"
              >
                {tag.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Notizen */}
      {product.notes && (
        <div className="mb-4 text-sm">
          <h3 className="text-sm font-bold text-slate-700 mb-1">Notizen:</h3>
          <p className="text-slate-600 whitespace-pre-wrap">{product.notes}</p>
        </div>
      )}

      {/* Metadaten */}
      <div className="mt-4 pt-4 border-t border-slate-200 text-xs text-slate-500">
        <div>
          Erstellt: {new Date(product.created_at).toLocaleDateString("de-DE")}
        </div>
        {product.updated_at && product.updated_at !== product.created_at && (
          <div>
            Aktualisiert:{" "}
            {new Date(product.updated_at).toLocaleDateString("de-DE")}
          </div>
        )}
      </div>
    </div>
  );
}

export default function BatchPrintView({
  productIds,
  onClose,
}: BatchPrintViewProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [images, setImages] = useState<Record<string, Image>>({});
  const [projects, setProjects] = useState<Record<string, Project>>({});
  const [productTags, setProductTags] = useState<Record<string, Tag[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      // Produkte laden
      const allProducts = await productsService.getAll();
      const selectedProducts = allProducts.filter((p) =>
        productIds.includes(p.id),
      );
      setProducts(selectedProducts);

      // Bilder laden
      const imageMap: Record<string, Image> = {};
      for (const product of selectedProducts) {
        const productImages = await imagesService.getByEntity(
          "product",
          product.id,
        );
        if (productImages.length > 0) {
          imageMap[product.id] = productImages[0];
        }
      }
      setImages(imageMap);

      // Projekte laden
      const allProjects = await projectsService.getAll();
      const projectMap: Record<string, Project> = {};
      allProjects.forEach((p) => {
        projectMap[p.id] = p;
      });
      setProjects(projectMap);

      // Tags laden
      const allTags = await tagsService.getAll();
      const tagMap: Record<string, Tag> = {};
      allTags.forEach((t) => {
        tagMap[t.id] = t;
      });

      const productTagsMap: Record<string, Tag[]> = {};
      for (const product of selectedProducts) {
        const assignments = await tagAssignmentsService.getByEntity(
          "product",
          product.id,
        );
        productTagsMap[product.id] = assignments
          .map((a) => tagMap[a.tag_id])
          .filter(Boolean);
      }
      setProductTags(productTagsMap);

      setIsLoading(false);
    };

    loadData();
  }, [productIds]);

  const handlePrint = () => {
    window.print();
  };

  return ReactDOM.createPortal(
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 print:hidden"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto print:relative print:inset-auto">
        <div className="min-h-screen flex items-start justify-center p-4 print:p-0">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl print:max-w-none print:shadow-none print:rounded-none">
            {/* Header - nur auf Bildschirm */}
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between print:hidden z-10">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Batch-Druck ({products.length} Karten)
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Druckvorschau der ausgewählten Produktkarten
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  disabled={isLoading}
                  className="px-4 py-2 bg-gurktaler-500 text-white rounded-lg hover:bg-gurktaler-600 transition-colors font-medium disabled:opacity-50"
                >
                  Drucken
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Schließen"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 print:p-0">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-gurktaler-500 rounded-full animate-spin" />
                  <p className="text-slate-600 mt-4">Lade Daten...</p>
                </div>
              ) : (
                <div className="space-y-6 print:space-y-0">
                  {products.map((product) => (
                    <PrintCard
                      key={product.id}
                      product={product}
                      image={images[product.id]}
                      project={
                        product.project_id ? projects[product.project_id] : null
                      }
                      tags={productTags[product.id] || []}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Print-spezifische Styles */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 1cm;
          }
          
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          
          .print-card {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
      `}</style>
    </>,
    document.body,
  );
}
