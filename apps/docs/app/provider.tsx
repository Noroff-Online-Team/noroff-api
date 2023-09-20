"use client"

import { RootProvider } from "next-docs-ui/provider"
import dynamic from "next/dynamic"
import type { ReactNode } from "react"

const SearchDialog = dynamic(() => import("@/components/search"))

export function Provider({ children }: { children: ReactNode }) {
  return (
    <RootProvider
      search={{
        SearchDialog,
        links: [
          ["Holidaze", "/docs/v2/holidaze"],
          ["Social", "/docs/v2/social"],
          ["Auction House", "/docs/v2/auction-house"]
        ]
      }}
    >
      {children}
    </RootProvider>
  )
}
