import { FastifyRequest } from "fastify"
import { RainyDaysProduct } from "@prisma/v2-client"
import { isHttpError, NotFound, BadRequest, InternalServerError } from "http-errors"
import { ZodError } from "zod"
import { rainyDaysParamsSchema } from "./rainyDays.schema"
import { sortAndPaginationSchema } from "@noroff/api-utils"

import { getRainyDaysProducts, getRainyDaysProduct } from "./rainyDays.service"

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
  try {
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
  } catch (error) {
    if (error instanceof ZodError) {
      throw new BadRequest(error.message)
    }

    if (isHttpError(error)) {
      throw error
    }

    throw new InternalServerError("Something went wrong.")
  }
}

export async function getRainyDaysProductHandler(
  request: FastifyRequest<{
    Params: { id: string }
  }>
) {
  try {
    const params = rainyDaysParamsSchema.parse(request.params)
    const { id } = params

    const product = await getRainyDaysProduct(id)

    if (!product.data) {
      throw new NotFound("No product with such ID")
    }

    return product
  } catch (error) {
    if (error instanceof ZodError) {
      throw new BadRequest(error.message)
    }

    if (isHttpError(error)) {
      throw error
    }

    throw new InternalServerError("Something went wrong.")
  }
}
