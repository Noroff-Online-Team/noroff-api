import { db, hashPassword } from "@/utils"
import { CreateProfileInput } from "./auth.schema"

const DEFAULT_CREDITS = 1000
const DEFAULT_VENUE_MANAGER = false

export async function createProfile(input: CreateProfileInput) {
  const { password, ...rest } = input

  const { hash, salt } = hashPassword(password)

  const profile = await db.userProfile.create({
    data: {
      ...rest,
      venueManager: DEFAULT_VENUE_MANAGER,
      credits: DEFAULT_CREDITS,
      salt,
      password: hash
    }
  })

  return profile
}

export async function findProfileByEmail(email: string) {
  return await db.userProfile.findUnique({
    where: {
      email
    }
  })
}

export const findProfileByEmailOrName = async (email: string, name: string) => {
  return await db.userProfile.findFirst({
    where: {
      OR: [{ name }, { email }]
    }
  })
}
