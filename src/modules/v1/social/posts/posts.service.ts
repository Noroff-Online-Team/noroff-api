import { Post } from "@prisma-api-v1/client"
import { prisma } from "@/utils"
import { PostIncludes } from "./posts.controller"
import { CreateCommentSchema, CreatePostBaseSchema, CreatePostSchema } from "./posts.schema"

export async function getPosts(
  sort: keyof Post = "created",
  sortOrder: "asc" | "desc" = "desc",
  limit = 100,
  offset = 0,
  includes: PostIncludes = {},
  tag: string | undefined
) {
  const withCommentAuthor = includes.comments ? { comments: { include: { author: true } } } : {}
  const whereTag = tag ? { tags: { has: tag } } : {}

  return await prisma.post.findMany({
    orderBy: {
      [sort]: sortOrder
    },
    take: limit,
    skip: offset,
    where: { ...whereTag },
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

export async function getPost(id: number, includes: PostIncludes = {}) {
  const withCommentAuthor = includes.comments ? { comments: { include: { author: true } } } : {}

  return await prisma.post.findUnique({
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
}

export const createPost = async (data: CreatePostSchema, includes: PostIncludes = {}) => {
  const withCommentAuthor = includes.comments ? { comments: { include: { author: true } } } : {}

  return await prisma.post.create({
    data: {
      ...data,
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
}

export const updatePost = async (id: number, data: CreatePostBaseSchema, includes: PostIncludes = {}) => {
  const withCommentAuthor = includes.comments ? { comments: { include: { author: true } } } : {}

  return await prisma.post.update({
    data: {
      ...data,
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
}

export const deletePost = async (id: number) =>
  await prisma.post.delete({
    where: {
      id
    }
  })

export const createReaction = async (postId: number, symbol: string) => {
  const query = {
    postId_symbol: {
      postId,
      symbol
    }
  }

  let item = await prisma.reaction.findUnique({
    where: query
  })

  if (item) {
    item.count += 1
    item = await prisma.reaction.update({
      data: item,
      where: query
    })
  } else {
    item = await prisma.reaction.create({
      data: {
        postId,
        count: 1,
        symbol
      }
    })
  }

  return item
}

export const createComment = async (postId: number, owner: string, comment: CreateCommentSchema) =>
  await prisma.comment.create({
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

export const deleteComment = async (id: number) =>
  await prisma.comment.delete({
    where: {
      id
    }
  })

export const getComment = async (id: number) =>
  await prisma.comment.findUnique({
    where: {
      id
    },
    select: {
      id: true,
      body: true,
      created: true,
      owner: true,
      replyToId: true,
      replies: true,
      author: true
    }
  })

export const getPostsOfFollowedUsers = async (
  id: number,
  sort: keyof Post = "created",
  sortOrder: "asc" | "desc" = "desc",
  limit = 100,
  offset = 0,
  includes: PostIncludes = {},
  tag: string | undefined
) => {
  const withCommentAuthor = includes.comments ? { comments: { include: { author: true } } } : {}
  const whereTag = tag ? { tags: { has: tag } } : {}

  return await prisma.post.findMany({
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
