
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Brain, Settings2, Shield, TrendingUp, Eye, EyeOff, TestTube, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useAI } from '@/contexts/AIContext';
import { AIProvider } from '@/types/ai';
import { toast } from '@/hooks/use-toast';

const AI_PROVIDERS = [
  {
    id: 'openai',
    name: 'OpenAI',
    type: 'openai' as const,
    models: [
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', type: 'chat' as const, costPer1kTokens: 0.01, maxTokens: 128000, capabilities: ['chat', 'analysis'] },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', type: 'chat' as const, costPer1kTokens: 0.002, maxTokens: 16000, capabilities: ['chat'] }
    ]
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    type: 'anthropic' as const,
    models: [
      { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', type: 'chat' as const, costPer1kTokens: 0.003, maxTokens: 200000, capabilities: ['chat', 'analysis'] },
      { id: 'claude-3-haiku', name: 'Claude 3 Haiku', type: 'chat' as const, costPer1kTokens: 0.00025, maxTokens: 200000, capabilities: ['chat'] }
    ]
  },
  {
    id: 'google',
    name: 'Google Gemini',
    type: 'google' as const,
    models: [
      { id: 'gemini-pro', name: 'Gemini Pro', type: 'chat' as const, costPer1kTokens: 0.00025, maxTokens: 32000, capabilities: ['chat', 'vision'] }
    ]
  }
];

