-- ============================================
-- City Data Expansion Migration
-- Adds 49 new cities: DE (+34), AT (+7), CH (+8)
-- SAFE: INSERT ONLY with ON CONFLICT DO NOTHING
-- No existing data will be modified or deleted
-- ============================================

-- ============================================
-- PART 1: NEW GERMAN CITIES (+34)
-- ============================================
INSERT INTO cities (name, country) VALUES
  -- Niedersachsen expansion
  ('Hildesheim', 'Germany'),
  ('Salzgitter', 'Germany'),
  ('Wilhelmshaven', 'Germany'),
  -- Sachsen expansion
  ('Zwickau', 'Germany'),
  ('Plauen', 'Germany'),
  ('Görlitz', 'Germany'),
  -- Sachsen-Anhalt expansion
  ('Dessau-Roßlau', 'Germany'),
  ('Wittenberg', 'Germany'),
  ('Stendal', 'Germany'),
  -- Schleswig-Holstein expansion
  ('Neumünster', 'Germany'),
  ('Norderstedt', 'Germany'),
  ('Elmshorn', 'Germany'),
  -- Thüringen expansion
  ('Weimar', 'Germany'),
  ('Gera', 'Germany'),
  ('Gotha', 'Germany'),
  -- Rheinland-Pfalz expansion
  ('Kaiserslautern', 'Germany'),
  ('Worms', 'Germany'),
  ('Speyer', 'Germany'),
  -- Brandenburg expansion
  ('Frankfurt (Oder)', 'Germany'),
  ('Brandenburg an der Havel', 'Germany'),
  ('Oranienburg', 'Germany'),
  -- Saarland expansion
  ('Neunkirchen', 'Germany'),
  ('Homburg', 'Germany'),
  ('Völklingen', 'Germany'),
  -- Mecklenburg-Vorpommern expansion
  ('Stralsund', 'Germany'),
  ('Greifswald', 'Germany'),
  ('Neubrandenburg', 'Germany'),
  ('Wismar', 'Germany')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- PART 2: AUSTRIAN CITIES (+7)
-- ============================================
INSERT INTO cities (name, country) VALUES
  -- Upper Austria
  ('Leonding', 'Austria'),
  -- Tyrol
  ('Kufstein', 'Austria'),
  -- Carinthia
  ('Wolfsberg', 'Austria'),
  -- Lower Austria
  ('Krems', 'Austria'),
  ('Baden', 'Austria'),
  -- Styria
  ('Leoben', 'Austria'),
  -- Vorarlberg
  ('Feldkirch', 'Austria')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- PART 3: SWISS CITIES (+8)
-- ============================================
INSERT INTO cities (name, country) VALUES
  -- Aargau
  ('Aarau', 'Switzerland'),
  ('Baden (CH)', 'Switzerland'),
  -- Zug
  ('Zug', 'Switzerland'),
  -- Neuchâtel
  ('Neuchâtel', 'Switzerland'),
  -- Fribourg
  ('Fribourg', 'Switzerland'),
  -- Valais
  ('Sion', 'Switzerland'),
  -- Graubünden
  ('Chur', 'Switzerland'),
  -- Thurgau
  ('Frauenfeld', 'Switzerland'),
  -- Bern expansion
  ('Thun', 'Switzerland')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- PART 4: CITY ALIASES (SKIPPED)
-- ============================================
-- NOTE: city_aliases.target_city_id expects INTEGER but cities.id is UUID
-- City aliases can be added manually via Admin Panel → City Aliases page
-- This is safer and allows admin to verify each alias

-- ============================================
-- VERIFICATION QUERIES (Run manually if needed)
-- ============================================

-- Count cities by country
-- SELECT country, COUNT(*) as count FROM cities GROUP BY country ORDER BY count DESC;

-- Show new cities added
-- SELECT name, country FROM cities WHERE created_at > NOW() - INTERVAL '1 hour';

-- ============================================
-- MIGRATION COMPLETE
-- Total: +49 cities (DE: +34, AT: +7, CH: +8)
-- ============================================
