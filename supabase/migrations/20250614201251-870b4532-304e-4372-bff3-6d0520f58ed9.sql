
-- Create budgets table to store user budget limits by category
CREATE TABLE public.budgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  period TEXT NOT NULL DEFAULT 'monthly', -- monthly, weekly, yearly
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, category, period, start_date)
);

-- Create budget_history table to track budget changes
CREATE TABLE public.budget_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  budget_id UUID NOT NULL REFERENCES public.budgets(id) ON DELETE CASCADE,
  old_amount NUMERIC,
  new_amount NUMERIC NOT NULL,
  changed_by UUID NOT NULL,
  change_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create budget_alerts table to track budget notifications
CREATE TABLE public.budget_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  budget_id UUID NOT NULL REFERENCES public.budgets(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL, -- 'warning', 'exceeded', 'near_limit'
  threshold_percentage NUMERIC NOT NULL,
  is_sent BOOLEAN NOT NULL DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_alerts ENABLE ROW LEVEL SECURITY;

-- RLS policies for budgets table
CREATE POLICY "Users can view their own budgets" 
  ON public.budgets 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own budgets" 
  ON public.budgets 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budgets" 
  ON public.budgets 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budgets" 
  ON public.budgets 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS policies for budget_history table
CREATE POLICY "Users can view their budget history" 
  ON public.budget_history 
  FOR SELECT 
  USING (changed_by = auth.uid());

CREATE POLICY "Users can create budget history" 
  ON public.budget_history 
  FOR INSERT 
  WITH CHECK (changed_by = auth.uid());

-- RLS policies for budget_alerts table
CREATE POLICY "Users can view their budget alerts" 
  ON public.budget_alerts 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create budget alerts" 
  ON public.budget_alerts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their budget alerts" 
  ON public.budget_alerts 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create trigger to update updated_at column
CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON public.budgets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically create budget history entries
CREATE OR REPLACE FUNCTION public.create_budget_history()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.amount != NEW.amount THEN
    INSERT INTO public.budget_history (budget_id, old_amount, new_amount, changed_by)
    VALUES (NEW.id, OLD.amount, NEW.amount, NEW.user_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for budget history
CREATE TRIGGER budget_history_trigger
  AFTER UPDATE ON public.budgets
  FOR EACH ROW
  EXECUTE FUNCTION public.create_budget_history();
