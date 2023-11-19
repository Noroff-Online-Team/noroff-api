import { FastifyInstance } from "fastify"

import { getSquareEyesProductHandler, getSquareEyesProductsHandler } from "./squareEyes.controller"
import { squareEyesParamsSchema, squareEyesResponseSchema } from "./squareEyes.schema"

async function squareEyesRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      schema: {
        tags: ["e-com"],
        response: {
          200: squareEyesResponseSchema.array()
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
          200: squareEyesResponseSchema
        }
      }
    },
    getSquareEyesProductHandler
  )
}

export default squareEyesRoutes
