"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "brutal";
  size?: "sm" | "md" | "lg" | "xl";
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {

    const variants = {
      primary: "bg-brand-lime text-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[0px] active:translate-y-[0px] active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)]",
      secondary: "bg-brand-paper text-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[0px] active:translate-y-[0px] active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)]",
      outline: "bg-transparent text-black border-2 border-black hover:bg-black hover:text-white transition-colors duration-200",
      ghost: "hover:bg-gray-100 text-black border-2 border-transparent hover:border-black",
      danger: "bg-brand-rose text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]",
      brutal: "bg-brand-blue text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-display uppercase tracking-wider",
    };

    const sizes = {
      sm: "px-4 py-2 text-xs font-bold",
      md: "px-6 py-3 text-sm font-bold",
      lg: "px-8 py-4 text-base font-bold",
      xl: "px-10 py-5 text-lg font-bold",
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "inline-flex items-center justify-center font-sans uppercase tracking-wide transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none transform will-change-transform",
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || isLoading}
        {...(props as any)}
      >
        {isLoading && (
          <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin mr-2" />
        )}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
export { Button };
