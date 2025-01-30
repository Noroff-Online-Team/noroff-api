import { Title } from "@/app/layout.client"
import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared"

export const baseOptions: BaseLayoutProps = {
  nav: {
    transparentMode: "none",
    title: <Title />
  },
  links: []
}
