import type { ReactNode } from "react"
import { layoutOptions } from "@/app/layout.config"
import { Layout } from "fumadocs-ui/layout"

export default function HomeLayout({ children }: { children: ReactNode }): React.ReactElement {
  return <Layout {...layoutOptions}>{children}</Layout>
}
