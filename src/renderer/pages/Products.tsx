import { useState, useEffect } from "react";
import { Plus, Search, Package } from "lucide-react";
import Modal from "@/renderer/components/Modal";
import ProductForm from "@/renderer/components/ProductForm";
import ProductCard from "@/renderer/components/ProductCard";
import QuickAddUrlDialog from "@/renderer/components/QuickAddUrlDialog";
import {
  products as productsService,
  projects as projectsService,
  tags as tagsService,
  tagAssignments as tagAssignmentsService,
  images as imagesService,
  favorites as favoritesService,
} from "@/renderer/services/storage";
import type { Product, Project, Image, Tag, Document } from "@/shared/types";

function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productImages, setProductImages] = useState<Record<string, Image[]>>(
    {}
  );
  const [projects, setProjects] = useState<Project[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [versioningProduct, setVersioningProduct] = useState<Product | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTagId, setSelectedTagId] = useState<string>("");
  const [showQuickUrlDialog, setShowQuickUrlDialog] = useState(false);
  const [quickUrlProduct, setQuickUrlProduct] = useState<Product | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allProducts = productsService.getAll();
    setProducts(allProducts);
    setProjects(projectsService.getAll());
    setTags(tagsService.getAll());

    // Load images for all products
    const imageMap: Record<string, Image[]> = {};
    allProducts.forEach((product) => {
      imageMap[product.id] = imagesService.getByEntity("product", product.id);
    });
    setProductImages(imageMap);
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

  const handleQuickAddUrl = (product: Product) => {
    setQuickUrlProduct(product);
    setShowQuickUrlDialog(true);
  };

  const handleAddQuickUrl = (url: string, name: string) => {
    if (!quickUrlProduct) return;

    const newDoc: Document = {
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      type: "url",
      path: url,
      name: name || url,
    };

    const currentDocs = quickUrlProduct.documents || [];
    productsService.update(quickUrlProduct.id, {
      documents: [...currentDocs, newDoc],
    });

    setShowQuickUrlDialog(false);
    setQuickUrlProduct(null);
    loadData();
  };

  const handleQuickAddDocument = (product: Product) => {
    handleEdit(product);
  };

  const handleCopyName = () => {
    // Clipboard copy happens in ProductCard
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesTag = true;
    if (selectedTagId) {
      const assignments = tagAssignmentsService.getByEntity(
        "product",
        product.id
      );
      matchesTag = assignments.some((a) => a.tag_id === selectedTagId);
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
      {filteredProducts.length === 0 && (
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

      {/* Products Grid */}
      {filteredProducts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              image={productImages[product.id]?.[0]}
              isFavorite={favoritesService.isFavorite("product", product.id)}
              onToggleFavorite={() => {
                favoritesService.toggle("product", product.id);
                loadData();
              }}
              onEdit={() => handleEdit(product)}
              onDelete={() => handleDelete(product.id)}
              onCreateVersion={() => handleCreateVersion(product)}
              onAddUrl={() => handleQuickAddUrl(product)}
              onAddDocument={() => handleQuickAddDocument(product)}
              onCopy={handleCopyName}
              onUpdate={loadData}
            />
          ))}
        </div>
      )}

      {/* Quick Add URL Dialog */}
      <QuickAddUrlDialog
        isOpen={showQuickUrlDialog}
        onClose={() => {
          setShowQuickUrlDialog(false);
          setQuickUrlProduct(null);
        }}
        onAdd={handleAddQuickUrl}
        entityName={quickUrlProduct?.name || ""}
      />

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
