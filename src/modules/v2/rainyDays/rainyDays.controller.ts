import { FastifyRequest } from "fastify"
import { NotFound, BadRequest, InternalServerError } from "http-errors"
import { ZodError } from "zod"
import { rainyDaysParamsSchema } from "./rainyDays.schema"

import { getRainyDaysProducts, getRainyDaysProduct } from "./rainyDays.service"

export async function getRainyDaysProductsHandler() {
  try {
    const products = await getRainyDaysProducts()

    if (!products.data.length) {
      throw new NotFound("Couldn't find any products.")
    }

    return products
  } catch (error) {
    if (error instanceof NotFound) {
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

    if (error instanceof NotFound) {
      throw error
    }

    throw new InternalServerError("Something went wrong.")
  }
}
