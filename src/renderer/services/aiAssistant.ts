// AI Assistant Service
// Supports: OpenAI (ChatGPT), Anthropic (Claude), Alibaba (Qwen), DeepSeek

export type AIProvider = 'openai' | 'claude' | 'qwen' | 'deepseek'

export interface AIMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
}

export interface AIConfig {
  provider: AIProvider
  apiKey: string
  model?: string
}

interface ProviderConfig {
  name: string
  apiUrl: string
  defaultModel: string
  models: string[]
}

// Provider configurations
const PROVIDERS: Record<AIProvider, ProviderConfig> = {
  openai: {
    name: 'ChatGPT',
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    defaultModel: 'gpt-4-turbo-preview',
    models: ['gpt-4-turbo-preview', 'gpt-4', 'gpt-3.5-turbo'],
  },
  claude: {
    name: 'Claude',
    apiUrl: 'https://api.anthropic.com/v1/messages',
    defaultModel: 'claude-3-5-sonnet-20241022',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-sonnet-20240229'],
  },
  qwen: {
    name: 'Qwen',
    apiUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    defaultModel: 'qwen-max',
    models: ['qwen-max', 'qwen-plus', 'qwen-turbo'],
  },
  deepseek: {
    name: 'DeepSeek',
    apiUrl: 'https://api.deepseek.com/v1/chat/completions',
    defaultModel: 'deepseek-chat',
    models: ['deepseek-chat', 'deepseek-coder'],
  },
}

/**
 * Get provider configuration
 */
export function getProviderConfig(provider: AIProvider): ProviderConfig {
  return PROVIDERS[provider]
}

/**
 * Get all available providers
 */
export function getAvailableProviders(): Array<{ id: AIProvider; name: string }> {
  return Object.entries(PROVIDERS).map(([id, config]) => ({
    id: id as AIProvider,
    name: config.name,
  }))
}

/**
 * Send chat message to AI provider
 */
export async function sendChatMessage(
  config: AIConfig,
  messages: AIMessage[]
): Promise<string> {
  const provider = PROVIDERS[config.provider]
  const model = config.model || provider.defaultModel
  
  // Load API key from storage if not provided
  const apiKey = config.apiKey || loadAPIKey(config.provider)
  
  if (!apiKey) {
    throw new Error(`API-Key für ${provider.name} nicht konfiguriert. Bitte in den Einstellungen hinterlegen.`)
  }

  try {
    if (config.provider === 'claude') {
      return await sendClaudeMessage(apiKey, model, messages)
    } else if (config.provider === 'qwen') {
      return await sendQwenMessage(apiKey, model, messages)
    } else {
      // OpenAI-compatible API (OpenAI, DeepSeek)
      return await sendOpenAICompatibleMessage(provider.apiUrl, apiKey, model, messages)
    }
  } catch (error) {
    console.error('AI API Error:', error)
    throw new Error(`Fehler bei ${provider.name}: ${(error as Error).message}`)
  }
}

/**
 * Send message to Claude API
 */
async function sendClaudeMessage(
  apiKey: string,
  model: string,
  messages: AIMessage[]
): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      messages: messages
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role,
          content: m.content,
        })),
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Claude API Error')
  }

  const data = await response.json()
  return data.content[0].text
}

/**
 * Send message to Qwen API (Alibaba DashScope)
 */
async function sendQwenMessage(
  apiKey: string,
  model: string,
  messages: AIMessage[]
): Promise<string> {
  const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Qwen API Error')
  }

  const data = await response.json()
  return data.choices[0].message.content
}

/**
 * Send message to OpenAI-compatible API (OpenAI, DeepSeek)
 */
async function sendOpenAICompatibleMessage(
  apiUrl: string,
  apiKey: string,
  model: string,
  messages: AIMessage[]
): Promise<string> {
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
      temperature: 0.7,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'API Error')
  }

  const data = await response.json()
  return data.choices[0].message.content
}

/**
 * Store API keys securely in localStorage (basic obfuscation)
 */
const API_KEYS_STORAGE = 'gurktaler_ai_keys'

export function saveAPIKey(provider: AIProvider, apiKey: string): void {
  const keys = loadAPIKeys()
  keys[provider] = btoa(apiKey) // Basic encoding
  localStorage.setItem(API_KEYS_STORAGE, JSON.stringify(keys))
}

export function loadAPIKey(provider: AIProvider): string | null {
  const keys = loadAPIKeys()
  const encoded = keys[provider]
  return encoded ? atob(encoded) : null
}

export function loadAPIKeys(): Record<string, string> {
  const stored = localStorage.getItem(API_KEYS_STORAGE)
  return stored ? JSON.parse(stored) : {}
}

export function deleteAPIKey(provider: AIProvider): void {
  const keys = loadAPIKeys()
  delete keys[provider]
  localStorage.setItem(API_KEYS_STORAGE, JSON.stringify(keys))
}

export function hasAPIKey(provider: AIProvider): boolean {
  return !!loadAPIKey(provider)
}
