/**
 * Loading Indicator Component
 *
 * Zeigt einen globalen Loading-Overlay während Operationen:
 * - Spinner für unbestimmte Ladezeiten
 * - Fortschrittsbalken für längere Operationen
 * - Optionale Nachricht
 */

import { useLoading } from "@/renderer/contexts/LoadingContext";
import { Loader2 } from "lucide-react";

export default function LoadingIndicator() {
  const { loading } = useLoading();

  if (!loading.isLoading) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="flex flex-col items-center gap-4">
          {/* Spinner */}
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />

          {/* Message */}
          {loading.message && (
            <p className="text-slate-700 font-medium text-center">
              {loading.message}
            </p>
          )}

          {/* Progress Bar */}
          {loading.progress !== undefined && (
            <div className="w-full">
              <div className="flex justify-between text-xs text-slate-500 mb-2">
                <span>Fortschritt</span>
                <span>{Math.round(loading.progress)}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300 ease-out"
                  style={{ width: `${loading.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Hint */}
          <p className="text-xs text-slate-500 text-center">Bitte warten...</p>
        </div>
      </div>
    </div>
  );
}
