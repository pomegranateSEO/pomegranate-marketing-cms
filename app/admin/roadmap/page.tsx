
import React from 'react';
import { FileCode, Copy, Terminal, LayoutTemplate, Box, ArrowRight, Database, Bot } from 'lucide-react';
import { Button } from '../../../components/ui/button';

export default function RoadmapPage() {
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const dbSchemaContext = `
-- POMEGRANATE CMS SCHEMA CONTEXT
-- Provide this to your AI Agent to teach it the database structure.

-- 1. BUSINESS (Root Entity)
-- Table: businesses
-- Columns: id (uuid), name, legal_name, description, logo_url, global_theme (jsonb: colors, fonts), social_links (jsonb array), contact details.

-- 2. SERVICES (Shared Content)
-- Table: services
-- Columns: id, business_id, name, base_slug, short_description, shared_content_blocks (jsonb: process_html, pricing_html).

-- 3. LOCATIONS (Multipliers)
-- Table: target_locations
-- Columns: id, business_id, name, slug, address_region, landmarks_list (text[]), geo_data (jsonb: lat, lng).

-- 4. GENERATED PAGES (pSEO Instances)
-- Table: pseo_page_instances
-- Columns: id, service_id, location_id, url_slug, seo_title, seo_meta_desc, 
--          unique_hero (jsonb: headline, subheadline), unique_local_context (jsonb: content),
--          published (boolean).

-- 5. BLOG POSTS
-- Table: blog_posts
-- Columns: id, headline, slug, content_body, featured_image_url, published.

-- 6. STATIC PAGES
-- Table: pages
-- Columns: id, title, slug, content_html, page_type (e.g. 'AboutPage').

-- RELATIONSHIPS:
-- businesses.id -> services.business_id
-- businesses.id -> target_locations.business_id
-- services.id + target_locations.id -> pseo_page_instances (The generated pages)
`;

  const agentPrompt = `I am building a Next.js 14 website using the App Router and Tailwind CSS.
I have a Supabase backend that acts as a Headless CMS.

Here is the Database Schema Context for my CMS:
[PASTE THE COPIED SCHEMA CONTEXT HERE]

My goal is to build the frontend.
1. Create a Supabase client in 'lib/supabase.ts'.
2. Create a 'components/VisualContentRenderer.tsx' to handle markdown and custom shortcodes like [[COMPARTMENT:cta]].
3. Create the dynamic route 'app/[service]/[location]/page.tsx' to fetch data from 'pseo_page_instances'.

Please guide me step-by-step, starting with the Supabase client setup.`;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-12">
      
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
          <FileCode className="h-8 w-8 text-purple-600" />
          Frontend Integration Roadmap
        </h1>
        <p className="text-slate-500 mt-3 max-w-3xl text-lg leading-relaxed">
          Pomegranate is a <strong>Headless CMS</strong>. This means your content lives here in the database, but your website (the "Head") needs to be built separately to display it. 
          Follow this guide to connect a Next.js frontend to your Pomegranate data.
        </p>
      </div>

      {/* STEP 1: AI AGENT STRATEGY */}
      <section className="bg-white border rounded-xl p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Bot className="h-32 w-32 text-purple-900" />
        </div>
        
        <h2 className="text-2xl font-bold text-slate-900 mb-4">1. The "AI Agent" Strategy</h2>
        <div className="prose text-slate-600 max-w-none">
          <p>
            You do not need to be a coding expert to build this frontend. We strongly recommend using an AI Coding Assistant.
            Tools like <strong>Cursor</strong>, <strong>Windsurf</strong>, or <strong>Claude 3.5 Sonnet</strong> can write 90% of the code for you if given the right context.
          </p>
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mt-4 flex gap-4 items-start">
             <div className="bg-white p-2 rounded-full shadow-sm text-blue-600">
                <Terminal className="h-5 w-5" />
             </div>
             <div>
                <h3 className="font-bold text-blue-900">How to prompt your AI Agent</h3>
                <p className="text-sm text-blue-800 mt-1 mb-3">
                   Copy the context block below. Paste it into your AI chat as the very first message. 
                   This teaches the AI exactly how your data is structured so it writes correct code instantly.
                </p>
                
                <div className="relative group">
                  <pre className="bg-slate-900 text-slate-50 p-4 rounded-md text-xs font-mono overflow-x-auto whitespace-pre-wrap border border-slate-700">
                    {dbSchemaContext.trim()}
                  </pre>
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => copyToClipboard(dbSchemaContext)}
                  >
                    <Copy className="h-3 w-3 mr-2" /> Copy Context
                  </Button>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* STEP 2: SETUP */}
      <section>
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
           <span className="bg-slate-100 text-slate-500 w-8 h-8 flex items-center justify-center rounded-full text-sm">2</span>
           Project Setup
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-white p-6 rounded-lg border">
              <h3 className="font-bold text-slate-800 mb-2">Tech Stack</h3>
              <ul className="space-y-2 text-sm text-slate-600 list-disc pl-4">
                 <li><strong>Framework:</strong> Next.js 14 (App Router)</li>
                 <li><strong>Styling:</strong> Tailwind CSS</li>
                 <li><strong>Data Fetching:</strong> Supabase JS Client</li>
                 <li><strong>Deployment:</strong> Vercel</li>
              </ul>
           </div>
           <div className="bg-white p-6 rounded-lg border">
              <h3 className="font-bold text-slate-800 mb-2">Environment Variables</h3>
              <p className="text-sm text-slate-500 mb-3">You will need these from your Supabase Project Settings.</p>
              <code className="block bg-slate-100 p-3 rounded text-xs font-mono text-slate-700">
                 NEXT_PUBLIC_SUPABASE_URL=https://...<br/>
                 NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
              </code>
           </div>
        </div>
      </section>

      {/* STEP 3: TEMPLATES */}
      <section>
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
           <span className="bg-slate-100 text-slate-500 w-8 h-8 flex items-center justify-center rounded-full text-sm">3</span>
           Required Templates
        </h2>
        <div className="grid grid-cols-1 gap-4">
           {/* Service Location Page */}
           <div className="bg-white border-l-4 border-green-500 rounded-r-lg p-5 shadow-sm">
              <div className="flex justify-between items-start">
                 <div>
                    <h3 className="font-bold text-slate-800">The pSEO Page Template</h3>
                    <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 mt-1 inline-block">app/[service]/[location]/page.tsx</code>
                 </div>
                 <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded font-bold">CRITICAL</span>
              </div>
              <p className="text-sm text-slate-600 mt-3">
                 This is your money maker. It needs to fetch data from the <code>pseo_page_instances</code> table.
              </p>
              <div className="mt-4 bg-slate-50 p-3 rounded text-xs font-mono text-slate-500">
                 const &#123; data &#125; = await supabase<br/>
                 &nbsp;&nbsp;.from('pseo_page_instances')<br/>
                 &nbsp;&nbsp;.select('*, service:services(*), location:target_locations(*)')<br/>
                 &nbsp;&nbsp;.eq('url_slug', params.slug)<br/>
                 &nbsp;&nbsp;.single();
              </div>
           </div>

           {/* Standard Pages */}
           <div className="bg-white border-l-4 border-blue-500 rounded-r-lg p-5 shadow-sm">
              <div className="flex justify-between items-start">
                 <div>
                    <h3 className="font-bold text-slate-800">Standard Page Template</h3>
                    <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 mt-1 inline-block">app/[slug]/page.tsx</code>
                 </div>
                 <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded font-bold">CORE</span>
              </div>
              <p className="text-sm text-slate-600 mt-3">
                 Handles About, Contact, Privacy Policy. Fetches from the <code>pages</code> table.
              </p>
           </div>

           {/* Collection Pages */}
           <div className="bg-white border-l-4 border-purple-500 rounded-r-lg p-5 shadow-sm">
              <div className="flex justify-between items-start">
                 <div>
                    <h3 className="font-bold text-slate-800">Collection Pages (Hubs)</h3>
                    <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 mt-1 inline-block">app/blog/page.tsx, app/locations/page.tsx</code>
                 </div>
                 <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded font-bold">NAVIGATION</span>
              </div>
              <p className="text-sm text-slate-600 mt-3">
                 Lists items (Blog Posts, Locations, Industries). Essential for internal linking and site structure.
              </p>
           </div>
        </div>
      </section>

      {/* STEP 4: COMPONENTS */}
      <section>
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
           <span className="bg-slate-100 text-slate-500 w-8 h-8 flex items-center justify-center rounded-full text-sm">4</span>
           Key Components
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           <div className="bg-white p-4 rounded-lg border shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                 <Box className="h-5 w-5 text-slate-400" />
                 <h3 className="font-bold text-slate-700">VisualContentRenderer</h3>
              </div>
              <p className="text-xs text-slate-500">
                 A smart component that parses your content. It converts markdown to HTML and replaces Shortcodes (like <code>[[COMPARTMENT:cta]]</code>) with actual UI blocks.
              </p>
           </div>
           
           <div className="bg-white p-4 rounded-lg border shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                 <LayoutTemplate className="h-5 w-5 text-slate-400" />
                 <h3 className="font-bold text-slate-700">CTABlock</h3>
              </div>
              <p className="text-xs text-slate-500">
                 Fetches a Call-To-Action from the database by ID and displays it.
              </p>
           </div>

           <div className="bg-white p-4 rounded-lg border shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                 <Database className="h-5 w-5 text-slate-400" />
                 <h3 className="font-bold text-slate-700">SchemaInjector</h3>
              </div>
              <p className="text-xs text-slate-500">
                 Takes the <code>schema_json_ld</code> JSON from the database and inserts it into the page <code>&lt;head&gt;</code> for Google.
              </p>
           </div>
        </div>
      </section>

      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
         <h3 className="text-lg font-bold text-green-900 mb-2">Ready to Start?</h3>
         <p className="text-green-800 mb-6">
            Open your AI Coding Assistant, paste the "Database Context" from Step 1, and ask it to "Initialize the Next.js project structure".
         </p>
         <Button onClick={() => copyToClipboard(agentPrompt)} className="bg-green-600 hover:bg-green-700 text-white">
            <Copy className="h-4 w-4 mr-2" /> Copy "Start Project" Prompt
         </Button>
      </div>

    </div>
  );
}
