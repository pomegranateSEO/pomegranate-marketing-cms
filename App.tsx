import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
  return (
    <Router>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/admin" replace />} />
            <Route path="/admin" element={<DashboardPage />} />
            <Route path="/admin/businesses" element={<BusinessPage />} />
            <Route path="/admin/services" element={<ServicesPage />} />
            <Route path="/admin/locations" element={<LocationsPage />} />
            <Route path="/admin/knowledge-entities" element={<KnowledgeEntitiesPage />} />
            
            {/* New Content Routes */}
            <Route path="/admin/pages" element={<PagesPage />} />
            <Route path="/admin/posts" element={<PostsPage />} />
            <Route path="/admin/reviews" element={<ReviewsPage />} />
            <Route path="/admin/downloads" element={<DownloadsPage />} />
            <Route path="/admin/tools" element={<ToolsPage />} />
            
            <Route path="/admin/generation" element={<Placeholder title="Batch Generation" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;