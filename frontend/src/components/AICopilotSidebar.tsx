"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { Bot, ChevronRight, Send, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Message = { role: "user" | "assistant"; content: string };

const QUICK_PROMPTS = [
  "What are the highest-risk open findings?",
  "Summarize overdue evidence requests",
  "List controls with no framework mapping",
  "What should I test next for this engagement?",
];

async function callCopilot(userMessage: string): Promise<string> {
  const base = process.env.NEXT_PUBLIC_API_URL || "";
  try {
    const res = await fetch(`${base}/api/v1/ai/risk-copilot`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ engagement_id: "00000000-0000-0000-0000-000000000000" }),
    });
    if (!res.ok) throw new Error(`${res.status}`);
    const data = await res.json();
    const risks = (data.risks ?? []).slice(0, 3).join("; ");
    const controls = (data.controls ?? []).slice(0, 3).join("; ");
    return `Key risks: ${risks || "none identified"}. Suggested controls: ${controls || "none"}. (Context: "${userMessage}")`;
  } catch {
    return `I'm the DClaw Audit AI Copilot. You asked: "${userMessage}". Connect an OpenRouter API key to enable full AI responses.`;
  }
}

export default function AICopilotSidebar() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm your DClaw Audit Copilot. Ask me about risks, findings, evidence, or controls." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setLoading(true);
    const reply = await callCopilot(msg);
    setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    setLoading(false);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    send();
  }

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(true)}
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-gray-900 px-4 py-3 text-white shadow-lg hover:bg-gray-700 transition-all ${open ? "hidden" : ""}`}
        aria-label="Open AI Copilot"
      >
        <Bot className="h-5 w-5" />
        <span className="text-sm font-medium">AI Copilot</span>
      </button>

      {/* Sidebar panel */}
      {open && (
        <div className="fixed bottom-0 right-0 z-50 flex h-[600px] w-[380px] flex-col rounded-tl-2xl border border-gray-200 bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between rounded-tl-2xl bg-gray-900 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <span className="font-semibold">AI Copilot</span>
              <Badge className="bg-gray-700 text-xs text-gray-200">Beta</Badge>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close">
              <X className="h-4 w-4 hover:text-gray-300" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl bg-gray-100 px-3 py-2 text-sm text-gray-500 animate-pulse">
                  Thinking…
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick prompts */}
          <div className="border-t border-gray-100 px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar">
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => send(p)}
                className="shrink-0 flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-600 hover:bg-gray-50 whitespace-nowrap"
              >
                <ChevronRight className="h-3 w-3" />
                {p}
              </button>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-gray-200 px-3 py-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about risks, findings, controls…"
              className="flex-1 text-sm"
              disabled={loading}
            />
            <Button type="submit" size="icon" disabled={loading || !input.trim()} className="bg-gray-900 hover:bg-gray-700">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
