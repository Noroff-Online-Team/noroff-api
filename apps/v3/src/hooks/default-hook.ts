import type { Hook } from "@hono/zod-openapi"
import * as HttpStatusCodes from "stoker/http-status-codes"

// biome-ignore lint/suspicious/noExplicitAny: Allow any
export const defaultHook: Hook<any, any, any, any> = (result, c) => {
  if (!result.success) {
    return c.json(
      {
        success: result.success,
        error: result.error
      },
      HttpStatusCodes.UNPROCESSABLE_ENTITY
    )
  }
}
