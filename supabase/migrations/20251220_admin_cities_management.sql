-- Admin Cities and Popular Cities Management
-- This migration creates tables for managing cities and popular cities from admin panel

-- Create admin_cities table
CREATE TABLE IF NOT EXISTS admin_cities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    country_code TEXT NOT NULL CHECK (country_code IN ('DE', 'AT', 'CH')),
    state_id TEXT, -- 'BW', 'BY', 'BE', etc.
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(name, country_code, state_id)
);

-- Create admin_popular_cities table
CREATE TABLE IF NOT EXISTS admin_popular_cities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    city_name TEXT NOT NULL UNIQUE,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_cities_country ON admin_cities(country_code);
CREATE INDEX IF NOT EXISTS idx_admin_cities_state ON admin_cities(state_id);
CREATE INDEX IF NOT EXISTS idx_admin_cities_active ON admin_cities(is_active);
CREATE INDEX IF NOT EXISTS idx_admin_popular_cities_active ON admin_popular_cities(is_active);
CREATE INDEX IF NOT EXISTS idx_admin_popular_cities_order ON admin_popular_cities(display_order);

-- Enable RLS
ALTER TABLE admin_cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_popular_cities ENABLE ROW LEVEL SECURITY;

-- Policies: Only admins can manage
CREATE POLICY "Admins can manage cities"
    ON admin_cities
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can manage popular cities"
    ON admin_popular_cities
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Public read access for active cities
CREATE POLICY "Anyone can view active cities"
    ON admin_cities
    FOR SELECT
    TO public
    USING (is_active = true);

CREATE POLICY "Anyone can view active popular cities"
    ON admin_popular_cities
    FOR SELECT
    TO public
    USING (is_active = true);

-- Insert initial data from vendorData.js
-- Germany cities by state
INSERT INTO admin_cities (name, country_code, state_id, display_order, is_active) VALUES
-- Berlin
('Berlin', 'DE', 'BE', 1, true),
-- Hamburg
('Hamburg', 'DE', 'HH', 2, true),
-- Bavaria (BY)
('München (Munich)', 'DE', 'BY', 3, true),
('Nürnberg (Nuremberg)', 'DE', 'BY', 4, true),
('Augsburg', 'DE', 'BY', 5, true),
('Regensburg', 'DE', 'BY', 6, true),
('Ingolstadt', 'DE', 'BY', 7, true),
('Würzburg', 'DE', 'BY', 8, true),
('Erlangen', 'DE', 'BY', 9, true),
('Fürth', 'DE', 'BY', 10, true),
-- North Rhine-Westphalia (NW)
('Köln (Cologne)', 'DE', 'NW', 11, true),
('Düsseldorf', 'DE', 'NW', 12, true),
('Dortmund', 'DE', 'NW', 13, true),
('Essen', 'DE', 'NW', 14, true),
('Duisburg', 'DE', 'NW', 15, true),
('Bochum', 'DE', 'NW', 16, true),
('Wuppertal', 'DE', 'NW', 17, true),
('Bielefeld', 'DE', 'NW', 18, true),
('Bonn', 'DE', 'NW', 19, true),
('Münster', 'DE', 'NW', 20, true),
-- Hesse (HE)
('Frankfurt am Main', 'DE', 'HE', 21, true),
('Wiesbaden', 'DE', 'HE', 22, true),
('Kassel', 'DE', 'HE', 23, true),
('Darmstadt', 'DE', 'HE', 24, true),
-- Baden-Württemberg (BW)
('Stuttgart', 'DE', 'BW', 25, true),
('Karlsruhe', 'DE', 'BW', 26, true),
('Mannheim', 'DE', 'BW', 27, true),
('Freiburg im Breisgau', 'DE', 'BW', 28, true),
('Heidelberg', 'DE', 'BW', 29, true),
('Ulm', 'DE', 'BW', 30, true),
('Heilbronn', 'DE', 'BW', 31, true),
('Pforzheim', 'DE', 'BW', 32, true),
-- Lower Saxony (NI)
('Hannover', 'DE', 'NI', 33, true),
('Braunschweig', 'DE', 'NI', 34, true),
('Oldenburg', 'DE', 'NI', 35, true),
('Osnabrück', 'DE', 'NI', 36, true),
('Wolfsburg', 'DE', 'NI', 37, true),
('Göttingen', 'DE', 'NI', 38, true),
-- Saxony (SN)
('Leipzig', 'DE', 'SN', 39, true),
('Dresden', 'DE', 'SN', 40, true),
('Chemnitz', 'DE', 'SN', 41, true),
-- Saxony-Anhalt (ST)
('Magdeburg', 'DE', 'ST', 42, true),
('Halle (Saale)', 'DE', 'ST', 43, true),
-- Schleswig-Holstein (SH)
('Kiel', 'DE', 'SH', 44, true),
('Lübeck', 'DE', 'SH', 45, true),
('Flensburg', 'DE', 'SH', 46, true),
-- Thuringia (TH)
('Erfurt', 'DE', 'TH', 47, true),
('Jena', 'DE', 'TH', 48, true),
-- Rhineland-Palatinate (RP)
('Mainz', 'DE', 'RP', 49, true),
('Ludwigshafen am Rhein', 'DE', 'RP', 50, true),
('Koblenz', 'DE', 'RP', 51, true),
('Trier', 'DE', 'RP', 52, true),
-- Bremen (HB)
('Bremen', 'DE', 'HB', 53, true),
('Bremerhaven', 'DE', 'HB', 54, true),
-- Brandenburg (BB)
('Potsdam', 'DE', 'BB', 55, true),
('Cottbus', 'DE', 'BB', 56, true),
-- Saarland (SL)
('Saarbrücken', 'DE', 'SL', 57, true),
-- Mecklenburg-Vorpommern (MV)
('Rostock', 'DE', 'MV', 58, true),
('Schwerin', 'DE', 'MV', 59, true),

-- Austria cities
('Wien (Vienna)', 'AT', 'W', 100, true),
('Salzburg', 'AT', 'S', 101, true),
('Graz', 'AT', 'ST', 102, true),
('Linz', 'AT', 'O', 103, true),
('Innsbruck', 'AT', 'T', 104, true),
('Klagenfurt', 'AT', 'K', 105, true),

-- Switzerland cities
('Zürich (Zurich)', 'CH', 'ZH', 200, true),
('Genève (Geneva)', 'CH', 'GE', 201, true),
('Basel', 'CH', 'BS', 202, true),
('Bern', 'CH', 'BE', 203, true),
('Lausanne', 'CH', 'VD', 204, true)
ON CONFLICT (name, country_code, state_id) DO NOTHING;

-- Insert popular cities
INSERT INTO admin_popular_cities (city_name, display_order, is_active) VALUES
('Berlin', 1, true),
('Hamburg', 2, true),
('München (Munich)', 3, true),
('Köln (Cologne)', 4, true),
('Frankfurt am Main', 5, true),
('Stuttgart', 6, true),
('Düsseldorf', 7, true),
('Ulm', 8, true),
('Wien (Vienna)', 9, true),
('Zürich (Zurich)', 10, true),
('Salzburg', 11, true),
('Genève (Geneva)', 12, true)
ON CONFLICT (city_name) DO NOTHING;

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers
DROP TRIGGER IF EXISTS update_admin_cities_updated_at ON admin_cities;
CREATE TRIGGER update_admin_cities_updated_at
    BEFORE UPDATE ON admin_cities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_admin_popular_cities_updated_at ON admin_popular_cities;
CREATE TRIGGER update_admin_popular_cities_updated_at
    BEFORE UPDATE ON admin_popular_cities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
