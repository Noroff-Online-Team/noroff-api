import { FastifyRequest } from "fastify"
import { SquareEyesProduct } from "@prisma/v2-client"
import { NotFound, BadRequest } from "http-errors"
import { squareEyesParamsSchema } from "./squareEyes.schema"
import { sortAndPaginationSchema } from "@noroff/api-utils"

import { getSquareEyesProducts, getSquareEyesProduct } from "./squareEyes.service"

export async function getSquareEyesProductsHandler(
  request: FastifyRequest<{
    Querystring: {
      limit?: number
      page?: number
      sort?: keyof SquareEyesProduct
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

    const products = await getSquareEyesProducts(sort, sortOrder, limit, page)

    if (!products.data.length) {
      throw new NotFound("Couldn't find any products.")
    }

    return products
  } catch (error) {
    throw error
  }
}

export async function getSquareEyesProductHandler(
  request: FastifyRequest<{
    Params: { id: string }
  }>
) {
  try {
    const params = squareEyesParamsSchema.parse(request.params)
    const { id } = params

    const product = await getSquareEyesProduct(id)

    if (!product.data) {
      throw new NotFound("No product with such ID")
    }

    return product
  } catch (error) {
    throw error
  }
}
