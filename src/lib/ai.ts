const AI_CHAT_ENDPOINT = import.meta.env.VITE_AI_CHAT_ENDPOINT;

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export function isAiConfigured() {
  return Boolean(AI_CHAT_ENDPOINT);
}

/**
 * Sends a chat conversation to the user-owned AI proxy endpoint.
 * The frontend never holds an API key; the proxy (deployed by the project owner)
 * authenticates to the AI provider and returns the reply.
 * Returns null when no endpoint is configured so the caller can use a local fallback.
 */
export async function chatWithAI(messages: ChatMessage[]): Promise<string | null> {
  if (!AI_CHAT_ENDPOINT) return null;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);
    const res = await fetch(AI_CHAT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ messages }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`AI service error (${res.status})${text ? ': ' + text : ''}`);
    }
    const json = await res.json().catch(() => ({}));
    const reply = json.reply ?? json.message ?? json.answer ?? null;
    if (typeof reply === 'string' && reply.trim()) return reply;
    return null;
  } catch {
    return null;
  }
}

/**
 * Local rule-based fallback used when no AI endpoint is configured.
 * Covers navigation, place search, token generation, and queue info.
 */
export function fallbackReply(message: string, locationCity?: string | null): string {
  const m = message.toLowerCase();
  const where = locationCity ? `around ${locationCity}` : 'around your selected location';

  const replySection = (title: string, body: string) => `**${title}**\n${body}`;

  if (/\b(hi|hello|hey|good (morning|afternoon|evening))\b/.test(m)) {
    return replySection(
      'Hello! I am QueueLess AI',
      'I can help you find nearby places, explain token generation, and guide you through queue tracking. What would you like to do?'
    );
  }

  if (/\b(token|generate|book|reserve)\b/.test(m)) {
    return replySection(
      'Generating a digital token',
      '1. Sign in to your QueueLess account.\n2. Go to Explore and open a QueueLess partner centre (not an OpenStreetMap nearby place).\n3. Tap "Generate Digital Token".\n4. Track your live position on the tracking page.\n\nOnly partner centres support tokens. Nearby OpenStreetMap listings are for information and directions only.'
    );
  }

  if (/\b(queue|waiting|position|people ahead|tracking|track)\b/.test(m)) {
    return replySection(
      'Tracking your queue',
      'Open your active token from the dashboard or tracking page. You will see your token number, people ahead, estimated wait, and which token is currently being served. The page updates live as the centre serves customers.'
    );
  }

  if (/\b(find|near|nearby|around|search|hospital|clinic|bank|atm|salon|beauty|repair|vehicle|restaurant|cafe|dining|diagnostic)\b/.test(m)) {
    return replySection(
      'Finding nearby places',
      `Use the Explore page. Choose your city or tap "Use my location", pick a category filter, and browse results.\n\n- QueueLess Partner Centres: support tokens and queue tracking.\n- Nearby Places: from OpenStreetMap (${where}); info and directions only, no tokens.\n\nIf you tell me a category (e.g. "banks near me"), I can point you to the right filter.`
    );
  }

  if (/\b(location|city|gps|area)\b/.test(m)) {
    return replySection(
      'Setting your location',
      'On Explore, pick a popular Indian city chip, type your city/locality manually, or tap "Use my location" for GPS. Nearby OpenStreetMap results update automatically for your selected location.'
    );
  }

  if (/\b(help|what can you do|how does this work)\b/.test(m)) {
    return replySection(
      'What I can help with',
      '- Find nearby places by category (hospitals, banks, salons, vehicle service, restaurants, etc.)\n- Explain how to generate a digital token at partner centres\n- Explain live queue tracking\n- Guide you around the QueueLess app\n\nTry: "Find hospitals near me" or "How do I generate a token?"'
    );
  }

  return replySection(
    'QueueLess AI',
    "I'm not sure I understood. You can ask me to find nearby places (e.g. 'banks near me'), explain how to generate a token, or describe how queue tracking works. What would you like help with?"
  );
}
