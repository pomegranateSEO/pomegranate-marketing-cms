
import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { supabase } from './lib/supabaseClient';
import { Sidebar } from './components/layout/Sidebar';
import DashboardPage from './app/admin/page';
import BusinessPage from './app/admin/businesses/page';
import ServicesPage from './app/admin/services/page';
import LocationsPage from './app/admin/locations/page';
import KnowledgeEntitiesPage from './app/admin/knowledge-entities/page';
import PagesPage from './app/admin/pages/page';
import PostsPage from './app/admin/posts/page';
import ReviewsPage from './app/admin/reviews/page';
import DownloadsPage from './app/admin/downloads/page';
import ToolsPage from './app/admin/tools/page';
import IndustriesPage from './app/admin/industries/page';
import CaseStudiesPage from './app/admin/case-studies/page';
import AssociatesPage from './app/admin/associates/page';
import MediaPage from './app/admin/media/page';
import LoginPage from './app/auth/page';
import GenerationPage from './app/admin/generation/page';
import BlogTopicsPage from './app/admin/blog-topics/page';
import PeoplePage from './app/admin/people/page';
import { Loader2 } from 'lucide-react';

// Placeholder components for routes not yet implemented in Phase 1
const Placeholder = ({ title }: { title: string }) => (
  <div className="p-8">
    <h1 className="text-2xl font-bold mb-4">{title}</h1>
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
      Pending Phase 2 Implementation
    </div>
  </div>
);

function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If not authenticated, force Login Page
  if (!session) {
    return <LoginPage />;
  }

  // Authenticated Layout
  return (
    <Router>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/admin" replace />} />
            <Route path="/admin" element={<DashboardPage />} />
            
            {/* Core Data */}
            <Route path="/admin/businesses" element={<BusinessPage />} />
            <Route path="/admin/services" element={<ServicesPage />} />
            <Route path="/admin/industries" element={<IndustriesPage />} />
            <Route path="/admin/locations" element={<LocationsPage />} />
            <Route path="/admin/knowledge-entities" element={<KnowledgeEntitiesPage />} />
            
            {/* Content Management */}
            <Route path="/admin/blog-topics" element={<BlogTopicsPage />} />
            <Route path="/admin/media" element={<MediaPage />} />
            <Route path="/admin/pages" element={<PagesPage />} />
            <Route path="/admin/posts" element={<PostsPage />} />
            <Route path="/admin/case-studies" element={<CaseStudiesPage />} />
            <Route path="/admin/reviews" element={<ReviewsPage />} />
            <Route path="/admin/associates" element={<AssociatesPage />} />
            <Route path="/admin/downloads" element={<DownloadsPage />} />
            <Route path="/admin/tools" element={<ToolsPage />} />
            
            <Route path="/admin/generation" element={<GenerationPage />} />
            <Route path="/admin/people" element={<PeoplePage />} />
          </Routes>
        </main>
      </div>
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          style: {
            fontFamily: 'inherit',
          },
        }}
      />
    </Router>
  );
}

export default App;
