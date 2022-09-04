import { Post } from "@prisma/client"
import { prisma } from "../../../utils"
import { PostIncludes } from "./posts.controller"
import {
  CreateCommentSchema,
  CreatePostBaseSchema,
  CreatePostSchema
} from "./posts.schema"

export async function getPosts(sort: keyof Post = "created", sortOrder: "asc" | "desc" = "desc", limit = 100, offset = 0, includes: PostIncludes = {}) {
  return prisma.post.findMany({
    orderBy: {
      [sort]: sortOrder
    },
    take: limit,
    skip: offset,
    include: {
      ...includes,
      _count: {
        select: {
          comments: true,
          reactions: true,
        }
      }
    }
  })
}

export async function getPost(id: number, includes: PostIncludes = {}) {
  return prisma.post.findUnique({
    where: { id },
    include: {
      ...includes,
      _count: {
        select: {
          comments: true,
          reactions: true,
        }
      }
    }
  })
}

export const createPost = (data: CreatePostSchema, includes: PostIncludes = {}) => {
  return prisma.post.create({
    data: {
      ...data,
      created: new Date(),
      updated: new Date()
    },
    include: {
      ...includes,
      _count: {
        select: {
          comments: true,
          reactions: true,
        }
      }
    }
  })
}

export const updatePost = (id: number, data: CreatePostBaseSchema, includes: PostIncludes = {}) =>
  prisma.post.update({
    data: {
      ...data,
      updated: new Date()
    },
    where: {
      id
    },
    include: {
      ...includes,
      _count: {
        select: {
          comments: true,
          reactions: true,
        }
      }
    }
  })

export const deletePost = (id: number) =>
  prisma.post.delete({
    where: {
      id
    }
  })

export const createReaction = async (postId: number, symbol: string) => {
  const match = symbol.match(/\p{Extended_Pictographic}/u)

  if (!match) {
    return {
      postId,
      symbol,
      count: 0,
      message: "Only Emoji symbols are valid reactions"
    }
  }

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

export const createComment = async (
  postId: number,
  owner: string,
  comment: CreateCommentSchema
) => {
  return prisma.comment.create({
    data: {
      body: comment.body,
      replyToId: comment.replyToId,
      postId,
      created: new Date(),
      owner
    }
  })
}

export const deleteComment = (id: number) =>
  prisma.comment.delete({
    where: {
      id
    }
  })

export const getComment = (id: number) =>
  prisma.comment.findUnique({
    where: {
      id
    }
  })
