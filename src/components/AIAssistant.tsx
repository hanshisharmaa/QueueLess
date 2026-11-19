import { useState } from 'react';
import { Bot, X, Send, MapPin, Phone, Timer, Clock } from 'lucide-react';
import { useAssistant } from '../hooks/useAssistant';
import { cn } from '../lib/cn';

const quickActions = [
  { label: 'Find hospitals near me', icon: MapPin, hint: 'healthcare' },
  { label: 'Find banks near me', icon: BankIcon, hint: 'banking' },
  { label: 'How do I generate a token?', icon: Phone, hint: 'token' },
  { label: 'Track my queue', icon: Timer, hint: 'queue' },
];

function BankIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <path d="M3 9h18" />
      <path d="M3 13h18" />
    </svg>
  );
}

export function AIAssistant() {
  const [open, setOpen] = useState(false);
  const { messages, input, loading, error, aiConfigured, setInput, send } =
    useAssistant();

  return (
    <>
      {/* Toggle / launcher */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open QueueLess AI assistant"
        className="fixed bottom-6 right-6 z-[60] flex h-12 w-12 items-center justify-center rounded-full bg-electric-600 text-white shadow-glow transition hover:from-electric-500 hover:to-electric-400"
      >
        <Bot className="h-6 w-6" />
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-[60] flex w-full max-w-xs flex-col gap-2">
          <div
            className="card rounded-2xl border border-navy-200 shadow-card flex flex-col h-[500px] sm:h-[600px] bg-white"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 rounded-2xl bg-navy-950 px-4 py-3 text-white">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-electric-400" />
                <span className="font-bold">QueueLess AI</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                {aiConfigured ? (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
                    <Clock className="h-3 w-3" />
                  </span>
                ) : (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-amber-300">
                    <Clock className="h-3 w-3" />
                  </span>
                )}
                <span className="text-navy-200/70">
                  {aiConfigured ? 'AI assistant' : 'Built-in help'}
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded p-1 hover:bg-white/20"
                aria-label="Close assistant"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick actions */}
            <div className="px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-navy-400 mb-3">
                Try asking
              </p>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((a, i) => (
                  <button
                    key={i}
                    onClick={() => send(a.label)}
                    className="shrink-0 rounded-full border border-navy-100 bg-white px-3 py-1.5 text-xs font-semibold text-navy-700 transition hover:border-electric-300 hover:text-electric-600"
                  >
                    <a.icon className={`h-3.5 w-3.5 ${a.icon === BankIcon ? 'text-navy-500' : ''}`} />
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center h-32 text-center">
                  <p className="text-sm text-navy-400">
                    How can I help you today?
                  </p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  } max-w-[90%] ${msg.role === 'user' ? 'md:ml-auto' : 'md:mr-auto'}`}
                >
                  <div
                    className={cn(
                      'rounded-2xl px-4 py-3 text-sm leading-relaxed',
                      msg.role === 'user'
                        ? 'bg-electric-600 text-white'
                        : 'bg-navy-50 text-navy-800 border border-navy-100'
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {error && (
                <div className="flex justify-start max-w-[90%] md:mr-auto">
                  <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                  </div>
                </div>
              )}
              {loading && (
                <div className="flex justify-start max-w-[90%] md:mr-auto">
                  <div className="rounded-2xl bg-navy-50 px-4 py-3 text-sm text-navy-500 flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-navy-300 animate-pulse" />
                    <span>Typing…</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="px-4 pb-3 pt-2 border-t border-navy-100">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send();
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about places, tokens or queues…"
                  className="flex-1 rounded-xl border border-navy-200 bg-white px-4 py-2.5 text-sm text-navy-900 placeholder:text-navy-300 focus:border-electric-500 focus:outline-none focus:ring-2 focus:ring-electric-500/20 disabled:opacity-60"
                  disabled={loading}
                  autoComplete="off"
                  spellCheck={false}
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="rounded-xl bg-electric-600 px-4 py-2.5 text-white text-sm font-semibold disabled:opacity-60 transition"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
              {!aiConfigured && (
                <p className="mt-1.5 text-[10px] text-center text-navy-400">
                  AI endpoint not configured — using built-in help. Set VITE_AI_CHAT_ENDPOINT to connect an AI provider.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
