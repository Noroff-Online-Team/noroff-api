import { Prisma } from "@prisma/client"
import { prisma } from "../../../utils"
import { ProfileMediaSchema } from "./profiles.schema"

export async function getProfiles() {
  return prisma.profile.findMany({
    select: {
      email: true,
      name: true,
      _count: {
        select: {
          posts: true,
          followers: true,
          following: true
        }
      }
    }
  })
}

export async function getProfile(name: string) {
  return prisma.profile.findUnique({
    where: { name },
    include: {
      posts: true,
      followers: true,
      following: true
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
}

export const followProfile = async (target: string, follower: string) => {
  console.log("follow", target, follower);

  return prisma.profile.update({
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
      email: true,
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
  console.log("unfollow", target, follower);
  
  return prisma.profile.update({
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
      email: true,
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