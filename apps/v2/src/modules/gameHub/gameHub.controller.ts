import { FastifyRequest } from "fastify"
import { sortAndPaginationSchema } from "@noroff/api-utils"
import { GameHubProducts } from "@prisma/v2-client"
import { BadRequest, NotFound } from "http-errors"

import { gameHubParamsSchema } from "./gameHub.schema"
import { getGameHubProduct, getGameHubProducts } from "./gameHub.service"

export async function getGameHubProductsHandler(
  request: FastifyRequest<{
    Querystring: {
      limit?: number
      page?: number
      sort?: keyof GameHubProducts
      sortOrder?: "asc" | "desc"
    }
  }>
) {
  await sortAndPaginationSchema.parseAsync(request.query)
  const { sort, sortOrder, limit, page } = request.query

  if (limit && limit > 100) {
    throw new BadRequest("Limit cannot be greater than 100")
  }

  const products = await getGameHubProducts(sort, sortOrder, limit, page)

  if (!products.data.length) {
    throw new NotFound("Couldn't find any products.")
  }

  return products
}

export async function getGameHubProductHandler(
  request: FastifyRequest<{
    Params: { id: string }
  }>
) {
  const params = gameHubParamsSchema.parse(request.params)
  const { id } = params

  const product = await getGameHubProduct(id)

  if (!product.data) {
    throw new NotFound("No product with such ID")
  }

  return product
}
