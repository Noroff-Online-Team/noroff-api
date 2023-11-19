import { notFound } from "next/navigation"
import { allDocs } from "contentlayer/generated"
import { ExternalLinkIcon } from "lucide-react"
import { MDXContent } from "next-docs-ui/mdx"
import { DocsPage } from "next-docs-ui/page"
import { findNeighbour, getTableOfContents } from "next-docs-zeta/server"

import { getPage, getPageUrl, getTree } from "@/utils/source"

import { Content } from "./content"

type Param = {
  version: string
  slug?: string[]
}

export default async function Page({ params }: { params: Param }) {
  const tree = getTree(params.version)
  const page = getPage([params.version, ...(params.slug ?? [])])

  if (page == null) {
    notFound()
  }

  const toc = await getTableOfContents(page.body.raw)
  const url = getPageUrl(page.slug)
  const neighbours = findNeighbour(tree, url)

  return (
    <DocsPage
      toc={toc}
      footer={neighbours}
      tableOfContent={{
        footer: (
          <a
            href={`https://github.com/Noroff-Online-Team/noroff-api/blob/main/apps/docs/content/${page._raw.sourceFilePath}`}
            target="_blank"
            rel="noreferrer noopener"
            className="text-xs inline-flex text-muted-foreground items-center hover:text-foreground"
          >
            Edit on Github <ExternalLinkIcon className="ml-1 w-3 h-3" />
          </a>
        )
      }}
    >
      <MDXContent>
        <div className="nd-not-prose mb-12">
          <h1 className="text-foreground mb-4 text-3xl font-semibold sm:text-4xl">{page.title}</h1>
          <p className="text-muted-foreground sm:text-lg">{page.description}</p>
        </div>
        <Content code={page.body.code} />
      </MDXContent>
    </DocsPage>
  )
}

export function generateStaticParams() {
  return allDocs.map(docs => {
    const [version, ...slugs] = docs.slug.split("/")

    return {
      slug: slugs,
      version
    }
  })
}
