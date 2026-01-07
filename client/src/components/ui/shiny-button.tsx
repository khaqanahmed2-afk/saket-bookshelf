import * as React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
}

export const ShinyButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", children, ...props }, ref) => {
    
    const baseStyles = "relative inline-flex items-center justify-center px-8 py-3 overflow-hidden font-display font-bold tracking-wide rounded-full transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none";
    
    const variants = {
      primary: "bg-primary text-white shadow-[0_10px_20px_rgba(255,100,50,0.3)] hover:shadow-[0_15px_25px_rgba(255,100,50,0.4)]",
      secondary: "bg-secondary text-secondary-foreground shadow-[0_10px_20px_rgba(100,200,255,0.3)] hover:shadow-[0_15px_25px_rgba(100,200,255,0.4)]",
      outline: "bg-transparent border-2 border-primary text-primary hover:bg-primary/5",
      ghost: "bg-transparent text-primary hover:bg-primary/5",
    };

    return (
      <motion.button
        whileTap={{ scale: 0.95 }}
        ref={ref}
        className={cn(baseStyles, variants[variant], className)}
        {...props}
      >
        {/* Shine effect */}
        {variant !== 'outline' && variant !== 'ghost' && (
          <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:animate-[shine_1.5s_infinite]" />
        )}
        <span className="relative z-10 flex items-center gap-2">{children}</span>
      </motion.button>
    )
  }
)
ShinyButton.displayName = "ShinyButton"
