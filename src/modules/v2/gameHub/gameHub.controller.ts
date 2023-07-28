import { FastifyRequest } from "fastify"
import { NotFound, BadRequest, InternalServerError } from "http-errors"
import { ZodError } from "zod"
import { gameHubParamsSchema } from "./gameHub.schema"

import { getGameHubProducts, getGameHubProduct } from "./gameHub.service"

export async function getGameHubProductsHandler() {
  try {
    const products = await getGameHubProducts()

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
    if (error instanceof ZodError) {
      throw new BadRequest(error.message)
    }

    if (error instanceof NotFound) {
      throw error
    }

    throw new InternalServerError("Something went wrong.")
  }
}
