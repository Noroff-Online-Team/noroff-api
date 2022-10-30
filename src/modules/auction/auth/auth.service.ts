import { prisma, hashPassword } from "../../../utils"
import { CreateProfileInput } from "../profiles/profiles.schema"

const DEFAULT_CREDITS = 1000

export async function createProfile(input: CreateProfileInput) {
  const { password, ...rest } = input

  const { hash, salt } = hashPassword(password)

  const profile = await prisma.auctionProfile.create({
    data: { ...rest, credits: DEFAULT_CREDITS, salt, password: hash }
  })

  return profile
}

export async function findProfileByEmail(email: string) {
  return await prisma.auctionProfile.findUnique({
    where: {
      email
    }
  })
}

export const findProfileByEmailOrName = async (email: string, name: string) => {
  return await prisma.auctionProfile.findFirst({
    where: {
      OR: [{ name }, { email }]
    }
  })
}
