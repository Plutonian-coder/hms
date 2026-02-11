"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="w-full space-y-1">
        {label && (
          <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1">
            {label}
          </label>
        )}
        <div className="relative group">
          {icon && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 text-black/50 group-focus-within:text-black transition-colors">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full bg-white border-b-2 border-black py-3 px-2 text-base font-medium text-black placeholder:text-gray-400 focus:outline-none focus:border-brand-lime focus:bg-brand-lime/5 transition-all duration-200 rounded-none",
              icon && "pl-8",
              error && "border-brand-rose bg-brand-rose/5",
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-xs font-bold text-brand-rose uppercase tracking-wide">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export { Input };
