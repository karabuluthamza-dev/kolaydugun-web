-- ============================================
-- FINAL CITY SYNCHRONIZATION MIGRATION
-- Syncs all cities from vendorData.js constant into admin_cities
-- SAFE: INSERT ONLY with ON CONFLICT DO NOTHING
-- ============================================

-- Germany (DE)
INSERT INTO admin_cities (name, country_code, state_id, is_active) VALUES
  ('Hildesheim', 'DE', 'NI', true),
  ('Salzgitter', 'DE', 'NI', true),
  ('Wilhelmshaven', 'DE', 'NI', true),
  ('Zwickau', 'DE', 'SN', true),
  ('Plauen', 'DE', 'SN', true),
  ('Görlitz', 'DE', 'SN', true),
  ('Dessau-Roßlau', 'DE', 'ST', true),
  ('Wittenberg', 'DE', 'ST', true),
  ('Stendal', 'DE', 'ST', true),
  ('Neumünster', 'DE', 'SH', true),
  ('Norderstedt', 'DE', 'SH', true),
  ('Elmshorn', 'DE', 'SH', true),
  ('Weimar', 'DE', 'TH', true),
  ('Gera', 'DE', 'TH', true),
  ('Gotha', 'DE', 'TH', true),
  ('Kaiserslautern', 'DE', 'RP', true),
  ('Worms', 'DE', 'RP', true),
  ('Speyer', 'DE', 'RP', true),
  ('Frankfurt (Oder)', 'DE', 'BB', true),
  ('Brandenburg an der Havel', 'DE', 'BB', true),
  ('Oranienburg', 'DE', 'BB', true),
  ('Neunkirchen', 'DE', 'SL', true),
  ('Homburg', 'DE', 'SL', true),
  ('Völklingen', 'DE', 'SL', true),
  ('Stralsund', 'DE', 'MV', true),
  ('Greifswald', 'DE', 'MV', true),
  ('Neubrandenburg', 'DE', 'MV', true),
  ('Wismar', 'DE', 'MV', true),
  ('Neuss', 'DE', 'NW', true),
  ('Paderborn', 'DE', 'NW', true),
  ('Bottrop', 'DE', 'NW', true),
  ('Offenbach am Main', 'DE', 'HE', true),
  ('Hanau', 'DE', 'HE', true),
  ('Gießen', 'DE', 'HE', true),
  ('Krefeld', 'DE', 'NW', true),
  ('Oberhausen', 'DE', 'NW', true),
  ('Hagen', 'DE', 'NW', true),
  ('Hamm', 'DE', 'NW', true),
  ('Leverkusen', 'DE', 'NW', true),
  ('Solingen', 'DE', 'NW', true),
  ('Herne', 'DE', 'NW', true)
ON CONFLICT (name, country_code, state_id) DO NOTHING;

-- Austria (AT)
INSERT INTO admin_cities (name, country_code, state_id, is_active) VALUES
  ('Wels', 'AT', 'O', true),
  ('Steyr', 'AT', 'O', true),
  ('Leonding', 'AT', 'O', true),
  ('Villach', 'AT', 'K', true),
  ('Wolfsberg', 'AT', 'K', true),
  ('Sankt Pölten', 'AT', 'N', true),
  ('Wiener Neustadt', 'AT', 'N', true),
  ('Krems', 'AT', 'N', true),
  ('Baden', 'AT', 'N', true),
  ('Bregenz', 'AT', 'V', true),
  ('Dornbirn', 'AT', 'V', true),
  ('Feldkirch', 'AT', 'V', true),
  ('Eisenstadt', 'AT', 'B', true),
  ('Leoben', 'AT', 'ST', true),
  ('Kufstein', 'AT', 'T', true)
ON CONFLICT (name, country_code, state_id) DO NOTHING;

-- Switzerland (CH)
INSERT INTO admin_cities (name, country_code, state_id, is_active) VALUES
  ('Winterthur', 'CH', 'ZH', true),
  ('Biel/Bienne', 'CH', 'BE', true),
  ('Luzern (Lucerne)', 'CH', 'LU', true),
  ('St. Gallen', 'CH', 'SG', true),
  ('Lugano', 'CH', 'TI', true),
  ('Aarau', 'CH', 'AG', true),
  ('Baden (CH)', 'CH', 'AG', true),
  ('Zug', 'CH', 'ZG', true),
  ('Neuchâtel', 'CH', 'NE', true),
  ('Fribourg', 'CH', 'FR', true),
  ('Sion', 'CH', 'VS', true),
  ('Chur', 'CH', 'GR', true),
  ('Frauenfeld', 'CH', 'TG', true),
  ('Thun', 'CH', 'BE', true)
ON CONFLICT (name, country_code, state_id) DO NOTHING;
