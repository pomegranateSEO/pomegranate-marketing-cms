import * as React from "react"
import { cn } from "../../lib/utils"
import { Skeleton } from "../ui/skeleton";

export function CardSkeleton() {
  return (
    <div className="bg-card p-6 rounded-lg border shadow-sm space-y-4">
      <div className="flex justify-between items-start">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-4" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="pt-4 border-t flex justify-end gap-2">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-9" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="bg-card border rounded-lg shadow-sm overflow-hidden">
      <div className="bg-muted border-b">
        <div className="flex">
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="flex-1 px-6 py-4">
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div key={colIndex} className="flex-1 px-6 py-4">
                <Skeleton className={cn(
                  "h-4",
                  colIndex === 0 ? "w-32" : "w-full"
                )} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function PageHeaderSkeleton() {
  return (
    <div className="flex justify-between items-center mb-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <Skeleton className="h-10 w-32" />
    </div>
  );
}

export function FormSkeleton({ fields = 6 }: { fields?: number }) {
  return (
    <div className="bg-card p-6 rounded-lg border shadow-sm space-y-6">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex justify-end pt-4 border-t">
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}

export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      <div className="bg-card p-6 rounded-lg border shadow-sm space-y-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="bg-card p-6 rounded-lg border shadow-sm col-span-2">
        <Skeleton className="h-4 w-32 mb-4" />
        <div className="grid grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4 bg-muted rounded border space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex justify-between items-center p-4 bg-card rounded-lg border shadow-sm">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="p-6">
      <PageHeaderSkeleton />
      <TableSkeleton rows={5} columns={4} />
    </div>
  );
}
