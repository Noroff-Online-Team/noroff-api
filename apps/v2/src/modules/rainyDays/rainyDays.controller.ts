import { FastifyRequest } from "fastify"
import { sortAndPaginationSchema } from "@noroff/api-utils"
import { RainyDaysProduct } from "@prisma/v2-client"
import { BadRequest, NotFound } from "http-errors"

import { rainyDaysParamsSchema } from "./rainyDays.schema"
import { getRainyDaysProduct, getRainyDaysProducts } from "./rainyDays.service"

export async function getRainyDaysProductsHandler(
  request: FastifyRequest<{
    Querystring: {
      limit?: number
      page?: number
      sort?: keyof RainyDaysProduct
      sortOrder?: "asc" | "desc"
    }
  }>
) {
  await sortAndPaginationSchema.parseAsync(request.query)
  const { sort, sortOrder, limit, page } = request.query

  if (limit && limit > 100) {
    throw new BadRequest("Limit cannot be greater than 100")
  }

  const products = await getRainyDaysProducts(sort, sortOrder, limit, page)

  if (!products.data.length) {
    throw new NotFound("Couldn't find any products.")
  }

  return products
}

export async function getRainyDaysProductHandler(
  request: FastifyRequest<{
    Params: { id: string }
  }>
) {
  const params = rainyDaysParamsSchema.parse(request.params)
  const { id } = params

  const product = await getRainyDaysProduct(id)

  if (!product.data) {
    throw new NotFound("No product with such ID")
  }

  return product
}
