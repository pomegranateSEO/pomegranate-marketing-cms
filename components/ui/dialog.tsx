import * as React from "react";
import { cn } from "../../lib/utils";
import { X } from "lucide-react";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const previousActiveElement = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (open) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      document.body.style.overflow = "hidden";
      
      // Focus the dialog when opened
      setTimeout(() => {
        const firstFocusable = dialogRef.current?.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as HTMLElement;
        firstFocusable?.focus();
      }, 0);
    } else {
      document.body.style.overflow = "";
      previousActiveElement.current?.focus();
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Handle escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  // Focus trap
  React.useEffect(() => {
    if (!open) return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const focusableElements = dialog.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    };

    dialog.addEventListener("keydown", handleTabKey);
    return () => dialog.removeEventListener("keydown", handleTabKey);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      ref={dialogRef}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />
      
      {/* Dialog content */}
      <div className="relative z-10 w-full max-w-lg mx-4">
        {children}
      </div>
    </div>
  );
}

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

export function DialogContent({ children, className }: DialogContentProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden",
        className
      )}
    >
      {children}
    </div>
  );
}

interface DialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function DialogHeader({ children, className }: DialogHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between p-6 border-b border-slate-100", className)}>
      {children}
    </div>
  );
}

interface DialogTitleProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
}

export function DialogTitle({ children, id, className }: DialogTitleProps) {
  return (
    <h2 id={id} className={cn("text-lg font-semibold text-slate-900", className)}>
      {children}
    </h2>
  );
}

interface DialogCloseProps {
  onClose: () => void;
}

export function DialogClose({ onClose }: DialogCloseProps) {
  return (
    <button
      onClick={onClose}
      className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      aria-label="Close dialog"
    >
      <X className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}

interface DialogBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function DialogBody({ children, className }: DialogBodyProps) {
  return <div className={cn("p-6", className)}>{children}</div>;
}

interface DialogFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function DialogFooter({ children, className }: DialogFooterProps) {
  return (
    <div className={cn("flex justify-end gap-3 p-6 border-t border-slate-100 bg-slate-50", className)}>
      {children}
    </div>
  );
}
