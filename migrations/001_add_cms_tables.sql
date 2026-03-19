-- Migration: Add CMS tables for client_logos, navigation, and site_settings
-- Date: 2026-03-19

-- =============================================
-- CLIENT LOGOS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS client_logos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  display_order INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE client_logos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for client_logos
CREATE POLICY "Enable read for authenticated users" ON client_logos
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users" ON client_logos
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON client_logos
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable delete for authenticated users" ON client_logos
  FOR DELETE TO authenticated USING (true);

-- =============================================
-- NAVIGATION TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS navigation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT NOT NULL CHECK (section IN ('header', 'footer')),
  label TEXT NOT NULL,
  url TEXT DEFAULT '',
  icon TEXT,
  "order" INTEGER DEFAULT 0,
  parent_id UUID REFERENCES navigation(id) ON DELETE CASCADE,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE navigation ENABLE ROW LEVEL SECURITY;

-- RLS Policies for navigation
CREATE POLICY "Enable read for all users" ON navigation
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users" ON navigation
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON navigation
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable delete for authenticated users" ON navigation
  FOR DELETE TO authenticated USING (true);

-- =============================================
-- SITE SETTINGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for site_settings
CREATE POLICY "Enable read for all users" ON site_settings
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users" ON site_settings
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON site_settings
  FOR UPDATE TO authenticated USING (true);

-- =============================================
-- ADD COLUMNS TO EXISTING TABLES
-- =============================================

-- Add hub_order and is_featured_on_hub to services table
ALTER TABLE services ADD COLUMN IF NOT EXISTS hub_order INTEGER DEFAULT 999;
ALTER TABLE services ADD COLUMN IF NOT EXISTS is_featured_on_hub BOOLEAN DEFAULT false;

-- Add hub_order and is_featured_on_hub to industries table
ALTER TABLE industries ADD COLUMN IF NOT EXISTS hub_order INTEGER DEFAULT 999;
ALTER TABLE industries ADD COLUMN IF NOT EXISTS is_featured_on_hub BOOLEAN DEFAULT false;

-- Add hub_intro and testimonials_heading to pages table
ALTER TABLE pages ADD COLUMN IF NOT EXISTS hub_intro TEXT;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS testimonials_heading TEXT;

-- =============================================
-- SEED DATA (optional - comment out if not needed)
-- =============================================

-- Insert default site settings
INSERT INTO site_settings (key, value) VALUES
  ('og_default_image', ''),
  ('seo_fallback_title', 'pomegranate - Digital Marketing Agency'),
  ('seo_fallback_description', 'Full-service digital marketing agency offering SEO, web design, copywriting, and training.'),
  ('footer_tagline', 'pomegranate work to plant the seeds which become the roots of digital fruits.'),
  ('footer_copyright_year', '2026'),
  ('contact_email', 'info@pomegranate.marketing'),
  ('contact_phone', '+44 7544 348242'),
  ('whatsapp_url', 'https://wa.me/447544348242'),
  ('address', '')
ON CONFLICT (key) DO NOTHING;

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_client_logos_published ON client_logos(published);
CREATE INDEX IF NOT EXISTS idx_client_logos_order ON client_logos(display_order);
CREATE INDEX IF NOT EXISTS idx_navigation_section ON navigation(section);
CREATE INDEX IF NOT EXISTS idx_navigation_published ON navigation(published);
CREATE INDEX IF NOT EXISTS idx_navigation_order ON navigation("order");
CREATE INDEX IF NOT EXISTS idx_services_hub ON services(is_featured_on_hub, hub_order);
CREATE INDEX IF NOT EXISTS idx_industries_hub ON industries(is_featured_on_hub, hub_order);
