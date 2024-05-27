import type { FastifyRequest } from "fastify"
import { NotFound } from "http-errors"

import {
  getSquareEyesProduct,
  getSquareEyesProducts
} from "./squareEyes.service"

export async function getSquareEyesProductsHandler() {
  const products = await getSquareEyesProducts()
  return products
}

export async function getSquareEyesProductHandler(
  request: FastifyRequest<{
    Params: { id: string }
  }>
) {
  const { id } = request.params
  const product = await getSquareEyesProduct(id)

  if (!product) {
    throw new NotFound("No product with such ID")
  }

  return product
}
