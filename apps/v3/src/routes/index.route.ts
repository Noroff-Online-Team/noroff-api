import { createRoute, z } from "@hono/zod-openapi"

import { jsonResponse } from "@/helpers/response-schemas"
import { createRouter } from "@/lib/create-app"
import * as HttpStatusCodes from "stoker/http-status-codes"

const router = createRouter().openapi(
  createRoute({
    tags: ["index"],
    method: "get",
    path: "/",
    hide: true, // Hides the route from Swagger UI
    responses: {
      [HttpStatusCodes.OK]: jsonResponse(
        z.object({
          message: z.string(),
          github: z.string().url(),
          docs: z.string().url(),
          swagger: z.string().url()
        }),
        "Noroff API v3 Index"
      )
    }
  }),
  c => {
    return c.json(
      {
        message: "Welcome to the Noroff API v3!",
        github: "https://github.com/Noroff-Online-Team/noroff-api",
        docs: "https://docs.noroff.dev/docs/v3",
        swagger: "https://v3.api.noroff.dev/docs"
      },
      HttpStatusCodes.OK
    )
  }
)

export default router
