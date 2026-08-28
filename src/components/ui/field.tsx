"use client";

import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

import { cn } from "../../lib/utils";

// text-base (16px) on inputs stops iOS Safari zooming in on focus.
const controlClass =
  "min-h-11 w-full rounded-xl border border-border bg-surface px-3 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring";

export const Label = ({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) => (
  <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium">
    {children}
  </label>
);

export const Input = ({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) => (
  <input className={cn(controlClass, className)} {...props} />
);

export const Select = ({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) => (
  <select className={cn(controlClass, className)} {...props} />
);

export const Textarea = ({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea className={cn(controlClass, "min-h-24 py-2.5", className)} {...props} />
);

export const FieldError = ({ children }: { children?: string }) =>
  children ? <p className="mt-1.5 text-sm text-danger">{children}</p> : null;
