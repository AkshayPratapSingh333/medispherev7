import * as React from "react"

import { cn } from "../../lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "bg-white/60 backdrop-blur-md border-amber-200/40 placeholder:text-stone-400 text-stone-900 file:text-foreground selection:bg-emerald-500 selection:text-white h-10 w-full min-w-0 rounded-lg px-4 py-2 text-base shadow-lg transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-amber-200/60 focus-visible:bg-white/80 focus-visible:ring-2 focus-visible:ring-emerald-500/30",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
