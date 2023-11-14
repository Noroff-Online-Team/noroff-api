import { allDocs, allMeta } from "contentlayer/generated"
import { AxeIcon } from "lucide-react"
import { createUtils, loadContext } from "next-docs-zeta/contentlayer"
import { type PageTree, createPageTreeBuilder } from "next-docs-zeta/server"
import { createElement } from "react"
import type { RawDocumentData } from "contentlayer/source-files"

const ctx = loadContext(allMeta, allDocs, {
  resolveIcon() {
    return createElement(AxeIcon)
  }
})

export const { getPage, getPageUrl } = createUtils(ctx)

const builder = createPageTreeBuilder({
  pages: allDocs.map(page => ({
    file: getFileData(page._raw, page.locale),
    title: page.title,
    url: getPageUrl(page.slug.split("/"), page.locale),
    icon: page.icon
  })),
  metas: allMeta.map(meta => ({
    file: getFileData(meta._raw),
    pages: meta.pages,
    icon: meta.icon,
    title: meta.title
  }))
})

const v1Tree = builder.build({ root: "docs/v1" })
const v2Tree = builder.build({ root: "docs/v2" })

export function getTree(version: "v1" | "v2" | string): PageTree {
  if (version === "v1") {
    return v1Tree
  }

  return v2Tree
}

function getFileData(raw: RawDocumentData, locale?: string) {
  const dotIndex = raw.sourceFileName.lastIndexOf(".")
  const flattenedPath = raw.sourceFileDir === raw.flattenedPath ? raw.flattenedPath + "/index" : raw.flattenedPath

  return {
    locale,
    dirname: raw.sourceFileDir,
    name: raw.sourceFileName.slice(0, dotIndex === -1 ? undefined : dotIndex),
    flattenedPath,
    path: raw.sourceFilePath
  }
}
