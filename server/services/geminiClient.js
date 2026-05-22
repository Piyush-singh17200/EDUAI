import { GoogleGenerativeAI } from '@google/generative-ai';
import '../config/env.js';

const DEFAULT_GEMINI_MODEL = 'gemini-1.5-flash';
const DEFAULT_FALLBACK_MODELS = ['gemini-1.5-flash-8b', 'gemini-1.5-pro'];
const DEFAULT_OPENROUTER_MODEL = 'meta-llama/llama-3.2-3b-instruct:free';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MAX_OUTPUT_TOKENS = 900;
const DEFAULT_TEMPERATURE = 0.35;
const DEFAULT_PROMPT_MAX_CHARS = 12000;
const DEFAULT_TIMEOUT_MS = 18000;
const DEFAULT_THINKING_BUDGET = 0;

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_KEY);
let disabledReason = '';

const toPositiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const toNumberInRange = (value, fallback, min, max) => {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const aiProvider = String(
  process.env.AI_PROVIDER || (process.env.OPENROUTER_API_KEY ? 'openrouter' : 'gemini')
).toLowerCase();
const modelName = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
const openRouterModelName = process.env.OPENROUTER_MODEL || DEFAULT_OPENROUTER_MODEL;
const defaultMaxOutputTokens = toPositiveInteger(
  process.env.GEMINI_MAX_OUTPUT_TOKENS,
  DEFAULT_MAX_OUTPUT_TOKENS
);
const defaultTemperature = toNumberInRange(
  process.env.GEMINI_TEMPERATURE,
  DEFAULT_TEMPERATURE,
  0,
  1
);
const defaultPromptMaxChars = toPositiveInteger(
  process.env.GEMINI_PROMPT_MAX_CHARS,
  DEFAULT_PROMPT_MAX_CHARS
);
const defaultTimeoutMs = toPositiveInteger(
  process.env.GEMINI_TIMEOUT_MS,
  DEFAULT_TIMEOUT_MS
);
const defaultThinkingBudget = Number.isFinite(Number.parseInt(process.env.GEMINI_THINKING_BUDGET, 10))
  ? Number.parseInt(process.env.GEMINI_THINKING_BUDGET, 10)
  : DEFAULT_THINKING_BUDGET;

const splitModels = (value) =>
  String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const isSupportedModelCandidate = (model = '') =>
  String(model).includes('gemini-');

const getModelCandidates = () => {
  const fallbackModels = splitModels(process.env.GEMINI_FALLBACK_MODELS);
  return [...new Set([
    process.env.GEMINI_MODEL || modelName,
    ...(fallbackModels.length ? fallbackModels : DEFAULT_FALLBACK_MODELS)
  ])].filter(isSupportedModelCandidate);
};

const getErrorMessage = (error) =>
  error?.message || error?.response?.data?.error?.message || 'Unknown AI service error';

const isPermanentConfigError = (error) => {
  const message = getErrorMessage(error).toLowerCase();
  return message.includes('api key not valid')
    || message.includes('api_key_invalid')
    || message.includes('api key expired')
    || message.includes('permission_denied')
    || message.includes('no auth credentials')
    || message.includes('invalid api key')
    || message.includes('401');
};

const createTextResponse = (text) => ({
  response: {
    text: () => text
  }
});

const getRequestText = (request) => {
  if (typeof request === 'string') return request;

  if (Array.isArray(request?.contents)) {
    return request.contents
      .map((content) =>
        (content.parts || [])
          .map((part) => part.text || '')
          .filter(Boolean)
          .join('\n')
      )
      .filter(Boolean)
      .join('\n\n');
  }

  return String(request || '');
};

const toOpenRouterMessages = (request, responseMimeType) => {
  const messages = [];

  if (responseMimeType === 'application/json') {
    messages.push({
      role: 'system',
      content: 'Return only valid JSON. Do not wrap the JSON in markdown.'
    });
  }

  if (typeof request === 'string') {
    messages.push({ role: 'user', content: request });
    return messages;
  }

  if (Array.isArray(request?.contents)) {
    request.contents.forEach((content) => {
      const role = content.role === 'model' ? 'assistant' : 'user';
      const text = (content.parts || [])
        .map((part) => part.text || '')
        .filter(Boolean)
        .join('\n');

      if (text) {
        messages.push({ role, content: text });
      }
    });

    return messages;
  }

  messages.push({ role: 'user', content: getRequestText(request) });
  return messages;
};

const generateOpenRouterContent = async ({
  request,
  maxOutputTokens,
  temperature,
  timeoutMs,
  responseMimeType
}) => {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key is missing');
  }

  let lastError;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.APP_URL || process.env.CLIENT_URL || 'http://localhost:3000',
        'X-Title': 'EduAI Platform'
      },
      body: JSON.stringify({
        model: openRouterModelName,
        messages: toOpenRouterMessages(request, responseMimeType),
        max_tokens: maxOutputTokens,
        temperature,
        top_p: 0.8
      }),
      signal: controller.signal
    });

    const bodyText = await response.text();
    let payload = null;

    try {
      payload = JSON.parse(bodyText);
    } catch {
      payload = null;
    }

    if (!response.ok) {
      const retryAfter = Number.parseFloat(
        payload?.error?.metadata?.retry_after_seconds
        || response.headers.get('retry-after')
        || '0'
      );
      const providerMessage = payload?.error?.metadata?.raw
        || payload?.error?.message
        || payload?.message
        || bodyText.slice(0, 500);

      if (response.status === 429 && attempt === 0 && Number.isFinite(retryAfter) && retryAfter > 0 && retryAfter <= 10) {
        await sleep(Math.ceil(retryAfter * 1000));
        continue;
      }

      throw new Error(`OpenRouter request failed (${response.status}): ${providerMessage}`);
    }

    const content = payload?.choices?.[0]?.message?.content;
    const text = Array.isArray(content)
      ? content.map((part) => part?.text || part?.content || '').join('')
      : String(content || '').trim();

    if (!text) {
      throw new Error('OpenRouter returned an empty response');
    }

    return createTextResponse(text);
    } catch (error) {
      lastError = error;
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError || new Error('OpenRouter request failed');
};

