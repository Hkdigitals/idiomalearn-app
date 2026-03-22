import { OPENROUTER_CONFIG } from "./constants";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface StreamCallbacks {
  onToken: (token: string) => void;
  onComplete: (fullText: string) => void;
  onError: (error: Error) => void;
}

/**
 * Stream a chat completion from OpenRouter.
 * Uses Qwen 3.5 9B by default — $0.05/M tokens, ~0.4s latency.
 */
export async function streamChat(
  messages: ChatMessage[],
  callbacks: StreamCallbacks,
  apiKey: string,
  model?: string
): Promise<void> {
  const selectedModel = model || OPENROUTER_CONFIG.model;

  try {
    const response = await fetch(`${OPENROUTER_CONFIG.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "https://idiomalearn.app",
        "X-Title": "IdiomaLearn",
      },
      body: JSON.stringify({
        model: selectedModel,
        messages,
        max_tokens: OPENROUTER_CONFIG.maxTokens,
        temperature: OPENROUTER_CONFIG.temperature,
        stream: true,
      }),
    });

    if (!response.ok) {
      // Try fallback model
      if (selectedModel === OPENROUTER_CONFIG.model && OPENROUTER_CONFIG.fallbackModels.length > 0) {
        console.warn(`Primary model failed, trying fallback: ${OPENROUTER_CONFIG.fallbackModels[0]}`);
        return streamChat(messages, callbacks, apiKey, OPENROUTER_CONFIG.fallbackModels[0]);
      }
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body");

    const decoder = new TextDecoder();
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ") && line !== "data: [DONE]") {
          try {
            const json = JSON.parse(line.slice(6));
            const token = json.choices?.[0]?.delta?.content || "";
            if (token) {
              fullText += token;
              callbacks.onToken(token);
            }
          } catch {
            // Skip malformed JSON chunks
          }
        }
      }
    }

    callbacks.onComplete(fullText);
  } catch (error) {
    callbacks.onError(error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Non-streaming chat for analysis tasks (feedback, level assessment).
 */
export async function chatCompletion(
  messages: ChatMessage[],
  apiKey: string,
  options?: { maxTokens?: number; temperature?: number; jsonMode?: boolean }
): Promise<string> {
  const response = await fetch(`${OPENROUTER_CONFIG.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "https://idiomalearn.app",
      "X-Title": "IdiomaLearn",
    },
    body: JSON.stringify({
      model: OPENROUTER_CONFIG.model,
      messages,
      max_tokens: options?.maxTokens || 1000,
      temperature: options?.temperature || 0.3,
      ...(options?.jsonMode && { response_format: { type: "json_object" } }),
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
