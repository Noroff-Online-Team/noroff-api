import { baseOptions } from "@/app/layout.config"
import { HomeLayout } from "fumadocs-ui/layouts/home"
import type { ReactNode } from "react"

export default function HomeLayoutComponent({
  children
}: { children: ReactNode }): React.ReactElement {
  return <HomeLayout {...baseOptions}>{children}</HomeLayout>
}
