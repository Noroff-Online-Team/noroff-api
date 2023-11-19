import { FastifyInstance } from "fastify"
import { createResponseSchema, sortAndPaginationSchema } from "@noroff/api-utils"

import { getOnlineShopProductHandler, getOnlineShopProductsHandler } from "./onlineShop.controller"
import { onlineShopParamsSchema, onlineShopSchema } from "./onlineShop.schema"

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
