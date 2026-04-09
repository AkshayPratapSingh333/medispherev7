import * as React from "react"

import { cn } from "../../lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "bg-white/60 backdrop-blur-md border border-amber-200/40 placeholder:text-stone-400 text-stone-900 focus-visible:border-amber-200/60 focus-visible:bg-white/80 focus-visible:ring-2 focus-visible:ring-emerald-500/30 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex field-sizing-content min-h-24 w-full rounded-lg px-4 py-3 text-sm shadow-lg transition-all outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
