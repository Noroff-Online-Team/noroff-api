import { hashPassword } from "@noroff/api-utils"

import { db } from "@/utils"

import { CreateProfileInput } from "./auth.schema"

const DEFAULT_AVATAR = {
  url: "https://images.unsplash.com/photo-1579547945413-497e1b99dac0?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&h=400&w=400",
  alt: "A blurry multi-colored rainbow background"
}

const DEFAULT_BANNER = {
  url: "https://images.unsplash.com/photo-1579547945413-497e1b99dac0?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&h=500&w=1500",
  alt: "A blurry multi-colored rainbow background"
}

export async function createProfile(input: CreateProfileInput) {
  const { password, banner, avatar, ...rest } = input

  const { hash, salt } = hashPassword(password)

  const profile = await db.userProfile.create({
    data: {
      ...rest,
      avatar: avatar?.url ? { create: avatar } : { create: DEFAULT_AVATAR },
      banner: banner?.url ? { create: banner } : { create: DEFAULT_BANNER },
      salt,
      password: hash
    },
    include: {
      avatar: true,
      banner: true
    }
  })

  return { data: profile }
}

export async function findProfileByEmail(email: string) {
  const data = await db.userProfile.findUnique({
    where: { email },
    include: { avatar: true, banner: true }
  })

  return { data }
}

export const findProfileByEmailOrName = async (email: string, name: string) => {
  const data = await db.userProfile.findFirst({
    where: { OR: [{ name }, { email }] },
    include: { avatar: true, banner: true }
  })

  return { data }
}

export const createApiKey = async (userName: string, apiKeyName?: string) => {
  const data = await db.apiKey.create({
    data: {
      name: apiKeyName,
      user: { connect: { name: userName } }
    }
  })

  return { data }
}
