"use client"

import { cn } from "@/utils/cn"
import { cva } from "class-variance-authority"
import { SearchDialog, type SharedProps } from "next-docs-ui/components/dialog/search"
import { useDocsSearch } from "next-docs-zeta/search/client"
import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { versions } from "@/utils/versions"

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
  const { search, setSearch, query } = useDocsSearch(undefined, tag)

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
        <div className="flex flex-row items-center gap-1 p-4">
          {versions.map(version => (
            <button
              key={version.param}
              className={cn(itemVariants({ active: tag === version.param }))}
              onClick={() => setTag(version.param)}
              tabIndex={-1}
            >
              {version.version}
            </button>
          ))}
        </div>
      }
    />
  )
}
