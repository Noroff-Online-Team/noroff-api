import { Prisma } from "@prisma/client"
import { prisma } from "../../../utils"
import { ProfileMediaSchema } from "./profiles.schema"

export async function getProfiles() {
  return prisma.profile.findMany({
    select: {
      email: true,
      name: true,
    }
  })
}

export async function getProfile(name: string) {
  return prisma.profile.findUnique({
    where: { name },
    include: {
      posts: true
    }
  })
}

export const createProfile = (data: Prisma.ProfileCreateInput) => {
  return prisma.profile.create({ data })
}

export const updateProfileMedia = async (name: string, { avatar, banner }: ProfileMediaSchema) => {
  prisma.profile.update({
    data: {
      avatar,
      banner
    },
    where: {
      name
    }
  })
