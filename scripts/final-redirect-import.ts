import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Full redirect mappings from WordPress export
const REDIRECTS = [
  // Homepage variants
  { from: '/http://pomegranate.marketing/', to: '/', hits: 0 },
  { from: '/http://pomegranate.marketing', to: '/', hits: 0 },
  { from: '/http://www.pomegranate.marketing', to: '/', hits: 0 },
  { from: '/http://www.pomegranate.marketing/', to: '/', hits: 0 },
  { from: '/https://pomegranate.marketing', to: '/', hits: 0 },
  { from: '/https://www.pomegranate.marketing/', to: '/', hits: 0 },
  { from: '/https://www.pomegranate.marketing', to: '/', hits: 0 },
  { from: '/the-seo-company-for-small-businesses', to: '/', hits: 2 },
  { from: '/the-seo-company-for-small-businesses-1', to: '/', hits: 3 },
  { from: '/seo-london-uk', to: '/', hits: 0 },
  { from: '/digital-marketing-services', to: '/', hits: 5 },
  
  // About
  { from: '/about-us', to: '/about', hits: 127 },
  
  // Blog
  { from: '/blog', to: '/blog', hits: 14 },
  { from: '/post_tag-sitemap.xml', to: '/blog', hits: 21 },
  { from: '/uk/seo-blog-topics', to: '/blog', hits: 82 },
  { from: '/uk/seo-blog-topics/welcome-to-pomegranate', to: '/blog', hits: 61 },
  { from: '/uk/seo-blog-topics/what-is-technical-seo-really', to: '/blog', hits: 23 },
  { from: '/uk/seo-blog-topics/general-process-and-pricing', to: '/blog', hits: 11 },
  
  // Blog posts
  { from: '/seo-blog-uk/why-keyword-research-is-important-in-seo-2/', to: '/blog/why-keyword-research-is-important-in-seo', hits: 38 },
  { from: '/uk/seo-blog-topics/why-keyword-research-is-important-in-seo', to: '/blog/why-keyword-research-is-important-in-seo', hits: 35 },
  { from: '/uk/seo-blog-topics/why-should-i-do-keyword-research', to: '/blog/why-should-i-do-keyword-research', hits: 24 },
  { from: '/uk/seo-blog-topics/how-much-do-seo-consultants-charge', to: '/blog/how-much-do-seo-consultants-charge', hits: 45 },
  { from: '/uk/seo-blog-topics/how-much-do-seo-companies-make', to: '/blog/how-much-do-seo-companies-make', hits: 18 },
  { from: '/uk/seo-blog-topics/how-does-local-seo-work', to: '/blog/how-does-local-seo-work', hits: 26 },
  { from: '/uk/seo-blog-topics/why-is-on-page-seo-important', to: '/blog/why-is-on-page-seo-important', hits: 29 },
  { from: '/uk/seo-blog-topics/why-content-marketing-is-important', to: '/blog/why-content-marketing-is-important', hits: 13 },
  { from: '/uk/seo-blog-topics/what-is-off-page-seo-in-simple-words', to: '/blog/what-is-off-page-seo-in-simple-words', hits: 36 },
  { from: '/uk/seo-blog-topics/what-is-link-building-why-is-it-important', to: '/blog/what-is-link-building-why-is-it-important', hits: 27 },
  { from: '/uk/seo-blog-topics/backlinks-with-high-domain-authority-in-2024', to: '/blog/backlinks-with-high-domain-authority', hits: 144 },
  { from: '/uk/seo-blog-topics/seo-vs-ads', to: '/blog/seo-vs-ads', hits: 31 },
  { from: '/uk/seo-blog-topics/small-business-local-seo', to: '/blog/small-business-local-seo', hits: 46 },
  { from: '/ai-and-seo-optimise-for-generative-search', to: '/blog/ai-and-seo-optimise-for-generative-search', hits: 457 },
  { from: '/uk/seo-blog-topics/seo-quotes-for-instagram', to: '/blog/seo-quotes-for-instagram', hits: 139 },
  { from: '/uk/seo-blog-uk/seo-quote-template/', to: '/blog/seo-quote-template', hits: 239 },
  { from: '/uk/seo-blog-topics/seo-quote-template', to: '/blog/seo-quote-template', hits: 77 },
  { from: '/uk/seo-blog-topics/seo-quote', to: '/blog/understanding-seo-quotes', hits: 322 },
  { from: '/uk/seo-blog-topics/seo-and-blogging', to: '/blog/seo-and-blogging', hits: 69 },
  { from: '/uk/seo-blog-topics/pomegranate-marketing-strategy', to: '/blog/pomegranate-marketing-strategy', hits: 53 },
  { from: '/uk/seo-blog-topics/seo-or-ads', to: '/blog/seo-vs-ads', hits: 4 },
  { from: '/seo-blog-topics-seo-quote-template', to: '/blog/seo-quote-template', hits: 0 },
  { from: '/seo-blog-uk-seo-ads', to: '/blog/understanding-roi-of-seo-ads', hits: 0 },
  { from: '/seo-blog-uk-seo-organic', to: '/blog/mastering-seo-organic', hits: 0 },
  { from: '/seo-blog-topics-small-business-local-seo', to: '/blog/small-business-local-seo', hits: 0 },
  { from: '/seo-blog-topics-seo-vs-ads', to: '/blog/seo-vs-ads', hits: 0 },
  { from: '/uk/seo-blog-topics/tag/technical SEO', to: '/blog', hits: 14 },
  { from: '/uk/seo-blog-topics/tag/ppc ads', to: '/blog', hits: 22 },
  { from: '/uk/seo-blog-topics/tag/partners', to: '/blog', hits: 8 },
  { from: '/uk/seo-blog-topics/tag/on page SEO', to: '/blog', hits: 10 },
  { from: '/uk/seo-blog-topics/tag/off page seo', to: '/blog', hits: 10 },
  { from: '/uk/seo-blog-topics/tag/local seo', to: '/blog', hits: 30 },
  { from: '/uk/seo-blog-topics/tag/link building', to: '/blog', hits: 6 },
  { from: '/uk/seo-blog-topics/tag/keyword research', to: '/blog', hits: 8 },
  { from: '/uk/seo-blog-topics/tag/google ads', to: '/blog', hits: 15 },
  { from: '/uk/seo-blog-topics/tag/content marketing', to: '/blog', hits: 6 },
  { from: '/uk/seo-blog-topics/tag/backlinks', to: '/blog', hits: 6 },
  { from: '/uk/seo-blog-topics/category/seoquote', to: '/blog', hits: 6 },
  
  // Morocco location
  { from: '/seo-specialist-in-morocco/', to: '/locations', hits: 539 },
  
  // Services
  { from: '/uk/national-seo-packages', to: '/seo-service', hits: 103 },
  { from: '/uk/services', to: '/seo-service', hits: 18 },
  { from: '/uk/seo-plans-and-pricing', to: '/seo-service', hits: 60 },
  { from: '/uk/one-time-seo-package', to: '/seo-service', hits: 17 },
  { from: '/uk/monthly-seo-services', to: '/seo-service', hits: 41 },
  { from: '/uk/cheap-seo-packages', to: '/seo-service', hits: 13 },
  { from: '/uk/technical-seo-company', to: '/seo-service', hits: 37 },
  { from: '/uk/on-page-seo-services', to: '/seo-service', hits: 42 },
  { from: '/uk/off-page-seo-company', to: '/seo-service', hits: 19 },
  { from: '/uk/seo-and-link-building-services', to: '/seo-service', hits: 48 },
  { from: '/uk/keyword-research-service', to: '/seo-service', hits: 46 },
  { from: '/uk/keyword-search-service', to: '/seo-service', hits: 12 },
  { from: '/digital-pr', to: '/seo-service', hits: 7 },
  { from: '/seo-content-writing-services', to: '/seo-service', hits: 5 },
  { from: '/local-seo', to: '/seo-service', hits: 6 },
  { from: '/seo-london-uk', to: '/seo-service', hits: 0 },
  
  // Enterprises / Industries  
  { from: '/uk/seo-packages-for-small-business', to: '/industries/enterprise', hits: 15 },
  { from: '/uk/advisory-and-corporate-seo-packages', to: '/industries/enterprise', hits: 79 },
  { from: '/uk/seo-for-small-business-london', to: '/industries/enterprise', hits: 20 },
  { from: '/uk/growth-seo-small-business-package', to: '/industries/enterprise', hits: 68 },
  { from: '/uk/google-seo-consultants-london', to: '/industries/enterprise', hits: 47 },
  { from: '/uk/london-seo-consultants', to: '/seo-service', hits: 27 },
  { from: '/uk/seo-company-in-london', to: '/seo-service', hits: 4 },
  { from: '/uk/london-local-seo', to: '/seo-service', hits: 36 },
  { from: '/uk/local-seo-for-small-business', to: '/seo-service', hits: 22 },
  { from: '/uk/local-seo-consultants-in-london', to: '/seo-service', hits: 74 },
  { from: '/uk/local-seo-consultant-london', to: '/seo-service', hits: 21 },
  
  // Contact / Quote
  { from: '/get-a-free-quote', to: '/contact', hits: 9 },
  { from: '/get-a-free-seo-quote', to: '/contact', hits: 155 },
  { from: '/online-seo-qu
