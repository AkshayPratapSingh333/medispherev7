import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:shadow-lg hover:shadow-emerald-500/30 hover:from-emerald-700 hover:to-emerald-800",
        glass: "bg-white/60 backdrop-blur-md border border-amber-200/40 text-stone-900 hover:bg-white/80 hover:border-amber-200/60 hover:shadow-lg",
        glassDark: "bg-stone-100/20 backdrop-blur-lg border border-amber-200/30 text-stone-900 hover:bg-stone-100/40 hover:border-amber-200/50",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border border-amber-200/40 bg-white/60 backdrop-blur-sm text-stone-900 hover:bg-white/80 hover:border-amber-200/60 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-amber-100/40 hover:text-stone-900 dark:hover:bg-white/10",
        link: "text-emerald-700 underline-offset-4 hover:underline hover:text-emerald-800",
      },
      size: {
        default: "h-10 px-6 py-2 has-[>svg]:px-4",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 text-xs",
        lg: "h-12 rounded-lg px-8 has-[>svg]:px-5",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
