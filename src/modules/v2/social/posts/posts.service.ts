import { SocialPost } from "@prisma-api-v2/client"
import { db } from "@/utils"
import { SocialPostIncludes } from "./posts.controller"
import { CreateCommentSchema, CreatePostBaseSchema, CreatePostSchema } from "./posts.schema"

export async function getPosts(
  sort: keyof SocialPost = "created",
  sortOrder: "asc" | "desc" = "desc",
  limit = 100,
  page = 1,
  includes: SocialPostIncludes = {},
  tag: string | undefined
) {
  const withCommentAuthor = includes.comments ? { comments: { include: { author: true } } } : {}
  const whereTag = tag ? { tags: { has: tag } } : {}

  const [data, meta] = await db.socialPost
    .paginate({
      where: { ...whereTag },
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

export async function getPost(id: number, includes: SocialPostIncludes = {}) {
  const withCommentAuthor = includes.comments ? { comments: { include: { author: true } } } : {}

  const [data, meta] = await db.socialPost
    .paginate({
      where: { id },
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
      limit: 1
    })

  return { data: data[0], meta }
}

export const createPost = async (createPostData: CreatePostSchema, includes: SocialPostIncludes = {}) => {
  const withCommentAuthor = includes.comments ? { comments: { include: { author: true } } } : {}

  const data = await db.socialPost.create({
    data: {
      ...createPostData,
      created: new Date(),
      updated: new Date()
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

  return { data }
}

export const updatePost = async (
  id: number,
  updatePostData: CreatePostBaseSchema,
  includes: SocialPostIncludes = {}
) => {
  const withCommentAuthor = includes.comments ? { comments: { include: { author: true } } } : {}

  const data = await db.socialPost.update({
    data: {
      ...updatePostData,
      updated: new Date()
    },
    where: { id },
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

  return { data }
}

export const deletePost = async (id: number) => {
  await db.socialPost.delete({
    where: { id }
  })
}

export const createReaction = async (postId: number, symbol: string) => {
  const query = {
    postId_symbol: {
      postId,
      symbol
    }
  }

  let item = await db.socialPostReaction.findUnique({
    where: query
  })

  if (item) {
    item.count += 1
    item = await db.socialPostReaction.update({
      data: item,
      where: query
    })
  } else {
    item = await db.socialPostReaction.create({
      data: {
        postId,
        count: 1,
        symbol
      }
    })
  }

  return { data: item }
}

export const createComment = async (postId: number, owner: string, comment: CreateCommentSchema) => {
  const data = await db.socialPostComment.create({
    data: {
      body: comment.body,
      replyToId: comment.replyToId,
      postId,
      created: new Date(),
      owner
    },
    select: {
      id: true,
      body: true,
      created: true,
      owner: true,
      replyToId: true,
      postId: true,
      author: true
    }
  })

  return { data }
}

export const deleteComment = async (id: number) => {
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
  const withCommentAuthor = includes.comments ? { comments: { include: { author: true } } } : {}
  const whereTag = tag ? { tags: { has: tag } } : {}

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
