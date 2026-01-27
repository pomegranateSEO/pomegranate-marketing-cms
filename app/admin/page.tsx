import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
    Building2, Briefcase, MapPin, BookOpen, 
    FileText, Search, Rocket, CheckCircle2, ArrowRight 
} from 'lucide-react';
import { getDashboardStats } from '../../lib/db/stats';
import { Button } from '../../components/ui/button';

export default function DashboardPage() {
    const [stats, setStats] = useState({
        businesses: 0,
        services: 0,
        locations: 0,
        knowledge: 0,
        pages: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const data = await getDashboardStats();
                setStats(data);
            } catch (e) {
                console.error("Failed to load stats", e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const steps = [
        {
            id: 1,
            title: "Business & Branding",
            description: "Upload business identity, logo, and brand guidelines.",
            icon: Building2,
            link: "/admin/businesses",
            completed: stats.businesses > 0
        },
        {
            id: 2,
            title: "Services",
            description: "Define the core services you offer (80% of content).",
            icon: Briefcase,
            link: "/admin/services",
            completed: stats.services > 0
        },
        {
            id: 3,
            title: "Target Locations",
            description: "Add locations to serve (20% of content).",
            icon: MapPin,
            link: "/admin/locations",
            completed: stats.locations > 0
        },
        {
            id: 4,
            title: "Knowledge Entities",
            description: "Research and save relevant Wikipedia/Data entities.",
            icon: BookOpen,
            link: "/admin/knowledge-entities",
            completed: stats.knowledge > 0
        },
        {
            id: 5,
            title: "Select Service Pages",
            description: "Combine services and locations to plan pages.",
            icon: FileText,
            link: "/admin/generation",
            completed: stats.pages > 0
        },
        {
            id: 6,
            title: "Keyword Research",
            description: "Assign target keywords to page clusters.",
            icon: Search,
            link: "/admin/generation", // Assuming part of generation workflow
            completed: false // Placeholder logic
        },
        {
            id: 7,
            title: "Generate Site",
            description: "Execute AI generation for all pages and blog posts.",
            icon: Rocket,
            link: "/admin/generation",
            completed: false // Placeholder logic
        }
    ];

    const nextStep = steps.find(s => !s.completed) || steps[steps.length - 1];

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <header className="mb-10">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Pomegranate Dashboard</h1>
                <p className="text-slate-500">
                    Welcome to the Knowledge Graph CMS. Follow the steps below to build your programmatic SEO site.
                </p>
            </header>

            {/* Progress Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Current Phase</h3>
                    <div className="mt-2 text-2xl font-bold text-primary">
                        {stats.businesses === 0 ? "Phase 1: Setup" : "Phase 2: Content"}
                    </div>
                    <div className="mt-4">
                        <Link to={nextStep.link}>
                            <Button className="w-full justify-between group">
                                Continue: {nextStep.title}
                                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border shadow-sm col-span-2">
                    <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">Site Architecture</h3>
                    <div className="grid grid-cols-4 gap-4 text-center">
                        <div className="p-4 bg-slate-50 rounded border">
                            <div className="text-2xl font-bold text-slate-800">{stats.businesses}</div>
                            <div className="text-xs text-slate-500 mt-1">Root Entity</div>
                        </div>
                        <div className="p-4 bg-slate-50 rounded border">
                            <div className="text-2xl font-bold text-slate-800">{stats.services}</div>
                            <div className="text-xs text-slate-500 mt-1">Services</div>
                        </div>
                        <div className="p-4 bg-slate-50 rounded border">
                            <div className="text-2xl font-bold text-slate-800">{stats.locations}</div>
                            <div className="text-xs text-slate-500 mt-1">Locations</div>
                        </div>
                         <div className="p-4 bg-purple-50 rounded border border-purple-100">
                            <div className="text-2xl font-bold text-purple-700">{stats.pages}</div>
                            <div className="text-xs text-purple-600 mt-1">Generated Pages</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Steps Timeline */}
            <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b bg-slate-50">
                    <h2 className="font-semibold text-lg">Build Progress</h2>
                </div>
                <div className="divide-y">
                    {steps.map((step) => {
                        const Icon = step.icon;
                        const isNext = step.id === nextStep.id && !step.completed;
                        
                        return (
                            <div 
                                key={step.id} 
                                className={`p-6 flex items-start gap-4 transition-colors ${
                                    step.completed ? 'bg-white opacity-50' : isNext ? 'bg-blue-50/50' : 'bg-white'
                                }`}
                            >
                                <div className={`
                                    flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border
                                    ${step.completed 
                                        ? 'bg-green-100 border-green-200 text-green-700' 
                                        : isNext 
                                            ? 'bg-primary text-white border-primary shadow-md ring-4 ring-blue-50' 
                                            : 'bg-white border-slate-200 text-slate-400'}
                                `}>
                                    {step.completed ? <CheckCircle2 className="h-6 w-6" /> : <span className="font-bold">{step.id}</span>}
                                </div>
                                
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className={`font-semibold text-lg ${step.completed ? 'text-slate-800' : isNext ? 'text-primary' : 'text-slate-500'}`}>
                                                {step.title}
                                            </h3>
                                            <p className="text-slate-600 mt-1 max-w-2xl">{step.description}</p>
                                        </div>
                                        <div>
                                            {step.completed ? (
                                                <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded">Completed</span>
                                            ) : (
                                                <Link to={step.link}>
                                                    <Button variant={isNext ? "default" : "outline"} size="sm">
                                                        {isNext ? "Start Phase" : "Pending"}
                                                    </Button>
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}