import { JWT } from '@fastify/jwt'

declare module "fastify" {
  interface FastifyRequest {
    jwt: JWT;
  }
  export interface FastifyInstance {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    authenticate: any;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    name: string
  }
}