
-- Create transactions table for both income and expense tracking
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  category TEXT NOT NULL,
  subcategory TEXT,
  description TEXT,
  transaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  source_client TEXT,
  vendor_merchant TEXT,
  location TEXT,
  payment_method TEXT,
  reference_number TEXT,
  is_business_related BOOLEAN DEFAULT false,
  is_reimbursable BOOLEAN DEFAULT false,
  is_tax_exempt BOOLEAN DEFAULT false,
  tds_amount DECIMAL(10,2) DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  is_recurring BOOLEAN DEFAULT false,
  recurring_frequency TEXT,
  recurring_end_date TIMESTAMP WITH TIME ZONE,
  recurring_occurrences INTEGER,
  parent_transaction_id UUID REFERENCES public.transactions(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create categories table for predefined and custom categories
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  icon TEXT,
  color TEXT,
  is_default BOOLEAN DEFAULT false,
  spending_limit DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create clients table for income sources
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create attachments table for receipts and documents
CREATE TABLE public.transaction_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_attachments ENABLE ROW LEVEL SECURITY;

-- Create policies for transactions
CREATE POLICY "Users can view their own transactions" 
  ON public.transactions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions" 
  ON public.transactions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" 
  ON public.transactions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions" 
  ON public.transactions 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create policies for categories
CREATE POLICY "Users can view their own categories" 
  ON public.categories 
  FOR SELECT 
  USING (auth.uid() = user_id OR is_default = true);

CREATE POLICY "Users can create their own categories" 
  ON public.categories 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories" 
  ON public.categories 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories" 
  ON public.categories 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create policies for clients
CREATE POLICY "Users can view their own clients" 
  ON public.clients 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own clients" 
  ON public.clients 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients" 
  ON public.clients 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients" 
  ON public.clients 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create policies for attachments
CREATE POLICY "Users can view attachments of their transactions" 
  ON public.transaction_attachments 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.transactions 
      WHERE transactions.id = transaction_attachments.transaction_id 
      AND transactions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create attachments for their transactions" 
  ON public.transaction_attachments 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.transactions 
      WHERE transactions.id = transaction_attachments.transaction_id 
      AND transactions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete attachments of their transactions" 
  ON public.transaction_attachments 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.transactions 
      WHERE transactions.id = transaction_attachments.transaction_id 
      AND transactions.user_id = auth.uid()
    )
  );

-- Insert default categories
INSERT INTO public.categories (name, type, icon, color, is_default) VALUES
-- Income categories
('Salary', 'income', 'Wallet', '#10B981', true),
('Business Revenue', 'income', 'TrendingUp', '#059669', true),
('Freelance Income', 'income', 'Briefcase', '#0D9488', true),
('Investment Returns', 'income', 'TrendingUp', '#0891B2', true),
('Rental Income', 'income', 'Home', '#0284C7', true),
('Commission', 'income', 'Percent', '#2563EB', true),
('Interest Income', 'income', 'PiggyBank', '#7C3AED', true),
('Gift/Bonus', 'income', 'Gift', '#C026D3', true),
('Other', 'income', 'CircleDollarSign', '#6B7280', true),

-- Essential expense categories
('Food & Dining', 'expense', 'UtensilsCrossed', '#EF4444', true),
('Transportation', 'expense', 'Car', '#F97316', true),
('Utilities', 'expense', 'Zap', '#F59E0B', true),
('Rent/Mortgage', 'expense', 'Home', '#EAB308', true),
('Healthcare', 'expense', 'Heart', '#84CC16', true),
('Insurance', 'expense', 'Shield', '#22C55E', true),
('Groceries', 'expense', 'ShoppingCart', '#10B981', true),

-- Business expense categories
('Office Supplies', 'expense', 'Package', '#06B6D4', true),
('Marketing', 'expense', 'Megaphone', '#0EA5E9', true),
('Travel', 'expense', 'Plane', '#3B82F6', true),
('Professional Services', 'expense', 'Users', '#6366F1', true),
('Software Subscriptions', 'expense', 'Monitor', '#8B5CF6', true),
('Equipment', 'expense', 'HardDrive', '#A855F7', true),

-- Discretionary expense categories
('Entertainment', 'expense', 'Film', '#D946EF', true),
('Shopping', 'expense', 'ShoppingBag', '#EC4899', true),
('Hobbies', 'expense', 'Gamepad2', '#F43F5E', true),
('Gym/Fitness', 'expense', 'Dumbbell', '#EF4444', true),
('Personal Care', 'expense', 'Sparkles', '#F97316', true),

-- Investment expense categories
('Mutual Funds', 'expense', 'TrendingUp', '#059669', true),
('Stocks', 'expense', 'BarChart3', '#0D9488', true),
('FD', 'expense', 'Landmark', '#0891B2', true),
('Gold', 'expense', 'Coins', '#F59E0B', true),
('Real Estate', 'expense', 'Building', '#84CC16', true);

-- Create storage bucket for receipts and attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('transaction-attachments', 'transaction-attachments', true);

-- Create storage policy for transaction attachments
CREATE POLICY "Users can upload transaction attachments" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'transaction-attachments' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their transaction attachments" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'transaction-attachments' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their transaction attachments" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'transaction-attachments' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
