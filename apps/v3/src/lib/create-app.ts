import type { Schema } from "hono"

import { OpenAPIHono } from "@hono/zod-openapi"
import { requestId } from "hono/request-id"

import { defaultHook } from "@/hooks/default-hook"
import { pinoLogger } from "@/middlewares/logger"
import { notFound } from "@/middlewares/not-found"
import { onError } from "@/middlewares/on-error"

import type { AppBindings, AppOpenAPI } from "@/types"

export function createRouter() {
  return new OpenAPIHono<AppBindings>({
    strict: false,
    defaultHook
  })
}

export default function createApp() {
  const app = createRouter()
  app.use(requestId()).use(pinoLogger())

  app.notFound(notFound)
  app.onError(onError)
  return app
}

export function createTestApp<S extends Schema>(router: AppOpenAPI<S>) {
  return createApp().route("/", router)
}
