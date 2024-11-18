import { source } from "@/utils/source"
import { createFromSource } from "fumadocs-core/search/server"

export const { GET } = createFromSource(source, page => ({
  title: page.data.title,
  description: page.data.description,
  url: page.url,
  id: page.url,
  structuredData: page.data.structuredData,
  tag: page.url.startsWith("/docs/v1") ? "v1" : "v2"
}))
