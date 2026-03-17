import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Building2, MapPin, Briefcase, BookOpen, Settings,
  FileText, PenTool, Star, Download, Wrench, Layers, LogOut,
  Factory, Users, Award, Image as ImageIcon, Lightbulb, ArrowRight, AlertTriangle, DollarSign,
  Sun, Moon
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { supabase } from '../../lib/supabaseClient';
import { useTheme } from '../../lib/theme-provider';
import { Logo } from '../shared/Logo';
import { Tooltip } from '../ui/tooltip';

export const Sidebar = () => {
  const [email, setEmail] = useState('User');
  const { resolvedTheme, toggleTheme } = useTheme();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setEmail(data.user.email);
    });
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const coreNavItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/admin/businesses", label: "Identity & Brand", icon: Building2 },
    { href: "/admin/services", label: "Services", icon: Briefcase },
    { href: "/admin/locations", label: "Locations", icon: MapPin },
    { href: "/admin/knowledge-entities", label: "Knowledge Graph", icon: BookOpen },
    { href: "/admin/people", label: "People / Authors", icon: Users },
  ];

  const contentNavItems = [
    { href: "/admin/blog-topics", label: "Blog Topic Hubs", icon: Lightbulb },
    { href: "/admin/media", label: "Media Library", icon: ImageIcon },
    { href: "/admin/pages", label: "Pages", icon: Layers },
    { href: "/admin/posts", label: "Blog Posts", icon: PenTool },
    { href: "/admin/industries", label: "Industries", icon: Factory },
    { href: "/admin/case-studies", label: "Case Studies", icon: Award },
    { href: "/admin/reviews", label: "Reviews", icon: Star },
    { href: "/admin/associates", label: "Partner Orgs", icon: Users },
    { href: "/admin/downloads", label: "Downloads", icon: Download },
    { href: "/admin/tools", label: "Free Tools", icon: Wrench },
    { href: "/admin/pricing", label: "Pricing Plans", icon: DollarSign },
  ];

  const systemNavItems = [
    { href: "/admin/redirects", label: "Redirects", icon: ArrowRight },
    { href: "/admin/error-logs", label: "404 Logs", icon: AlertTriangle },
  ];

  const generationNavItems = [
    { href: "/admin/generation", label: "Batch Generation", icon: Settings },
  ];

  const NavGroup = ({ title, items }: { title: string, items: any[] }) => (
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
                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900",
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
    <nav role="navigation" aria-label="Main navigation" className="w-64 bg-slate-900 text-white min-h-screen flex flex-col border-r border-slate-800 flex-shrink-0">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <Logo size="md" variant="dark" />
          <Tooltip content={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
              aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Moon className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </Tooltip>
        </div>
        <p className="text-xs text-slate-500 mt-3">Production Build</p>
      </div>
      
      <div className="flex-1 px-3 overflow-y-auto">
        <NavGroup title="Core Data" items={coreNavItems} />
        <NavGroup title="Content Management" items={contentNavItems} />
        <NavGroup title="Content Building" items={generationNavItems} />
        <NavGroup title="System" items={systemNavItems} />
      </div>

      <div className="p-4 border-t border-slate-800 mt-auto bg-slate-950">
        <div className="flex items-center justify-between">
            <div className="text-xs text-slate-400 truncate max-w-[140px]" title={email}>
              {email}
            </div>
            <Tooltip content="Sign out">
              <button 
                onClick={handleSignOut} 
                className="text-slate-500 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded p-1" 
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
              </button>
            </Tooltip>
        </div>
      </div>
    </nav>
  );
};