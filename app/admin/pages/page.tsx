import React from 'react';
import { Layers, Plus } from 'lucide-react';
import { Button } from '../../../components/ui/button';

export default function PagesPage() {
  const staticPages = [
    { id: '1', title: 'Homepage', slug: '/', status: 'Published', type: 'Core' },
    { id: '2', title: 'About Us', slug: '/about', status: 'Draft', type: 'Core' },
    { id: '3', title: 'Contact', slug: '/contact', status: 'Published', type: 'Core' },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Static Pages</h1>
          <p className="text-slate-500 mt-2">
            Manage core website pages (Home, About, Contact). 
          </p>
        </div>
        <Button disabled>
          <Plus className="h-4 w-4 mr-2" /> Add Page
        </Button>
      </div>

      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b font-medium text-slate-500">
            <tr>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Slug</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {staticPages.map((page) => (
              <tr key={page.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">{page.title}</td>
                <td className="px-6 py-4 text-slate-500 font-mono text-xs">{page.slug}</td>
                <td className="px-6 py-4 text-slate-500">{page.type}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    page.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {page.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                   <Button variant="ghost" size="sm" className="text-primary" disabled>Edit</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-slate-400 text-center">
        * Static page editing requires schema extension. Currently viewing mock data.
      </p>
    </div>
  );
}