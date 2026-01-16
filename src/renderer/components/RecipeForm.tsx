import { useState, FormEvent, useEffect } from "react";
import { products as productsService } from "@/renderer/services/storage";
import RecipeIngredientEditor from "./RecipeIngredientEditor";
import RecipeCalculator from "./RecipeCalculator";
import ImageUpload from "./ImageUpload";
import TagSelector from "./TagSelector";
import DocumentManager from "./DocumentManager";
import type { Recipe, RecipeType, Product, Document } from "@/shared/types";

interface RecipeFormProps {
  recipe?: Recipe;
  onSubmit: (data: Omit<Recipe, "id" | "created_at" | "updated_at">) => void;
  onCancel: () => void;
}

const typeLabels: Record<RecipeType, string> = {
  macerate: "Mazerat",
  distillate: "Destillat",
  blend: "Ausmischung",
};

export default function RecipeForm({
  recipe,
  onSubmit,
  onCancel,
}: RecipeFormProps) {
  const [name, setName] = useState(recipe?.name || "");
  const [version, setVersion] = useState(recipe?.version || "");
  const [type, setType] = useState<RecipeType>(recipe?.type || "macerate");
  const [productId, setProductId] = useState(recipe?.product_id || "");
  const [instructions, setInstructions] = useState(recipe?.instructions || "");
  const [yieldAmount, setYieldAmount] = useState(
    recipe?.yield_amount?.toString() || ""
  );
  const [yieldUnit, setYieldUnit] = useState(recipe?.yield_unit || "ml");
  const [notes, setNotes] = useState(recipe?.notes || "");
  const [products, setProducts] = useState<Product[]>([]);
  const [documents, setDocuments] = useState<Document[]>(
    recipe?.documents || []
  );

  useEffect(() => {
    const loadProducts = async () => {
      setProducts(await productsService.getAll());
    };
    loadProducts();
  }, []);

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
      window.open(doc.path, "_blank");
    }
  };

  const handleShowInFolder = async (doc: Document) => {
    await window.electron.invoke("file:show", doc.path);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmit({
      name: name.trim(),
      version: version.trim() || undefined,
      type,
      product_id: productId.trim() || undefined,
      instructions: instructions.trim() || undefined,
      yield_amount: yieldAmount ? parseFloat(yieldAmount) : undefined,
      yield_unit: yieldUnit || undefined,
      notes: notes.trim() || undefined,
      documents: documents.length > 0 ? documents : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Bezeichnung *
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500"
            placeholder="z.B. Kräuter-Mazerat Basis"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="type"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Typ *
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as RecipeType)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500"
            >
              {Object.entries(typeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="version"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Version
            </label>
            <input
              id="version"
              type="text"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500"
              placeholder="z.B. 1.0 oder 1.1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Wird automatisch zu "1.0" wenn leer
            </p>
          </div>
        </div>

        <div>
          <label
            htmlFor="product"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Produkt (optional)
          </label>
          <select
            id="product"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500"
          >
            <option value="">Kein Produkt</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} (v{product.version})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="instructions"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Anleitung / Herstellung
          </label>
          <textarea
            id="instructions"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500 resize-none"
            placeholder="Beschreibe die Herstellungsschritte..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="yieldAmount"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Ausbeute (Menge)
            </label>
            <input
              id="yieldAmount"
              type="number"
              step="0.01"
              min="0"
              value={yieldAmount}
              onChange={(e) => setYieldAmount(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500"
              placeholder="z.B. 1000"
            />
          </div>

          <div>
            <label
              htmlFor="yieldUnit"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Einheit
            </label>
            <select
              id="yieldUnit"
              value={yieldUnit}
              onChange={(e) => setYieldUnit(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500"
            >
              <option value="ml">ml</option>
              <option value="l">Liter</option>
              <option value="g">Gramm</option>
              <option value="kg">Kilogramm</option>
            </select>
          </div>
        </div>

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
            rows={2}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500 resize-none"
            placeholder="Weitere Hinweise..."
          />
        </div>
      </div>

      {/* Ingredients Editor (only when editing) */}
      {recipe && (
        <div className="border-t border-slate-200 pt-6">
          <RecipeIngredientEditor recipeId={recipe.id} />
        </div>
      )}

      {/* Calculator (only when editing) */}
      {recipe && (
        <div className="border-t border-slate-200 pt-6">
          <RecipeCalculator
            recipeId={recipe.id}
            yieldAmount={recipe.yield_amount}
            yieldUnit={recipe.yield_unit}
          />
        </div>
      )}

      {/* Tags (only when editing) */}
      {recipe && (
        <div className="border-t border-slate-200 pt-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Tags
          </label>
          <TagSelector entityType="recipe" entityId={recipe.id} />
        </div>
      )}

      {/* Images (only when editing) */}
      {recipe && (
        <div className="border-t border-slate-200 pt-6">
          <ImageUpload
            entityType="recipe"
            entityId={recipe.id}
            maxImages={20}
          />
        </div>
      )}

      {/* Documents */}
      {recipe && (
        <div className="border-t border-slate-200 pt-6">
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
      <div className="flex gap-3 pt-4 border-t border-slate-200">
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
          {recipe ? "Speichern" : "Erstellen"}
        </button>
      </div>
    </form>
  );
}
