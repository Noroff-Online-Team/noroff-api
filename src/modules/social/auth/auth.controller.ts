import { FastifyReply, FastifyRequest } from "fastify"
import { verifyPassword } from "../../../utils/hash"
import { CreateProfileInput } from "../profiles/profiles.schema"
import { LoginInput } from "./auth.schema"
import { createProfile, findProfileByEmail } from "./auth.service"

export async function registerProfileHandler(
  request: FastifyRequest<{
    Body: CreateProfileInput
  }>,
  reply: FastifyReply
) {
  const body = request.body

  try {
    const profile = await createProfile(body)

    return reply.code(201).send(profile)
  } catch (e) {
    console.log(e)
    return reply.code(500).send(e)
  }
}

export async function loginHandler(
  request: FastifyRequest<{
    Body: LoginInput
  }>,
  reply: FastifyReply
) {
  const body = request.body

  // find a profile by email
  const profile = await findProfileByEmail(body.email)

  if (!profile) {
    return reply.code(401).send({
      message: "Invalid email or password"
    })
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
      email: profile.email
    }
  }

  return reply.code(401).send({
    message: "Invalid email or password"
  })
}
