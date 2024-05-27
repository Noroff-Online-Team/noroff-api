"use client"

import { cva } from "class-variance-authority"
import Link from "next/link"
import { useParams } from "next/navigation"
import { type ReactNode, useEffect, useState } from "react"

import { NoroffLogo } from "@/components/noroff-logo"
import { cn } from "@/utils/cn"
import { versions } from "@/utils/versions"

const itemVariants = cva(
  "px-2 py-1 rounded-md transition-colors hover:text-accent-foreground",
  {
    variants: {
      active: {
        true: "bg-border text-foreground dark:bg-accent dark:text-accent-foreground"
      }
    }
  }
)

export function useVersion(): string | undefined {
  const { slug } = useParams()
  return Array.isArray(slug) && slug.length > 0 ? slug[0] : undefined
}

export function Body({
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

export function NavChildren(): React.ReactElement {
  const version = useVersion()
  const [swaggerText, setSwaggerText] = useState<string | null>(
    version === "v1" ? "Swagger v1" : "Swagger v2"
  )
  const [swaggerUrl, setSwaggerUrl] = useState<string>(
    version === "v1"
      ? "https://api.noroff.dev/docs"
      : "https://v2.api.noroff.dev/docs"
  )

  useEffect(() => {
    setSwaggerUrl(
      version === "v1"
        ? "https://api.noroff.dev/docs"
        : "https://v2.api.noroff.dev/docs"
    )

    if (version) {
      setSwaggerText(version === "v1" ? "Swagger v1" : "Swagger v2")
    } else {
      setSwaggerText(null)
    }
  }, [version])

  return (
    <>
      <div className="p-1 text-sm border rounded-md bg-secondary/50 text-muted-foreground max-md:absolute max-md:left-1/2 max-md:-translate-x-1/2">
        {versions.map(m => (
          <Link
            key={m.version}
            href={`/docs/${m.version}`}
            className={cn(itemVariants({ active: version === m.version }))}
          >
            {m.version}
          </Link>
        ))}
      </div>
      {swaggerText && (
        <>
          <Link
            href={swaggerUrl}
            target="_blank"
            className="text-sm transition-colors text-muted-foreground max-md:hidden hover:text-accent-foreground"
          >
            {swaggerText}
          </Link>
        </>
      )}
    </>
  )
}

export function SidebarBanner(): React.ReactElement {
  const version = useVersion()
  const currentVersion =
    versions.find(item => item.param === version) ?? versions[0]
  const Icon = currentVersion.icon

  return (
    <div className="flex flex-row items-center gap-2 p-2 -mt-2 transition-colors rounded-lg text-card-foreground hover:bg-muted/80">
      <Icon
        className={cn(
          "w-9 h-9 p-1.5 shrink-0 rounded-md text-primary bg-gradient-to-b from-primary/50 border border-primary/50",
          version === "v1" &&
            "[--primary:213_98%_48%] dark:[--primary:213_94%_68%]",
          version === "v2" &&
            "[--primary:270_95%_60%] dark:[--primary:270_95%_75%]"
        )}
      />
      <div>
        <p className="font-medium">
          {currentVersion.name} {currentVersion.version}
        </p>
        <p className="text-xs text-muted-foreground">
          {currentVersion.description}
        </p>
      </div>
    </div>
  )
}
