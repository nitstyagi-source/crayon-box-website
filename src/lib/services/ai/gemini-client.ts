/**
 * Google Gemini 3.8 Flash AI Client Service
 * High-speed, resilient intelligence engine for VANI AI Copilot
 * Primary model: gemini-3.8-flash (with automatic fallback across 3.7 / 3.6 / 3.5 / 2.5 on upstream 503 spikes)
 */

const PRIMARY_MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
const FALLBACK_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.7-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-2.5-flash'
];

export interface GenerateGeminiOptions {
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
  jsonMode?: boolean;
  timeoutMs?: number;
  thinkingBudget?: number;
}

export interface GeminiResponse {
  text: string;
  json?: any;
  modelUsed: string;
  usageMetadata?: any;
}

export async function callGemini(options: GenerateGeminiOptions): Promise<GeminiResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment variables');
  }
  const modelsToTry = [PRIMARY_MODEL, ...FALLBACK_MODELS.filter(m => m !== PRIMARY_MODEL)];

  let lastError: any = null;

  for (const model of modelsToTry) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const requestBody: any = {
      contents: [
        {
          role: 'user',
          parts: [{ text: options.prompt }]
        }
      ],
      generationConfig: {
        temperature: options.temperature ?? 0.3,
        maxOutputTokens: options.maxOutputTokens ?? 4096,
      }
    };

    const supportsThinking = model.includes('2.5') || model.includes('3.7') || model.includes('3.8');
    if (options.thinkingBudget !== undefined && supportsThinking) {
      requestBody.generationConfig.thinkingConfig = {
        thinkingBudget: options.thinkingBudget
      };
    }

    if (options.systemInstruction) {
      requestBody.systemInstruction = {
        parts: [{ text: options.systemInstruction }]
      };
    }

    if (options.jsonMode) {
      requestBody.generationConfig.responseMimeType = 'application/json';
    }

    const timeoutMs = options.timeoutMs ?? 35000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.status === 503 || res.status === 429) {
        console.warn(`[Gemini Client] Model ${model} returned ${res.status}, cascading to next model...`);
        lastError = new Error(`Model ${model} overloaded (${res.status})`);
        continue;
      }

      if (!res.ok) {
        const errText = await res.text();
        console.error(`[Gemini Client Error] ${model} ${res.status}:`, errText);
        lastError = new Error(`Gemini API returned status ${res.status}: ${errText.substring(0, 200)}`);
        continue;
      }

      const data = await res.json();
      const candidate = data.candidates?.[0];
      const textOutput = candidate?.content?.parts?.[0]?.text || '';

      let parsedJson = null;
      if (options.jsonMode && textOutput) {
        try {
          parsedJson = JSON.parse(textOutput);
        } catch (e) {
          const jsonMatch = textOutput.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
          if (jsonMatch) {
            try {
              parsedJson = JSON.parse(jsonMatch[1]);
            } catch {}
          }
        }
      }

      return {
        text: textOutput,
        json: parsedJson,
        modelUsed: model,
        usageMetadata: data.usageMetadata
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      lastError = err;
      if (err.name === 'AbortError') {
        console.warn(`[Gemini Client] Timeout (${timeoutMs}ms) on ${model}, cascading to next model...`);
        continue;
      }
    }
  }

  throw lastError || new Error('All Gemini model endpoints failed to respond.');
}
