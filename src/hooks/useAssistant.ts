import { useCallback, useState, useRef, useEffect } from 'react';
import { chatWithAI, fallbackReply, isAiConfigured } from '../lib/ai';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface UseAssistantOptions {
  locationCity?: string | null;
}

interface UseAssistantReturn {
  messages: ChatMessage[];
  input: string;
  loading: boolean;
  error: string | null;
  aiConfigured: boolean;
  setInput: (value: string) => void;
  send: (text?: string) => void;
  clear: () => void;
}

export function useAssistant(options: UseAssistantOptions = {}): UseAssistantReturn {
  const { locationCity } = options;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const aiConfigured = isAiConfigured();

  const stop = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  }, []);

  const addMessage = useCallback((role: ChatMessage['role'], content: string) => {
    setMessages((prev) => [...prev, { role, content }]);
  }, []);

  const send = useCallback(
    (text?: string) => {
      const userText = (text ?? input).trim();
      if (!userText) return;
      stop();
      addMessage('user', userText);
      setInput('');
      setLoading(true);
      setError(null);

      const history: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
        {
          role: 'system',
          content:
            'You are QueueLess AI, a helpful assistant for the QueueLess queue-management app in India. ' +
            'Nearby places from OpenStreetMap are NOT QueueLess partners and do not support token generation. ' +
            'Only partner centres support tokens and queue tracking. Keep answers short and plain. ' +
            `The user's selected location city is ${locationCity ?? 'not set'}.`,
        },
        ...messages,
        { role: 'user', content: userText },
      ];

      (async () => {
        let reply: string | null = null;
        try {
          reply = await chatWithAI(history);
        } catch {
          reply = null;
        }
        if (abortRef.current?.signal.aborted) return;
        if (!reply) {
          reply = fallbackReply(userText, locationCity ?? undefined);
        }
        setLoading(false);
        addMessage('assistant', reply);
      })();
    },
    [input, messages, locationCity, addMessage, stop]
  );

  const clear = useCallback(() => {
    stop();
    setMessages([]);
    setError(null);
    setLoading(false);
  }, [stop]);

  useEffect(() => {
    return () => stop();
  }, [stop]);

  return { messages, input, loading, error, aiConfigured, setInput, send, clear };
}
