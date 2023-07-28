import { FastifyRequest } from "fastify"
import { NotFound, BadRequest, InternalServerError } from "http-errors"
import { ZodError } from "zod"
import { squareEyesParamsSchema } from "./squareEyes.schema"

import { getSquareEyesProducts, getSquareEyesProduct } from "./squareEyes.service"

export async function getSquareEyesProductsHandler() {
  try {
    const products = await getSquareEyesProducts()

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
    if (error instanceof ZodError) {
      throw new BadRequest(error.message)
    }

    if (error instanceof NotFound) {
      throw error
    }

    throw new InternalServerError("Something went wrong.")
  }
}
