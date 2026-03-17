import React from 'react';
import { AlertTriangle, X, RefreshCw, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { SanitizedError } from '../../lib/error-utils';

interface ErrorBannerProps {
  error: SanitizedError | string | null;
  onDismiss?: () => void;
  onRetry?: () => void;
  className?: string;
  showTechnical?: boolean;
}

export function ErrorBanner({ 
  error, 
  onDismiss, 
  onRetry,
  className,
  showTechnical = false 
}: ErrorBannerProps) {
  if (!error) return null;

  const errorData: SanitizedError = typeof error === 'string' 
    ? { userMessage: error }
    : error;

  return (
    <div 
      className={cn(
        "bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-6",
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-destructive mb-1">
            Something went wrong
          </h3>
          <p className="text-sm text-destructive/90">
            {errorData.userMessage}
          </p>
          
          {showTechnical && errorData.technicalDetails && (
            <details className="mt-3">
              <summary className="text-xs text-destructive/80 cursor-pointer hover:text-destructive">
                Technical details (for support)
              </summary>
              <pre className="mt-2 text-xs bg-destructive/10 p-2 rounded overflow-auto text-destructive">
                {errorData.technicalDetails}
              </pre>
            </details>
          )}
          
          {(errorData.action || onRetry) && (
            <div className="flex items-center gap-3 mt-3">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-destructive hover:text-destructive/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive rounded"
                >
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  Try again
                </button>
              )}
              {errorData.action && !onRetry && (
                <span className="inline-flex items-center gap-1.5 text-sm text-destructive/80">
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  {errorData.action}
                </span>
              )}
            </div>
          )}
        </div>
        
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-destructive/60 hover:text-destructive p-1 rounded hover:bg-destructive/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}

interface InlineErrorProps {
  message: string;
  className?: string;
}

export function InlineError({ message, className }: InlineErrorProps) {
  return (
    <span 
      className={cn("text-sm text-destructive flex items-center gap-1", className)}
      role="alert"
    >
      <AlertTriangle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
      {message}
    </span>
  );
}

interface FormErrorSummaryProps {
  errors: Record<string, string>;
  className?: string;
}

export function FormErrorSummary({ errors, className }: FormErrorSummaryProps) {
  const errorEntries = Object.entries(errors).filter(([_, message]) => message);
  
  if (errorEntries.length === 0) return null;

  return (
    <div 
      className={cn(
        "bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-6",
        className
      )}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <h3 className="font-semibold text-destructive mb-2">
            Please fix the following errors:
          </h3>
          <ul className="text-sm text-destructive/90 space-y-1">
            {errorEntries.map(([field, message]) => (
              <li key={field} className="flex items-center gap-2">
                <span aria-hidden="true">•</span>
                <span>{message}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
