import * as React from "react"
import { cn } from "../../lib/utils"

const badgeVariants = {
  default: "bg-primary/20 text-primary border border-primary/30",
  secondary: "bg-secondary text-secondary-foreground",
  destructive: "bg-destructive/20 text-red-400 border border-destructive/30",
  outline: "border border-input text-foreground bg-transparent",
  success: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25",
  warning: "bg-amber-500/15 text-amber-400 border border-amber-500/25",
  info: "bg-blue-500/15 text-blue-400 border border-blue-500/25",
}

const Badge = React.forwardRef(({ className, variant = "default", ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
      badgeVariants[variant] || badgeVariants.default,
      className
    )}
    {...props}
  />
))
Badge.displayName = "Badge"

export { Badge, badgeVariants }
