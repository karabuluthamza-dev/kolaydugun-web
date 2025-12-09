-- Fix form_schema for 'Düğün Fotoğrafçısı' (Wedding Photography)
-- Ensuring keys are clean and consistent for translation.

UPDATE public.categories
SET form_schema = '[
  {
    "key": "photo_services",
    "label": "photo_services_label",
    "type": "multiselect",
    "options": [
        "photo_service_story",
        "photo_service_save_date",
        "photo_service_trash_dress",
        "photo_service_drone",
        "photo_service_album",
        "photo_service_digital",
        "photo_service_jimmy_jib",
        "photo_service_studio"
    ]
  },
  {
    "key": "photo_shooting_types",
    "label": "photo_shooting_types_label",
    "type": "multiselect",
    "options": [
        "shoot_documentary",
        "shoot_story",
        "shoot_catalog",
        "shoot_concept",
        "shoot_engagement",
        "shoot_classic"
    ]
  },
  {
    "key": "photo_team_size",
    "label": "photo_team_size_label",
    "type": "select",
    "options": [
        "team_size_1",
        "team_size_2",
        "team_size_3",
        "team_size_4_plus"
    ]
  },
  {
    "key": "photo_delivery_time",
    "label": "photo_delivery_time_label",
    "type": "select",
    "options": [
        "delivery_2_weeks",
        "delivery_4_weeks",
        "delivery_8_weeks",
        "delivery_3_months"
    ]
  }
]'::jsonb
WHERE name = 'Düğün Fotoğrafçısı' OR name = 'Wedding Photography';
