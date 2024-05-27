import type { JWT } from "@fastify/jwt"

declare module "fastify" {
  interface FastifySchema {
    body?: unknown
    querystring?: unknown
    params?: unknown
    headers?: unknown
    response?: unknown
    tags?: string[]
  }
  interface FastifyRequest {
    jwt: JWT
  }
  export interface FastifyInstance {
    // biome-ignore lint/suspicious/noExplicitAny:
    authenticate: any
    // biome-ignore lint/suspicious/noExplicitAny:
    apiKey: any
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    id: number
    email: string
    name: string
  }
}
