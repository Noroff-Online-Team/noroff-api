import { prisma, hashPassword } from "../../../utils"
import { CreateProfileInput } from "../profiles/profiles.schema"


export async function createProfile(input: CreateProfileInput) {
  const { password, ...rest } = input

  const { hash, salt } = hashPassword(password)

  const profile = await prisma.profile.create({
    data: { ...rest, salt, password: hash }
  })

  return profile
}

export async function findProfileByEmail(email: string) {
  return prisma.profile.findUnique({
    where: {
      email
    }
  })
}
