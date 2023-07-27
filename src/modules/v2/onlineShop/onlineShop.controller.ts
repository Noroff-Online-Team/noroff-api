import { FastifyRequest } from "fastify"
import { NotFound, BadRequest, InternalServerError } from "http-errors"
import { ZodError } from "zod"
import { onlineShopParamsSchema } from "./onlineShop.schema"

import { getOnlineShopProducts, getOnlineShopProduct } from "./onlineShop.service"

export async function getOnlineShopProductsHandler() {
  try {
    const products = await getOnlineShopProducts()

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

export async function getOnlineShopProductHandler(
  request: FastifyRequest<{
    Params: { id: string }
  }>
) {
  try {
    const params = onlineShopParamsSchema.parse(request.params)
    const { id } = params

    const product = await getOnlineShopProduct(id)

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
