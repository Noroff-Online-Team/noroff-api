import { NavChildren, SidebarBanner, Title } from "@/app/layout.client"
import type { DocsLayoutProps } from "fumadocs-ui/layout"

import { utils } from "@/utils/source"

export const layoutOptions: Omit<DocsLayoutProps, "children"> = {
  tree: utils.pageTree,
  nav: {
    transparentMode: "none",
    title: <Title />,
    children: <NavChildren />,
    githubUrl: "https://github.com/Noroff-Online-Team/noroff-api"
  },
  sidebar: {
    defaultOpenLevel: 0,
    banner: <SidebarBanner />
  }
}
