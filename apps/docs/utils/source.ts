import { docs, meta } from "@/.source"
import { IconContainer } from "@/components/ui/icon"
import type { InferMetaType, InferPageType } from "fumadocs-core/source"
import { loader } from "fumadocs-core/source"
import { createMDXSource } from "fumadocs-mdx"
import { icons } from "lucide-react"
import { createElement } from "react"

export const source = loader({
  baseUrl: "/docs",
  icon(icon) {
    if (icon && icon in icons)
      return createElement(IconContainer, {
        icon: icons[icon as keyof typeof icons]
      })
  },
  source: createMDXSource(docs, meta)
})

export type Page = InferPageType<typeof source>
export type Meta = InferMetaType<typeof source>
