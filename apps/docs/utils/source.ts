import { allDocs, allMeta } from "contentlayer/generated"
import { AxeIcon } from "lucide-react"
import { buildPageTree, createUtils, loadContext } from "next-docs-zeta/contentlayer"
import type { PageTree } from "next-docs-zeta/server"
import { createElement } from "react"

const ctx = loadContext(allMeta, allDocs, {
  resolveIcon() {
    return createElement(AxeIcon)
  }
})

const v1Tree = buildPageTree(ctx, {
  root: "docs/v1"
})

const v2Tree = buildPageTree(ctx, {
  root: "docs/v2"
})

export function getTree(version: "v1" | "v2" | string): PageTree {
  if (version === "v1") {
    return v1Tree
  }

  return v2Tree
}

export const { getPage, getPageUrl } = createUtils(ctx)
