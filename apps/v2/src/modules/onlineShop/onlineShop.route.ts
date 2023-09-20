import { FastifyInstance } from "fastify"

import { onlineShopSchema, onlineShopParamsSchema } from "./onlineShop.schema"
import { createResponseSchema, sortAndPaginationSchema } from "@noroff/api-utils"
import { getOnlineShopProductsHandler, getOnlineShopProductHandler } from "./onlineShop.controller"

async function onlineShopRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      schema: {
        tags: ["online-shop"],
        querystring: sortAndPaginationSchema,
        response: {
          200: createResponseSchema(onlineShopSchema.array())
        }
      }
    },
    getOnlineShopProductsHandler
  )

  server.get(
    "/:id",
    {
      schema: {
        tags: ["online-shop"],
        params: onlineShopParamsSchema,
        response: {
          200: createResponseSchema(onlineShopSchema)
        }
      }
    },
    getOnlineShopProductHandler
  )
}

export default onlineShopRoutes
