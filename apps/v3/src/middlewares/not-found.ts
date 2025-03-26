import * as HttpStatusCodes from "@/helpers/http-status-codes"
import type { NotFoundHandler } from "hono"
import statuses from "statuses"

export const notFound: NotFoundHandler = c => {
  const statusCode = HttpStatusCodes.NOT_FOUND

  return c.json(
    {
      errors: [
        {
          message: `Route ${c.req.method}:${c.req.path} not found`
        }
      ],
      status: statuses(statusCode),
      statusCode
    },
    statusCode
  )
}
