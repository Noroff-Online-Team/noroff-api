import { mediaGuard } from "@noroff/api-utils"
import type { Pet } from "@prisma/v2-client"
import type { FastifyReply, FastifyRequest } from "fastify"
import { BadRequest, Forbidden, NotFound } from "http-errors"

import type { RequestUser } from "@/types/api"
import {
  type CreatePetSchema,
  type UpdatePetSchema,
  createPetSchema,
  petIdSchema,
  petsQuerySchema,
  updatePetSchema
} from "./pets.schema"

import {
  createPet,
  deletePet,
  getPet,
  getPets,
  updatePet
} from "./pets.service"

export async function getPetsHandler(
  request: FastifyRequest<{
    Querystring: {
      limit?: number
      page?: number
      sort?: keyof Pet
      sortOrder?: "asc" | "desc"
    }
  }>
) {
  await petsQuerySchema.parseAsync(request.query)
  const { limit, page, sort, sortOrder } = request.query

  if (limit && limit > 100) {
    throw new BadRequest("Limit cannot be greater than 100")
  }

  const pets = await getPets(sort, sortOrder, limit, page)

  return pets
}

export async function getPetHandler(
  request: FastifyRequest<{
    Params: { id: string }
  }>
) {
  const { id } = petIdSchema.parse(request.params)
  const pet = await getPet(id)

  if (!pet.data) {
    throw new NotFound("Pet not found")
  }

  return pet
}

export async function createPetHandler(
  request: FastifyRequest<{
    Body: CreatePetSchema
  }>,
  reply: FastifyReply
) {
  const { name } = request.user as RequestUser
  const { image } = await createPetSchema.parseAsync(request.body)

  if (image) {
    await mediaGuard(image.url)
  }

  const pet = await createPet(name, request.body)

  reply.code(201).send(pet)
}

export async function updatePetHandler(
  request: FastifyRequest<{
    Params: { id: string }
    Body: UpdatePetSchema
  }>,
  reply: FastifyReply
) {
  const { name } = request.user as RequestUser
  const { id } = petIdSchema.parse(request.params)
  const { image } = await updatePetSchema.parseAsync(request.body)

  const pet = await getPet(id)

  if (!pet.data) {
    throw new NotFound("Pet not found")
  }

  if (pet.data.ownerName.toLowerCase() !== name.toLowerCase()) {
    throw new Forbidden("You are not the owner of this pet")
  }

  if (image) {
    await mediaGuard(image.url)
  }

  const updatedPet = await updatePet(id, request.body)

  reply.code(200).send(updatedPet)
}

export async function deletePetHandler(
  request: FastifyRequest<{
    Params: { id: string }
  }>,
  reply: FastifyReply
) {
  const { name } = request.user as RequestUser
  const { id } = petIdSchema.parse(request.params)

  const pet = await getPet(id)

  if (!pet.data) {
    throw new NotFound("Pet not found")
  }

  if (pet.data.ownerName.toLowerCase() !== name.toLowerCase()) {
    throw new Forbidden("You are not the owner of this pet")
  }

  await deletePet(id)

  reply.code(204).send()
}
