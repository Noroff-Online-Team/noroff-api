import { createRoute, z } from "@hono/zod-openapi"

import { createRouter } from "@/lib/create-app"
import * as HttpStatusCodes from "stoker/http-status-codes"
import jsonContent from "stoker/openapi/helpers/json-content"

const router = createRouter().openapi(
  createRoute({
    tags: ["index"],
    method: "get",
    path: "/",
    hide: true, // Hides the route from Swagger UI
    responses: {
      [HttpStatusCodes.OK]: jsonContent(
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
