import { db, hashPassword } from "@/utils"
import { CreateProfileInput } from "./auth.schema"

const DEFAULT_CREDITS = 1000
const DEFAULT_VENUE_MANAGER = false
const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1579547945413-497e1b99dac0?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&h=400&w=400"
const DEFAULT_BANNER =
  "https://images.unsplash.com/photo-1579547945413-497e1b99dac0?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&h=500&w=1500"

export async function createProfile(input: CreateProfileInput) {
  const { password, banner, avatar, ...rest } = input

  const { hash, salt } = hashPassword(password)

  const profile = await db.userProfile.create({
    data: {
      ...rest,
      avatar: avatar || DEFAULT_AVATAR,
      banner: banner || DEFAULT_BANNER,
      venueManager: DEFAULT_VENUE_MANAGER,
      credits: DEFAULT_CREDITS,
      salt,
      password: hash
    }
  })

  return { data: profile }
}

export async function findProfileByEmail(email: string) {
  return await db.userProfile.findUnique({
    where: { email }
  })
}

export const findProfileByEmailOrName = async (email: string, name: string) => {
  return await db.userProfile.findFirst({
    where: {
      OR: [{ name }, { email }]
    }
  })
}
