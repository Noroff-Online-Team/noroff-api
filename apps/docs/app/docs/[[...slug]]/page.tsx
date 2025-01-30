import { Callout } from "@/components/callout"
import { EndpointDetails } from "@/components/endpoint-details"
import { cn } from "@/utils/cn"
import { source } from "@/utils/source"
import {
  CodeBlock,
  type CodeBlockProps,
  Pre
} from "fumadocs-ui/components/codeblock"
import { TypeTable } from "fumadocs-ui/components/type-table"
import defaultComponents from "fumadocs-ui/mdx"
import {
  DocsBody,
  DocsCategory,
  DocsDescription,
  DocsPage,
  DocsTitle
} from "fumadocs-ui/page"
import { notFound } from "next/navigation"
import type { HTMLAttributes } from "react"

type TypeTableObjectType = {
  [name: string]: {
    description?: string
    type: string
    typeDescription?: string
    typeDescriptionLink?: string
    default?: string
  }
}

type CalloutType = {
  variant?: "default" | "info" | "warning" | "destructive"
  noIcon?: boolean
}

type EndpointDetailsType = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  path: string
}

export default async function DocsPageComponent({
  params
}: {
  params: Promise<{ slug: string[] }>
}) {
  const page = source.getPage((await params).slug)
  if (!page) notFound()

  const path = `apps/docs/content/docs/${page.file.path}`
  const MDX = page.data.body

  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
      tableOfContent={{
        style: "clerk",
        single: false
      }}
      editOnGithub={{
        repo: "noroff-api",
        owner: "Noroff-Online-Team",
        sha: "main",
        path: path
      }}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX
          components={{
            ...defaultComponents,
            pre: ({
              title,
              className,
              icon,
              allowCopy,
              ...props
            }: CodeBlockProps) => (
              <CodeBlock title={title} icon={icon} allowCopy={allowCopy}>
                <Pre className={cn("max-h-[400px]", className)} {...props} />
              </CodeBlock>
            ),
            blockquote: (
              props: React.QuoteHTMLAttributes<HTMLQuoteElement>
            ) => (
              <div className="px-3 my-4 text-sm border rounded-lg shadow-md">
                {props.children}
              </div>
            ),
            Hr: (props: HTMLAttributes<HTMLHRElement>) => (
              <hr {...props} className="my-8 border-[hsl(var(--border))]" />
            ),
            EndpointDetails: (
              props: HTMLAttributes<HTMLDivElement> & EndpointDetailsType
            ) => <EndpointDetails {...props} />,
            TypeTable: (
              props: HTMLAttributes<HTMLDivElement> & {
                type: TypeTableObjectType
              }
            ) => <TypeTable {...props} />,
            Callout: (props: HTMLAttributes<HTMLDivElement> & CalloutType) => (
              <Callout {...props}>{props.children}</Callout>
            )
          }}
        />
      </DocsBody>
    </DocsPage>
  )
}

export function generateStaticParams(): { slug: string[] }[] {
  return source.generateParams()
}
