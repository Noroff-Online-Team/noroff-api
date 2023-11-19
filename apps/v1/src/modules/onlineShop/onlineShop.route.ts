import { FastifyInstance } from "fastify"

import { getOnlineShopProductHandler, getOnlineShopProductsHandler } from "./onlineShop.controller"
import { onlineShopParamsSchema, onlineShopResponseSchema } from "./onlineShop.schema"

async function onlineShopRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      schema: {
        tags: ["online-shop"],
        response: {
          200: onlineShopResponseSchema.array()
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
          200: onlineShopResponseSchema
        }
      }
    },
    getOnlineShopProductHandler
  )
}

export default onlineShopRoutes
