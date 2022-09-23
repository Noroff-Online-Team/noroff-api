import { Prisma, Profile } from "@prisma/client"
import { prisma } from "../../../utils"
import { ProfileIncludes } from "./profiles.controller"
import { ProfileMediaSchema } from "./profiles.schema"

export async function getProfiles(sort: keyof Profile = "name", sortOrder: "asc" | "desc" = "desc", limit = 100, offset = 0, includes: ProfileIncludes = {}) {
  return await prisma.profile.findMany({
    include: {
      ...includes,
      _count: {
        select: {
          posts: true,
          followers: true,
          following: true
        }
      }
    },
    orderBy: {
      [sort]: sortOrder
    },
    take: limit,
    skip: offset,
  })
}

export const getProfile = async (name: string, includes: ProfileIncludes = {}) => await prisma.profile.findUnique({
  where: { name },
  include: {
    ...includes,
    _count: {
      select: {
        posts: true,
        followers: true,
        following: true
      }
    }
  }
})

export const createProfile = async (data: Prisma.ProfileCreateInput) => {
  return await prisma.profile.create({ data })
}

export const updateProfileMedia = async (name: string, { avatar, banner }: ProfileMediaSchema) => {
  return await prisma.profile.update({
    where: { name },
    data: {
      avatar,
      banner
    },
  })
}

export const followProfile = async (target: string, follower: string) => {
  return await prisma.profile.update({
    where: {
      name: follower
    },
    data: {
      following: {
        connect: {
          name: target
        }
      }
    },
    select: {
      name: true,
      avatar: true,
      followers: {
        select: {
          name: true,
          avatar: true,
        }
      },
      following: {
        select: {
          name: true,
          avatar: true,
        }
      }
    }
  })
}

export const unfollowProfile = async (target: string, follower: string) => {
  return await prisma.profile.update({
    where: {
      name: follower
    },
    data: {
      following: {
        disconnect: {
          name: target
        }
      }
    },
    select: {
      name: true,
      avatar: true,
      followers: {
        select: {
          name: true,
          avatar: true,
        }
      },
      following: {
        select: {
          name: true,
          avatar: true,
        }
      }
    }
  })
}

export const deleteProfile = async (name: string) => {
  return await prisma.profile.delete({
    where: { name }
  })
}