import { map } from "@/.map"
import type { InferMetaType, InferPageType } from "fumadocs-core/source"
import { loader } from "fumadocs-core/source"
import { createMDXSource, defaultSchemas } from "fumadocs-mdx"
import { z } from "zod"

const frontmatterSchema = defaultSchemas.frontmatter.extend({
  toc: z.boolean().default(true),
  index: z.boolean().default(false)
})

export const utils = loader({
  baseUrl: "/docs",
  rootDir: "docs",
  source: createMDXSource(map, { schema: { frontmatter: frontmatterSchema } })
})

export type Page = InferPageType<typeof utils>
export type Meta = InferMetaType<typeof utils>
