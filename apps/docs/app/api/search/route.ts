import { allDocs } from "contentlayer/generated"
import { createSearchAPI } from "next-docs-zeta/search/server"

export const { GET } = createSearchAPI("advanced", {
  indexes: allDocs.map(docs => ({
    id: docs._id,
    title: docs.title,
    url: `/docs/${docs.slug}`,
    structuredData: docs.structuredData,
    tag: docs._raw.flattenedPath.startsWith("docs/v1") ? "v1" : "v2"
  })),
  tag: true
})
