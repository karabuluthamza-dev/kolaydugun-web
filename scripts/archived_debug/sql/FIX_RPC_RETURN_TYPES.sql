-- Fix RPC functions return types to match table schema (TIMESTAMPTZ)
-- We must DROP the functions first because we are changing the return type signature

-- 1. get_posts_by_category
DROP FUNCTION IF EXISTS get_posts_by_category(text, integer, integer);

CREATE OR REPLACE FUNCTION get_posts_by_category(
  p_category_slug TEXT,
  p_limit INTEGER DEFAULT 10,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  slug TEXT,
  title JSONB,
  excerpt JSONB,
  featured_image_url TEXT,
  view_count INTEGER,
  reading_time INTEGER,
  created_at TIMESTAMPTZ  -- Changed from TIMESTAMP to TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.slug,
    p.title,
    p.excerpt,
    COALESCE(p.featured_image_url, p.image_url) as featured_image_url,
    p.view_count,
    p.reading_time,
    p.created_at
  FROM posts p
  INNER JOIN post_categories pc ON p.id = pc.post_id
  INNER JOIN blog_categories bc ON pc.category_id = bc.id
  WHERE bc.slug = p_category_slug
    AND p.status = 'published'
  ORDER BY p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- 2. get_related_posts
DROP FUNCTION IF EXISTS get_related_posts(uuid, integer);

CREATE OR REPLACE FUNCTION get_related_posts(
  p_post_id UUID,
  p_limit INTEGER DEFAULT 3
)
RETURNS TABLE (
  id UUID,
  slug TEXT,
  title JSONB,
  excerpt JSONB,
  featured_image_url TEXT,
  view_count INTEGER,
  reading_time INTEGER,
  created_at TIMESTAMPTZ -- Changed from TIMESTAMP to TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  -- Get posts from same categories
  SELECT DISTINCT 
    p.id,
    p.slug,
    p.title,
    p.excerpt,
    COALESCE(p.featured_image_url, p.image_url) as featured_image_url,
    p.view_count,
    p.reading_time,
    p.created_at
  FROM posts p
  INNER JOIN post_categories pc1 ON p.id = pc1.post_id
  INNER JOIN post_categories pc2 ON pc1.category_id = pc2.category_id
  WHERE pc2.post_id = p_post_id
    AND p.id != p_post_id
    AND p.status = 'published'
  ORDER BY p.view_count DESC, p.created_at DESC
  LIMIT p_limit;
  
  -- If not enough related posts, fill with recent popular posts
  IF (SELECT COUNT(*) FROM posts WHERE id = p_post_id) < p_limit THEN
    RETURN QUERY
    SELECT 
      p.id,
      p.slug,
      p.title,
      p.excerpt,
      COALESCE(p.featured_image_url, p.image_url) as featured_image_url,
      p.view_count,
      p.reading_time,
      p.created_at
    FROM posts p
    WHERE p.id != p_post_id
      AND p.status = 'published'
      AND p.id NOT IN (
        SELECT DISTINCT p2.id
        FROM posts p2
        INNER JOIN post_categories pc1 ON p2.id = pc1.post_id
        INNER JOIN post_categories pc2 ON pc1.category_id = pc2.category_id
        WHERE pc2.post_id = p_post_id
      )
    ORDER BY p.view_count DESC, p.created_at DESC
    LIMIT (p_limit - (SELECT COUNT(*) FROM posts WHERE id = p_post_id));
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 3. get_posts_by_tag
DROP FUNCTION IF EXISTS get_posts_by_tag(text, integer, integer);

CREATE OR REPLACE FUNCTION get_posts_by_tag(
  p_tag_slug TEXT,
  p_limit INTEGER DEFAULT 10,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  slug TEXT,
  title JSONB,
  excerpt JSONB,
  featured_image_url TEXT,
  view_count INTEGER,
  reading_time INTEGER,
  created_at TIMESTAMPTZ -- Changed from TIMESTAMP to TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.slug,
    p.title,
    p.excerpt,
    COALESCE(p.featured_image_url, p.image_url) as featured_image_url,
    p.view_count,
    p.reading_time,
    p.created_at
  FROM posts p
  INNER JOIN post_tags pt ON p.id = pt.post_id
  INNER JOIN blog_tags bt ON pt.tag_id = bt.id
  WHERE bt.slug = p_tag_slug
    AND p.status = 'published'
  ORDER BY p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- 4. search_posts (Doesn't return created_at usually, but checking just in case)
-- The previous definition didn't return created_at, so it's fine.
