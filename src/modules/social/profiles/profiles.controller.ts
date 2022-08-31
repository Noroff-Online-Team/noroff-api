import { Prisma } from "@prisma/client"
import { FastifyReply, FastifyRequest } from "fastify"

import { getProfiles, getProfile, createProfile, updateProfile } from "./profiles.service"

export async function getProfilesHandler() {
  const profiles = await getProfiles()
  return profiles
}

export async function getProfileHandler(
  request: FastifyRequest<{
    Params: { id: number }
  }>,
  reply: FastifyReply
) {
  const { id } = request.params
  const profile = await getProfile(id)

  if (!profile) {
    const error = new Error("No profile with such ID")
    return reply.code(404).send(error)
  }

  return profile
}

export async function createProfileHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const profile = await createProfile(request.body as Prisma.ProfileCreateInput)
  reply.send(profile);
}

export async function updateProfileHandler(
  request: FastifyRequest<{
    Params: { id: number }
  }>,
  reply: FastifyReply
) {
  const { id } = request.params
  const profile = await updateProfile(id, request.body as Prisma.ProfileUpdateInput)
  reply.send(profile);
}