import { createSearchAPI } from "fumadocs-core/search/server"

import { utils } from "@/utils/source"

export const { GET } = createSearchAPI("advanced", {
  indexes: utils.getPages().map(page => ({
    id: page.url,
    title: page.data.title,
    url: page.url,
    structuredData: page.data.exports.structuredData,
    tag: page.url.startsWith("/docs/v1") ? "v1" : "v2"
  })),
  tag: true
})
