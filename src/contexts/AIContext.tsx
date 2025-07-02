
import React, { createContext, useContext, useState, useEffect } from 'react';
import { type AISettings, type AIProvider as AIProviderInterface, type AIRequest } from '@/types/ai';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { toast } from '@/hooks/use-toast';

interface AIContextType {
  settings: AISettings | null;
  loading: boolean;
  updateSettings: (settings: Partial<AISettings>) => Promise<void>;
  testProvider: (provider: AIProviderInterface) => Promise<boolean>;
  makeAIRequest: (request: Omit<AIRequest, 'id' | 'timestamp' | 'duration' | 'status'>) => Promise<string>;
  getUsageStats: () => Promise<any>;
  isFeatureEnabled: (feature: keyof AISettings['features']) => boolean;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};

const defaultAISettings: AISettings = {
  globalEnabled: true, // Enable by default since we have Google API key
  providers: [
    {
      id: 'google',
      name: 'Google Gemini',
      type: 'google',
      status: 'connected', // Set as connected by default
      models: [
        { 
          id: 'gemini-pro', 
          name: 'Gemini Pro', 
          type: 'chat', 
          costPer1kTokens: 0.00025, 
          maxTokens: 32000, 
          capabilities: ['chat', 'vision', 'analysis'] 
        }
      ],
      usage: {
        totalCalls: 0,
        totalTokens: 0,
        totalCost: 0,
        lastUsed: '',
        monthlyUsage: { calls: 0, tokens: 0, cost: 0 }
      },
      config: {
        temperature: 0.7,
        maxTokens: 4000,
        timeout: 30000,
        retries: 3
      }
    }
  ],
  features: {
    transactionCategorization: {
      enabled: true,
      primaryProvider: 'google',
      fallbackProviders: [],
      model: 'gemini-pro',
      confidence: 0.8,
      maxCost: 0.01
    },
    financialInsights: {
      enabled: true,
      primaryProvider: 'google',
      fallbackProviders: [],
      model: 'gemini-pro',
      confidence: 0.9,
      maxCost: 0.05
    },
    chatAssistant: {
      enabled: true,
      primaryProvider: 'google',
      fallbackProviders: [],
      model: 'gemini-pro',
      confidence: 0.7,
      maxCost: 0.02
    },
    documentProcessing: {
      enabled: true,
      primaryProvider: 'google',
      fallbackProviders: [],
      model: 'gemini-pro',
      confidence: 0.85,
      maxCost: 0.03
    },
    forecasting: {
      enabled: true,
      primaryProvider: 'google',
      fallbackProviders: [],
      model: 'gemini-pro',
      confidence: 0.9,
      maxCost: 0.1
    }
  },
  security: {
    dataRetention: 30,
    allowDataTraining: false,
    maskSensitiveData: true
  }
};

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<AISettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAISettings();
    }
  }, [user]);

  const loadAISettings = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_settings')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings(data.settings as unknown as AISettings);
      } else {
        // Initialize with default settings that include Google provider
        setSettings(defaultAISettings);
        // Auto-save the default settings
        await supabase
          .from('ai_settings')
          .upsert({
            user_id: user?.id,
            settings: defaultAISettings as any,
            updated_at: new Date().toISOString()
          });
      }
    } catch (error) {
      console.error('Error loading AI settings:', error);
      setSettings(defaultAISettings);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<AISettings>) => {
    if (!user || !settings) return;

    const updatedSettings = { ...settings, ...newSettings };
    
    try {
      const { error } = await supabase
        .from('ai_settings')
        .upsert({
          user_id: user.id,
          settings: updatedSettings as any,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setSettings(updatedSettings);
      toast({
        title: "Success",
        description: "AI settings updated successfully",
      });
    } catch (error) {
      console.error('Error updating AI settings:', error);
      toast({
        title: "Error",
        description: "Failed to update AI settings",
        variant: "destructive",
      });
    }
  };

  const testProvider = async (provider: AIProviderInterface): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('test-ai-provider', {
        body: { provider: { ...provider, type: 'google' } }
      });

      if (error) throw error;
      return data.success;
    } catch (error) {
      console.error('Error testing AI provider:', error);
      return false;
    }
  };

  const makeAIRequest = async (request: Omit<AIRequest, 'id' | 'timestamp' | 'duration' | 'status'>): Promise<string> => {
    const startTime = Date.now();
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-request', {
        body: {
          provider: 'google',
          model: 'gemini-pro',
          prompt: request.prompt
        }
      });

      if (error) throw error;

      // Log the request for analytics
      await supabase.from('ai_requests').insert({
        user_id: user?.id,
        provider: 'google',
        model: 'gemini-pro',
        tokens: data.tokens || 0,
        cost: data.cost || 0,
        duration: Date.now() - startTime,
        status: 'success'
      });

      return data.response;
    } catch (error) {
      console.error('AI Request error:', error);
      
      // Log the error
      await supabase.from('ai_requests').insert({
        user_id: user?.id,
        provider: 'google',
        model: 'gemini-pro',
        tokens: 0,
        cost: 0,
        duration: Date.now() - startTime,
        status: 'error'
      });

      throw error;
    }
  };

  const getUsageStats = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('ai-usage-stats', {
        body: { userId: user?.id }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting usage stats:', error);
      return null;
    }
  };

  const isFeatureEnabled = (feature: keyof AISettings['features']): boolean => {
    return settings?.globalEnabled && settings?.features[feature]?.enabled || false;
  };

  return (
    <AIContext.Provider value={{
      settings,
      loading,
      updateSettings,
      testProvider,
      makeAIRequest,
      getUsageStats,
      isFeatureEnabled
    }}>
      {children}
    </AIContext.Provider>
  );
};
