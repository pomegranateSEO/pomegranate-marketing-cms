import * as React from "react"
import { cn } from "../../lib/utils"

interface TooltipProps {
  children: React.ReactNode
  content: string
  side?: 'top' | 'bottom' | 'left' | 'right'
  delayDuration?: number
  className?: string
}

export function Tooltip({
  children,
  content,
  side = 'top',
  delayDuration = 200,
  className,
}: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false)
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout>>()

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-popover border-l-transparent border-r-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-popover border-l-transparent border-r-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-popover border-t-transparent border-b-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-popover border-t-transparent border-b-transparent border-l-transparent',
  }

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => setIsVisible(true), delayDuration)
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setIsVisible(false)
  }

  const handleFocus = () => {
    setIsVisible(true)
  }

  const handleBlur = () => {
    setIsVisible(false)
  }

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {children}
      {isVisible && (
        <div
          role="tooltip"
          className={cn(
            "absolute z-50 px-2 py-1.5 text-xs font-medium",
            "bg-popover text-popover-foreground border border-border rounded-md shadow-md",
            "animate-in fade-in-0 zoom-in-95",
            "motion-reduce:animate-none motion-reduce:transition-none",
            positionClasses[side],
            className
          )}
        >
          {content}
          <div
            className={cn(
              "absolute w-0 h-0 border-[6px]",
              arrowClasses[side]
            )}
          />
        </div>
      )}
    </div>
  )
}

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export { Tooltip as TooltipContent }