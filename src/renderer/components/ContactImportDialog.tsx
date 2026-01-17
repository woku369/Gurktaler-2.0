import { useState } from "react";
import { Check, X, AlertCircle, Users } from "lucide-react";
import type { ParsedContact } from "@/renderer/services/vcardParser";
import type { Contact } from "@/shared/types";

interface ContactImportDialogProps {
  contacts: ParsedContact[];
  existingContacts: Contact[];
  onImport: (selectedContacts: Array<ParsedContact & { type: string }>) => void;
  onCancel: () => void;
}

interface ContactSelection {
  contact: ParsedContact;
  selected: boolean;
  type: "supplier" | "partner" | "customer" | "other";
  isDuplicate: boolean;
  duplicateMatch?: Contact;
}

const typeOptions = [
  { value: "supplier", label: "Lieferant" },
  { value: "partner", label: "Partner" },
  { value: "customer", label: "Kunde" },
  { value: "other", label: "Sonstiges" },
];

export default function ContactImportDialog({
  contacts,
  existingContacts,
  onImport,
  onCancel,
}: ContactImportDialogProps) {
  const [selections, setSelections] = useState<ContactSelection[]>(() => {
    return contacts.map((contact) => {
      // Check for duplicates
      const duplicate = existingContacts.find(
        (existing) =>
          (contact.email &&
            existing.email?.toLowerCase() === contact.email.toLowerCase()) ||
          contact.name.toLowerCase() === existing.name.toLowerCase()
      );

      return {
        contact,
        selected: !duplicate, // Auto-deselect duplicates
        type: "supplier" as const,
        isDuplicate: !!duplicate,
        duplicateMatch: duplicate,
      };
    });
  });

  const [showDuplicates, setShowDuplicates] = useState(true);

  const handleToggleAll = () => {
    const allSelected = selections.every((s) => s.selected || s.isDuplicate);
    setSelections(
      selections.map((s) => ({
        ...s,
        selected: s.isDuplicate ? false : !allSelected,
      }))
    );
  };

  const handleToggle = (index: number) => {
    setSelections(
      selections.map((s, i) =>
        i === index ? { ...s, selected: !s.selected } : s
      )
    );
  };

  const handleTypeChange = (index: number, type: string) => {
    setSelections(
      selections.map((s, i) => (i === index ? { ...s, type: type as any } : s))
    );
  };

  const handleImport = () => {
    const selectedContacts = selections
      .filter((s) => s.selected)
      .map((s) => ({
        ...s.contact,
        type: s.type,
      }));

    onImport(selectedContacts);
  };

  const selectedCount = selections.filter((s) => s.selected).length;
  const duplicateCount = selections.filter((s) => s.isDuplicate).length;
  const displayedSelections = showDuplicates
    ? selections
    : selections.filter((s) => !s.isDuplicate);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-6 h-6 text-gurktaler-600" />
                Kontakte importieren
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                {contacts.length} Kontakt(e) aus vCard gefunden
              </p>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* Summary */}
          <div className="flex items-center gap-4 text-sm">
            <span className="text-slate-700">
              <strong>{selectedCount}</strong> ausgewählt
            </span>
            {duplicateCount > 0 && (
              <>
                <span className="text-amber-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  <strong>{duplicateCount}</strong> Duplikat(e)
                </span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showDuplicates}
                    onChange={(e) => setShowDuplicates(e.target.checked)}
                    className="rounded border-slate-300"
                  />
                  <span className="text-slate-600">Duplikate anzeigen</span>
                </label>
              </>
            )}
          </div>
        </div>

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-3">
            {/* Select All */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <input
                type="checkbox"
                checked={selections.every((s) => s.selected || s.isDuplicate)}
                onChange={handleToggleAll}
                className="w-4 h-4 rounded border-slate-300"
              />
              <span className="font-medium text-slate-700">Alle auswählen</span>
            </div>

            {/* Contact Items */}
            {displayedSelections.map((selection, index) => {
              const actualIndex = showDuplicates
                ? index
                : selections.indexOf(selection);

              return (
                <div
                  key={actualIndex}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selection.isDuplicate
                      ? "bg-amber-50 border-amber-200"
                      : selection.selected
                      ? "bg-gurktaler-50 border-gurktaler-300"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selection.selected}
                      disabled={selection.isDuplicate}
                      onChange={() => handleToggle(actualIndex)}
                      className="w-4 h-4 mt-1 rounded border-slate-300 disabled:opacity-50"
                    />

                    {/* Contact Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-800">
                            {selection.contact.last_name
                              ? `${selection.contact.last_name}, ${selection.contact.name}`
                              : selection.contact.name}
                          </h3>
                          {selection.contact.company && (
                            <p className="text-sm text-slate-600">
                              {selection.contact.company}
                            </p>
                          )}
                        </div>

                        {/* Type Selector */}
                        {!selection.isDuplicate && (
                          <select
                            value={selection.type}
                            onChange={(e) =>
                              handleTypeChange(actualIndex, e.target.value)
                            }
                            className="text-sm px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-gurktaler-500"
                            disabled={!selection.selected}
                          >
                            {typeOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      {/* Contact Details */}
                      <div className="space-y-1 text-sm text-slate-600">
                        {selection.contact.email && (
                          <p>📧 {selection.contact.email}</p>
                        )}
                        {selection.contact.phone && (
                          <p>📞 {selection.contact.phone}</p>
                        )}
                        {selection.contact.address && (
                          <p className="text-xs">
                            📍 {selection.contact.address}
                          </p>
                        )}
                      </div>

                      {/* Duplicate Warning */}
                      {selection.isDuplicate && selection.duplicateMatch && (
                        <div className="mt-2 p-2 bg-amber-100 rounded border border-amber-200">
                          <p className="text-xs text-amber-800 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Ähnlicher Kontakt bereits vorhanden:{" "}
                            <strong>
                              {selection.duplicateMatch.last_name
                                ? `${selection.duplicateMatch.last_name}, ${selection.duplicateMatch.name}`
                                : selection.duplicateMatch.name}
                            </strong>
                            {selection.duplicateMatch.email &&
                              ` (${selection.duplicateMatch.email})`}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={handleImport}
            disabled={selectedCount === 0}
            className="flex-1 px-4 py-2 bg-gurktaler-600 text-white rounded-lg hover:bg-gurktaler-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            {selectedCount} Kontakt(e) importieren
          </button>
        </div>
      </div>
    </div>
  );
}
