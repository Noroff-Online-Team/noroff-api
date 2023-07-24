import { FastifyReply, FastifyRequest } from "fastify"
import { BadRequest, Unauthorized } from "http-errors"
import { LoginInput } from "./auth.schema"
import { createProfile, findProfileByEmail, findProfileByEmailOrName } from "./auth.service"
import { CreateProfileInput } from "../profiles/profiles.schema"
import { verifyPassword } from "@/utils/hash"
import { mediaGuard } from "@/utils/mediaGuard"

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

  await mediaGuard(body.avatar)

  const profile = await createProfile(body)
  return reply.code(201).send(profile)
}

export async function loginHandler(
  request: FastifyRequest<{
    Body: LoginInput
  }>,
  reply: FastifyReply
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
    return reply.code(200).send({
      name: profile.name,
      email: profile.email,
      avatar: profile.avatar,
      venueManager: profile.venueManager,
      accessToken: request.jwt.sign(rest)
    })
  }

  throw new Unauthorized("Invalid email or password")
}
