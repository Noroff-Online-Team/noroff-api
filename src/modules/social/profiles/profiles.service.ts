import { Prisma, Profile, Post } from "@prisma/client"
import { prisma } from "../../../utils"
import { ProfileIncludes } from "./profiles.controller"
import { ProfileMediaSchema } from "./profiles.schema"
import { PostIncludes } from "../posts/posts.controller"

export async function getProfiles(
  sort: keyof Profile = "name",
  sortOrder: "asc" | "desc" = "desc",
  limit = 100,
  offset = 0,
  includes: ProfileIncludes = {}
) {
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
    skip: offset
  })
}

export const getProfile = async (name: string, includes: ProfileIncludes = {}) =>
  await prisma.profile.findUnique({
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
    }
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
          avatar: true
        }
      },
      following: {
        select: {
          name: true,
          avatar: true
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
          avatar: true
        }
      },
      following: {
        select: {
          name: true,
          avatar: true
        }
      }
    }
  })
}

export const getProfilePosts = async (
  name: string,
  sort: keyof Post = "created",
  sortOrder: "asc" | "desc" = "desc",
  limit = 100,
  offset = 0,
  includes: PostIncludes = {}
) => {
  const withCommentAuthor = includes.comments ? { comments: { include: { author: true } } } : {}

  return await prisma.post.findMany({
    where: { owner: name },
    orderBy: {
      [sort]: sortOrder
    },
    take: limit,
    skip: offset,
    include: {
      ...includes,
      ...withCommentAuthor,
      _count: {
        select: {
          comments: true,
          reactions: true
        }
      }
    }
  })
}
