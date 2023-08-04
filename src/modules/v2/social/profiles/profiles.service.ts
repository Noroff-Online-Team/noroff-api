import { UserProfile, SocialPost } from "@prisma-api-v2/client"
import { db } from "@/utils"
import { ProfileIncludes } from "./profiles.controller"
import { ProfileMediaSchema } from "./profiles.schema"
import { SocialPostIncludes } from "../posts/posts.controller"

export async function getProfiles(
  sort: keyof UserProfile = "name",
  sortOrder: "asc" | "desc" = "desc",
  limit = 100,
  page = 1,
  includes: ProfileIncludes = {}
) {
  const [data, meta] = await db.userProfile
    .paginate({
      orderBy: {
        [sort]: sortOrder
      },
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
    .withPages({
      limit: limit,
      page: page
    })

  return { data, meta }
}

export const getProfile = async (name: string, includes: ProfileIncludes = {}) => {
  const [data, meta] = await db.userProfile
    .paginate({
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
    .withPages({
      limit: 1
    })

  return { data: data[0], meta }
}

export const updateProfileMedia = async (name: string, { avatar, banner }: ProfileMediaSchema) => {
  const data = await db.userProfile.update({
    where: { name },
    data: {
      avatar,
      banner
    }
  })

  return { data }
}

export const followProfile = async (target: string, follower: string) => {
  const data = await db.userProfile.update({
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

  return { data }
}

export const unfollowProfile = async (target: string, follower: string) => {
  const data = await db.userProfile.update({
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

  return { data }
}

export const getProfilePosts = async (
  name: string,
  sort: keyof SocialPost = "created",
  sortOrder: "asc" | "desc" = "desc",
  limit = 100,
  page = 1,
  includes: SocialPostIncludes = {}
) => {
  const withCommentAuthor = includes.comments ? { comments: { include: { author: true } } } : {}

  const [data, meta] = await db.socialPost
    .paginate({
      where: { owner: name },
      orderBy: {
        [sort]: sortOrder
      },
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
    .withPages({
      limit: limit,
      page: page
    })

  return { data, meta }
}