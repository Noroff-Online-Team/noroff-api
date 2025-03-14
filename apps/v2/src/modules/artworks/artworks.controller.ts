import { mediaGuard } from "@noroff/api-utils"
import type { Artwork } from "@prisma/v2-client"
import type { FastifyReply, FastifyRequest } from "fastify"
import { BadRequest, Forbidden, NotFound } from "http-errors"

import type { RequestUser } from "@/types/api"
import {
  type CreateArtworkSchema,
  type UpdateArtworkSchema,
  artworkIdSchema,
  artworksQuerySchema,
  createArtworkSchema,
  updateArtworkSchema
} from "./artworks.schema"

import {
  createArtwork,
  deleteArtwork,
  getArtwork,
  getArtworks,
  updateArtwork
} from "./artworks.service"

export async function getArtworksHandler(
  request: FastifyRequest<{
    Querystring: {
      limit?: number
      page?: number
      sort?: keyof Artwork
      sortOrder?: "asc" | "desc"
    }
  }>
) {
  await artworksQuerySchema.parseAsync(request.query)
  const { limit, page, sort, sortOrder } = request.query

  if (limit && limit > 100) {
    throw new BadRequest("Limit cannot be greater than 100")
  }

  const artworks = await getArtworks(sort, sortOrder, limit, page)

  return artworks
}

export async function getArtworkHandler(
  request: FastifyRequest<{
    Params: { id: string }
  }>
) {
  const { id } = artworkIdSchema.parse(request.params)
  const artwork = await getArtwork(id)

  if (!artwork.data) {
    throw new NotFound("Artwork not found")
  }

  return artwork
}

export async function createArtworkHandler(
  request: FastifyRequest<{
    Body: CreateArtworkSchema
  }>,
  reply: FastifyReply
) {
  const { name } = request.user as RequestUser
  const { image } = await createArtworkSchema.parseAsync(request.body)

  if (image) {
    await mediaGuard(image.url)
  }

  const artwork = await createArtwork(name, request.body)

  reply.code(201).send(artwork)
}

export async function updateArtworkHandler(
  request: FastifyRequest<{
    Params: { id: string }
    Body: UpdateArtworkSchema
  }>,
  reply: FastifyReply
) {
  const { name } = request.user as RequestUser
  const { id } = artworkIdSchema.parse(request.params)
  const { image } = await updateArtworkSchema.parseAsync(request.body)

  const artwork = await getArtwork(id)

  if (!artwork.data) {
    throw new NotFound("Artwork not found")
  }

  if (artwork.data.ownerName.toLowerCase() !== name.toLowerCase()) {
    throw new Forbidden("You are not the owner of this artwork")
  }

  if (image) {
    await mediaGuard(image.url)
  }

  const updatedArtwork = await updateArtwork(id, request.body)

  reply.code(200).send(updatedArtwork)
}

export async function deleteArtworkHandler(
  request: FastifyRequest<{
    Params: { id: string }
  }>,
  reply: FastifyReply
) {
  const { name } = request.user as RequestUser
  const { id } = artworkIdSchema.parse(request.params)

  const artwork = await getArtwork(id)

  if (!artwork.data) {
    throw new NotFound("Artwork not found")
  }

  if (artwork.data.ownerName.toLowerCase() !== name.toLowerCase()) {
    throw new Forbidden("You are not the owner of this artwork")
  }

  await deleteArtwork(id)

  reply.code(204).send()
}
