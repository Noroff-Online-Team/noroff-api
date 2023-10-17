"use client"

import { cn } from "@/utils/cn"
import { cva } from "class-variance-authority"
import { GithubIcon } from "lucide-react"
import { Nav as OriginalNav } from "next-docs-ui/nav"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { NoroffLogo } from "./noroff-logo"

const item = cva("px-2 py-1 rounded-md transition-colors hover:text-accent-foreground", {
  variants: {
    active: {
      true: "bg-border text-foreground dark:bg-accent dark:text-accent-foreground"
    }
  }
})
export function Nav() {
  const { version } = useParams()
  const [isScrolledDown, setIsScrolledDown] = useState(true)
  const [swaggerText, setSwaggerText] = useState<string | null>(version === "v1" ? "Swagger v1" : "Swagger v2")
  const [swaggerUrl, setSwaggerUrl] = useState<string>(
    version === "v1" ? "https://api.noroff.dev/docs" : "https://v2.api.noroff.dev/docs"
  )

  useEffect(() => {
    const listener = () => {
      setIsScrolledDown(window.document.scrollingElement!.scrollTop < 30)
    }

    listener()
    window.addEventListener("scroll", listener)
    return () => window.removeEventListener("scroll", listener)
  }, [])

  useEffect(() => {
    setSwaggerUrl(version === "v1" ? "https://api.noroff.dev/docs" : "https://v2.api.noroff.dev/docs")

    if (version) {
      setSwaggerText(version === "v1" ? "Swagger v1" : "Swagger v2")
    } else {
      setSwaggerText(null)
    }
  }, [version])

  return (
    <OriginalNav
      title={
        <div className="flex flex-row items-center">
          <NoroffLogo />
          <div className="flex-col -space-y-1 hidden sm:flex">
            <span className="font-bold">Noroff API</span>
            <span className="text-xs font-normal text-muted-foreground">Documentation</span>
          </div>
        </div>
      }
      enableSidebar={version === "v1" || version === "v2"}
      links={[
        {
          label: "Github",
          icon: <GithubIcon className="h-5 w-5" />,
          href: "https://github.com/Noroff-Online-Team/noroff-api",
          external: true
        }
      ]}
      items={
        version
          ? [
              {
                href: swaggerUrl,
                children: swaggerText,
                external: true
              }
            ]
          : undefined
      }
      transparent={!version && isScrolledDown}
    >
      <div className="bg-secondary/50 rounded-md border p-1 text-sm text-muted-foreground max-sm:absolute max-sm:left-[50%] max-sm:translate-x-[-50%]">
        <Link href="/docs/v2" className={cn(item({ active: version === "v2" }))}>
          v2
        </Link>
        <Link href="/docs/v1" className={cn(item({ active: version === "v1" }))}>
          v1
        </Link>
      </div>
    </OriginalNav>
  )
}
