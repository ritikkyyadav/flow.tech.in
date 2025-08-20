-- Add template column to invoices if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
      AND table_name   = 'invoices'
      AND column_name  = 'template'
  ) THEN
    ALTER TABLE public.invoices ADD COLUMN template text NOT NULL DEFAULT 'modern';
  END IF;
END $$;
