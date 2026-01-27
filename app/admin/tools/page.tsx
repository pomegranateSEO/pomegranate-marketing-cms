import React from 'react';
import { Wrench, Plus } from 'lucide-react';
import { Button } from '../../../components/ui/button';

export default function ToolsPage() {
  return (
    <div className="p-6">
       <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Free Tools</h1>
          <p className="text-slate-500 mt-2">
            Manage interactive tools and calculators.
          </p>
        </div>
        <Button disabled>
          <Plus className="h-4 w-4 mr-2" /> Add Tool
        </Button>
      </div>

      <div className="text-center py-12 border-2 border-dashed rounded-lg bg-slate-50">
          <Wrench className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No tools yet</h3>
          <p className="text-slate-500 mb-6">Configure free tools to generate leads.</p>
          <Button disabled>
             Add Tool
          </Button>
      </div>
    </div>
  );
}