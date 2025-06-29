
export interface AIProvider {
  id: string;
  name: string;
  type: 'openai' | 'anthropic' | 'google' | 'azure' | 'custom';
  status: 'connected' | 'disconnected' | 'error' | 'testing';
  apiKey?: string;
  endpoint?: string;
  models: AIModel[];
  usage: AIUsageStats;
  config: AIProviderConfig;
}

export interface AIModel {
  id: string;
  name: string;
  type: 'chat' | 'completion' | 'vision' | 'audio';
  costPer1kTokens: number;
  maxTokens: number;
  capabilities: string[];
}

export interface AIUsageStats {
  totalCalls: number;
  totalTokens: number;
  totalCost: number;
  lastUsed: string;
  monthlyUsage: {
    calls: number;
    tokens: number;
    cost: number;
  };
}

export interface AIProviderConfig {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  timeout?: number;
  retries?: number;
}

export interface AIRequest {
  id: string;
  provider: string;
  model: string;
  prompt: string;
  response?: string;
  tokens: number;
  cost: number;
  timestamp: string;
  duration: number;
  status: 'success' | 'error' | 'timeout';
}

export interface AIFeatureConfig {
  enabled: boolean;
  primaryProvider: string;
  fallbackProviders: string[];
  model: string;
  confidence: number;
  maxCost: number;
}

export interface AISettings {
  globalEnabled: boolean;
  providers: AIProvider[];
  features: {
    transactionCategorization: AIFeatureConfig;
    financialInsights: AIFeatureConfig;
    chatAssistant: AIFeatureConfig;
    documentProcessing: AIFeatureConfig;
    forecasting: AIFeatureConfig;
  };
  security: {
    dataRetention: number;
    allowDataTraining: boolean;
    maskSensitiveData: boolean;
  };
}
