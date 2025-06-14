
-- Add payment_terms column to clients table
ALTER TABLE public.clients 
ADD COLUMN payment_terms text DEFAULT 'net_30';

-- Add gst_number column to clients table  
ALTER TABLE public.clients 
ADD COLUMN gst_number text;
