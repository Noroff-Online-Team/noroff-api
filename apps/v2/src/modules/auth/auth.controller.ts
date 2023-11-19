import { FastifyReply, FastifyRequest } from "fastify"
import { mediaGuard, verifyPassword } from "@noroff/api-utils"
import { UserProfile } from "@prisma/v2-client"
import { BadRequest, Unauthorized } from "http-errors"

import {
  CreateAPIKeyInput,
  createApiKeySchema,
  createProfileBodySchema,
  CreateProfileInput,
  loginBodySchema,
  LoginInput
} from "./auth.schema"
import { createApiKey, createProfile, findProfileByEmail, findProfileByEmailOrName } from "./auth.service"

export async function registerProfileHandler(
  request: FastifyRequest<{
    Body: CreateProfileInput
  }>,
  reply: FastifyReply
) {
  const body = await createProfileBodySchema.parseAsync(request.body)

  const checkProfile = await findProfileByEmailOrName(body.email, body.name)

  if (checkProfile.data) {
    throw new BadRequest("Profile already exists")
  }

  if (body.avatar?.url) {
    await mediaGuard(body.avatar.url)
  }
  if (body.banner?.url) {
    await mediaGuard(body.banner.url)
  }

  const profile = await createProfile(body)

  reply.code(201).send(profile)
}

export async function loginHandler(
  request: FastifyRequest<{
    Body: LoginInput
  }>
) {
  const body = await loginBodySchema.parseAsync(request.body)

  const profile = await findProfileByEmail(body.email)

  if (!profile.data) {
    throw new Unauthorized("Invalid email or password")
  }

  // Compare supplied password with stored password
  const correctPassword = verifyPassword({
    candidatePassword: body.password,
    salt: profile.data.salt,
    hash: profile.data.password
  })

  if (!correctPassword) {
    throw new Unauthorized("Invalid email or password")
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, salt, ...rest } = profile.data

  return {
    data: {
      name: profile.data.name,
      email: profile.data.email,
      bio: profile.data.bio,
      avatar: profile.data.avatar,
      banner: profile.data.banner,
      accessToken: request.jwt.sign(rest)
    }
  }
}

export async function createApiKeyHandler(
  request: FastifyRequest<{
    Body: CreateAPIKeyInput
  }>,
  reply: FastifyReply
) {
  await createApiKeySchema.parseAsync(request.body)
  const { name: userName } = request.user as UserProfile

  const apiKey = await createApiKey(userName, request.body?.name)

  reply.code(201).send(apiKey)
}
