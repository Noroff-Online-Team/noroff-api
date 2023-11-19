import type { ReactNode } from "react"
import Image from "next/image"
import { DocsLayout } from "next-docs-ui/layout"

import { cn } from "@/utils/cn"
import { getTree } from "@/utils/source"
import { versions } from "@/utils/versions"

export default function Layout({ params, children }: { params: { version: string }; children: ReactNode }) {
  const tree = getTree(params.version)
  const version = versions.find(version => version.param === params.version) ?? versions[0]
  const Icon = version.icon

  return (
    <main className="[--primary:213_94%_68%]">
      <div id="docs-gradient" className="absolute right-0 top-0 overflow-hidden z-[-1] sm:right-[20vw]">
        <Image
          alt=""
          src="/gradient.png"
          loading="eager"
          width={800}
          height={800}
          className="min-w-[800px] opacity-50"
          priority
          aria-hidden
        />
      </div>
      <DocsLayout
        tree={tree}
        nav={{ enabled: false }}
        sidebar={{
          defaultOpenLevel: 0,
          banner: (
            <div className="flex flex-row gap-2 items-center p-2 -mt-2 rounded-lg text-card-foreground transition-colors hover:bg-muted/80">
              <Icon
                className={cn(
                  "w-9 h-9 p-1.5 shrink-0 rounded-md text-primary bg-gradient-to-b from-primary/50 border border-primary/50",
                  params.version === "v1" && "[--primary:213_98%_48%] dark:[--primary:213_94%_68%]",
                  params.version === "v2" && "[--primary:270_95%_60%] dark:[--primary:270_95%_75%]"
                )}
              />
              <div>
                <p className="font-medium">
                  {version.name} {version.version}
                </p>
                <p className="text-xs text-muted-foreground">{version.description}</p>
              </div>
            </div>
          )
        }}
      >
        {children}
      </DocsLayout>
    </main>
  )
}

export function generateStaticParams() {
  return versions.map(version => ({ version: version.param }))
}
