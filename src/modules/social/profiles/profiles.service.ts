import { Prisma } from "@prisma/client"
import { prisma } from "../../../utils"

export async function getProfiles() {
  return prisma.profile.findMany({
    include: {
      posts: true
    }
  })
}

export async function getProfile(id: number) {
  return prisma.profile.findUnique({
    where: { id },
    include: {
      posts: true
    }
  })
}

export const createProfile = (data: Prisma.ProfileCreateInput) => {
  return prisma.profile.create({ data })
}

export const updateProfile = (id: number, data: Prisma.ProfileUpdateInput) =>
  prisma.profile.update({
    data,
    where: {
      id
    }
  })
