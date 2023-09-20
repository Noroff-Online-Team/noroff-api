import { getPageUrl } from "@/utils/source"
import { allDocs } from "contentlayer/generated"
import { createSearchAPI } from "next-docs-zeta/server"

export const { GET } = createSearchAPI("advanced", {
  indexes: allDocs.map(docs => ({
    id: docs._id,
    title: docs.title,
    content: docs.body.raw,
    url: getPageUrl(docs.slug),
    structuredData: docs.structuredData,
    tag: docs._raw.flattenedPath.startsWith("docs/v1") ? "v1" : "v2"
  })),
  tag: true
})
