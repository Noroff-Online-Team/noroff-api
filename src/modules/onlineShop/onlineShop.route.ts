import { FastifyInstance } from "fastify"

import { onlineShopResponseSchema, onlineShopParamsSchema } from "./onlineShop.schema"
import { getOnlineShopProductsHandler, getOnlineShopProductHandler } from "./onlineShop.controller"

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
