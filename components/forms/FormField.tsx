import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface FormFieldProps {
  name: string;
  label: string;
  required?: boolean;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function FormField({ 
  name, 
  label, 
  required, 
  description, 
  children,
  className 
}: FormFieldProps) {
  const { formState: { errors } } = useFormContext();
  const error = errors[name];
  const errorId = `${name}-error`;

  return (
    <div className={cn("space-y-2", className)}>
      <Label 
        htmlFor={name}
        className={cn(error && "text-red-600")}
      >
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
      </Label>
      
      {children}
      
      {description && !error && (
        <p className="text-xs text-slate-500">{description}</p>
      )}
      
      {error && (
        <p 
          id={errorId}
          className="text-sm text-red-600 flex items-center gap-1"
          role="alert"
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span>{error.message?.toString()}</span>
        </p>
      )}
    </div>
  );
}

interface ValidatedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name'> {
  name: string;
  label: string;
  required?: boolean;
  description?: string;
}

export function ValidatedInput({ 
  name, 
  label, 
  required, 
  description,
  className,
  ...props 
}: ValidatedInputProps) {
  const { register, formState: { errors } } = useFormContext();
  const error = errors[name];
  const errorId = `${name}-error`;

  return (
    <FormField name={name} label={label} required={required} description={description}>
      <Input
        id={name}
        {...register(name)}
        {...props}
        className={cn(
          error && "border-red-500 focus-visible:ring-red-500",
          className
        )}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? errorId : undefined}
      />
    </FormField>
  );
}

interface ValidatedTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'name'> {
  name: string;
  label: string;
  required?: boolean;
  description?: string;
}

export function ValidatedTextarea({ 
  name, 
  label, 
  required, 
  description,
  className,
  ...props 
}: ValidatedTextareaProps) {
  const { register, formState: { errors } } = useFormContext();
  const error = errors[name];
  const errorId = `${name}-error`;

  return (
    <FormField name={name} label={label} required={required} description={description}>
      <Textarea
        id={name}
        {...register(name)}
        {...props}
        className={cn(
          error && "border-red-500 focus-visible:ring-red-500",
          className
        )}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? errorId : undefined}
      />
    </FormField>
  );
}

interface ValidatedSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'name' | 'className'> {
  name: string;
  label: string;
  required?: boolean;
  description?: string;
  options: { value: string; label: string }[];
  className?: string;
}

export function ValidatedSelect({ 
  name, 
  label, 
  required, 
  description,
  options,
  className,
  ...props 
}: ValidatedSelectProps) {
  const { register, formState: { errors } } = useFormContext();
  const error = errors[name];
  const errorId = `${name}-error`;

  return (
    <FormField name={name} label={label} required={required} description={description}>
      <select
        id={name}
        {...register(name)}
        {...props}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-red-500 focus-visible:ring-red-500",
          className
        )}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? errorId : undefined}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </FormField>
  );
}

interface CharacterCountInputProps extends ValidatedInputProps {
  maxLength: number;
  showCount?: boolean;
}

export function CharacterCountInput({ 
  name, 
  label, 
  required, 
  description,
  maxLength,
  showCount = true,
  className,
  ...props 
}: CharacterCountInputProps) {
  const { watch } = useFormContext();
  const value = watch(name) || '';
  const length = String(value).length;
  const isOverLimit = length > maxLength;

  return (
    <FormField 
      name={name} 
      label={label} 
      required={required}
      description={description}
      className="relative"
    >
      <ValidatedInput
        name={name}
        label={label}
        required={required}
        maxLength={maxLength}
        className={cn(isOverLimit && "border-amber-500 focus-visible:ring-amber-500", className)}
        {...props}
      />
      {showCount && (
        <div className="flex justify-end mt-1">
          <span className={cn(
            "text-xs",
            isOverLimit ? "text-amber-600 font-medium" : "text-slate-400"
          )}>
            {length}/{maxLength}
          </span>
        </div>
      )}
    </FormField>
  );
}

interface CharacterCountTextareaProps extends Omit<ValidatedTextareaProps, 'maxLength'> {
  maxLength: number;
  showCount?: boolean;
}

export function CharacterCountTextarea({ 
  name, 
  label, 
  required, 
  description,
  maxLength,
  showCount = true,
  className,
  ...props 
}: CharacterCountTextareaProps) {
  const { watch } = useFormContext();
  const value = watch(name) || '';
  const length = String(value).length;
  const isOverLimit = length > maxLength;

  return (
    <FormField 
      name={name} 
      label={label} 
      required={required}
      description={description}
    >
      <ValidatedTextarea
        name={name}
        label={label}
        required={required}
        maxLength={maxLength}
        className={cn(isOverLimit && "border-amber-500 focus-visible:ring-amber-500", className)}
        {...props}
      />
      {showCount && (
        <div className="flex justify-end mt-1">
          <span className={cn(
            "text-xs",
            isOverLimit ? "text-amber-600 font-medium" : "text-slate-400"
          )}>
            {length}/{maxLength}
          </span>
        </div>
      )}
    </FormField>
  );
}
