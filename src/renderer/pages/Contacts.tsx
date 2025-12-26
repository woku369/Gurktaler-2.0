import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Mail,
  Phone,
  Building2,
  MapPin,
  Users,
  Star,
} from "lucide-react";
import Modal from "@/renderer/components/Modal";
import ContactForm from "@/renderer/components/ContactForm";
import {
  contacts as contactsService,
  favorites as favoritesService,
} from "@/renderer/services/storage";
import type { Contact } from "@/shared/types";

const typeLabels = {
  supplier: "Lieferant",
  partner: "Partner",
  customer: "Kunde",
  other: "Sonstiges",
};

const typeColors = {
  supplier: "bg-distillery-50 text-distillery-800 border-distillery-200",
  partner: "bg-green-50 text-green-800 border-green-200",
  customer: "bg-gurktaler-50 text-gurktaler-800 border-gurktaler-200",
  other: "bg-bronze-50 text-bronze-800 border-bronze-200",
};

function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [filterType, setFilterType] = useState<string>("all");

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    setContacts(await contactsService.getAll());
  };

  const handleSubmit = async (
    data: Omit<Contact, "id" | "created_at" | "updated_at">
  ) => {
    if (editingContact) {
      await contactsService.update(editingContact.id, data);
    } else {
      await contactsService.create(data);
    }
    await loadContacts();
    setIsModalOpen(false);
    setEditingContact(null);
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Kontakt wirklich löschen?")) {
      await contactsService.delete(id);
      await loadContacts();
    }
  };

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === "all" || contact.type === filterType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-distillery-900">
            Kontakte
          </h1>
          <p className="text-distillery-600 font-body">
            Lieferanten, Partner und wichtige Kontakte
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gurktaler-500 text-white rounded-vintage hover:bg-gurktaler-600 transition-all shadow-md font-body font-semibold"
        >
          <Plus className="w-5 h-5" />
          Neuer Kontakt
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilterType("all")}
          className={`px-4 py-2 rounded-vintage transition-all font-body font-semibold ${
            filterType === "all"
              ? "bg-gurktaler-500 text-white shadow-md"
              : "bg-gurktaler-50 text-distillery-700 border-vintage border-distillery-200 hover:bg-gurktaler-100"
          }`}
        >
          Alle ({contacts.length})
        </button>
        {Object.entries(typeLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilterType(key)}
            className={`px-4 py-2 rounded-vintage transition-all font-body font-semibold ${
              filterType === key
                ? "bg-gurktaler-500 text-white shadow-md"
                : "bg-gurktaler-50 text-distillery-700 border-vintage border-distillery-200 hover:bg-gurktaler-100"
            }`}
          >
            {label} ({contacts.filter((c) => c.type === key).length})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-distillery-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Kontakte durchsuchen..."
            className="w-full pl-10 pr-4 py-2 border-vintage border-distillery-200 rounded-vintage focus:outline-none focus:ring-2 focus:ring-gurktaler-500 font-body"
          />
        </div>
      </div>

      {/* Empty State */}
      {filteredContacts.length === 0 && (
        <div className="bg-white rounded-vintage shadow-vintage border-vintage border-distillery-200 p-12 text-center">
          <Users className="w-16 h-16 mx-auto text-distillery-300 mb-4" />
          <h3 className="text-lg font-heading font-semibold text-distillery-900 mb-2">
            {contacts.length === 0 ? "Noch keine Kontakte" : "Keine Ergebnisse"}
          </h3>
          <p className="text-slate-600 mb-6">
            {contacts.length === 0
              ? "Erstelle deinen ersten Kontakt."
              : "Keine Kontakte gefunden für deine Suche."}
          </p>
          {contacts.length === 0 && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-2 bg-gurktaler-500 text-white rounded-lg hover:bg-gurktaler-600 transition-colors"
            >
              Ersten Kontakt erstellen
            </button>
          )}
        </div>
      )}

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContacts.map((contact) => (
          <div
            key={contact.id}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:border-gurktaler-300 transition-colors group"
          >
            <div className="flex items-start justify-between mb-3">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  typeColors[contact.type]
                }`}
              >
                {typeLabels[contact.type]}
              </span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => {
                    favoritesService.toggle("contact", contact.id);
                    loadContacts();
                  }}
                  className="p-1 hover:bg-slate-100 rounded"
                  title="Favorit umschalten"
                >
                  <Star className="w-4 h-4 text-slate-400" />
                </button>
                <button
                  onClick={() => handleEdit(contact)}
                  className="p-1 hover:bg-slate-100 rounded"
                  title="Bearbeiten"
                >
                  <Edit2 className="w-4 h-4 text-slate-500" />
                </button>
                <button
                  onClick={() => handleDelete(contact.id)}
                  className="p-1 hover:bg-red-50 rounded"
                  title="Löschen"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>

            <h3 className="font-semibold text-slate-800 mb-1">
              {contact.name}
            </h3>

            {contact.company && (
              <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                <Building2 className="w-4 h-4" />
                <span>{contact.company}</span>
              </div>
            )}

            {contact.email && (
              <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                <Mail className="w-4 h-4" />
                <a
                  href={`mailto:${contact.email}`}
                  className="hover:text-gurktaler-600 transition-colors"
                >
                  {contact.email}
                </a>
              </div>
            )}

            {contact.phone && (
              <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                <Phone className="w-4 h-4" />
                <a
                  href={`tel:${contact.phone}`}
                  className="hover:text-gurktaler-600 transition-colors"
                >
                  {contact.phone}
                </a>
              </div>
            )}

            {contact.address && (
              <div className="flex items-start gap-2 text-sm text-slate-600 mt-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="text-xs">{contact.address}</span>
              </div>
            )}

            {contact.notes && (
              <div className="mt-3 pt-3 border-t border-slate-100">
                <p className="text-xs text-slate-500 line-clamp-2">
                  {contact.notes}
                </p>
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
            setEditingContact(null);
          }}
          title={editingContact ? "Kontakt bearbeiten" : "Neuer Kontakt"}
          size="md"
        >
          <ContactForm
            contact={editingContact || undefined}
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsModalOpen(false);
              setEditingContact(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
}

export default Contacts;
