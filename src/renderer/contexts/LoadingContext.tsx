/**
 * Loading Context
 *
 * Globaler State für Ladeanzeigen:
 * - Zeigt Loading-Spinner während Speicher-/Ladevorgängen
 * - Verhindert UI-Interaktion während kritischer Operationen
 * - Zeigt optionale Nachrichten/Fortschritt
 */

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number; // 0-100 für Fortschrittsbalken
}

interface LoadingContextType {
  loading: LoadingState;
  startLoading: (message?: string) => void;
  stopLoading: () => void;
  updateProgress: (progress: number, message?: string) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState<LoadingState>({
    isLoading: false,
  });

  const startLoading = (message?: string) => {
    setLoading({ isLoading: true, message, progress: undefined });
  };

  const stopLoading = () => {
    setLoading({ isLoading: false, message: undefined, progress: undefined });
  };

  const updateProgress = (progress: number, message?: string) => {
    setLoading((prev) => ({
      ...prev,
      progress: Math.max(0, Math.min(100, progress)),
      ...(message && { message }),
    }));
  };

  // 🎧 Event Listener für Custom Events (z.B. von imageCache.ts)
  useEffect(() => {
    const handleLoadingEvent = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { isLoading, message, progress } = customEvent.detail;
      if (isLoading) {
        startLoading(message);
        if (progress !== undefined) updateProgress(progress, message);
      } else {
        stopLoading();
      }
    };

    window.addEventListener("app:loading", handleLoadingEvent);
    return () => {
      window.removeEventListener("app:loading", handleLoadingEvent);
    };
  }, []);

  return (
    <LoadingContext.Provider
      value={{ loading, startLoading, stopLoading, updateProgress }}
    >
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within LoadingProvider");
  }
  return context;
}

/**
 * Hook für async Operationen mit automatischem Loading-State
 */
export function useAsyncOperation() {
  const { startLoading, stopLoading } = useLoading();

  const execute = async <T,>(
    operation: () => Promise<T>,
    message?: string,
  ): Promise<T> => {
    startLoading(message);
    try {
      const result = await operation();
      return result;
    } finally {
      stopLoading();
    }
  };

  return { execute };
}
