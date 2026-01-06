import { useEffect } from "react";
import { CheckCircle, X, AlertCircle, Info } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

export default function Toast({
  message,
  type = "success",
  duration = 3000,
  onClose,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColors = {
    success: "bg-green-50 border-green-200",
    error: "bg-red-50 border-red-200",
    info: "bg-blue-50 border-blue-200",
  };

  const textColors = {
    success: "text-green-800",
    error: "text-red-800",
    info: "text-blue-800",
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-600" />,
    error: <AlertCircle className="w-5 h-5 text-red-600" />,
    info: <Info className="w-5 h-5 text-blue-600" />,
  };

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 p-4 rounded-lg shadow-lg border-2 min-w-[300px] max-w-md animate-slide-up ${bgColors[type]}`}
    >
      {icons[type]}
      <span className={`flex-1 text-sm font-medium ${textColors[type]}`}>
        {message}
      </span>
      <button
        onClick={onClose}
        className={`p-1 hover:bg-white/50 rounded transition-colors ${textColors[type]}`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
