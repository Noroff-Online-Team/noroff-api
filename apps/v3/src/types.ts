import type { OpenAPIHono, RouteConfig, RouteHandler } from "@hono/zod-openapi"
import type { Schema } from "hono"
import type { PinoLogger } from "hono-pino"

export interface AppBindings {
  Variables: {
    logger: PinoLogger
  }
}

// biome-ignore lint/complexity/noBannedTypes: Allow empty object
export type AppOpenAPI<S extends Schema = {}> = OpenAPIHono<AppBindings, S>

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<
  R,
  AppBindings
>
