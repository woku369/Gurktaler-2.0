import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Settings, Trash2, Bot } from "lucide-react";
import {
  sendChatMessage,
  getAvailableProviders,
  getProviderConfig,
  hasAPIKey,
  type AIProvider,
  type AIMessage,
} from "@/renderer/services/aiAssistant";

interface AIChatProps {
  onOpenSettings?: () => void;
}

export default function AIChat({ onOpenSettings }: AIChatProps) {
  const [provider, setProvider] = useState<AIProvider>("openai");
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const providers = getAvailableProviders();
  const currentProvider = getProviderConfig(provider);
  const hasKey = hasAPIKey(provider);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !hasKey) return;

    const userMessage: AIMessage = {
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await sendChatMessage(
        {
          provider,
          apiKey: "", // Will be loaded from storage in service
          model: currentProvider.defaultModel,
        },
        [...messages, userMessage]
      );

      const assistantMessage: AIMessage = {
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError((err as Error).message);
      // Remove user message on error
      setMessages((prev) => prev.slice(0, -1));
      setInput(userMessage.content);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    if (confirm("Chat-Verlauf löschen?")) {
      setMessages([]);
      setError(null);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-purple-600" />
            <h2 className="font-semibold text-slate-800">KI-Assistent</h2>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={handleClearChat}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                title="Chat löschen"
              >
                <Trash2 className="w-4 h-4 text-slate-500" />
              </button>
            )}
            <button
              onClick={onOpenSettings}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              title="API-Einstellungen"
            >
              <Settings className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Provider Selection */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-600">Assistent:</label>
          <select
            value={provider}
            onChange={(e) => {
              setProvider(e.target.value as AIProvider);
              setError(null);
            }}
            className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {providers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} {!hasAPIKey(p.id) && "(API-Key fehlt)"}
              </option>
            ))}
          </select>
        </div>

        {/* API Key Warning */}
        {!hasKey && (
          <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-800">
              ⚠️ API-Key für {currentProvider.name} fehlt.{" "}
              <button
                onClick={onOpenSettings}
                className="underline hover:text-amber-900"
              >
                Jetzt hinzufügen
              </button>
            </p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs text-red-800">❌ {error}</p>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <Bot className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Willkommen beim KI-Assistenten
            </h3>
            <p className="text-slate-600 text-sm mb-4">
              Stelle Fragen zu Kräutern, Rezepturen oder Produktentwicklung.
            </p>
            <div className="max-w-md mx-auto text-left space-y-2">
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                <p className="text-sm text-purple-900">
                  💡 "Welche Kräuter passen zu Gurktaler?"
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                <p className="text-sm text-purple-900">
                  💡 "Wie berechne ich die Alkoholstärke?"
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                <p className="text-sm text-purple-900">
                  💡 "Ideen für Produktvarianten?"
                </p>
              </div>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-3 ${
                msg.role === "user"
                  ? "bg-purple-600 text-white"
                  : "bg-slate-100 text-slate-800"
              }`}
            >
              <div className="text-sm whitespace-pre-wrap break-words">
                {msg.content}
              </div>
              <div
                className={`text-xs mt-2 ${
                  msg.role === "user" ? "text-purple-200" : "text-slate-500"
                }`}
              >
                {msg.timestamp.toLocaleTimeString("de-DE", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 rounded-lg px-4 py-3">
              <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-slate-200 p-4">
        <div className="flex gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              hasKey
                ? "Stelle eine Frage... (Enter zum Senden, Shift+Enter für neue Zeile)"
                : "Bitte API-Key in den Einstellungen hinterlegen"
            }
            disabled={!hasKey || isLoading}
            className="flex-1 px-4 py-3 border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-slate-50 disabled:text-slate-400"
            rows={3}
          />
          <button
            onClick={handleSend}
            disabled={!hasKey || !input.trim() || isLoading}
            className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            title="Senden"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Modell: {currentProvider.defaultModel}
        </p>
      </div>
    </div>
  );
}
