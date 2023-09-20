import { JWT } from "@fastify/jwt"

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    authenticate: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
