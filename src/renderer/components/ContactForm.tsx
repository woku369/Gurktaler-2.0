import { useState, FormEvent, useEffect } from "react";
import ContactProjectSelector from "./ContactProjectSelector";
import DocumentManager from "./DocumentManager";
import ImageUpload from "./ImageUpload";
import TagSelector from "./TagSelector";
import type { Contact, Document, ContactCategoryEntity } from "@/shared/types";
import { contactCategories as categoriesService } from "@/renderer/services/storage";

interface ContactFormProps {
  contact?: Contact;
  onSubmit: (data: Omit<Contact, "id" | "created_at" | "updated_at">) => void;
  onCancel: () => void;
}

export default function ContactForm({
  contact,
  onSubmit,
  onCancel,
}: ContactFormProps) {
  const [name, setName] = useState(contact?.name || "");
  const [lastName, setLastName] = useState(contact?.last_name || "");
  const [type, setType] = useState(contact?.type || "supplier");
  const [company, setCompany] = useState(contact?.company || "");
  const [email, setEmail] = useState(contact?.email || "");
  const [phone, setPhone] = useState(contact?.phone || "");
  const [address, setAddress] = useState(contact?.address || "");
  const [notes, setNotes] = useState(contact?.notes || "");
  const [documents, setDocuments] = useState<Document[]>(
    contact?.documents || []
  );
  const [categories, setCategories] = useState<ContactCategoryEntity[]>([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const cats = await categoriesService.getAll();
      setCategories(cats);
    } catch (error) {
      console.error("Error loading contact categories:", error);
    }
  };

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

    if (!name.trim()) {
      alert("Bitte Namen eingeben");
      return;
    }

    onSubmit({
      name: name.trim(),
      last_name: lastName.trim() || undefined,
      type,
      company: company.trim() || undefined,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
      notes: notes.trim() || undefined,
      documents: documents.length > 0 ? documents : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Vorname <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500"
          placeholder="Max"
          required
        />
      </div>

      {/* Last Name */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Nachname
        </label>
        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500"
          placeholder="Mustermann"
        />
      </div>

      {/* Type */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Typ <span className="text-red-500">*</span>
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as any)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500"
        >
          {categories
            .sort((a, b) => a.order - b.order)
            .map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.icon && `${cat.icon} `}
                {cat.name}
              </option>
            ))}
        </select>
      </div>

      {/* Company */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Firma
        </label>
        <input
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500"
          placeholder="Firma GmbH"
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          E-Mail
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500"
          placeholder="max@beispiel.at"
        />
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Telefon
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500"
          placeholder="+43 123 456789"
        />
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Adresse
        </label>
        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500 resize-none"
          placeholder="Straße, PLZ Ort"
          rows={2}
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Notizen
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500 resize-none"
          placeholder="Zusätzliche Informationen..."
          rows={3}
        />
      </div>

      {/* Project Assignments */}
      {contact && (
        <div>
          <ContactProjectSelector contactId={contact.id} />
        </div>
      )}

      {/* Tags */}
      {contact && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Tags / Kategorien
          </label>
          <TagSelector entityType="contact" entityId={contact.id} />
          <p className="text-xs text-slate-500 mt-1">
            Nutze Tags um eigene Kategorien über die Standard-Typen hinaus zu
            definieren
          </p>
        </div>
      )}

      {/* Documents */}
      {contact && (
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

      {/* Images */}
      {contact && (
        <div>
          <ImageUpload
            entityType="contact"
            entityId={contact.id}
            maxImages={20}
          />
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-gurktaler-600 text-white rounded-lg hover:bg-gurktaler-700 transition-colors"
        >
          {contact ? "Speichern" : "Erstellen"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
        >
          Abbrechen
        </button>
      </div>
    </form>
  );
}
