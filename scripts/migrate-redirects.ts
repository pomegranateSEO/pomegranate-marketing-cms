/**
 * Migration script to import WordPress redirects to Supabase
 * Simpler version: handle known mappings, mark unknowns for manual review
 * 
 * Usage: npx tsx scripts/migrate-redirects.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// =====================================================
// KNOWN POST ID → NEW URL MAPPINGS
// Based on wp_posts.sql analysis and new site structure
// =====================================================

const POST_ID_MAPPINGS: Record<string, string> = {
  // Homepage
  '7': '/',// Main page
  
  // Blog
  '8': '/blog',// seo-blog-uk page
  
  // About
  '208': '/about',
  
  // Contact / Quote
  '602': '/contact',// get-a-free-quote, seo-quote
  
  // Downloads
  '620': '/downloads',
  
  // Services - all redirect to /seo-service
  '554': '/seo-service', //Services page (national-seo-packages)
  '675': '/seo-service', // local-seo
  '634': '/seo-service', // on-page-seo-services
  '704': '/seo-service', // digital-pr, seo-and-link-building
  '614': '/seo-service', // keyword-research, keyword-search-service
  '638': '/seo-service', // seo-content-writing
  '648': '/seo-service', // technical-seo
  '785': '/seo-service', // advisory-and-corporate-seo-packages
  '837': '/seo-service', // seo-for-small-business, google-seo-consultants
  '821': '/seo-service', // london-seo-consultants
  '808': '/seo-service', // marketing-company-waltham-forest
  
  // Free Tools
  '575': '/free-tools/seo-audit-checker', // free-website-review
  
  // Web Design - redirect to /web-design
  // '735': '/web-design', // web-design page (if exists)
  
  // Blog posts - map to /blog/slug
  // These will be handled dynamically
};

// =====================================================
// PATH TRANSFORMATION RULES
// =====================================================

function transformPath(oldPath: string): string | null {
  // Normalize: ensure leading slash
  let path = oldPath.startsWith('/') ? oldPath : '/' + oldPath;
  
  // Skip sitemaps
  if (path.includes('sitemap')) return null;
  
  // Skip wp-admin, wp-login, etc.
  if (path.includes('wp-admin') || path.includes('wp-login') || path.includes('wp-content')) return null;
  
  // Homepage variants
  if (path === '/' || path === '') return '/';
  
  // UK prefix removal
  if (path.startsWith('/uk/')) {
    path = path.substring(3); // Remove /uk
  }
  
  // Old service URLs → new service pages
  const serviceRedirects: Record<string, string> = {
    '/services': '/seo-service',
    '/seo-services': '/seo-service',
    '/seo-service': '/seo-service',
    '/web-design-services': '/web-design',
    '/web-design': '/web-design',
    '/seo-training': '/seo-training',
    '/local-seo': '/seo-service',
    '/on-page-seo-services': '/seo-service',
    '/off-page-seo-company': '/seo-service',
    '/keyword-research-service': '/seo-service',
    '/keyword-search-service': '/seo-service',
    '/digital-pr': '/seo-service',
    '/digital-marketing-services': '/seo-service',
    '/seo-content-writing-services': '/seo-service',
    '/monthly-seo-services': '/seo-service',
    '/one-time-seo-package': '/seo-service',
    '/cheap-seo-packages': '/seo-service',
    '/get-a-free-quote': '/contact',
    '/get-a-free-seo-quote': '/contact',
    '/free-website-review': '/free-tools/seo-audit-checker',
    '/about-us': '/about',
    '/seo-blog-uk': '/blog',
    '/blog': '/blog',
    '/downloads': '/downloads',
    '/contact': '/contact',
  };
  
  if (serviceRedirects[path]) {
    return serviceRedirects[path];
  }
  
  // Industry URLs
  if (path.includes('/enterprise') || path.includes('enterprise-seo')) {
    return '/industries/enterprise';
  }
  if (path.includes('/ecommerce') || path.includes('ecommerce-seo')) {
    return '/industries/ecommerce';
  }
  if (path.includes('/fx-companies') || path.includes('fx') || path.includes('forex')) {
    return '/industries/fx-companies';
  }
  if (path.includes('/charities') || path.includes('charity') || path.includes('nonprofit')) {
    return '/industries/charities';
  }
  if (path.includes('/seo-for-web-developers') || path.includes('web-developers')) {
    return '/industries/seo-for-web-developers';
  }
  
  // Location URLs
  if (path.includes('/london') || path.includes('/marketing-company-in-waltham-forest')) {
    return '/locations';
  }
  
  return path;
}

// =====================================================
// RESOLVE REDIRECT
// =====================================================

function resolveRedirect(fromPath: string, toPath: string, hitCount: number): {
  from_path: string;
  to_path: string;
  status_code: number;
  hit_count: number;
  source: string;
  notes?: string;
} | null {
  // Skip query string redirects (?p=...) - these are WordPress internal
  if (fromPath.startsWith('?')) {
    // Try to resolve post ID from query
    const postIdMatch = fromPath.match(/\?p=(\d+)/);
    if (postIdMatch) {
      const postId = postIdMatch[1];
      const newUrl = POST_ID_MAPPINGS[postId];
      if (newUrl) {
        return {
          from_path: `/?p=${postId}`,
          to_path: newUrl,
          status_code: 301,
          hit_count: hitCount,
          source: 'import',
          notes: `WordPress query redirect: ?p=${postId} → ${newUrl}`,
        };
      }
    }
    return null;
  }
  
  // Handle numeric to_path (WordPress post ID)
  const numericToPath = parseInt(toPath);
  if (!isNaN(numericToPath)) {
    const newUrl = POST_ID_MAPPINGS[toPath];
    if (newUrl) {
      const normalizedFrom = transformPath(fromPath);
      if (normalizedFrom) {
        return {
          from_path: normalizedFrom,
          to_path: newUrl,
          status_code: 301,
          hit_count: hitCount,
          source: 'import',
          notes: `WordPress post ID ${toPath} → ${newUrl}`,
        };
      }
    }
    // Unknown post ID - skip, will need manual handling
    console.log(`  Skipping: ${fromPath} → unknown post ID ${toPath}`);
    return null;
  }
  
  // Handle full URL as to_path
  if (toPath.startsWith('http')) {
    // Extract path from URL
    try {
      const url = new URL(toPath);
      if (url.hostname === 'pomegranate.marketing' || url.hostname === 'www.pomegranate.marketing') {
        // Internal URL - extract path
        const newPath = transformPath(url.pathname);
        if (newPath) {
          const normalizedFrom = transformPath(fromPath);
          if (normalizedFrom) {
            return {
              from_path: normalizedFrom,
              to_path: newPath,
              status_code: 301,
              hit_count: hitCount,
              source: 'import',
              notes: `Full URL redirect`,
            };
          }
        }
      }
      // External URL or sitemap - skip
      console.log(`  Skipping external/sitemap: ${toPath}`);
      return null;
    } catch {
      // Invalid URL
      return null;
    }
  }
  
  // Both are paths
  const normalizedFrom = transformPath(fromPath);
  const normalizedTo = transformPath(toPath);
  
  if (!normalizedFrom || !normalizedTo) {
    return null;
  }
  
  // Skip if from and to are same
  if (normalizedFrom === normalizedTo) {
    return null;
  }
  
  return {
    from_path: normalizedFrom,
    to_path: normalizedTo,
    status_code: 301,
    hit_count: hitCount,
    source: 'import',
  };
}

// =====================================================
// MAIN
// =====================================================

async function main() {
  console.log('Redirect Migration Script');
  console.log('=========================\n');
  
  const csvPath = path.resolve(__dirname, '../../TEST NEW POMEGRANATE WEBSITE 13-03-2026/commercial content migration & redirects/2026-03-16-redirects-export.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.error(`CSV file not found: ${csvPath}`);
    process.exit(1);
  }
  
  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.trim().split('\n');
  
  console.log(`Processing ${lines.length} lines from CSV...\n`);
  
  const redirects: Array<ReturnType<typeof resolveRedirect>> = [];
  
  for (const line of lines) {
    const parts = line.split(',');
    if (parts.length < 3) continue;
    
    const statusCode = parseInt(parts[0]);
    const fromPath = parts[1].trim();
    const toPath = parts[2].trim();
    const hitCount = parts.length > 3 ? parseInt(parts[3]) || 0 : 0;
    
    if (statusCode !== 301) continue;
    
    const redirect = resolveRedirect(fromPath, toPath, hitCount);
    if (redirect) {
      redirects.push(redirect);
    }
  }
  
  console.log(`\nProcessed ${redirects.length} valid redirects\n`);
  
  // Deduplicate by from_path
  const uniqueRedirects = new Map<string, typeof redirects[0]>();
  for (const r of redirects) {
    if (r &&!uniqueRedirects.has(r.from_path)) {
      uniqueRedirects.set(r.from_path, r);
    }
  }
  
  console.log(`Unique redirects: ${uniqueRedirects.size}\n`);
  
  // Insert into Supabase
  const redirectArray = Array.from(uniqueRedirects.values());
  const BATCH_SIZE = 50;
  let inserted = 0;
  
  console.log('Inserting redirects into Supabase...');
  
  for (let i = 0; i < redirectArray.length; i += BATCH_SIZE) {
    const batch = redirectArray.slice(i, i + BATCH_SIZE);
    
    const { data, error } = await supabase
      .from('redirects')
      .upsert(batch, { onConflict: 'from_path' })
      .select();
    
    if (error) {
      console.error(`Batch error: ${error.message}`);
      console.error('Problem batch:', batch.slice(0, 2));
    } else {
      inserted += data?.length || 0;
      console.log(`  Inserted ${inserted}/${redirectArray.length}`);
    }
  }
  
  console.log(`\nDone! Inserted ${inserted} redirects.`);
  console.log(`\nNote: Some post IDs may need manual mapping in CMS admin panel.`);
}

main().catch(console.error);