"use client"

import type { HTMLAttributes } from "react"
import { useMDXComponent } from "next-contentlayer/hooks"
import { ImageZoom } from "next-docs-ui/components/image-zoom"
import { TypeTable } from "next-docs-ui/components/type-table"
import defaultComponents from "next-docs-ui/mdx"

import { Callout } from "@/components/callout"
import { EndpointDetails } from "@/components/endpoint-details"

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

const components = {
  ...defaultComponents,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  img: (props: any) => <ImageZoom {...props} />,
  pre: (props: HTMLAttributes<HTMLPreElement>) => <defaultComponents.pre {...props} className="max-h-[400px]" />,
  blockquote: (props: React.QuoteHTMLAttributes<HTMLQuoteElement>) => (
    <div className="my-4 rounded-lg border px-3 text-sm shadow-md">{props.children}</div>
  ),
  Hr: (props: HTMLAttributes<HTMLHRElement>) => <hr {...props} className="my-8 border-[hsl(var(--border))]" />,
  EndpointDetails: (props: HTMLAttributes<HTMLDivElement> & EndpointDetailsType) => <EndpointDetails {...props} />,
  TypeTable: (props: HTMLAttributes<HTMLDivElement> & { type: TypeTableObjectType }) => <TypeTable {...props} />,
  Callout: (props: HTMLAttributes<HTMLDivElement> & CalloutType) => <Callout {...props}>{props.children}</Callout>
}

export function Content({ code }: { code: string }) {
  const inject = `if (typeof process === 'undefined') {globalThis.process = { env: {} }}`
  const MDX = useMDXComponent(inject + code)

  return <MDX components={components} />
}
