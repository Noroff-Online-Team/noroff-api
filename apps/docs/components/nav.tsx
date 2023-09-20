"use client"

import { cn } from "@/utils/cn"
import { cva } from "class-variance-authority"
import { GithubIcon } from "lucide-react"
import { Nav as OriginalNav } from "next-docs-ui/components"
import { SidebarContext } from "next-docs-zeta/sidebar"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useContext, useEffect, useState } from "react"

const item = cva("px-2 py-1 rounded-md transition-colors hover:text-accent-foreground", {
  variants: {
    active: {
      true: "bg-accent text-accent-foreground"
    }
  }
})
export function Nav() {
  const { version } = useParams()
  const [isSidebarOpen] = useContext(SidebarContext)
  const [transparent, setTransparent] = useState(true)
  const [swaggerUrl, setSwaggerUrl] = useState<string>(
    version === "v1" ? "https://api.noroff.dev/docs" : "https://v2.api.noroff.dev/docs"
  )

  useEffect(() => {
    if (isSidebarOpen) {
      setTransparent(true)
      return
    }

    const listener = () => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      setTransparent(window.document.scrollingElement!.scrollTop < 30)
    }

    listener()
    window.addEventListener("scroll", listener)
    return () => window.removeEventListener("scroll", listener)
  }, [isSidebarOpen])

  useEffect(() => {
    setSwaggerUrl(version === "v1" ? "https://api.noroff.dev/docs" : "https://v2.api.noroff.dev/docs")
  }, [version])

  return (
    <OriginalNav
      title="Noroff API Docs"
      enableSidebar={version === "v1" || version === "v2"}
      links={[
        {
          label: "Github",
          icon: <GithubIcon className="h-5 w-5" />,
          href: "https://github.com/Noroff-Online-Team/noroff-api",
          external: true
        }
      ]}
      items={[
        {
          href: swaggerUrl,
          children: "Swagger",
          external: true
        }
      ]}
      transparent={transparent}
    >
      <div className="bg-secondary/50 rounded-md border p-1 text-sm text-muted-foreground max-sm:absolute max-sm:left-[50%] max-sm:translate-x-[-50%]">
        <Link href="/docs/v1" className={cn(item({ active: version === "v1" }))}>
          v1
        </Link>
        <Link href="/docs/v2" className={cn(item({ active: version === "v2" }))}>
          v2
        </Link>
      </div>
    </OriginalNav>
  )
}
