import type { ReactNode } from "react"
import Image from "next/image"
import { layoutOptions } from "@/app/layout.config"
import { DocsLayout } from "fumadocs-ui/layout"

import { Body } from "../layout.client"

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <main className="[--primary:213_94%_68%]">
      <div
        id="docs-gradient"
        className="absolute right-0 top-0 overflow-hidden z-[-1] sm:right-[20vw]"
      >
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
      <Body>
        <DocsLayout {...layoutOptions}>{children}</DocsLayout>
      </Body>
    </main>
  )
}
