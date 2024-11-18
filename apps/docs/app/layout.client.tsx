"use client"

import { useParams } from "next/navigation"
import type { ReactNode } from "react"

import { NoroffLogo } from "@/components/noroff-logo"
import { cn } from "@/utils/cn"
import { versions } from "@/utils/versions"

export function useVersion(): string | undefined {
  const { slug } = useParams()
  return Array.isArray(slug) && slug.length > 0 ? slug[0] : undefined
}

export function BodyWrapper({
  children
}: { children: ReactNode }): React.ReactElement {
  const version = useVersion()
  return <div className={cn("body-wrapper", version)}>{children}</div>
}

export function Title(): React.ReactElement {
  return (
    <div className="flex flex-row items-center">
      <NoroffLogo />
      <div className="flex-col hidden -space-y-1 sm:flex">
        <span className="font-bold">Noroff API</span>
        <span className="text-xs font-normal text-muted-foreground">
          Documentation
        </span>
      </div>
    </div>
  )
}

export function DeprecatedBanner(): React.ReactElement | null {
  const version = useVersion()
  const currentVersion =
    versions.find(item => item.param === version) ?? versions[0]

  if (currentVersion.version === "v1") {
    return (
      <div className="flex items-center justify-center p-2 text-white bg-destructive/80">
        <p className="text-sm font-medium">
          This version is deprecated and will be removed in the future, please
          use v2 instead.
        </p>
      </div>
    )
  }

  return null
}
