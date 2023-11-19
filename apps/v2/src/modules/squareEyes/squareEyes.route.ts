import { FastifyInstance } from "fastify"
import { createResponseSchema, sortAndPaginationSchema } from "@noroff/api-utils"

import { getSquareEyesProductHandler, getSquareEyesProductsHandler } from "./squareEyes.controller"
import { squareEyesParamsSchema, squareEyesSchema } from "./squareEyes.schema"

async function squareEyesRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      schema: {
        tags: ["e-com"],
        querystring: sortAndPaginationSchema,
        response: {
          200: createResponseSchema(squareEyesSchema.array())
        }
      }
    },
    getSquareEyesProductsHandler
  )

  server.get(
    "/:id",
    {
      schema: {
        tags: ["e-com"],
        params: squareEyesParamsSchema,
        response: {
          200: createResponseSchema(squareEyesSchema)
        }
      }
    },
    getSquareEyesProductHandler
  )
}

export default squareEyesRoutes
