import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Search, Building2, MapPin, Briefcase, BookOpen, FileText, PenTool, 
  Star, Download, Wrench, Layers, Settings, Factory, Users, Award, 
  Image as ImageIcon, Lightbulb, ArrowRight, AlertTriangle, DollarSign,
  X, Keyboard
} from 'lucide-react'
import { cn } from '../../lib/utils'

interface Command {
  id: string
  label: string
  description?: string
  icon: React.ElementType
  href: string
  keywords?: string[]
}

const commands: Command[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Settings, href: '/admin', keywords: ['home', 'overview'] },
  { id: 'businesses', label: 'Identity & Brand', icon: Building2, href: '/admin/businesses', keywords: ['business', 'brand', 'identity'] },
  { id: 'services', label: 'Services', icon: Briefcase, href: '/admin/services', keywords: ['service', 'offerings'] },
  { id: 'locations', label: 'Locations', icon: MapPin, href: '/admin/locations', keywords: ['location', 'geo', 'place'] },
  { id: 'knowledge', label: 'Knowledge Graph', icon: BookOpen, href: '/admin/knowledge-entities', keywords: ['wiki', 'entity', 'knowledge'] },
  { id: 'topics', label: 'Blog Topic Hubs', icon: Lightbulb, href: '/admin/blog-topics', keywords: ['blog', 'topic', 'ideas'] },
  { id: 'media', label: 'Media Library', icon: ImageIcon, href: '/admin/media', keywords: ['media', 'images', 'files'] },
  { id: 'pages', label: 'Pages', icon: Layers, href: '/admin/pages', keywords: ['page', 'static'] },
  { id: 'posts', label: 'Blog Posts', icon: PenTool, href: '/admin/posts', keywords: ['blog', 'post', 'article'] },
  { id: 'industries', label: 'Industries', icon: Factory, href: '/admin/industries', keywords: ['industry', 'vertical'] },
  { id: 'case-studies', label: 'Case Studies', icon: Award, href: '/admin/case-studies', keywords: ['case', 'study', 'portfolio'] },
  { id: 'reviews', label: 'Reviews', icon: Star, href: '/admin/reviews', keywords: ['review', 'testimonial'] },
  { id: 'associates', label: 'Partner Orgs', icon: Users, href: '/admin/associates', keywords: ['partner', 'associate'] },
  { id: 'downloads', label: 'Downloads', icon: Download, href: '/admin/downloads', keywords: ['download', 'resource'] },
  { id: 'tools', label: 'Free Tools', icon: Wrench, href: '/admin/tools', keywords: ['tool', 'calculator'] },
  { id: 'pricing', label: 'Pricing Plans', icon: DollarSign, href: '/admin/pricing', keywords: ['pricing', 'plan'] },
  { id: 'generation', label: 'Batch Generation', icon: Settings, href: '/admin/generation', keywords: ['generate', 'batch', 'seo'] },
  { id: 'people', label: 'People / Authors', icon: Users, href: '/admin/people', keywords: ['people', 'author', 'team'] },
  { id: 'redirects', label: 'Redirects', icon: ArrowRight, href: '/admin/redirects', keywords: ['redirect', 'url'] },
  { id: 'errors', label: '404 Logs', icon: AlertTriangle, href: '/admin/error-logs', keywords: ['404', 'error', 'log'] },
  { id: 'shortcuts', label: 'Keyboard Shortcuts', icon: Keyboard, href: '#shortcuts', keywords: ['help', 'keyboard', '?'] },
]

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const navigate = useNavigate()

  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands
    
    const lowerQuery = query.toLowerCase()
    return commands.filter(cmd => 
      cmd.label.toLowerCase().includes(lowerQuery) ||
      cmd.keywords?.some(kw => kw.toLowerCase().includes(lowerQuery)) ||
      cmd.description?.toLowerCase().includes(lowerQuery)
    )
  }, [query])

  const handleSelect = useCallback((command: Command) => {
    if (command.href === '#shortcuts') {
      onClose()
      window.dispatchEvent(new CustomEvent('show-shortcuts'))
      return
    }
    navigate(command.href)
    setQuery('')
    setSelectedIndex(0)
    onClose()
  }, [navigate, onClose])

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (filteredCommands[selectedIndex]) {
          handleSelect(filteredCommands[selectedIndex])
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedIndex, filteredCommands, handleSelect])

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/50"
      onClick={onClose}
    >
      <div 
        className="bg-card border rounded-lg shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-label="Command palette"
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b">
          <Search className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search pages and actions..."
            value={query}
            onChange={e => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none"
            autoFocus
          />
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <div className="max-h-[60vh] overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="px-4 py-8 text-center text-muted-foreground">
              <p>No results found</p>
              <p className="text-xs mt-1">Try a different search term</p>
            </div>
          ) : (
            <ul className="py-2" role="listbox">
              {filteredCommands.map((command, index) => {
                const Icon = command.icon
                return (
                  <li
                    key={command.id}
                    role="option"
                    aria-selected={index === selectedIndex}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors",
                      index === selectedIndex 
                        ? "bg-primary/10 text-primary" 
                        : "hover:bg-muted text-foreground"
                    )}
                    onClick={() => handleSelect(command)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{command.label}</div>
                      {command.description && (
                        <div className="text-xs text-muted-foreground truncate">{command.description}</div>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
        
        <div className="px-4 py-2 border-t bg-muted/50 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-muted border rounded text-[10px]">↑↓</kbd>
            Navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-muted border rounded text-[10px]">↵</kbd>
            Select
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-muted border rounded text-[10px]">Esc</kbd>
            Close
          </span>
        </div>
      </div>
    </div>
  )
}