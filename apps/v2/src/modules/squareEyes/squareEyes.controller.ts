import { FastifyRequest } from "fastify"
import { sortAndPaginationSchema } from "@noroff/api-utils"
import { SquareEyesProduct } from "@prisma/v2-client"
import { BadRequest, NotFound } from "http-errors"

import { squareEyesParamsSchema } from "./squareEyes.schema"
import { getSquareEyesProduct, getSquareEyesProducts } from "./squareEyes.service"

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
}

export async function getSquareEyesProductHandler(
  request: FastifyRequest<{
    Params: { id: string }
  }>
) {
  const params = squareEyesParamsSchema.parse(request.params)
  const { id } = params

  const product = await getSquareEyesProduct(id)

  if (!product.data) {
    throw new NotFound("No product with such ID")
  }

  return product
}
