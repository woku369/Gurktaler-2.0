import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  GitBranch,
  Edit2,
  Trash2,
  Package,
  Star,
} from "lucide-react";
import Modal from "@/renderer/components/Modal";
import ProductForm from "@/renderer/components/ProductForm";
import {
  products as productsService,
  projects as projectsService,
  tags as tagsService,
  tagAssignments as tagAssignmentsService,
  images as imagesService,
  favorites as favoritesService,
} from "@/renderer/services/storage";
import type { Product, Project, Tag } from "@/shared/types";

const statusColors = {
  draft: "bg-distillery-50 text-distillery-800 border-distillery-200",
  testing: "bg-bronze-50 text-bronze-800 border-bronze-200",
  approved: "bg-green-50 text-green-800 border-green-200",
  archived: "bg-slate-50 text-slate-700 border-slate-200",
};

const statusLabels = {
  draft: "Entwurf",
  testing: "In Test",
  approved: "Freigegeben",
  archived: "Archiviert",
};

function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [versioningProduct, setVersioningProduct] = useState<Product | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTagId, setSelectedTagId] = useState<string>("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setProducts(productsService.getAll());
    setProjects(projectsService.getAll());
    setTags(tagsService.getAll());
  };

  const handleSubmit = (
    data: Omit<Product, "id" | "created_at" | "updated_at">
  ) => {
    if (editingProduct) {
      productsService.update(editingProduct.id, data);
    } else if (versioningProduct) {
      // Creating new version
      productsService.create({
        ...data,
        parent_id: versioningProduct.id,
      });
    } else {
      // Creating new product
      productsService.create(data);
    }
    loadData();
    setIsModalOpen(false);
    setEditingProduct(null);
    setVersioningProduct(null);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Produkt wirklich löschen? Alle Versionen bleiben erhalten.")) {
      productsService.delete(id);
      loadData();
    }
  };

  const handleCreateVersion = (product: Product) => {
    setVersioningProduct(product);
    setIsModalOpen(true);
  };

  // Build product tree structure
  const buildProductTree = () => {
    const rootProducts = products.filter((p) => !p.parent_id);
    return rootProducts.map((root) => ({
      root,
      versions: products.filter((p) => p.parent_id === root.id),
    }));
  };

  const productTree = buildProductTree();
  const filteredTree = productTree.filter((item) => {
    const matchesSearch = item.root.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    let matchesTag = true;
    if (selectedTagId) {
      const rootAssignments = tagAssignmentsService.getByEntity(
        "product",
        item.root.id
      );
      const versionAssignments = item.versions.flatMap((v) =>
        tagAssignmentsService.getByEntity("product", v.id)
      );
      matchesTag = [...rootAssignments, ...versionAssignments].some(
        (a) => a.tag_id === selectedTagId
      );
    }

    return matchesSearch && matchesTag;
  });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-distillery-900">
            Produkte
          </h1>
          <p className="text-distillery-600 font-body">
            Produktentwicklung mit Versionierung
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gurktaler-500 text-white rounded-vintage hover:bg-gurktaler-600 transition-all shadow-md font-body font-semibold"
        >
          <Plus className="w-5 h-5" />
          Neues Produkt
        </button>
      </div>

      {/* Search and Tag Filter */}
      <div className="mb-6 flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-distillery-400" />
          <input
            type="text"
            placeholder="Produkte durchsuchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border-vintage border-distillery-200 rounded-vintage focus:outline-none focus:ring-2 focus:ring-gurktaler-500 focus:border-transparent font-body bg-white"
          />
        </div>
        <select
          value={selectedTagId}
          onChange={(e) => setSelectedTagId(e.target.value)}
          className="px-4 py-2.5 border-vintage border-distillery-200 rounded-vintage focus:outline-none focus:ring-2 focus:ring-gurktaler-500 font-body bg-white"
        >
          <option value="">Alle Tags</option>
          {tags.map((tag) => (
            <option key={tag.id} value={tag.id}>
              {tag.name}
            </option>
          ))}
        </select>
      </div>

      {/* Empty State */}
      {filteredTree.length === 0 && (
        <div className="bg-white rounded-vintage shadow-vintage border-vintage border-distillery-200 p-12 text-center">
          <Package className="w-16 h-16 mx-auto text-distillery-300 mb-4" />
          <h3 className="text-lg font-heading font-semibold text-distillery-900 mb-2">
            {products.length === 0 ? "Noch keine Produkte" : "Keine Ergebnisse"}
          </h3>
          <p className="text-distillery-600 mb-6 font-body">
            {products.length === 0
              ? "Erstelle dein erstes Produkt, um mit der Entwicklung zu beginnen."
              : "Keine Produkte gefunden für deine Suche."}
          </p>
          {products.length === 0 && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-2.5 bg-gurktaler-500 text-white rounded-vintage hover:bg-gurktaler-600 transition-all shadow-md font-body font-semibold"
            >
              Erstes Produkt erstellen
            </button>
          )}
        </div>
      )}

      {/* Product Tree */}
      <div className="space-y-4">
        {filteredTree.map((product) => (
          <div
            key={product.root.id}
            className="bg-white rounded-vintage shadow-vintage border-vintage border-distillery-200 overflow-hidden"
          >
            {/* Root Product */}
            <div className="p-6 hover:bg-gurktaler-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-heading font-semibold text-distillery-900">
                      {product.root.name}
                    </h3>
                    <span className="text-sm text-distillery-600 font-body font-semibold">
                      v{product.root.version}
                    </span>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full border-vintage ${
                        statusColors[
                          product.root.status as keyof typeof statusColors
                        ]
                      }`}
                    >
                      {
                        statusLabels[
                          product.root.status as keyof typeof statusLabels
                        ]
                      }
                    </span>
                  </div>
                  {product.root.description && (
                    <p className="text-sm text-distillery-600 mb-2 font-body">
                      {product.root.description}
                    </p>
                  )}
                  {product.root.archive_reason && (
                    <p className="text-sm text-red-600 italic mb-2">
                      Archiviert: {product.root.archive_reason}
                    </p>
                  )}
                  {(() => {
                    const productAssignments =
                      tagAssignmentsService.getByEntity(
                        "product",
                        product.root.id
                      );
                    const productTags = productAssignments
                      .map((a) => tags.find((t) => t.id === a.tag_id))
                      .filter((t): t is Tag => t !== undefined);
                    return (
                      productTags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {productTags.map((tag) => (
                            <span
                              key={tag.id}
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white"
                              style={{ backgroundColor: tag.color }}
                            >
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      )
                    );
                  })()}
                  {product.root.project_id && (
                    <p className="text-xs text-slate-500">
                      Projekt:{" "}
                      {projects.find((p) => p.id === product.root.project_id)
                        ?.name || "Unbekannt"}
                    </p>
                  )}
                  {/* Bilder */}
                  {(() => {
                    const productImages = imagesService.getByEntity(
                      "product",
                      product.root.id
                    );
                    if (productImages.length === 0) return null;
                    return (
                      <div className="flex gap-1 mt-2 overflow-x-auto">
                        {productImages.slice(0, 3).map((img) => (
                          <img
                            key={img.id}
                            src={img.data_url}
                            alt={img.caption || img.file_name}
                            className="w-16 h-16 object-cover rounded border border-slate-200"
                            title={img.caption || img.file_name}
                          />
                        ))}
                        {productImages.length > 3 && (
                          <div className="w-16 h-16 flex items-center justify-center bg-slate-100 rounded border border-slate-200 text-xs text-slate-500">
                            +{productImages.length - 3}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
                <div className="flex items-center gap-2">
                  {product.versions.length > 0 && (
                    <span className="flex items-center gap-1 text-sm text-slate-500">
                      <GitBranch className="w-4 h-4" />
                      {product.versions.length} Version(en)
                    </span>
                  )}
                  <button
                    onClick={() => handleCreateVersion(product.root)}
                    className="p-2 hover:bg-gurktaler-50 rounded-lg transition-colors"
                    title="Neue Version erstellen"
                  >
                    <Plus className="w-5 h-5 text-gurktaler-600" />
                  </button>
                  <button
                    onClick={() => {
                      favoritesService.toggle("product", product.root.id);
                      loadData();
                    }}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    title={
                      favoritesService.isFavorite("product", product.root.id)
                        ? "Aus Favoriten entfernen"
                        : "Zu Favoriten hinzufügen"
                    }
                  >
                    <Star
                      className={`w-5 h-5 ${
                        favoritesService.isFavorite("product", product.root.id)
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-slate-400"
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => handleEdit(product.root)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Bearbeiten"
                  >
                    <Edit2 className="w-5 h-5 text-slate-500" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.root.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    title="Löschen"
                  >
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </button>
                </div>
              </div>
            </div>

            {/* Versions */}
            {product.versions.length > 0 && (
              <div className="border-t border-slate-200 bg-slate-50">
                {product.versions.map((version) => (
                  <div
                    key={version.id}
                    className="p-4 pl-12 hover:bg-slate-100 transition-colors border-b border-slate-200 last:border-b-0"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <div className="w-6 h-6 border-l-2 border-b-2 border-slate-300 rounded-bl-lg -ml-8 -mt-2"></div>
                          <span className="font-medium text-slate-700">
                            {version.name}
                          </span>
                          <span className="text-sm text-slate-500">
                            v{version.version}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              statusColors[
                                version.status as keyof typeof statusColors
                              ]
                            }`}
                          >
                            {
                              statusLabels[
                                version.status as keyof typeof statusLabels
                              ]
                            }
                          </span>
                        </div>
                        {version.description && (
                          <p className="text-sm text-slate-600 ml-8 mb-1">
                            {version.description}
                          </p>
                        )}
                        {version.archive_reason && (
                          <p className="text-sm text-red-600 italic ml-8">
                            Archiviert: {version.archive_reason}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCreateVersion(version)}
                          className="p-2 hover:bg-gurktaler-50 rounded-lg transition-colors"
                          title="Unterversion erstellen"
                        >
                          <Plus className="w-4 h-4 text-gurktaler-600" />
                        </button>
                        <button
                          onClick={() => {
                            favoritesService.toggle("product", version.id);
                            loadData();
                          }}
                          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                          title={
                            favoritesService.isFavorite("product", version.id)
                              ? "Aus Favoriten entfernen"
                              : "Zu Favoriten hinzufügen"
                          }
                        >
                          <Star
                            className={`w-4 h-4 ${
                              favoritesService.isFavorite("product", version.id)
                                ? "text-yellow-500 fill-yellow-500"
                                : "text-slate-400"
                            }`}
                          />
                        </button>
                        <button
                          onClick={() => handleEdit(version)}
                          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Bearbeiten"
                        >
                          <Edit2 className="w-4 h-4 text-slate-500" />
                        </button>
                        <button
                          onClick={() => handleDelete(version.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Löschen"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingProduct(null);
            setVersioningProduct(null);
          }}
          title={
            editingProduct
              ? "Produkt bearbeiten"
              : versioningProduct
              ? `Neue Version von "${versioningProduct.name}"`
              : "Neues Produkt"
          }
          size="lg"
        >
          <ProductForm
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsModalOpen(false);
              setEditingProduct(null);
              setVersioningProduct(null);
            }}
            product={editingProduct || undefined}
            parentProduct={versioningProduct || undefined}
            projects={projects}
          />
        </Modal>
      )}
    </div>
  );
}

export default Products;
