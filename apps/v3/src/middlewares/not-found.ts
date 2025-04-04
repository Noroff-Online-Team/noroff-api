import type { NotFoundHandler } from "hono"
import statuses from "statuses"
import * as HttpStatusCodes from "stoker/http-status-codes"

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
