import type { FastifyReply, FastifyRequest } from "fastify"
import { mediaGuard, verifyPassword } from "@noroff/api-utils"
import type { UserProfile } from "@prisma/v2-client"
import { BadRequest, Unauthorized } from "http-errors"

import {
  type CreateAPIKeyInput,
  createApiKeySchema,
  createProfileBodySchema,
  type CreateProfileInput,
  loginBodySchema,
  type LoginInput,
  loginQuerySchema
} from "./auth.schema"
import {
  createApiKey,
  createProfile,
  findProfileByEmail,
  findProfileByEmailOrName
} from "./auth.service"

export interface AuthLoginIncludes {
  holidaze?: boolean
}

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
    Querystring: {
      _holidaze?: string
    }
  }>
) {
  const body = await loginBodySchema.parseAsync(request.body)
  const { _holidaze } = await loginQuerySchema.parseAsync(request.query)

  const includes: AuthLoginIncludes = {
    holidaze: Boolean(_holidaze)
  }

  const profile = await findProfileByEmail(body.email, includes)

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
      ...rest,
      accessToken: request.jwt.sign({
        name: rest.name,
        email: rest.email
      })
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
