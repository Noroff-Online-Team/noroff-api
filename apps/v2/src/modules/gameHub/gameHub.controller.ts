import { FastifyRequest } from "fastify"
import { GameHubProducts } from "@prisma/v2-client"
import { NotFound, BadRequest } from "http-errors"
import { gameHubParamsSchema } from "./gameHub.schema"
import { sortAndPaginationSchema } from "@noroff/api-utils"

import { getGameHubProducts, getGameHubProduct } from "./gameHub.service"

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
  try {
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
  } catch (error) {
    throw error
  }
}

export async function getGameHubProductHandler(
  request: FastifyRequest<{
    Params: { id: string }
  }>
) {
  try {
    const params = gameHubParamsSchema.parse(request.params)
    const { id } = params

    const product = await getGameHubProduct(id)

    if (!product.data) {
      throw new NotFound("No product with such ID")
    }

    return product
  } catch (error) {
    throw error
  }
}
