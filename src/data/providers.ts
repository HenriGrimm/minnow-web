// Model providers and runtimes (spec §1.5). Cloud providers are in
// registry order; local providers and runtimes follow.

export type ProviderKind = 'cloud' | 'local';

export interface Provider {
  id: string;
  name: string;
  kind: ProviderKind;
}

/** The nine cloud provider presets, in registry order. */
export const CLOUD_PROVIDERS: readonly Provider[] = [
  { id: 'openrouter', name: 'OpenRouter', kind: 'cloud' },
  { id: 'openai', name: 'OpenAI', kind: 'cloud' },
  { id: 'groq', name: 'Groq', kind: 'cloud' },
  { id: 'mistral', name: 'Mistral', kind: 'cloud' },
  { id: 'opencode-zen', name: 'OpenCode Zen', kind: 'cloud' },
  { id: 'opencode-go', name: 'OpenCode Go', kind: 'cloud' },
  { id: 'anthropic', name: 'Anthropic', kind: 'cloud' },
  { id: 'deepseek', name: 'DeepSeek', kind: 'cloud' },
  { id: 'github-copilot', name: 'GitHub Copilot', kind: 'cloud' },
] as const;

/** The two local provider presets. */
export const LOCAL_PROVIDERS: readonly Provider[] = [
  { id: 'lmstudio', name: 'LM Studio', kind: 'local' },
  { id: 'ollama', name: 'Ollama', kind: 'local' },
] as const;

export type RuntimeId = 'llama-cpp' | 'mlx';

export interface Runtime {
  id: RuntimeId;
  name: string;
  note: string;
}

/** Built-in local runtimes. */
export const RUNTIMES: readonly Runtime[] = [
  { id: 'llama-cpp', name: 'llama.cpp', note: 'Portable local inference; multi-GPU layer split.' },
  { id: 'mlx', name: 'MLX', note: 'Apple Silicon inference via the MLX framework.' },
] as const;
