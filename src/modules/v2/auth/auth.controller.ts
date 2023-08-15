import { FastifyReply, FastifyRequest } from "fastify"
import { verifyPassword } from "@/utils/hash"
import { mediaGuard } from "@/utils/mediaGuard"
import { CreateProfileInput, LoginInput, createProfileBodySchema, loginBodySchema } from "./auth.schema"
import { createProfile, findProfileByEmail, findProfileByEmailOrName } from "./auth.service"
import { BadRequest, InternalServerError, Unauthorized, isHttpError } from "http-errors"
import { ZodError } from "zod"

export async function registerProfileHandler(
  request: FastifyRequest<{
    Body: CreateProfileInput
  }>,
  reply: FastifyReply
) {
  try {
    const body = await createProfileBodySchema.parseAsync(request.body)

    const checkProfile = await findProfileByEmailOrName(body.email, body.name)

    if (checkProfile) {
      throw new BadRequest("Profile already exists")
    }

    await mediaGuard(body.avatar)

    const profile = await createProfile(body)

    reply.code(201).send(profile)
  } catch (error) {
    if (error instanceof ZodError) {
      throw new BadRequest(error.message)
    }

    if (isHttpError(error)) {
      throw error
    }

    throw new InternalServerError("Something went wrong.")
  }
}

export async function loginHandler(
  request: FastifyRequest<{
    Body: LoginInput
  }>
) {
  try {
    const body = await loginBodySchema.parseAsync(request.body)

    const profile = await findProfileByEmail(body.email)

    if (!profile) {
      throw new Unauthorized("Invalid email or password")
    }

    // Compare supplied password with stored password
    const correctPassword = verifyPassword({
      candidatePassword: body.password,
      salt: profile.salt,
      hash: profile.password
    })

    if (!correctPassword) {
      throw new Unauthorized("Invalid email or password")
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, salt, ...rest } = profile

    return {
      data: {
        name: profile.name,
        email: profile.email,
        avatar: profile.avatar,
        banner: profile.banner,
        accessToken: request.jwt.sign(rest)
      }
    }
  } catch (error) {
    if (error instanceof ZodError) {
      throw new BadRequest(error.message)
    }

    if (isHttpError(error)) {
      throw error
    }

    throw new InternalServerError("Something went wrong.")
  }
}
