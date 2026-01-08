import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { CapacityUtilization } from "../../shared/types";
import * as storage from "../services/storage";

interface Props {
  onClose: () => void;
}

export default function CapacitySettingsModal({ onClose }: Props) {
  const [capacity, setCapacity] = useState<CapacityUtilization>({
    enabled: false,
    quarters: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCapacity();
  }, []);

  const loadCapacity = async () => {
    const data = await storage.capacity.get();
    setCapacity(data);
    setLoading(false);
  };

  const generateQuarters = () => {
    const quarters: string[] = [];
    const today = new Date();
    const currentYear = today.getFullYear();

    // Generiere Quartale für 3 Jahre (12 Quartale)
    for (let year = 0; year < 3; year++) {
      for (let q = 1; q <= 4; q++) {
        quarters.push(`Q${q}/${(currentYear + year) % 100}`);
      }
    }

    return quarters;
  };

  const handlePercentageChange = (quarter: string, percentage: number) => {
    const existing = (capacity.quarters || []).find(
      (q) => q.quarter === quarter
    );
    if (existing) {
      setCapacity({
        ...capacity,
        quarters: (capacity.quarters || []).map((q) =>
          q.quarter === quarter ? { ...q, percentage } : q
        ),
      });
    } else {
      setCapacity({
        ...capacity,
        quarters: [...(capacity.quarters || []), { quarter, percentage }],
      });
    }
  };

  const getPercentage = (quarter: string): number => {
    return (
      capacity.quarters?.find((q) => q.quarter === quarter)?.percentage || 0
    );
  };

  const handleSave = async () => {
    // Filtere Quartale mit 0% raus
    const filtered = {
      ...capacity,
      quarters: (capacity.quarters || []).filter((q) => q.percentage > 0),
    };
    await storage.capacity.update(filtered);
    onClose();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6">
          <div className="text-slate-600">Lade...</div>
        </div>
      </div>
    );
  }

  const quarters = generateQuarters();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">
            Kapazitätsauslastung konfigurieren
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          <p className="text-sm text-slate-600 mb-6">
            Gib für jedes Quartal die durchschnittliche Kapazitätsauslastung in
            Prozent an. Der Balken wird unter allen Projekten angezeigt und die
            Farbintensität entspricht der Auslastung.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {quarters.map((quarter) => (
              <div key={quarter} className="space-y-1">
                <label className="text-sm font-medium text-slate-700">
                  {quarter}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={getPercentage(quarter)}
                    onChange={(e) =>
                      handlePercentageChange(
                        quarter,
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-gurktaler-500"
                  />
                  <span className="text-sm text-slate-600">%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-gurktaler-600 text-white rounded-lg hover:bg-gurktaler-700 transition-colors"
          >
            Speichern
          </button>
        </div>
      </div>
    </div>
  );
}
