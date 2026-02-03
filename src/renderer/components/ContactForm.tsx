import { useState, FormEvent, useEffect } from "react";
import { Plus, X } from "lucide-react";
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
  const [address, setAddress] = useState(contact?.address || "");
  const [notes, setNotes] = useState(contact?.notes || "");
  const [documents, setDocuments] = useState<Document[]>(
    contact?.documents || [],
  );
  const [categories, setCategories] = useState<ContactCategoryEntity[]>([]);

  // Multi-field state
  const [emails, setEmails] = useState<
    Array<{ value: string; label?: string; isPrimary?: boolean }>
  >(
    contact?.emails ||
      (contact?.email
        ? [{ value: contact.email, isPrimary: true }]
        : [{ value: "", isPrimary: true }]),
  );
  const [phones, setPhones] = useState<
    Array<{ value: string; label?: string; isPrimary?: boolean }>
  >(
    contact?.phones ||
      (contact?.phone
        ? [{ value: contact.phone, isPrimary: true }]
        : [{ value: "", isPrimary: true }]),
  );

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

    // Filter out empty emails and phones
    const validEmails = emails.filter((e) => e.value.trim());
    const validPhones = phones.filter((p) => p.value.trim());

    // Get primary values for backward compatibility
    const primaryEmail =
      validEmails.find((e) => e.isPrimary)?.value || validEmails[0]?.value;
    const primaryPhone =
      validPhones.find((p) => p.isPrimary)?.value || validPhones[0]?.value;

    onSubmit({
      name: name.trim(),
      last_name: lastName.trim() || undefined,
      type,
      company: company.trim() || undefined,
      email: primaryEmail || undefined,
      phone: primaryPhone || undefined,
      emails: validEmails.length > 0 ? validEmails : undefined,
      phones: validPhones.length > 0 ? validPhones : undefined,
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
          E-Mail Adressen
        </label>
        <div className="space-y-2">
          {emails.map((emailItem, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="email"
                value={emailItem.value}
                onChange={(e) => {
                  const newEmails = [...emails];
                  newEmails[index].value = e.target.value;
                  setEmails(newEmails);
                }}
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500"
                placeholder="max@beispiel.at"
              />
              <input
                type="text"
                value={emailItem.label || ""}
                onChange={(e) => {
                  const newEmails = [...emails];
                  newEmails[index].label = e.target.value;
                  setEmails(newEmails);
                }}
                className="w-32 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500"
                placeholder="Label"
              />
              <button
                type="button"
                onClick={() => {
                  const newEmails = [...emails];
                  newEmails[index].isPrimary = !newEmails[index].isPrimary;
                  setEmails(newEmails);
                }}
                className={`px-3 py-2 border rounded-lg transition-colors ${
                  emailItem.isPrimary
                    ? "bg-gurktaler-500 text-white border-gurktaler-500"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
                title="Als primär markieren"
              >
                ★
              </button>
              {emails.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setEmails(emails.filter((_, i) => i !== index))
                  }
                  className="px-3 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setEmails([...emails, { value: "", isPrimary: false }])
            }
            className="flex items-center gap-2 px-3 py-2 text-sm text-gurktaler-600 hover:text-gurktaler-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Weitere E-Mail hinzufügen
          </button>
        </div>
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Telefonnummern
        </label>
        <div className="space-y-2">
          {phones.map((phoneItem, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="tel"
                value={phoneItem.value}
                onChange={(e) => {
                  const newPhones = [...phones];
                  newPhones[index].value = e.target.value;
                  setPhones(newPhones);
                }}
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500"
                placeholder="+43 123 456789"
              />
              <input
                type="text"
                value={phoneItem.label || ""}
                onChange={(e) => {
                  const newPhones = [...phones];
                  newPhones[index].label = e.target.value;
                  setPhones(newPhones);
                }}
                className="w-32 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gurktaler-500"
                placeholder="Label"
              />
              <button
                type="button"
                onClick={() => {
                  const newPhones = [...phones];
                  newPhones[index].isPrimary = !newPhones[index].isPrimary;
                  setPhones(newPhones);
                }}
                className={`px-3 py-2 border rounded-lg transition-colors ${
                  phoneItem.isPrimary
                    ? "bg-gurktaler-500 text-white border-gurktaler-500"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
                title="Als primär markieren"
              >
                ★
              </button>
              {phones.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setPhones(phones.filter((_, i) => i !== index))
                  }
                  className="px-3 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setPhones([...phones, { value: "", isPrimary: false }])
            }
            className="flex items-center gap-2 px-3 py-2 text-sm text-gurktaler-600 hover:text-gurktaler-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Weitere Telefonnummer hinzufügen
          </button>
        </div>
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
