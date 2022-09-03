import { Prisma } from "@prisma/client"
import { FastifyReply, FastifyRequest } from "fastify"

import { getProfiles, getProfile, createProfile, updateProfile } from "./profiles.service"

export async function getProfilesHandler() {
  const profiles = await getProfiles()
  return profiles
}

export async function getProfileHandler(
  request: FastifyRequest<{
    Params: { name: string }
  }>,
  reply: FastifyReply
) {
  
  const { name } = request.params
  const profile = await getProfile(name)

  if (!profile) {
    const error = new Error("No profile with this name")
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
    Params: { name: string }
  }>,
  reply: FastifyReply
) {
  const { name } = request.params
  const profile = await updateProfile(name, request.body as Prisma.ProfileUpdateInput)
  reply.send(profile);
}