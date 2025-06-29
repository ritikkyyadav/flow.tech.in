
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AISettings, AIProvider, AIRequest } from '@/types/ai';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface AIContextType {
  settings: AISettings | null;
  loading: boolean;
  updateSettings: (settings: Partial<AISettings>) => Promise<void>;
  testProvider: (provider: AIProvider) => Promise<boolean>;
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
  globalEnabled: false,
  providers: [],
  features: {
    transactionCategorization: {
      enabled: false,
      primaryProvider: '',
      fallbackProviders: [],
      model: '',
      confidence: 0.8,
      maxCost: 0.01
    },
    financialInsights: {
      enabled: false,
      primaryProvider: '',
      fallbackProviders: [],
      model: '',
      confidence: 0.9,
      maxCost: 0.05
    },
    chatAssistant: {
      enabled: false,
      primaryProvider: '',
      fallbackProviders: [],
      model: '',
      confidence: 0.7,
      maxCost: 0.02
    },
    documentProcessing: {
      enabled: false,
      primaryProvider: '',
      fallbackProviders: [],
      model: '',
      confidence: 0.85,
      maxCost: 0.03
    },
    forecasting: {
      enabled: false,
      primaryProvider: '',
      fallbackProviders: [],
      model: '',
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
        setSettings(data.settings);
      } else {
        setSettings(defaultAISettings);
      }
    } catch (error) {
      console.error('Error loading AI settings:', error);
      setSettings(defaultAISettings);
      toast({
        title: "Error",
        description: "Failed to load AI settings",
        variant: "destructive",
      });
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
          settings: updatedSettings,
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

  const testProvider = async (provider: AIProvider): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('test-ai-provider', {
        body: { provider }
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
        body: request
      });

      if (error) throw error;

      // Log the request for analytics
      await supabase.from('ai_requests').insert({
        user_id: user?.id,
        provider: request.provider,
        model: request.model,
        tokens: data.tokens,
        cost: data.cost,
        duration: Date.now() - startTime,
        status: 'success'
      });

      return data.response;
    } catch (error) {
      // Log the error
      await supabase.from('ai_requests').insert({
        user_id: user?.id,
        provider: request.provider,
        model: request.model,
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
