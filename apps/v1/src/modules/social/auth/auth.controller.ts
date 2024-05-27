import type { FastifyReply, FastifyRequest } from "fastify"
import { mediaGuard, verifyPassword } from "@noroff/api-utils"
import { BadRequest, Unauthorized } from "http-errors"

import type { CreateProfileInput } from "../profiles/profiles.schema"
import type { LoginInput } from "./auth.schema"
import {
  createProfile,
  findProfileByEmail,
  findProfileByEmailOrName
} from "./auth.service"

export async function registerProfileHandler(
  request: FastifyRequest<{
    Body: CreateProfileInput
  }>,
  reply: FastifyReply
) {
  const body = request.body

  const checkProfile = await findProfileByEmailOrName(body.email, body.name)

  if (checkProfile) {
    throw new BadRequest("Profile already exists")
  }

  await mediaGuard(body.banner)
  await mediaGuard(body.avatar)

  const profile = await createProfile(body)
  return reply.code(201).send(profile)
}

export async function loginHandler(
  request: FastifyRequest<{
    Body: LoginInput
  }>
) {
  const body = request.body

  const profile = await findProfileByEmail(body.email)

  if (!profile) {
    throw new Unauthorized("Invalid email or password")
  }

  // verify password
  const correctPassword = verifyPassword({
    candidatePassword: body.password,
    salt: profile.salt,
    hash: profile.password
  })

  if (correctPassword) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, salt, ...rest } = profile
    // generate access token
    return {
      accessToken: request.jwt.sign(rest),
      name: profile.name,
      avatar: profile.avatar,
      banner: profile.banner,
      email: profile.email
    }
  }

  throw new Unauthorized("Invalid email or password")
}
