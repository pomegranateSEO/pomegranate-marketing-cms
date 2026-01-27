import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Building2, MapPin, Briefcase, BookOpen, Settings,
  FileText, PenTool, Star, Download, Wrench, Layers
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const Sidebar = () => {
  const coreNavItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/admin/businesses", label: "Identity & Brand", icon: Building2 },
    { href: "/admin/services", label: "Services", icon: Briefcase },
    { href: "/admin/locations", label: "Locations", icon: MapPin },
    { href: "/admin/knowledge-entities", label: "Knowledge Graph", icon: BookOpen },
  ];

  const contentNavItems = [
    { href: "/admin/pages", label: "Pages", icon: Layers },
    { href: "/admin/posts", label: "Blog Posts", icon: PenTool },
    { href: "/admin/reviews", label: "Reviews", icon: Star },
    { href: "/admin/downloads", label: "Downloads", icon: Download },
    { href: "/admin/tools", label: "Free Tools", icon: Wrench },
  ];

  const generationNavItems = [
    { href: "/admin/generation", label: "Generation", icon: Settings },
  ];

  const NavGroup = ({ title, items }: { title: string, items: typeof coreNavItems }) => (
    <div className="mb-6">
      <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{title}</h3>
      <nav className="space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.exact}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-primary/20 text-primary border-r-2 border-primary"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );

  return (
    <div className="w-64 bg-slate-900 text-white min-h-screen flex flex-col border-r border-slate-800 flex-shrink-0">
      <div className="p-6">
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <span className="text-primary">Pomegranate</span>
          <span className="text-slate-400 font-light">v2</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">Production Build</p>
      </div>
      
      <div className="flex-1 px-3 overflow-y-auto">
        <NavGroup title="Core Data" items={coreNavItems} />
        <NavGroup title="Content Management" items={contentNavItems} />
        <NavGroup title="System" items={generationNavItems} />
      </div>

      <div className="p-4 border-t border-slate-800 mt-auto">
        <div className="text-xs text-slate-500">
          User: admin@pomegranate.ai
        </div>
      </div>
    </div>
  );
};