"use client"

import { cn } from "@/utils/cn"
import { cva } from "class-variance-authority"
import { GithubIcon } from "lucide-react"
import { Nav as OriginalNav } from "next-docs-ui/components"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

const item = cva("px-2 py-1 rounded-md transition-colors hover:text-accent-foreground", {
  variants: {
    active: {
      true: "bg-accent text-accent-foreground"
    }
  }
})
export function Nav() {
  const { version } = useParams()
  const [isScrolledDown, setIsScrolledDown] = useState(true)
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
  }, [version])

  return (
    <OriginalNav
      title={
        <div className="flex flex-row items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
            <path
              fill="currentColor"
              d="m6.809 10.55.003 10.157 4.52 5.383c2.484 2.96 4.55 5.414 4.586 5.45.062.062.36-.282 2.848-3.247 1.527-1.824 2.785-3.336 2.793-3.36.015-.042-2.344-2.05-2.434-2.07-.031-.008-.75.82-1.602 1.84l-1.546 1.852-.094-.117-2.992-3.567-2.899-3.445v-6.63c0-5.222.012-6.616.055-6.562.027.04 2.832 3.383 6.23 7.438l6.18 7.367h2.781V.4h-9.281v3.269h6.012l-.004 5.8v5.802l-.106-.133c-.058-.07-2.859-3.414-6.222-7.426L9.523.418 8.164.41 6.804.398l.005 10.153"
            />
          </svg>
          <div className="flex-col -space-y-1 hidden sm:flex">
            <span className="font-bold">Noroff API</span>
            <span className="text-xs font-normal text-gray-500">Documentation</span>
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
      items={[
        {
          href: swaggerUrl,
          children: "Swagger",
          external: true
        }
      ]}
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
