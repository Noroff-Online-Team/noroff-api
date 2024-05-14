import { notFound } from "next/navigation"
import { Card, Cards } from "fumadocs-ui/components/card"
import { DocsBody, DocsPage } from "fumadocs-ui/page"
import { ExternalLinkIcon } from "lucide-react"

import { utils, type Page } from "@/utils/source"

type Param = {
  slug: string[]
}

export default async function Page({ params }: { params: Param }) {
  const page = utils.getPage(params.slug)

  if (page == null) {
    notFound()
  }

  const path = `apps/docs/content/docs/${page.file.path}`
  const MDX = page.data.exports.default

  return (
    <DocsPage
      toc={page.data.exports.toc}
      tableOfContent={{
        enabled: page.data.toc,
        footer: (
          <a
            href={`https://github.com/Noroff-Online-Team/noroff-api/blob/main/${path}`}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground"
          >
            Edit on Github <ExternalLinkIcon className="w-3 h-3 ml-1" />
          </a>
        )
      }}
    >
      <div className="mb-6 nd-not-prose">
        <h1 className="mb-4 text-3xl font-semibold text-foreground sm:text-4xl">{page.data.title}</h1>
        <p className="text-muted-foreground sm:text-lg">{page.data.description}</p>
      </div>
      <DocsBody>{page.data.index ? <Category page={page} /> : <MDX />}</DocsBody>
    </DocsPage>
  )
}

function Category({ page }: { page: Page }): React.ReactElement {
  const filtered = utils
    .getPages()
    .filter(item => item.file.dirname === page.file.dirname && item.file.name !== "index")

  return (
    <Cards>
      {filtered.map(item => (
        <Card
          key={item.url}
          title={item.data.title}
          description={item.data.description ?? "No Description"}
          href={item.url}
        />
      ))}
    </Cards>
  )
}

export function generateStaticParams(): Param[] {
  return utils.getPages().map<Param>(page => ({
    slug: page.slugs
  }))
}
