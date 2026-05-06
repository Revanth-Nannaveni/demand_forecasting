import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Bot, User, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const API_BASE = "https://d2m11qgy1b40kt.cloudfront.net";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  cards?: { title: string; value: any }[];
  data?: any[];
};

const SUGGESTIONS = [
  "Show top buyers",
  "Total demand for chilli",
  "Show PO summary",
  "Show all POs",
];

const MessageBubble = ({ msg }: { msg: Message }) => (
  <div className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
    {msg.role === "assistant" && (
      <div className="w-8 h-8 rounded-full bg-primary/10 border border-border flex items-center justify-center flex-shrink-0 mt-0.5">
        <Bot size={14} className="text-primary" />
      </div>
    )}

    <div className={`max-w-[75%] space-y-2 ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col`}>
      <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed
        ${msg.role === "user"
          ? "bg-primary text-primary-foreground rounded-tr-sm"
          : "bg-muted text-foreground rounded-tl-sm border border-border"
        }`}>
        {msg.content}
      </div>

      {/* Cards */}
      {msg.cards && msg.cards.length > 0 && (
        <div className="grid grid-cols-3 gap-2 w-full">
          {msg.cards.map((card, i) => (
            <Card key={i} className="shadow-none border border-border">
              <CardContent className="p-3 text-center">
                <p className="text-xs text-muted-foreground">{card.title}</p>
                <p className="text-base font-bold mt-0.5">{card.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Data table */}
      {msg.data && msg.data.length > 0 && (
        <div className="w-full overflow-auto rounded-lg border border-border">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {Object.keys(msg.data[0]).slice(0, 6).map((k) => (
                  <th key={k} className="text-left px-3 py-2 text-muted-foreground font-medium">
                    {k}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {msg.data.slice(0, 10).map((row, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                  {Object.values(row).slice(0, 6).map((val: any, j) => (
                    <td key={j} className="px-3 py-2 text-foreground">
                      {String(val)}
                    </td>
                  ))}
                </tr>
              ))}
              {msg.data.length > 10 && (
                <tr>
                  <td colSpan={6} className="px-3 py-2 text-center text-xs text-muted-foreground">
                    +{msg.data.length - 10} more rows
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>

    {msg.role === "user" && (
      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
        <User size={14} className="text-primary-foreground" />
      </div>
    )}
  </div>
);

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! I'm your FarmGate assistant. Ask me about demand, supply, forecasts, or PO status. You can also try the suggestions below.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const query = text || input.trim();
    if (!query || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append("query", query);

      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        body: fd,
      });

      if (!res.ok) throw new Error("Failed to get response");
      const data = await res.json();

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.summary || "Here's what I found.",
        cards: data.cards?.length > 0 ? data.cards : undefined,
        data: data.data?.length > 0 ? data.data : undefined,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, I couldn't process that. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "Hi! I'm your FarmGate assistant. Ask me about demand, supply, forecasts, or PO status.",
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold font-display">Assistant</h1>
          <p className="text-sm text-muted-foreground">Ask about demand, supply, forecasts and purchase orders</p>
        </div>
        <Button variant="ghost" size="sm" onClick={clearChat} className="text-muted-foreground hover:text-destructive">
          <Trash2 size={14} className="mr-1.5" /> Clear chat
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-border flex items-center justify-center flex-shrink-0">
              <Bot size={14} className="text-primary" />
            </div>
            <div className="bg-muted rounded-2xl rounded-tl-sm border border-border px-4 py-2.5">
              <Loader2 size={14} className="animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="flex gap-2 flex-wrap py-3 flex-shrink-0">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => sendMessage(s)}
              className="px-3 py-1.5 rounded-full border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex items-center gap-2 pt-3 border-t border-border flex-shrink-0">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything about your data..."
          className="flex-1 bg-muted/40 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary/50 focus:bg-background transition-colors text-foreground placeholder:text-muted-foreground"
        />
        <Button
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          size="sm"
          className="rounded-xl px-4 h-10"
        >
          <Send size={14} />
        </Button>
      </div>
    </div>
  );
};

export default Chat;