export const AISettingsPage = () => {
  const { settings, loading, updateSettings, testProvider, getUsageStats } = useAI();
  const [activeTab, setActiveTab] = useState('providers');
  const [showApiKeys, setShowApiKeys] = useState<{ [key: string]: boolean }>({});
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [usageStats, setUsageStats] = useState<any>(null);

  useEffect(() => {
    loadUsageStats();
  }, []);

  const loadUsageStats = async () => {
    const stats = await getUsageStats();
    setUsageStats(stats);
  };

  const handleProviderUpdate = async (providerId: string, updates: Partial<AIProvider>) => {
    if (!settings) return;

    const updatedProviders = settings.providers.map(p => 
      p.id === providerId ? { ...p, ...updates } : p
    );

    const providerExists = settings.providers.some(p => p.id === providerId);
    if (!providerExists) {
      const template = AI_PROVIDERS.find(p => p.id === providerId);
      if (template) {
        updatedProviders.push({
          ...template,
          status: 'disconnected' as const,
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
          },
          ...updates
        });
      }
    }

    await updateSettings({ providers: updatedProviders });
  };

  const handleTestProvider = async (provider: AIProvider) => {
    setTestingProvider(provider.id);
    try {
      const success = await testProvider(provider);
      await handleProviderUpdate(provider.id, { 
        status: success ? 'connected' : 'error' 
      });
      
      toast({
        title: success ? "Connection Successful" : "Connection Failed",
        description: success ? `${provider.name} is working correctly` : `Failed to connect to ${provider.name}`,
        variant: success ? "default" : "destructive"
      });
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Failed to test the connection",
        variant: "destructive"
      });
    } finally {
      setTestingProvider(null);
    }
  };

  const toggleApiKeyVisibility = (providerId: string) => {
    setShowApiKeys(prev => ({ ...prev, [providerId]: !prev[providerId] }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="w-8 h-8" />
            AI & Integrations
          </h1>
          <p className="text-gray-600 mt-2">Configure AI providers and manage intelligent features</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="global-ai">Enable AI Features</Label>
            <Switch
              id="global-ai"
              checked={settings?.globalEnabled || false}
              onCheckedChange={(enabled) => updateSettings({ globalEnabled: enabled })}
            />
          </div>
        </div>
      </div>

      {!settings?.globalEnabled && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            AI features are currently disabled. Enable them above to configure providers and access intelligent capabilities.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="providers">AI Providers</TabsTrigger>
          <TabsTrigger value="features">Feature Settings</TabsTrigger>
          <TabsTrigger value="usage">Usage Analytics</TabsTrigger>
          <TabsTrigger value="security">Security & Privacy</TabsTrigger>
        </TabsList>

        <TabsContent value="providers" className="space-y-6">
          <div className="grid gap-6">
            {AI_PROVIDERS.map((template) => {
              const provider = settings?.providers.find(p => p.id === template.id) || {
                ...template,
                status: 'disconnected' as const,
                usage: { totalCalls: 0, totalTokens: 0, totalCost: 0, lastUsed: '', monthlyUsage: { calls: 0, tokens: 0, cost: 0 } },
                config: { temperature: 0.7, maxTokens: 4000, timeout: 30000, retries: 3 }
              };

              return (
                <Card key={template.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-3">
                        <Brain className="w-6 h-6" />
                        {template.name}
                        <Badge className={getStatusColor(provider.status)}>
                          {getStatusIcon(provider.status)}
                          {provider.status}
                        </Badge>
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestProvider(provider)}
                        disabled={!provider.apiKey || testingProvider === provider.id}
                      >
                        <TestTube className="w-4 h-4 mr-2" />
                        {testingProvider === provider.id ? 'Testing...' : 'Test Connection'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`${provider.id}-api-key`}>API Key</Label>
                        <div className="flex">
                          <Input
                            id={`${provider.id}-api-key`}
                            type={showApiKeys[provider.id] ? 'text' : 'password'}
                            placeholder="Enter your API key"
                            value={provider.apiKey || ''}
                            onChange={(e) => handleProviderUpdate(provider.id, { apiKey: e.target.value })}
                            className="rounded-r-none"
                            disabled={!settings?.globalEnabled}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => toggleApiKeyVisibility(provider.id)}
                            className="rounded-l-none border-l-0"
                          >
                            {showApiKeys[provider.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`${provider.id}-endpoint`}>Endpoint URL</Label>
                        <Input
                          id={`${provider.id}-endpoint`}
                          placeholder="Custom endpoint (optional)"
                          value={provider.endpoint || ''}
                          onChange={(e) => handleProviderUpdate(provider.id, { endpoint: e.target.value })}
                          disabled={!settings?.globalEnabled}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Available Models</Label>
                      <div className="flex flex-wrap gap-2">
                        {template.models.map((model) => (
                          <Badge key={model.id} variant="outline">
                            {model.name} (₹{model.costPer1kTokens}/1k tokens)
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {provider.status === 'connected' && (
                      <div className="grid grid-cols-3 gap-4 p-4 bg-green-50 rounded-lg">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{provider.usage.totalCalls}</div>
                          <div className="text-sm text-gray-600">Total Calls</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{provider.usage.totalTokens.toLocaleString()}</div>
                          <div className="text-sm text-gray-600">Tokens Used</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">₹{provider.usage.totalCost.toFixed(2)}</div>
                          <div className="text-sm text-gray-600">Total Cost</div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <div className="grid gap-6">
            {settings && Object.entries(settings.features).map(([featureKey, feature]) => (
              <Card key={featureKey}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="capitalize">
                      {featureKey.replace(/([A-Z])/g, ' $1').trim()}
                    </CardTitle>
                    <Switch
                      checked={feature.enabled}
                      onCheckedChange={(enabled) => {
                        const updatedFeatures = {
                          ...settings.features,
                          [featureKey]: { ...feature, enabled }
                        };
                        updateSettings({ features: updatedFeatures });
                      }}
                      disabled={!settings.globalEnabled}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Primary Provider</Label>
                      <Select
                        value={feature.primaryProvider}
                        onValueChange={(value) => {
                          const updatedFeatures = {
                            ...settings.features,
                            [featureKey]: { ...feature, primaryProvider: value }
                          };
                          updateSettings({ features: updatedFeatures });
                        }}
                        disabled={!feature.enabled}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                        <SelectContent>
                          {settings.providers.filter(p => p.status === 'connected').map((provider) => (
                            <SelectItem key={provider.id} value={provider.id}>
                              {provider.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Confidence Threshold: {(feature.confidence * 100).toFixed(0)}%</Label>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.1"
                        value={feature.confidence}
                        onChange={(e) => {
                          const updatedFeatures = {
                            ...settings.features,
                            [featureKey]: { ...feature, confidence: parseFloat(e.target.value) }
                          };
                          updateSettings({ features: updatedFeatures });
                        }}
                        disabled={!feature.enabled}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Max Cost Per Request: ₹{feature.maxCost}</Label>
                    <input
                      type="range"
                      min="0.001"
                      max="0.1"
                      step="0.001"
                      value={feature.maxCost}
                      onChange={(e) => {
                        const updatedFeatures = {
                          ...settings.features,
                          [featureKey]: { ...feature, maxCost: parseFloat(e.target.value) }
                        };
                        updateSettings({ features: updatedFeatures });
                      }}
                      disabled={!feature.enabled}
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Total API Calls</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{usageStats?.totalCalls || 0}</div>
                <div className="text-xs text-gray-500">This month</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{usageStats?.totalTokens?.toLocaleString() || 0}</div>
                <div className="text-xs text-gray-500">Input + Output</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{usageStats?.totalCost?.toFixed(2) || '0.00'}</div>
                <div className="text-xs text-gray-500">This month</div>
              </CardContent>
            </Card>
          </div>

          {usageStats?.dailyUsage && (
            <Card>
              <CardHeader>
                <CardTitle>Daily Usage Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between space-x-2">
                  {usageStats.dailyUsage.map((day: any, index: number) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-blue-500 rounded-t"
                        style={{ height: `${(day.calls / Math.max(...usageStats.dailyUsage.map((d: any) => d.calls))) * 200}px` }}
                      ></div>
                      <div className="text-xs mt-2">{day.date}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security & Privacy Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Data Retention Period</Label>
                  <p className="text-sm text-gray-600">How long to keep AI request logs</p>
                </div>
                <Select
                  value={settings?.security.dataRetention.toString()}
                  onValueChange={(value) => {
                    const updatedSecurity = {
                      ...settings?.security!,
                      dataRetention: parseInt(value)
                    };
                    updateSettings({ security: updatedSecurity });
                  }}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow Data for Training</Label>
                  <p className="text-sm text-gray-600">Allow AI providers to use your data for model training</p>
                </div>
                <Switch
                  checked={settings?.security.allowDataTraining || false}
                  onCheckedChange={(checked) => {
                    const updatedSecurity = {
                      ...settings?.security!,
                      allowDataTraining: checked
                    };
                    updateSettings({ security: updatedSecurity });
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Mask Sensitive Data</Label>
                  <p className="text-sm text-gray-600">Automatically mask sensitive information in AI requests</p>
                </div>
                <Switch
                  checked={settings?.security.maskSensitiveData || false}
                  onCheckedChange={(checked) => {
                    const updatedSecurity = {
                      ...settings?.security!,
                      maskSensitiveData: checked
                    };
                    updateSettings({ security: updatedSecurity });
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
