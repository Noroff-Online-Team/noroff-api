import { makeSource } from "contentlayer/source-files"
import { createConfig } from "next-docs-zeta/contentlayer/configuration"
import { structure } from "next-docs-zeta/mdx-plugins"
import remarkMath from "remark-math"

const config = createConfig({
  docsComputedFields: {
    structuredData: {
      type: "json",
      resolve: page => {
        return structure(page.body.raw, [remarkMath])
      }
    }
  }
})

config.mdx!.remarkPlugins!.push(remarkMath)

export default makeSource(config)
