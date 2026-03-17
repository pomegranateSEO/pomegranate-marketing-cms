import React from 'react'
import { cn } from '../../lib/utils'
import { FileQuestion, Plus, Inbox, FolderOpen } from 'lucide-react'
import { Button } from '../ui/button'

interface EmptyStateProps {
  icon?: React.ElementType
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

const iconMap = {
  default: FileQuestion,
  list: Inbox,
  folder: FolderOpen,
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const Icon = icon || iconMap.default

  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 px-4 text-center",
      className
    )}>
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick}>
          <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
          {action.label}
        </Button>
      )}
    </div>
  )
}

interface EmptyListProps {
  entityName: string
  onAdd?: () => void
  searchQuery?: string
  className?: string
}

export function EmptyList({
  entityName,
  onAdd,
  searchQuery,
  className,
}: EmptyListProps) {
  if (searchQuery) {
    return (
      <EmptyState
        icon={FileQuestion}
        title="No results found"
        description={`No ${entityName.toLowerCase()} match your search "${searchQuery}". Try a different search term.`}
        className={className}
      />
    )
  }

  return (
    <EmptyState
      icon={Inbox}
      title={`No ${entityName} yet`}
      description={`Get started by creating your first ${entityName.toLowerCase().replace(/s$/, '')}.`}
      action={onAdd ? { label: `Add ${entityName.replace(/s$/, '')}`, onClick: onAdd } : undefined}
      className={className}
    />
  )
}