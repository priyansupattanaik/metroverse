import { useState, useRef, useEffect } from "react";

export default function Chat({ city }: { city: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    [],
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Auto-scroll to bottom of chat
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // 1. Add User Message
    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      // 2. Call OpenRouter API
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
            "HTTP-Referer": window.location.origin, // OpenRouter Requirement
            "X-Title": "Metroverse", // OpenRouter Requirement
          },
          body: JSON.stringify({
            model: "meta-llama/llama-3.2-3b-instruct:free",
            messages: [
              {
                role: "system",
                content: `You are a futuristic AI guide for the ${city} Metro. Keep answers short, cyberpunk-themed, and under 50 words.`,
              },
              ...messages, // Include chat history
              userMsg,
            ],
          }),
        },
      );

      const data = await response.json();

      // 3. Add AI Response
      if (data.choices && data.choices[0]) {
        const aiMsg = {
          role: "assistant",
          content: data.choices[0].message.content,
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error("No response from AI");
      }
    } catch (error) {
      console.error("AI Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ CONNECTION ERROR: NEURAL LINK FAILED.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // MINIMIZED STATE (Button)
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="absolute bottom-6 right-6 z-50 group flex items-center gap-2 bg-black/80 border border-cyan-500/50 px-5 py-3 rounded-full hover:bg-cyan-900/80 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
      >
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-cyan-400 font-mono text-sm font-bold tracking-widest group-hover:text-white">
          AI GUIDE
        </span>
      </button>
    );
  }

  // EXPANDED STATE (Chat Window)
  return (
    <div className="absolute bottom-6 right-6 z-50 w-80 md:w-96 flex flex-col bg-black/95 border border-cyan-500/50 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.2)] backdrop-blur-xl">
      {/* Header */}
      <div className="bg-cyan-900/20 p-3 border-b border-cyan-500/30 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_8px_cyan]" />
          <span className="text-cyan-400 font-mono text-xs font-bold tracking-[0.2em]">
            METRO.AI // {city.toUpperCase()}
          </span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-cyan-600 hover:text-white transition-colors text-lg leading-none"
        >
          ×
        </button>
      </div>

      {/* Messages Area */}
      <div className="h-80 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-transparent">
        {messages.length === 0 && (
          <div className="text-gray-600 text-xs font-mono text-center mt-20">
            SYSTEM ONLINE.
            <br />
            ASK ME ABOUT {city.toUpperCase()}.
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`
              max-w-[85%] p-3 rounded-lg text-sm font-mono leading-relaxed
              ${
                msg.role === "user"
                  ? "bg-cyan-900/40 text-cyan-100 border border-cyan-500/30 rounded-br-none"
                  : "bg-gray-900/80 text-gray-300 border border-gray-700/50 rounded-bl-none"
              }
            `}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-900/50 border border-gray-800 p-2 rounded text-xs text-cyan-500 font-mono animate-pulse">
              PROCESSING...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-black border-t border-cyan-900/50 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Initiate query..."
          className="flex-1 bg-gray-900/50 border border-gray-700 text-white text-sm px-3 py-2 rounded focus:outline-none focus:border-cyan-500 focus:bg-black transition-all font-mono placeholder-gray-600"
        />
        <button
          onClick={handleSend}
          disabled={isLoading}
          className="bg-cyan-700 hover:bg-cyan-500 disabled:bg-gray-800 text-white px-4 py-2 rounded font-bold text-xs transition-all tracking-wider"
        >
          SEND
        </button>
      </div>
    </div>
  );
}
