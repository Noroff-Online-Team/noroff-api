import { FastifyInstance } from "fastify"

import { squareEyesSchema, squareEyesParamsSchema } from "./squareEyes.schema"
import { createResponseSchema } from "@/utils/createResponseSchema"
import { getSquareEyesProductsHandler, getSquareEyesProductHandler } from "./squareEyes.controller"

async function squareEyesRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      schema: {
        tags: ["e-com"],
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
