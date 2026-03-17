import React from 'react'
import { X, Keyboard } from 'lucide-react'
import { getShortcutLabel } from '../../lib/use-keyboard-shortcuts'

interface ShortcutItem {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  description: string
}

const shortcuts: ShortcutItem[] = [
  { key: 's', ctrl: true, description: 'Save current form' },
  { key: 'k', ctrl: true, description: 'Open command palette' },
  { key: '/', shift: true, description: 'Show keyboard shortcuts' },
  { key: 'Escape', description: 'Close dialogs/modals' },
  { key: 'd', ctrl: true, shift: true, description: 'Toggle dark mode' },
]

interface KeyboardShortcutsHelpProps {
  isOpen: boolean
  onClose: () => void
}

export function KeyboardShortcutsHelp({ isOpen, onClose }: KeyboardShortcutsHelpProps) {
  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div 
        className="bg-card border rounded-lg shadow-xl w-full max-w-md mx-4 p-6"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-labelledby="keyboard-shortcuts-title"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="keyboard-shortcuts-title" className="text-lg font-semibold flex items-center gap-2">
            <Keyboard className="h-5 w-5" aria-hidden="true" />
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors rounded p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Close"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        
        <div className="space-y-3">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
              <span className="text-muted-foreground">{shortcut.description}</span>
              <kbd className="px-2 py-1 text-xs font-mono bg-muted border rounded">
                {getShortcutLabel(shortcut)}
              </kbd>
            </div>
          ))}
        </div>
        
        <p className="mt-4 text-xs text-muted-foreground">
          Press <kbd className="px-1 py-0.5 bg-muted border rounded text-[10px]">Esc</kbd> to close this dialog
        </p>
      </div>
    </div>
  )
}

export { shortcuts as listOfShortcuts }