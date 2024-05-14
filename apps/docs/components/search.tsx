"use client"

import { useEffect, useState } from "react"
import { useVersion } from "@/app/layout.client"
import { cva } from "class-variance-authority"
import { useDocsSearch } from "fumadocs-core/search/client"
import { SearchDialog, type SharedProps } from "fumadocs-ui/components/dialog/search"

import { cn } from "@/utils/cn"
import { versions } from "@/utils/versions"

const itemVariants = cva("border px-2 py-0.5 rounded-md text-xs text-muted-foreground font-medium transition-colors", {
  variants: {
    active: {
      true: "text-accent-foreground bg-accent"
    }
  }
})

export default function CustomSearchDialog(props: SharedProps) {
  const currentVersion = useVersion()
  const defaultVerion = currentVersion === "v1" ? "v1" : "v2"
  const [version, setVersion] = useState(defaultVerion)
  const { search, setSearch, query } = useDocsSearch(undefined, version)

  useEffect(() => {
    setVersion(defaultVerion)
  }, [defaultVerion])

  return (
    <SearchDialog
      {...props}
      search={search}
      onSearchChange={setSearch}
      results={query.data ?? "empty"}
      footer={
        <div className="flex flex-row items-center gap-1">
          {versions.map(ver => (
            <button
              key={ver.param}
              className={cn(itemVariants({ active: version === ver.param }))}
              onClick={() => setVersion(ver.param)}
              tabIndex={-1}
              aria-label={
                version === ver.param
                  ? `Currently searching ${ver.version} docs`
                  : `Switch to searching ${ver.version} docs`
              }
            >
              {ver.version}
            </button>
          ))}
        </div>
      }
    />
  )
}
