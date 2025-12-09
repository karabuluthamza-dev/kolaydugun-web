-- Comprehensive Schema Fix for Key Vendor Categories
-- Standardizing keys to avoid UI issues and ensure translation support.

-- 1. Wedding Videography (Düğün Videocusu)
UPDATE public.categories
SET form_schema = '[
  {
    "key": "video_services",
    "label": "video_services_label",
    "type": "multiselect",
    "options": [
        "video_service_drone",
        "video_service_story",
        "video_service_save_date",
        "video_service_clip",
        "video_service_4k",
        "video_service_jimmy_jib",
        "video_service_live_stream"
    ]
  },
  {
    "key": "video_shooting_types",
    "label": "video_shooting_types_label",
    "type": "multiselect",
    "options": [
        "shoot_documentary",
        "shoot_story",
        "shoot_concept",
        "shoot_music_clip",
        "shoot_short_film"
    ]
  },
  {
    "key": "video_delivery_options",
    "label": "video_delivery_options_label",
    "type": "multiselect",
    "options": [
        "delivery_usb",
        "delivery_digital",
        "delivery_bluray"
    ]
  },
  {
    "key": "video_team_size",
    "label": "video_team_size_label",
    "type": "select",
    "options": [
        "team_size_1",
        "team_size_2",
        "team_size_3",
        "team_size_4_plus"
    ]
  },
  {
    "key": "video_delivery_time",
    "label": "video_delivery_time_label",
    "type": "select",
    "options": [
        "delivery_2_weeks",
        "delivery_4_weeks",
        "delivery_8_weeks",
        "delivery_3_months"
    ]
  }
]'::jsonb
WHERE name = 'Düğün Videocusu' OR name = 'Wedding Videography';

-- 2. Hair & Make-Up (Saç & Makyaj)
UPDATE public.categories
SET form_schema = '[
  {
    "key": "beauty_services",
    "label": "beauty_services_label",
    "type": "multiselect",
    "options": [
        "beauty_service_bridal_hair",
        "beauty_service_bridal_makeup",
        "beauty_service_trial",
        "beauty_service_gel_nails",
        "beauty_service_manicure_pedicure",
        "beauty_service_waxing",
        "beauty_service_guests"
    ]
  },
  {
    "key": "beauty_features",
    "label": "beauty_features_label",
    "type": "multiselect",
    "options": [
        "beauty_feature_home_service",
        "beauty_feature_city_wide",
        "beauty_feature_group_discount"
    ]
  },
  {
    "key": "beauty_brands",
    "label": "beauty_brands_label",
    "type": "text"
  }
]'::jsonb
WHERE name = 'Saç & Makyaj' OR name = 'Hair & Make-Up';

-- 3. Wedding Venues (Düğün Mekanları)
UPDATE public.categories
SET form_schema = '[
  {
    "key": "venue_type",
    "label": "venue_type_label",
    "type": "multiselect",
    "options": [
        "venue_type_hotel",
        "venue_type_garden",
        "venue_type_ballroom",
        "venue_type_restaurant",
        "venue_type_historical",
        "venue_type_boat",
        "venue_type_social_facility"
    ]
  },
  {
    "key": "venue_features",
    "label": "venue_features_label",
    "type": "multiselect",
    "options": [
        "venue_feature_alcohol",
        "venue_feature_catering",
        "venue_feature_cocktail",
        "venue_feature_after_party",
        "venue_feature_valet",
        "venue_feature_disabled_access",
        "venue_feature_accommodation"
    ]
  },
  {
    "key": "venue_view",
    "label": "venue_view_label",
    "type": "multiselect",
    "options": [
        "venue_view_sea",
        "venue_view_forest",
        "venue_view_city",
        "venue_view_garden",
        "venue_view_lake"
    ]
  },
  {
    "key": "venue_capacity_cocktail",
    "label": "venue_capacity_cocktail_label",
    "type": "number"
  },
  {
    "key": "venue_capacity_dinner",
    "label": "venue_capacity_dinner_label",
    "type": "number"
  }
]'::jsonb
WHERE name = 'Düğün Mekanları' OR name = 'Wedding Venues';

-- 4. Wedding Planners (Organizasyon)
UPDATE public.categories
SET form_schema = '[
  {
    "key": "planner_services",
    "label": "planner_services_label",
    "type": "multiselect",
    "options": [
        "planner_service_decoration",
        "planner_service_catering_coord",
        "planner_service_music_coord",
        "planner_service_photo_coord",
        "planner_service_guest_welcoming",
        "planner_service_concept_design",
        "planner_service_fireworks",
        "planner_service_henna"
    ]
  },
  {
    "key": "planner_extras",
    "label": "planner_extras_label",
    "type": "multiselect",
    "options": [
        "planner_extra_candy_bar",
        "planner_extra_limousine",
        "planner_extra_city_tour"
    ]
  }
]'::jsonb
WHERE name = 'Düğün Organizasyonu' OR name = 'Wedding Planners';

-- 5. Catering
UPDATE public.categories
SET form_schema = '[
  {
    "key": "catering_cuisines",
    "label": "catering_cuisines_label",
    "type": "multiselect",
    "options": [
        "cuisine_turkish",
        "cuisine_international",
        "cuisine_mediterranean",
        "cuisine_asian",
        "cuisine_vegetarian",
        "cuisine_vegan"
    ]
  },
  {
    "key": "catering_features",
    "label": "catering_features_label",
    "type": "multiselect",
    "options": [
        "catering_menu_tasting",
        "catering_menu_customization",
        "catering_service_staff",
        "catering_equipment_rental"
    ]
  }
]'::jsonb
WHERE name = 'Catering' OR name = 'Catering & Party Service';
