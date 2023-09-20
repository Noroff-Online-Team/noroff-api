"use client"

import { cn } from "@/utils/cn"
import SearchDialog, { type SearchDialogProps } from "next-docs-ui/components/dialog/search"
import { useParams } from "next/navigation"
import { useState } from "react"

export default function CustomSearchDialog(props: SearchDialogProps) {
  const { version } = useParams()
  const defaultTag = version === "v1" ? "v1" : "v2"
  const [tag, setTag] = useState<string>()
  const value = tag ?? defaultTag

  return (
    <SearchDialog {...props} tag={value}>
      <div className="flex flex-row gap-1 px-4 py-2">
        <button
          className={cn(
            "border px-2 py-0.5 rounded-md text-xs text-muted-foreground font-medium transition-colors",
            value === "v1" && "text-secondary-foreground bg-secondary"
          )}
          onClick={() => setTag("v1")}
          tabIndex={-1}
        >
          v1
        </button>
        <button
          className={cn(
            "border px-2 py-0.5 rounded-md text-xs text-muted-foreground font-medium transition-colors",
            value === "v2" && "text-secondary-foreground bg-secondary"
          )}
          onClick={() => setTag("v2")}
          tabIndex={-1}
        >
          v2
        </button>
      </div>
    </SearchDialog>
  )
}
