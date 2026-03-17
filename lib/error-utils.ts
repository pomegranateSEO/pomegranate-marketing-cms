/**
 * Error sanitization utility
 * Converts technical errors into user-friendly messages
 * Never exposes raw SQL/database errors to users
 */

export interface SanitizedError {
  userMessage: string;
  technicalDetails?: string;
  action?: string;
}

export function sanitizeError(error: unknown): SanitizedError {
  // Default error message
  const result: SanitizedError = {
    userMessage: "An unexpected error occurred. Please try again.",
  };

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    // Network/connection errors
    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      result.userMessage = "Unable to connect to the server. Please check your internet connection and try again.";
      result.action = "Check connection";
    }
    // Auth errors
    else if (message.includes('auth') || message.includes('unauthorized') || message.includes('forbidden')) {
      result.userMessage = "You don't have permission to perform this action. Please sign in again.";
      result.action = "Sign in";
    }
    // Not found errors
    else if (message.includes('not found') || message.includes('404')) {
      result.userMessage = "The requested item could not be found. It may have been deleted.";
      result.action = "Refresh page";
    }
    // Validation errors
    else if (message.includes('validation') || message.includes('invalid')) {
      result.userMessage = "Please check your input and try again. Some fields may be invalid.";
      result.action = "Review form";
    }
    // Duplicate/unique constraint errors
    else if (message.includes('duplicate') || message.includes('unique') || message.includes('already exists')) {
      result.userMessage = "An item with this information already exists. Please use a different value.";
      result.action = "Change value";
    }
    // Database constraint errors (sanitize these!)
    else if (message.includes('constraint') || message.includes('foreign key')) {
      result.userMessage = "Unable to complete this action due to existing relationships. Please remove related items first.";
      result.action = "Check dependencies";
    }
    // Timeout errors
    else if (message.includes('timeout') || message.includes('timed out')) {
      result.userMessage = "The operation took too long to complete. Please try again.";
      result.action = "Try again";
    }
    // Rate limiting
    else if (message.includes('rate limit') || message.includes('too many requests')) {
      result.userMessage = "Too many requests. Please wait a moment and try again.";
      result.action = "Wait and retry";
    }
    // Storage/upload errors
    else if (message.includes('storage') || message.includes('upload') || message.includes('file')) {
      result.userMessage = "Unable to upload or access files. Please check file size and try again.";
      result.action = "Check file";
    }
    // Keep technical details for non-sensitive errors
    else {
      result.userMessage = error.message;
    }
    
    // Always store technical details for console.error
    result.technicalDetails = error.stack || error.message;
  }
  
  // Handle Supabase-specific error shapes
  if (error && typeof error === 'object') {
    const err = error as any;
    
    // Supabase PostgrestError
    if (err.code && err.message) {
      // These are database errors - sanitize them!
      const code = err.code;
      
      if (code === '23505') { // unique_violation
        result.userMessage = "An item with this information already exists. Please use a different value.";
        result.action = "Change value";
      } else if (code === '23503') { // foreign_key_violation
        result.userMessage = "Unable to complete this action due to existing relationships.";
        result.action = "Check dependencies";
      } else if (code === '23502') { // not_null_violation
        result.userMessage = "Please fill in all required fields.";
        result.action = "Complete form";
      } else if (code === '42P01') { // undefined_table
        result.userMessage = "Database configuration issue. Please contact support.";
        result.action = "Contact support";
      } else if (code === '42703') { // undefined_column
        result.userMessage = "Database schema mismatch. Please contact support.";
        result.action = "Contact support";
      } else if (code.startsWith('22')) { // Data exceptions
        result.userMessage = "Invalid data format. Please check your input.";
        result.action = "Review input";
      } else if (code.startsWith('28')) { // Auth errors
        result.userMessage = "Authentication failed. Please sign in again.";
        result.action = "Sign in";
      } else if (code.startsWith('3D') || code.startsWith('3F')) { // Catalog/Schema
        result.userMessage = "Database configuration issue. Please contact support.";
        result.action = "Contact support";
      }
      
      // Never show raw SQL details to users
      result.technicalDetails = `[${code}] ${err.message}`;
    }
    
    // Supabase Auth errors
    if (err.__isAuthError || err.name === 'AuthError') {
      result.userMessage = err.message || "Authentication failed. Please sign in again.";
      result.action = "Sign in";
    }
  }
  
  return result;
}

/**
 * Handle errors consistently across the application
 * Usage: handleError(error, toast, 'Failed to save item')
 */
export function handleError(
  error: unknown, 
  showToast?: (message: string, description?: string) => void,
  defaultMessage = "An error occurred"
): SanitizedError {
  const sanitized = sanitizeError(error);
  
  // Always log technical details to console
  if (sanitized.technicalDetails) {
    console.error('Technical error details:', sanitized.technicalDetails);
  } else {
    console.error('Error:', error);
  }
  
  // Show user-friendly toast if provided
  if (showToast) {
    showToast(defaultMessage, sanitized.userMessage);
  }
  
  return sanitized;
}

/**
 * Get a user-friendly message for common HTTP status codes
 */
export function getHttpErrorMessage(status: number): string {
  const messages: Record<number, string> = {
    400: "Invalid request. Please check your input.",
    401: "Please sign in to continue.",
    403: "You don't have permission to perform this action.",
    404: "The requested item could not be found.",
    409: "This action conflicts with existing data.",
    422: "Unable to process your request. Please check your input.",
    429: "Too many requests. Please wait a moment.",
    500: "Something went wrong on our end. Please try again later.",
    502: "Service temporarily unavailable. Please try again later.",
    503: "Service temporarily unavailable. Please try again later.",
    504: "Request timed out. Please try again.",
  };
  
  return messages[status] || "An unexpected error occurred.";
}
