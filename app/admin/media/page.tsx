import React from 'react';
import { MediaManager } from '../../../components/shared/MediaManager';
import { EntityGenerator } from '../../../components/shared/EntityGenerator';

export default function MediaPage() {
  return (
    <div className="p-6 h-[calc(100vh-64px)] flex flex-col">
      <div className="flex justify-between items-center mb-6 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Media Library</h1>
          <p className="text-muted-foreground mt-2">
            Upload and manage images for your blogposts and pages.
          </p>
        </div>
        {/* Placeholder for future entity gen from images if needed */}
      </div>

      <div className="flex-1 min-h-0">
         <MediaManager mode="page" />
      </div>
    </div>
  );
}
