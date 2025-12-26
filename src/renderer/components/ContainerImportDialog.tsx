import { useState } from "react";
import {
  X,
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import type { ImportResult } from "@/renderer/services/containerImport";
import {
  parseExcelFile,
  validateContainers,
  convertToContainer,
} from "@/renderer/services/containerImport";
import { containers as containersService } from "@/renderer/services/storage";
import type { Container } from "@/shared/types";

interface ContainerImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
  existingContainers: Container[];
}

const typeLabels = {
  bottle: "Flasche",
  label: "Etikett",
  cap: "Verschluss",
  box: "Verpackung",
  other: "Sonstiges",
};

export default function ContainerImportDialog({
  isOpen,
  onClose,
  onImportComplete,
}: ContainerImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedValid, setSelectedValid] = useState<Set<number>>(new Set());
  const [selectedDuplicates, setSelectedDuplicates] = useState<Set<number>>(
    new Set()
  );
  const [duplicateAction, setDuplicateAction] = useState<"skip" | "overwrite">(
    "skip"
  );

  if (!isOpen) return null;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsProcessing(true);

    try {
      const parsed = await parseExcelFile(selectedFile);
      const existing = await containersService.getAll();
      const result = validateContainers(parsed, existing);

      setImportResult(result);
      setSelectedValid(new Set(result.valid.map((_, i) => i)));
    } catch (error) {
      alert("Fehler beim Verarbeiten der Datei: " + error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async () => {
    if (!importResult) return;

    let importedCount = 0;

    // Import gültige Gebinde
    for (const [index, cont] of importResult.valid.entries()) {
      if (selectedValid.has(index)) {
        await containersService.create(convertToContainer(cont));
        importedCount++;
      }
    }

    // Import Duplikate basierend auf Aktion
    if (duplicateAction === "overwrite") {
      for (const [index, cont] of importResult.duplicates.entries()) {
        if (selectedDuplicates.has(index)) {
          const existing = (await containersService.getAll()).find(
            (e) => e.name.toLowerCase() === cont.name.toLowerCase()
          );
          if (existing) {
            await containersService.update(
              existing.id,
              convertToContainer(cont)
            );
            importedCount++;
          }
        }
      }
    }

    alert(`${importedCount} Gebinde erfolgreich importiert!`);
    onImportComplete();
    handleClose();
  };

  const handleClose = () => {
    setFile(null);
    setImportResult(null);
    setSelectedValid(new Set());
    setSelectedDuplicates(new Set());
    setDuplicateAction("skip");
    onClose();
  };

  const toggleValid = (index: number) => {
    const newSet = new Set(selectedValid);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setSelectedValid(newSet);
  };

  const toggleDuplicate = (index: number) => {
    const newSet = new Set(selectedDuplicates);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setSelectedDuplicates(newSet);
  };

  const toggleAllValid = () => {
    if (selectedValid.size === importResult?.valid.length) {
      setSelectedValid(new Set());
    } else {
      setSelectedValid(new Set(importResult?.valid.map((_, i) => i)));
    }
  };

  const toggleAllDuplicates = () => {
    if (selectedDuplicates.size === importResult?.duplicates.length) {
      setSelectedDuplicates(new Set());
    } else {
      setSelectedDuplicates(new Set(importResult?.duplicates.map((_, i) => i)));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={handleClose}
      />

      <div className="relative bg-white rounded-vintage shadow-vintage-lg max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col border-vintage border-distillery-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-vintage border-distillery-200">
          <div>
            <h2 className="text-xl font-heading font-semibold text-distillery-900 flex items-center gap-2">
              <FileSpreadsheet className="w-6 h-6 text-gurktaler-500" />
              Gebinde aus Excel importieren
            </h2>
            <p className="text-sm text-distillery-600 font-body mt-1">
              Laden Sie eine befüllte Excel-Vorlage hoch
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gurktaler-50 rounded-vintage transition-colors"
          >
            <X className="w-5 h-5 text-distillery-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!file ? (
            // File Upload
            <div className="space-y-4">
              <label className="block">
                <div className="border-vintage border-dashed border-distillery-300 rounded-vintage p-12 text-center hover:border-gurktaler-400 hover:bg-gurktaler-50 transition-all cursor-pointer">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Upload className="w-12 h-12 mx-auto text-distillery-400 mb-4" />
                  <p className="text-lg font-body font-semibold text-distillery-800 mb-2">
                    Excel-Datei hier ablegen oder klicken zum Auswählen
                  </p>
                  <p className="text-sm text-distillery-600 font-body">
                    Unterstützte Formate: .xlsx, .xls
                  </p>
                </div>
              </label>

              <div className="bg-gurktaler-50 border-vintage border-gurktaler-200 rounded-vintage p-4">
                <h3 className="font-heading font-semibold text-distillery-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-gurktaler-600" />
                  Wichtige Hinweise
                </h3>
                <ul className="text-sm text-distillery-700 font-body space-y-1 list-disc list-inside">
                  <li>Die Spalte "Name *" ist ein Pflichtfeld</li>
                  <li>
                    Typ-Optionen: bottle (Flasche), label (Etikett), cap
                    (Verschluss), box (Verpackung), other (Sonstiges)
                  </li>
                  <li>
                    Volumen, Preis und Lagerbestand dürfen nicht negativ sein
                  </li>
                  <li>
                    Duplikate werden erkannt und können übersprungen oder
                    überschrieben werden
                  </li>
                  <li>
                    Nutzen Sie das Template für die richtige Spaltenstruktur
                  </li>
                </ul>
              </div>
            </div>
          ) : isProcessing ? (
            // Processing
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-gurktaler-200 border-t-gurktaler-500 rounded-full mx-auto mb-4"></div>
              <p className="text-distillery-600 font-body">
                Datei wird verarbeitet...
              </p>
            </div>
          ) : importResult ? (
            // Results
            <div className="space-y-6">
              {/* Statistics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 border-vintage border-green-200 rounded-vintage p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="font-heading font-semibold text-green-900">
                      Gültig
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-green-700 font-body">
                    {importResult.valid.length}
                  </p>
                </div>

                <div className="bg-bronze-50 border-vintage border-bronze-200 rounded-vintage p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-5 h-5 text-bronze-600" />
                    <span className="font-heading font-semibold text-bronze-900">
                      Duplikate
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-bronze-700 font-body">
                    {importResult.duplicates.length}
                  </p>
                </div>

                <div className="bg-red-50 border-vintage border-red-200 rounded-vintage p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span className="font-heading font-semibold text-red-900">
                      Fehler
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-red-700 font-body">
                    {importResult.invalid.length}
                  </p>
                </div>
              </div>

              {/* Valid Containers */}
              {importResult.valid.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-heading font-semibold text-distillery-900">
                      Gültige Gebinde ({selectedValid.size}/
                      {importResult.valid.length} ausgewählt)
                    </h3>
                    <button
                      onClick={toggleAllValid}
                      className="text-sm text-gurktaler-600 hover:text-gurktaler-700 font-body font-semibold"
                    >
                      {selectedValid.size === importResult.valid.length
                        ? "Alle abwählen"
                        : "Alle auswählen"}
                    </button>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {importResult.valid.map((cont, index) => (
                      <label
                        key={index}
                        className="flex items-start gap-3 p-3 bg-white border-vintage border-distillery-200 rounded-vintage hover:bg-gurktaler-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedValid.has(index)}
                          onChange={() => toggleValid(index)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-distillery-800 font-body">
                            {cont.name}
                          </p>
                          <p className="text-sm text-distillery-600 font-body">
                            {[
                              cont.type && typeLabels[cont.type],
                              cont.volume && `${cont.volume} ml`,
                              cont.supplier,
                            ]
                              .filter(Boolean)
                              .join(" • ")}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Duplicates */}
              {importResult.duplicates.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-heading font-semibold text-distillery-900">
                      Duplikate ({importResult.duplicates.length})
                    </h3>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 font-body text-sm">
                        <input
                          type="radio"
                          value="skip"
                          checked={duplicateAction === "skip"}
                          onChange={(e) =>
                            setDuplicateAction(e.target.value as "skip")
                          }
                        />
                        Überspringen
                      </label>
                      <label className="flex items-center gap-2 font-body text-sm">
                        <input
                          type="radio"
                          value="overwrite"
                          checked={duplicateAction === "overwrite"}
                          onChange={(e) =>
                            setDuplicateAction(e.target.value as "overwrite")
                          }
                        />
                        Überschreiben
                      </label>
                    </div>
                  </div>

                  {duplicateAction === "overwrite" && (
                    <div className="mb-3">
                      <button
                        onClick={toggleAllDuplicates}
                        className="text-sm text-gurktaler-600 hover:text-gurktaler-700 font-body font-semibold"
                      >
                        {selectedDuplicates.size ===
                        importResult.duplicates.length
                          ? "Alle abwählen"
                          : "Alle auswählen"}
                      </button>
                    </div>
                  )}

                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {importResult.duplicates.map((cont, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-bronze-50 border-vintage border-bronze-200 rounded-vintage"
                      >
                        {duplicateAction === "overwrite" && (
                          <input
                            type="checkbox"
                            checked={selectedDuplicates.has(index)}
                            onChange={() => toggleDuplicate(index)}
                            className="mt-1"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-bronze-900 font-body">
                            {cont.name}
                          </p>
                          <p className="text-sm text-bronze-700 font-body">
                            Dieses Gebinde existiert bereits
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Invalid Containers */}
              {importResult.invalid.length > 0 && (
                <div>
                  <h3 className="font-heading font-semibold text-distillery-900 mb-3">
                    Fehlerhafte Einträge ({importResult.invalid.length})
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {importResult.invalid.map((cont, index) => (
                      <div
                        key={index}
                        className="p-3 bg-red-50 border-vintage border-red-200 rounded-vintage"
                      >
                        <p className="font-semibold text-red-900 font-body mb-1">
                          Zeile {cont.row}: {cont.name || "(Kein Name)"}
                        </p>
                        <ul className="text-sm text-red-700 font-body space-y-1">
                          {cont.errors.map((err, i) => (
                            <li key={i}>• {err.message}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        {importResult && (
          <div className="p-6 border-t border-vintage border-distillery-200 flex justify-between items-center">
            <button
              onClick={handleClose}
              className="px-5 py-2.5 border-vintage border-distillery-300 text-distillery-700 rounded-vintage hover:bg-gurktaler-50 transition-all font-body font-semibold"
            >
              Abbrechen
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setFile(null);
                  setImportResult(null);
                }}
                className="px-5 py-2.5 bg-distillery-100 text-distillery-700 rounded-vintage hover:bg-distillery-200 transition-all font-body font-semibold"
              >
                Andere Datei
              </button>
              <button
                onClick={handleImport}
                disabled={
                  selectedValid.size === 0 &&
                  (duplicateAction === "skip" || selectedDuplicates.size === 0)
                }
                className="px-5 py-2.5 bg-gurktaler-500 text-white rounded-vintage hover:bg-gurktaler-600 transition-all shadow-md font-body font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {selectedValid.size +
                  (duplicateAction === "overwrite"
                    ? selectedDuplicates.size
                    : 0)}{" "}
                Gebinde importieren
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
