import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Groups an Input with an inline prefix/suffix (e.g. a currency symbol).
 * The Input inside should add matching horizontal padding (e.g. `pl-6`).
 */
function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-group"
      className={cn("relative flex w-full items-center", className)}
      {...props}
    />
  )
}

function InputGroupPrefix({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="input-group-prefix"
      className={cn(
        "pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-sm text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

export { InputGroup, InputGroupPrefix }
