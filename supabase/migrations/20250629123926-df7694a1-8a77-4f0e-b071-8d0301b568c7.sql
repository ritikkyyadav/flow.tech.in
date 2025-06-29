
-- Create AI settings table to store user AI configurations
CREATE TABLE public.ai_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create AI requests table to track API usage
CREATE TABLE public.ai_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  tokens INTEGER NOT NULL DEFAULT 0,
  cost NUMERIC NOT NULL DEFAULT 0,
  duration INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'success',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) policies
ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_requests ENABLE ROW LEVEL SECURITY;

-- Policies for ai_settings
CREATE POLICY "Users can view their own AI settings" 
  ON public.ai_settings 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI settings" 
  ON public.ai_settings 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI settings" 
  ON public.ai_settings 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Policies for ai_requests
CREATE POLICY "Users can view their own AI requests" 
  ON public.ai_requests 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI requests" 
  ON public.ai_requests 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Add trigger to update updated_at column
CREATE TRIGGER update_ai_settings_updated_at
  BEFORE UPDATE ON public.ai_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
