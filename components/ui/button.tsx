import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

const variantClasses = {
  variant: {
    default: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
    destructive: "bg-destructive text-white shadow-sm hover:bg-destructive/90",
    outline: "border bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "text-primary underline-offset-4 hover:underline",
  },
  size: {
    default: "h-9 px-4 py-2",
    sm: "h-8 rounded-md px-3 text-sm",
    lg: "h-10 rounded-md px-6",
    icon: "h-9 w-9",
  },
}

const baseButtonClasses =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"

export function buttonVariants(props?: {
  variant?: keyof typeof variantClasses.variant
  size?: keyof typeof variantClasses.size
  className?: string
}) {
  const variant = props?.variant || "default"
  const size = props?.size || "default"

  return cn(baseButtonClasses, variantClasses.variant[variant], variantClasses.size[size], props?.className)
}

interface ButtonProps extends React.ComponentProps<"button"> {
  variant?: keyof typeof variantClasses.variant
  size?: keyof typeof variantClasses.size
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        ref={ref}
        className={cn(baseButtonClasses, variantClasses.variant[variant], variantClasses.size[size], className)}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"

export { Button }
