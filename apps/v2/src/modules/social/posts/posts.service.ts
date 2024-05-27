import type { SocialPost } from "@prisma/v2-client"

import { db } from "@/utils"

import type { SocialPostIncludes } from "./posts.controller"
import type {
  CreateCommentSchema,
  CreatePostBaseSchema,
  CreatePostSchema,
  DisplaySocialPost,
  Media
} from "./posts.schema"

export async function getPosts(
  sort: keyof SocialPost = "created",
  sortOrder: "asc" | "desc" = "desc",
  limit = 100,
  page = 1,
  includes: SocialPostIncludes = {},
  tag: string | undefined
) {
  const withCommentAuthor = includes.comments
    ? {
        comments: {
          include: { author: { include: { avatar: true, banner: true } } }
        }
      }
    : {}
  const whereTag = tag ? { tags: { has: tag } } : {}
  const withAuthorMedia = includes.author
    ? { author: { include: { avatar: true, banner: true } } }
    : {}

  const [data, meta] = await db.socialPost
    .paginate({
      where: { ...whereTag },
      orderBy: {
        [sort]: sortOrder
      },
      include: {
        ...includes,
        ...withCommentAuthor,
        ...withAuthorMedia,
        media: true,
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

  const enrichedData = await Promise.all(
    data.map(async (post): Promise<DisplaySocialPost> => {
      let transformedMedia: Media["media"] | null = null

      if (post.media?.url) {
        transformedMedia = {
          url: post.media.url,
          alt: post.media.alt || ""
        }
      }

      const enrichedPost: DisplaySocialPost = {
        ...post,
        media: transformedMedia
      }

      if (includes.reactions) {
        enrichedPost.reactions = await fetchReactionCounts(post.id)
      }

      return enrichedPost
    })
  )

  return { data: enrichedData, meta }
}

export async function getPost(id: number, includes: SocialPostIncludes = {}) {
  const withCommentAuthor = includes.comments
    ? {
        comments: {
          include: { author: { include: { avatar: true, banner: true } } }
        }
      }
    : {}
  const withAuthorMedia = includes.author
    ? { author: { include: { avatar: true, banner: true } } }
    : {}

  const [data] = await db.socialPost
    .paginate({
      where: { id },
      include: {
        ...includes,
        ...withCommentAuthor,
        ...withAuthorMedia,
        media: true,
        _count: {
          select: {
            comments: true,
            reactions: true
          }
        }
      }
    })
    .withPages({
      limit: 1
    })

  // Return undefined for data if no post was found, allowing for a simple truthiness check in the controller.
  if (!data.length) {
    return { data: undefined }
  }

  const post = data[0]
  let transformedMedia: Media["media"] | null = null

  if (post.media?.url) {
    transformedMedia = {
      url: post.media.url,
      alt: post.media.alt || ""
    }
  }

  const enrichedPost: DisplaySocialPost = { ...post, media: transformedMedia }

  if (includes.reactions) {
    enrichedPost.reactions = await fetchReactionCounts(post.id)
  }

  return { data: enrichedPost }
}

export const createPost = async (
  createPostData: CreatePostSchema,
  includes: SocialPostIncludes = {}
) => {
  const { media, ...restData } = createPostData
  const withCommentAuthor = includes.comments
    ? {
        comments: {
          include: { author: { include: { avatar: true, banner: true } } }
        }
      }
    : {}
  const withAuthorMedia = includes.author
    ? { author: { include: { avatar: true, banner: true } } }
    : {}

  const data = await db.socialPost.create({
    data: {
      ...restData,
      media: media?.url ? { create: media } : undefined
    },
    include: {
      ...includes,
      ...withCommentAuthor,
      ...withAuthorMedia,
      media: true,
      _count: {
        select: {
          comments: true,
          reactions: true
        }
      }
    }
  })

  const enrichedData = includes.reactions
    ? { ...data, reactions: await fetchReactionCounts(data.id) }
    : data

  return { data: enrichedData }
}

export const updatePost = async (
  id: number,
  updatePostData: CreatePostBaseSchema,
  includes: SocialPostIncludes = {}
) => {
  const { media, ...restData } = updatePostData
  const withCommentAuthor = includes.comments
    ? {
        comments: {
          include: { author: { include: { avatar: true, banner: true } } }
        }
      }
    : {}

  const data = await db.socialPost.update({
    data: {
      ...restData,
      media: media?.url ? { create: media } : undefined
    },
    where: { id },
    include: {
      ...includes,
      ...withCommentAuthor,
      media: true,
      _count: {
        select: {
          comments: true,
          reactions: true
        }
      }
    }
  })

  const enrichedData = includes.reactions
    ? { ...data, reactions: await fetchReactionCounts(id) }
    : data

  return { data: enrichedData }
}

export const deletePost = async (id: number) => {
  await db.socialPost.delete({
    where: { id }
  })
}

async function fetchReactionCounts(postId: number) {
  const reactions = await db.socialPostReaction.findMany({
    where: { postId },
    select: { symbol: true, owner: true }
  })

  // Transform reactions into a more efficient structure for processing
  const reactionSummary = reactions.reduce<{
    [key: string]: { count: number; reactors: string[] }
  }>((acc, reaction) => {
    const { symbol, owner } = reaction
    if (!acc[symbol]) {
      acc[symbol] = { count: 0, reactors: [] }
    }
    acc[symbol].count += 1
    acc[symbol].reactors.push(owner)
    return acc
  }, {})

  // Convert the summary object back into the desired array format
  return Object.entries(reactionSummary).map(
    ([symbol, { count, reactors }]) => ({
      symbol,
      count,
      reactors
    })
  )
}

export const createOrDeleteReaction = async (
  postId: number,
  symbol: string,
  owner: string
) => {
  const userReactionQuery = {
    postId_symbol_owner: {
      postId,
      symbol,
      owner
    }
  }

  const userReaction = await db.socialPostReaction.findUnique({
    where: userReactionQuery
  })

  let reactionDetails

  if (userReaction) {
    reactionDetails = await db.socialPostReaction.delete({
      where: userReactionQuery
    })
  } else {
    reactionDetails = await db.socialPostReaction.create({
      data: {
        postId,
        owner,
        symbol,
        count: 1
      }
    })
  }

  const reactions = await fetchReactionCounts(postId)

  return {
    data: {
      ...reactionDetails,
      reactions
    }
  }
}

export const createComment = async (
  postId: number,
  owner: string,
  comment: CreateCommentSchema,
  includes: { author?: boolean } = {}
) => {
  const withAuthor = includes.author
    ? { author: { include: { avatar: true, banner: true } } }
    : {}

  const data = await db.socialPostComment.create({
    data: {
      ...comment,
      postId,
      owner
    },
    include: {
      ...withAuthor
    }
  })

  return { data }
}

export const deleteCommentAndReplies = async (id: number) => {
  await db.socialPostComment.delete({
    where: { id }
  })
}

export const getComment = async (id: number) => {
  return await db.socialPostComment.findUnique({
    where: { id }
  })
}

export const getPostsOfFollowedUsers = async (
  id: number,
  sort: keyof SocialPost = "created",
  sortOrder: "asc" | "desc" = "desc",
  limit = 100,
  page = 1,
  includes: SocialPostIncludes = {},
  tag: string | undefined
) => {
  const withCommentAuthor = includes.comments
    ? {
        comments: {
          include: { author: { include: { avatar: true, banner: true } } }
        }
      }
    : {}
  const whereTag = tag ? { tags: { has: tag } } : {}
  const withAuthorMedia = includes.author
    ? { author: { include: { avatar: true, banner: true } } }
    : {}

  const [data, meta] = await db.socialPost
    .paginate({
      where: {
        ...whereTag,
        author: {
          followers: {
            some: { id }
          }
        }
      },
      orderBy: {
        [sort]: sortOrder
      },
      include: {
        ...includes,
        ...withCommentAuthor,
        ...withAuthorMedia,
        media: true,
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

  const enrichedData = includes.reactions
    ? await Promise.all(
        data.map(async post => ({
          ...post,
          reactions: await fetchReactionCounts(post.id)
        }))
      )
    : data

  return { data: enrichedData, meta }
}

export const searchPosts = async (
  sort: keyof SocialPost = "created",
  sortOrder: "asc" | "desc" = "desc",
  limit = 100,
  page = 1,
  query: string,
  includes: SocialPostIncludes = {}
) => {
  const withCommentAuthor = includes.comments
    ? {
        comments: {
          include: { author: { include: { avatar: true, banner: true } } }
        }
      }
    : {}
  const withAuthorMedia = includes.author
    ? { author: { include: { avatar: true, banner: true } } }
    : {}

  const [data, meta] = await db.socialPost
    .paginate({
      where: {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { body: { contains: query, mode: "insensitive" } }
        ]
      },
      include: {
        ...includes,
        ...withCommentAuthor,
        ...withAuthorMedia,
        media: true,
        _count: {
          select: {
            comments: true,
            reactions: true
          }
        }
      },
      orderBy: {
        [sort]: sortOrder
      }
    })
    .withPages({
      limit,
      page
    })

  const enrichedData = includes.reactions
    ? await Promise.all(
        data.map(async post => ({
          ...post,
          reactions: await fetchReactionCounts(post.id)
        }))
      )
    : data

  return { data: enrichedData, meta }
}