export const getFastModel = ({
  maxOutputTokens = defaultMaxOutputTokens,
  temperature = defaultTemperature,
  timeoutMs = defaultTimeoutMs,
  thinkingBudget = defaultThinkingBudget,
  responseMimeType
} = {}) => {
  // Use a lower temperature for structured JSON tasks for speed and reliability
  const effectiveTemperature = responseMimeType === 'application/json' ? 0.15 : temperature;

  return {
    async generateContent(request) {
      if (aiProvider === 'openrouter') {
        return generateOpenRouterContent({
          request,
          maxOutputTokens,
          temperature: effectiveTemperature,
          timeoutMs,
          responseMimeType
        });
      }

    if (aiProvider !== 'gemini') {
      throw new Error(`Unsupported AI provider: ${aiProvider}`);
    }

    if (!process.env.GOOGLE_GENERATIVE_AI_KEY) {
      throw new Error('Gemini API key is missing');
    }

    if (disabledReason) {
      throw new Error(disabledReason);
    }

    const baseGenerationConfig = {
      maxOutputTokens,
      temperature,
      topP: 0.8,
      topK: 32
    };
    if (responseMimeType) {
      baseGenerationConfig.responseMimeType = responseMimeType;
    }
    let lastError;

    for (const model of getModelCandidates()) {
      try {
        const generationConfig = { ...baseGenerationConfig };
        if (model.includes('2.5') && Number.isFinite(thinkingBudget)) {
          generationConfig.thinkingConfig = { thinkingBudget };
        }

        const candidate = genAI.getGenerativeModel(
          { model, generationConfig },
          { timeout: timeoutMs, apiVersion: 'v1beta' }
        );
        return await candidate.generateContent(request);
      } catch (error) {
        lastError = error;
        const message = getErrorMessage(error);
        console.warn(`Gemini model "${model}" failed: ${message}`);

        if (isPermanentConfigError(error)) {
          disabledReason = message;
          throw error;
        }
      }
    }

    throw lastError || new Error('Gemini request failed');
      },

      async generateContentStream(request) {
        if (aiProvider === 'openrouter') {
          return this.generateContent(request);
        }

        if (!process.env.GOOGLE_GENERATIVE_AI_KEY) {
          throw new Error('Gemini API key is missing');
        }

        const baseGenerationConfig = {
          maxOutputTokens,
          temperature,
          topP: 0.8,
          topK: 32
        };

        for (const model of getModelCandidates()) {
          try {
            const candidate = genAI.getGenerativeModel(
              { model, generationConfig: baseGenerationConfig },
              { timeout: timeoutMs, apiVersion: 'v1beta' }
            );
            return await candidate.generateContentStream(request);
          } catch (error) {
            console.warn(`Gemini streaming model "${model}" failed: ${getErrorMessage(error)}`);
          }
        }
        throw new Error('Gemini streaming request failed');
      }
    };
};

export const generateText = async (request, options = {}) => {
  const response = await getFastModel(options).generateContent(request);
  return response.response.text();
};

export const generateStream = async (request, options = {}) => {
  return getFastModel(options).generateContentStream(request);
};

export const parseJsonObject = (text) => {
  const withoutFence = String(text || '').match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1] || String(text || '');
  const jsonMatch = withoutFence.match(/\{[\s\S]*\}/);

  if (!jsonMatch) return null;

  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    return null;
  }
};

export const parseJsonArray = (text) => {
  const withoutFence = String(text || '').match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1] || String(text || '');
  const jsonMatch = withoutFence.match(/\[[\s\S]*\]/);

  if (!jsonMatch) return null;

  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    return null;
  }
};

export const compactPromptText = (text = '', maxChars = defaultPromptMaxChars) => {
  if (typeof text !== 'string' || text.length <= maxChars) {
    return text;
  }

  return `${text.slice(0, maxChars)}\n\n[Input trimmed to keep the AI response fast.]`;
};
