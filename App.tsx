
import React, { useEffect, useState, useCallback } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { supabase } from './lib/supabaseClient';
import { Sidebar } from './components/layout/Sidebar';
import { ThemeProvider, useTheme } from './lib/theme-provider';
import { useKeyboardShortcuts } from './lib/use-keyboard-shortcuts';
import { KeyboardShortcutsHelp } from './components/shared/KeyboardShortcutsHelp';
import { CommandPalette } from './components/shared/CommandPalette';
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
import RedirectsPage from './app/admin/redirects/page';
import ErrorLogsPage from './app/admin/error-logs/page';
import PricingPage from './app/admin/pricing/page';
import { Loader2 } from 'lucide-react';

const Placeholder = ({ title }: { title: string }) => (
  <div className="p-8">
    <h1 className="text-2xl font-bold mb-4">{title}</h1>
    <div className="p-4 bg-yellow-100/50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-yellow-800 dark:text-yellow-400">
      Pending Phase 2 Implementation
    </div>
  </div>
);

const SkipLink = () => (
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
  >
    Skip to main content
  </a>
);

function AuthenticatedApp() {
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const { toggleTheme } = useTheme();

  useKeyboardShortcuts([
    { key: '/', shift: true, handler: () => setShowShortcuts(true) },
    { key: 'k', ctrl: true, handler: () => setShowCommandPalette(prev => !prev) },
    { key: 'd', ctrl: true, shift: true, handler: toggleTheme },
    { key: 'Escape', handler: () => {
      setShowShortcuts(false);
      setShowCommandPalette(false);
    }},
  ]);

  useEffect(() => {
    const handleShowShortcuts = () => setShowShortcuts(true);
    window.addEventListener('show-shortcuts', handleShowShortcuts);
    return () => window.removeEventListener('show-shortcuts', handleShowShortcuts);
  }, []);

  return (
    <>
      <SkipLink />
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main id="main-content" role="main" className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/admin" replace />} />
            <Route path="/admin" element={<DashboardPage />} />
            <Route path="/admin/businesses" element={<BusinessPage />} />
            <Route path="/admin/services" element={<ServicesPage />} />
            <Route path="/admin/industries" element={<IndustriesPage />} />
            <Route path="/admin/locations" element={<LocationsPage />} />
            <Route path="/admin/knowledge-entities" element={<KnowledgeEntitiesPage />} />
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
            <Route path="/admin/redirects" element={<RedirectsPage />} />
            <Route path="/admin/error-logs" element={<ErrorLogsPage />} />
            <Route path="/admin/pricing" element={<PricingPage />} />
          </Routes>
        </main>
      </div>
      <KeyboardShortcutsHelp isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
      <CommandPalette isOpen={showCommandPalette} onClose={() => setShowCommandPalette(false)} />
    </>
  );
}

function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return <LoginPage />;
  }

  return (
    <ThemeProvider>
      <Router>
        <AuthenticatedApp />
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
    </ThemeProvider>
  );
}

export default App;
