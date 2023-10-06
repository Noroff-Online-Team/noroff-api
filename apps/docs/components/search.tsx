"use client"

import { cn } from "@/utils/cn"
import { cva } from "class-variance-authority"
import { SearchDialog, type SharedProps } from "next-docs-ui/components/dialog/search"
import { useDocsSearch } from "next-docs-zeta/search"
import { useParams } from "next/navigation"
import { useState, useEffect } from "react"

const itemVariants = cva("border px-2 py-0.5 rounded-md text-xs text-muted-foreground font-medium transition-colors", {
  variants: {
    active: {
      true: "text-accent-foreground bg-accent"
    }
  }
})

export default function CustomSearchDialog(props: SharedProps) {
  const { version } = useParams()
  const defaultTag = version === "v1" ? "v1" : "v2"
  const [tag, setTag] = useState(defaultTag)
  const { search, setSearch, query } = useDocsSearch("en-US", tag)

  useEffect(() => {
    setTag(defaultTag)
  }, [defaultTag])

  return (
    <SearchDialog
      {...props}
      search={search}
      onSearchChange={setSearch}
      data={query.data}
      footer={
        <div className="flex flex-row gap-1 px-4 py-2">
          <button className={cn(itemVariants({ active: tag === "v2" }))} onClick={() => setTag("v2")} tabIndex={-1}>
            v2
          </button>
          <button className={cn(itemVariants({ active: tag === "v1" }))} onClick={() => setTag("v1")} tabIndex={-1}>
            v1
          </button>
        </div>
      }
    />
  )
}
