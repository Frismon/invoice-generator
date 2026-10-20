import * as React from "react"
import { cn } from "cn"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-[72px] px-3 py-2.5 w-full min-w-0 rounded-lg border border-input bg-white text-sm text-foreground transition-[border-color,box-shadow] outline-none placeholder:text-subtle hover:border-input-hover focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/18 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/10",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
