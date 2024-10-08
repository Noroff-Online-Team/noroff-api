import { hashPassword } from "@noroff/api-utils"

import { prisma } from "@/utils"

import type { CreateProfileInput } from "../profiles/profiles.schema"

export async function createProfile(input: CreateProfileInput) {
  const { password, ...rest } = input

  const { hash, salt } = hashPassword(password)

  const profile = await prisma.holidazeProfile.create({
    data: { ...rest, salt, password: hash }
  })

  return profile
}

export async function findProfileByEmail(email: string) {
  return await prisma.holidazeProfile.findUnique({
    where: {
      email
    }
  })
}

export const findProfileByEmailOrName = async (email: string, name: string) => {
  return await prisma.holidazeProfile.findFirst({
    where: {
      OR: [{ name }, { email }]
    }
  })
}
