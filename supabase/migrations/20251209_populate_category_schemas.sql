-- Update form_schema for 'Müzik Grupları' (Music Groups)
-- key: 'music_instruments'
-- Label: 'enstrumanlar_label' (will be translated)
-- Options keys: 'instr_davul_zurna', 'instr_solist', etc.

UPDATE public.categories
SET form_schema = '[
  {
    "key": "music_instruments",
    "label": "enstrumanlar_label",
    "type": "multiselect",
    "options": [
      "instr_davul_zurna",
      "instr_solist",
      "instr_bendir",
      "instr_darbuka",
      "instr_baglama",
      "instr_ud",
      "instr_kanun",
      "instr_cumbus",
      "instr_tanbur",
      "instr_ney",
      "instr_mey",
      "instr_kaval",
      "instr_sipsi",
      "instr_keyboard",
      "instr_orkestra"
    ]
  }
]'::jsonb
WHERE name = 'Müzik Grupları';
