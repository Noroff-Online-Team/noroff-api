import { cn } from "@/utils/cn"
import { getTree } from "@/utils/source"
import { Tally1Icon, Tally2Icon } from "lucide-react"
import { DocsLayout } from "next-docs-ui/layout"
import Image from "next/image"
import type { ReactNode } from "react"

export default function Layout({ params, children }: { params: { version: string }; children: ReactNode }) {
  const tree = getTree(params.version)
  const [Icon, title, description] =
    params.version === "v1" ? [Tally1Icon, "Noroff API", "Documentation"] : [Tally2Icon, "Noroff API", "Documentation"]

  return (
    <main
      className={cn(
        params.version === "v1" && "[--primary:213_94%_68%]",
        params.version === "v2" && "[--primary:270_95%_75%]"
      )}
    >
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
            <div className="relative flex flex-row gap-2 items-center p-2 rounded-lg border bg-card text-card-foreground transition-colors hover:bg-muted/50">
              <p className="absolute right-2 top-2 text-muted-foreground text-xs">
                {params.version === "v1" ? "v1" : "v2"}
              </p>
              <Icon className="w-9 h-9 p-1 shrink-0 border rounded-md text-primary bg-background" />
              <div>
                <p className="font-medium text-sm">{title}</p>
                <p className="text-muted-foreground text-xs">{description}</p>
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
  return [
    {
      version: "v1"
    },
    {
      version: "v2"
    }
  ]
}
