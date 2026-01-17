import { useState, useRef, useEffect } from "react";

// Get API Key from .env
const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

export default function Chat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    [],
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    if (!API_KEY) {
      alert("Missing VITE_OPENROUTER_API_KEY in .env");
      return;
    }

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY}`,
            "HTTP-Referer": window.location.origin, // OpenRouter Requirement
            "X-Title": "Metroverse", // OpenRouter Requirement
          },
          body: JSON.stringify({
            model: "meta-llama/llama-3.2-3b-instruct",
            messages: [
              {
                role: "system",
                content:
                  "You are a cyberpunk AI guide for Metroverse. Keep answers short, cool, and futuristic.",
              },
              ...messages,
              userMessage,
            ],
          }),
        },
      );

      const data = await response.json();
      const aiMessage = {
        role: "assistant",
        content:
          data.choices?.[0]?.message?.content || "Connection Interrupted...",
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ NEURAL LINK FAILED" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 1. Minimized Button
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="absolute bottom-10 right-6 z-50 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded-full shadow-[0_0_20px_cyan] transition-all"
      >
        AI GUIDE
      </button>
    );
  }

  // 2. Chat Window
  return (
    <div className="absolute bottom-10 right-6 z-50 w-80 md:w-96 bg-black/90 border border-cyan-500 rounded-lg shadow-2xl backdrop-blur-md flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-cyan-900/50 p-3 border-b border-cyan-500 flex justify-between items-center">
        <span className="text-cyan-400 font-mono font-bold tracking-widest">
          METRO.AI
        </span>
        <button
          onClick={() => setIsOpen(false)}
          className="text-cyan-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="h-80 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-gray-500 text-xs text-center font-mono mt-10">
            SYSTEM ONLINE.
            <br />
            ASK ME ABOUT THE CITY.
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] p-2 rounded text-sm ${
                m.role === "user"
                  ? "bg-cyan-800 text-white"
                  : "bg-gray-800 text-gray-300 border border-gray-700"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-cyan-500 text-xs animate-pulse">Thinking...</div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-black/50 border-t border-cyan-900 flex gap-2">
        <input
          className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-cyan-500 outline-none"
          placeholder="Enter query..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          className="bg-cyan-700 hover:bg-cyan-600 text-white px-4 py-2 rounded text-xs font-bold"
        >
          SEND
        </button>
      </div>
    </div>
  );
}
