-- Create builds table
CREATE TABLE public.builds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  description TEXT,
  items JSONB NOT NULL DEFAULT '{}',
  attributes JSONB NOT NULL DEFAULT '{"strength": 0, "dexterity": 0, "intelligence": 0, "focus": 0, "constitution": 0}',
  abilities JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create items cache table for NWDB data
CREATE TABLE public.nwdb_items (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  tier INTEGER,
  rarity TEXT,
  gear_score_max INTEGER,
  item_type TEXT NOT NULL,
  perks JSONB DEFAULT '[]',
  has_random_perks BOOLEAN DEFAULT false,
  cached_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create perks cache table
CREATE TABLE public.nwdb_perks (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  cached_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_builds_category ON public.builds(category);
CREATE INDEX idx_builds_created_at ON public.builds(created_at DESC);
CREATE INDEX idx_nwdb_items_type ON public.nwdb_items(item_type);
CREATE INDEX idx_nwdb_items_name ON public.nwdb_items USING gin(to_tsvector('english', name));
CREATE INDEX idx_nwdb_perks_name ON public.nwdb_perks USING gin(to_tsvector('english', name));

-- Enable Row Level Security
ALTER TABLE public.builds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nwdb_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nwdb_perks ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no authentication required)
CREATE POLICY "Builds are viewable by everyone" 
ON public.builds 
FOR SELECT 
USING (true);

CREATE POLICY "Items are viewable by everyone" 
ON public.nwdb_items 
FOR SELECT 
USING (true);

CREATE POLICY "Perks are viewable by everyone" 
ON public.nwdb_perks 
FOR SELECT 
USING (true);

-- Admin policies (for now, allow all operations - can be restricted later)
CREATE POLICY "Allow all operations on builds" 
ON public.builds 
FOR ALL 
USING (true);

CREATE POLICY "Allow all operations on items" 
ON public.nwdb_items 
FOR ALL 
USING (true);

CREATE POLICY "Allow all operations on perks" 
ON public.nwdb_perks 
FOR ALL 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_builds_updated_at
    BEFORE UPDATE ON public.builds
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();