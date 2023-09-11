import { FastifyInstance } from "fastify"

import { squareEyesSchema, squareEyesParamsSchema } from "./squareEyes.schema"
import { createResponseSchema, sortAndPaginationSchema } from "@/utils"
import { getSquareEyesProductsHandler, getSquareEyesProductHandler } from "./squareEyes.controller"

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
