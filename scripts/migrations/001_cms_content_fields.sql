-- Migration: Add CMS Content Fields
-- Date: 2026-03-19
-- Description: Adds CMS fields for homepage stats, featured tools, blog section title, 404 page content, footer/social fields, tool page content, legal pages, and email templates

-- 1. Add CMS fields to pages table
ALTER TABLE pages
ADD COLUMN IF NOT EXISTS stats JSONB,
ADD COLUMN IF NOT EXISTS featured_tools JSONB,
ADD COLUMN IF NOT EXISTS blog_section_title TEXT,
ADD COLUMN IF NOT EXISTS heading TEXT,
ADD COLUMN IF NOT EXISTS subheading TEXT,
ADD COLUMN IF NOT EXISTS cta_text TEXT,
ADD COLUMN IF NOT EXISTS cta_url TEXT;

COMMENT ON COLUMN pages.stats IS 'Homepage stats bar: [{"label": "Years in Business", "value": "7", "suffix": "+"}]';
COMMENT ON COLUMN pages.featured_tools IS 'Homepage featured tools: [{"title": "Tool Name", "description": "...", "href": "/path", "icon": "IconName"}]';
COMMENT ON COLUMN pages.blog_section_title IS 'Blog section heading for homepage';
COMMENT ON COLUMN pages.heading IS '404 page heading';
COMMENT ON COLUMN pages.subheading IS '404 page subheading';
COMMENT ON COLUMN pages.cta_text IS '404 page CTA button text';
COMMENT ON COLUMN pages.cta_url IS '404 page CTA button URL';

-- 2. Add CMS fields to businesses table
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS footer_tagline TEXT,
ADD COLUMN IF NOT EXISTS footer_copyright_text TEXT,
ADD COLUMN IF NOT EXISTS social_twitter TEXT,
ADD COLUMN IF NOT EXISTS social_linkedin TEXT,
ADD COLUMN IF NOT EXISTS social_facebook TEXT,
ADD COLUMN IF NOT EXISTS social_instagram TEXT;

COMMENT ON COLUMN businesses.footer_tagline IS 'Footer tagline text';
COMMENT ON COLUMN businesses.footer_copyright_text IS 'Custom footer copyright text';
COMMENT ON COLUMN businesses.social_twitter IS 'Twitter/X profile URL';
COMMENT ON COLUMN businesses.social_linkedin IS 'LinkedIn profile URL';
COMMENT ON COLUMN businesses.social_facebook IS 'Facebook profile URL';
COMMENT ON COLUMN businesses.social_instagram IS 'Instagram profile URL';

-- 3. Add CMS fields to free_tools table
ALTER TABLE free_tools
ADD COLUMN IF NOT EXISTS instructions TEXT,
ADD COLUMN IF NOT EXISTS output_description TEXT,
ADD COLUMN IF NOT EXISTS meta_description TEXT;

COMMENT ON COLUMN free_tools.instructions IS 'Step-by-step instructions for tool page';
COMMENT ON COLUMN free_tools.output_description IS 'Description of tool output/results';
COMMENT ON COLUMN free_tools.meta_description IS 'SEO meta description for tool page';

-- 4. Create legal_pages table
CREATE TABLE IF NOT EXISTS legal_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT DEFAULT '',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on legal_pages
ALTER TABLE legal_pages ENABLE ROW LEVEL SECURITY;

-- RLS policies for legal_pages
CREATE POLICY "Allow read access to legal_pages" ON legal_pages
    FOR SELECT USING (true);

CREATE POLICY "Allow admin insert on legal_pages" ON legal_pages
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin update on legal_pages" ON legal_pages
    FOR UPDATE USING (true);

-- 5. Create email_templates table
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_key VARCHAR(100) UNIQUE NOT NULL,
    subject VARCHAR(500) NOT NULL,
    body TEXT DEFAULT '',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on email_templates
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies for email_templates
CREATE POLICY "Allow read access to email_templates" ON email_templates
    FOR SELECT USING (true);

CREATE POLICY "Allow admin insert on email_templates" ON email_templates
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin update on email_templates" ON email_templates
    FOR UPDATE USING (true);

-- 6. Seed default legal pages
INSERT INTO legal_pages (slug, title, content) VALUES
    ('privacy-policy', 'Privacy Policy', '') ON CONFLICT (slug) DO NOTHING,
    ('terms-of-service', 'Terms of Service', '') ON CONFLICT (slug) DO NOTHING,
    ('cookie-policy', 'Cookie Policy', '') ON CONFLICT (slug) DO NOTHING;

-- 7. Seed default email templates
INSERT INTO email_templates (template_key, subject, body) VALUES
    ('contact_auto_reply', 'We received your message - pomegranate', '') ON CONFLICT (template_key) DO NOTHING,
    ('download_confirmation', 'Your download is ready - pomegranate', '') ON CONFLICT (template_key) DO NOTHING,
    ('audit_request_received', 'Your SEO audit request - pomegranate', '') ON CONFLICT (template_key) DO NOTHING,
    ('brand_check_submitted', 'Brand check submitted - pomegranate', '') ON CONFLICT (template_key) DO NOTHING;
