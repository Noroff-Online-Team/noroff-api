import type { HTMLAttributes } from "react"
import {
  CodeBlock,
  Pre,
  type CodeBlockProps
} from "fumadocs-ui/components/codeblock"
import {
  ImageZoom,
  type ImageZoomProps
} from "fumadocs-ui/components/image-zoom"
import { TypeTable } from "fumadocs-ui/components/type-table"
import defaultComponents from "fumadocs-ui/mdx"
import type { MDXComponents } from "mdx/types"

import { Callout } from "@/components/callout"
import { EndpointDetails } from "@/components/endpoint-details"

import { cn } from "./utils/cn"

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

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...defaultComponents,
    // biome-ignore lint/suspicious/noExplicitAny: type mismatch between ImageZoomProps and props. Any works fine here.
    img: (props: any) => <ImageZoom {...props} />,
    pre: ({ title, className, icon, allowCopy, ...props }: CodeBlockProps) => (
      <CodeBlock title={title} icon={icon} allowCopy={allowCopy}>
        <Pre className={cn("max-h-[400px]", className)} {...props} />
      </CodeBlock>
    ),
    blockquote: (props: React.QuoteHTMLAttributes<HTMLQuoteElement>) => (
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
      props: HTMLAttributes<HTMLDivElement> & { type: TypeTableObjectType }
    ) => <TypeTable {...props} />,
    Callout: (props: HTMLAttributes<HTMLDivElement> & CalloutType) => (
      <Callout {...props}>{props.children}</Callout>
    ),
    ...components
  }
}
