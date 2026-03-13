
import React, { useState, useEffect } from 'react';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { 
  Star, Download, Wrench, X, Check, Award, Users, PenTool
} from 'lucide-react';
import { fetchServices } from '../../lib/db/services';
import { fetchTools } from '../../lib/db/tools';
import { fetchCaseStudies } from '../../lib/db/case-studies';
import { fetchAssociates } from '../../lib/db/associates';
import { supabase } from '../../lib/supabaseClient';
import { AITextGenerator } from './AITextGenerator';
import { GlobalTheme } from '../../lib/types';

interface Props {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minHeight?: string;
  brandTheme?: GlobalTheme | null;
  keyword?: string;
}

type CompartmentType = 'reviews' | 'tool' | 'download' | 'case_study' | 'associates' | 'blog_posts' | null;

export const VisualContentEditor: React.FC<Props> = ({ 
  value, onChange, placeholder, minHeight = "min-h-[400px]",
  brandTheme, keyword 
}) => {
  const [activeCompartment, setActiveCompartment] = useState<CompartmentType>(null);
  
  // Data for selectors
  const [services, setServices] = useState<{id: string, name: string}[]>([]);
  const [tools, setTools] = useState<{id: string, name: string}[]>([]);
  const [caseStudies, setCaseStudies] = useState<{id: string, title: string}[]>([]);
  const [associates, setAssociates] = useState<{id: string, name: string}[]>([]);
  const [downloads, setDownloads] = useState<{name: string}[]>([]);

  // Selection states
  const [selectedId, setSelectedId] = useState<string>('');

useEffect(() => {
    if (activeCompartment === 'reviews') {
      fetchServices().then(data => setServices(data.map(s => ({ id: s.id, name: s.name }))));
    } else if (activeCompartment === 'tool') {
      fetchTools().then(data => setTools(data.map(t => ({ id: t.id, name: t.name }))));
    } else if (activeCompartment === 'case_study') {
      fetchCaseStudies().then(data => setCaseStudies(data.map(c => ({ id: c.id, title: c.title }))));
    } else if (activeCompartment === 'associates') {
      fetchAssociates().then(data => setAssociates(data.map(a => ({ id: a.id, name: a.name }))));
    } else if (activeCompartment === 'download') {
       supabase.storage.from('downloads').list().then(({ data }) => {
         if (data) setDownloads(data.map(f => ({ name: f.name })));
       });
    }
  }, [activeCompartment]);

  const insertShortcode = (shortcode: string) => {
    const newVal = value ? `${value}\n\n${shortcode}\n\n` : shortcode;
    onChange(newVal);
    setActiveCompartment(null);
    setSelectedId('');
  };

  const handleInsert = () => {
    if (!activeCompartment) return;

if (activeCompartment === 'reviews') {
       const serviceName = services.find(s => s.id === selectedId)?.name || 'All';
       insertShortcode(`[[COMPARTMENT:reviews|service_id=${selectedId}|title=Reviews for ${serviceName}]]`);
    } else if (activeCompartment === 'tool') {
       const toolName = tools.find(t => t.id === selectedId)?.name || 'Tool';
       insertShortcode(`[[COMPARTMENT:tool|tool_id=${selectedId}|title=${toolName}]]`);
    } else if (activeCompartment === 'download') {
       insertShortcode(`[[COMPARTMENT:download|file=${selectedId}]]`);
    } else if (activeCompartment === 'case_study') {
       if (selectedId === 'latest') {
          insertShortcode(`[[COMPARTMENT:case_studies|limit=3|title=Success Stories]]`);
       } else {
          insertShortcode(`[[COMPARTMENT:case_studies|id=${selectedId}]]`);
       }
    } else if (activeCompartment === 'associates') {
       if (selectedId === 'all_orgs') {
          insertShortcode(`[[COMPARTMENT:associates|type=organization|title=Our Partners]]`);
       } else {
          insertShortcode(`[[COMPARTMENT:associates|id=${selectedId}]]`);
       }
    } else if (activeCompartment === 'blog_posts') {
       insertShortcode(`[[COMPARTMENT:blog_posts|limit=3|title=Latest Insights]]`);
    }
  };

  return (
    <div className="border rounded-md bg-white shadow-sm overflow-hidden relative">
      {/* Toolbar */}
<div className="flex items-center gap-2 p-2 border-b bg-slate-50 overflow-x-auto whitespace-nowrap pr-12">
         <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">Insert:</span>
         
         <Button type="button" variant="ghost" size="sm" onClick={() => setActiveCompartment('reviews')} className="text-slate-600 hover:text-amber-600 hover:bg-amber-50">
           <Star className="h-4 w-4 mr-2" /> Reviews
         </Button>
         
         <Button type="button" variant="ghost" size="sm" onClick={() => setActiveCompartment('case_study')} className="text-slate-600 hover:text-indigo-600 hover:bg-indigo-50">
           <Award className="h-4 w-4 mr-2" /> Case Study
         </Button>

         <Button type="button" variant="ghost" size="sm" onClick={() => setActiveCompartment('associates')} className="text-slate-600 hover:text-pink-600 hover:bg-pink-50">
           <Users className="h-4 w-4 mr-2" /> Partner Org
         </Button>
         
         <Button type="button" variant="ghost" size="sm" onClick={() => setActiveCompartment('tool')} className="text-slate-600 hover:text-blue-600 hover:bg-blue-50">
           <Wrench className="h-4 w-4 mr-2" /> Tool
         </Button>
         
         <Button type="button" variant="ghost" size="sm" onClick={() => setActiveCompartment('download')} className="text-slate-600 hover:text-green-600 hover:bg-green-50">
           <Download className="h-4 w-4 mr-2" /> Download
         </Button>

         <Button type="button" variant="ghost" size="sm" onClick={() => setActiveCompartment('blog_posts')} className="text-slate-600 hover:text-orange-600 hover:bg-orange-50">
           <PenTool className="h-4 w-4 mr-2" /> Latest Posts
         </Button>
      </div>

      {/* AI Button floating or integrated */}
      <div className="absolute top-2 right-2">
         <AITextGenerator 
            onGenerate={(txt) => onChange(txt)} 
            fieldName="Body Content" 
            currentValue={value} 
            keyword={keyword}
            brandTheme={brandTheme}
         />
      </div>

      {/* Configuration Panel */}
      {activeCompartment && (
        <div className="bg-slate-100 p-3 border-b flex items-center gap-3 animate-in slide-in-from-top-2">
<div className="flex-1">
               {activeCompartment === 'reviews' && (
                  <select className="w-full text-sm rounded border p-1.5" onChange={(e) => setSelectedId(e.target.value)}>
                    <option value="">-- Select Service to Filter Reviews --</option>
                    <option value="all">All Reviews</option>
                    {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
               )}
               {activeCompartment === 'tool' && (
                  <select className="w-full text-sm rounded border p-1.5" onChange={(e) => setSelectedId(e.target.value)}>
                    <option value="">-- Select Free Tool --</option>
                    {tools.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
               )}
               {activeCompartment === 'download' && (
                  <select className="w-full text-sm rounded border p-1.5" onChange={(e) => setSelectedId(e.target.value)}>
                    <option value="">-- Select File --</option>
                    {downloads.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                  </select>
               )}
               {activeCompartment === 'case_study' && (
                   <select className="w-full text-sm rounded border p-1.5" onChange={(e) => setSelectedId(e.target.value)}>
                    <option value="">-- Select Case Study --</option>
                    <option value="latest">Latest 3 Case Studies</option>
                    {caseStudies.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
               )}
               {activeCompartment === 'associates' && (
                   <select className="w-full text-sm rounded border p-1.5" onChange={(e) => setSelectedId(e.target.value)}>
                    <option value="">-- Select Partner Organization --</option>
                    <option value="all_orgs">All Partner Organizations</option>
                    {associates.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
               )}
               {activeCompartment === 'blog_posts' && (
                   <div className="text-xs text-slate-500 font-medium">Inserts a grid of the 3 most recent blog posts.</div>
               )}
            </div>
           
           <div className="flex gap-1">
             <Button 
               type="button" 
               size="sm" 
               onClick={handleInsert} 
               disabled={activeCompartment !== 'blog_posts' && !selectedId}
             >
               <Check className="h-4 w-4" />
             </Button>
             <Button type="button" size="sm" variant="ghost" onClick={() => setActiveCompartment(null)}>
               <X className="h-4 w-4" />
             </Button>
           </div>
        </div>
      )}

      {/* Text Area */}
      <Textarea 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className={`border-0 rounded-none focus-visible:ring-0 p-4 font-mono text-sm leading-relaxed ${minHeight}`}
        placeholder={placeholder || "# Write your content here...\n\nUse the toolbar above to insert dynamic compartments."}
      />
      
      <div className="bg-slate-50 p-2 text-xs text-slate-400 border-t flex justify-between">
         <span>Markdown Supported</span>
         <span>Shortcodes: [[COMPARTMENT:type|...]]</span>
      </div>
    </div>
  );
};
