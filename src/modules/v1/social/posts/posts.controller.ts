import { Prisma, Post, Profile, Comment } from "@prisma-api-v1/client"
import { FastifyReply, FastifyRequest } from "fastify"
import { mediaGuard } from "@/utils/mediaGuard"
import { CreateCommentSchema, CreatePostBaseSchema } from "./posts.schema"
import { NotFound, Forbidden, BadRequest } from "http-errors"

import {
  getPosts,
  getPost,
  createPost,
  updatePost,
  createReaction,
  deletePost,
  createComment,
  getComment,
  getPostsOfFollowedUsers
} from "./posts.service"

export interface PostIncludes {
  author?: boolean
  reactions?: boolean
  comments?: boolean
}

type PostWithComments = Prisma.PromiseReturnType<typeof getPost> & { comments: Array<Comment> | [] }

export async function getPostsHandler(
  request: FastifyRequest<{
    Querystring: {
      limit?: number
      offset?: number
      _author?: boolean
      _reactions?: boolean
      _comments?: boolean
      sort?: keyof Post
      sortOrder?: "asc" | "desc"
      _tag?: string
    }
  }>,
  reply: FastifyReply
) {
  const { sort, sortOrder, limit, offset, _author, _reactions, _comments, _tag } = request.query

  if (limit && limit > 100) {
    throw new BadRequest("Limit cannot be greater than 100")
  }

  const includes: PostIncludes = {
    author: Boolean(_author),
    reactions: Boolean(_reactions),
    comments: Boolean(_comments)
  }

  const posts = await getPosts(sort, sortOrder, limit, offset, includes, _tag)
  reply.code(200).send(posts)
}

export async function getPostHandler(
  request: FastifyRequest<{
    Params: { id: number }
    Querystring: {
      _author?: boolean
      _reactions?: boolean
      _comments?: boolean
    }
  }>
) {
  const { id } = request.params
  const { _author, _reactions, _comments } = request.query

  const includes: PostIncludes = {
    author: Boolean(_author),
    reactions: Boolean(_reactions),
    comments: Boolean(_comments)
  }

  const post = await getPost(id, includes)

  if (!post) {
    throw new NotFound("No post with such ID")
  }

  return post
}

export async function createPostHandler(
  request: FastifyRequest<{
    Body: CreatePostBaseSchema
    Querystring: {
      _author?: boolean
      _reactions?: boolean
      _comments?: boolean
    }
  }>,
  reply: FastifyReply
) {
  const { name } = request.user as Profile
  const { media } = request.body as Post
  const { _author, _reactions, _comments } = request.query

  const includes: PostIncludes = {
    author: Boolean(_author),
    reactions: Boolean(_reactions),
    comments: Boolean(_comments)
  }

  try {
    await mediaGuard(media)
    const post = await createPost(
      {
        ...request.body,
        owner: name
      },
      includes
    )
    reply.send(post)
    return post
  } catch (error) {
    reply.code(500).send(error)
  }
}

export async function deletePostHandler(request: FastifyRequest<{ Params: { id: number } }>, reply: FastifyReply) {
  const { id } = request.params
  const { name } = request.user as Profile
  const post = await getPost(id)

  if (!post) {
    throw new NotFound("Post not found")
  }

  if (name !== post.owner) {
    throw new Forbidden("You do not have permission to delete this post")
  }

  try {
    await deletePost(id)
    reply.send(204)
  } catch (error) {
    reply.code(500).send(error)
  }
}

export async function updatePostHandler(
  request: FastifyRequest<{
    Params: { id: number }
    Body: CreatePostBaseSchema
    Querystring: {
      _author?: boolean
      _reactions?: boolean
      _comments?: boolean
    }
  }>,
  reply: FastifyReply
) {
  const { id } = request.params
  const { name } = request.user as Profile
  const { media } = request.body
  const { _author, _reactions, _comments } = request.query

  await mediaGuard(media)

  const includes: PostIncludes = {
    author: Boolean(_author),
    reactions: Boolean(_reactions),
    comments: Boolean(_comments)
  }

  const post = await getPost(id)

  if (!post) {
    throw new NotFound("Post not found")
  }

  if (name !== post.owner) {
    throw new Forbidden("You do not have permission to edit this post")
  }

  try {
    const updatedPost = await updatePost(id, request.body, includes)
    reply.send(updatedPost)
    return updatedPost
  } catch (error) {
    reply.code(500).send(error)
  }
}

export async function createReactionHandler(
  request: FastifyRequest<{
    Params: { id: number; symbol: string }
  }>,
  reply: FastifyReply
) {
  try {
    const { id, symbol } = request.params
    const match = symbol.match(/\p{Extended_Pictographic}/u)

    if (!match) {
      throw new BadRequest("Only emoji codes are valid reactions")
    }

    const post = await getPost(id)

    if (!post) {
      throw new NotFound("Post not found")
    }

    const result = await createReaction(id, symbol)
    reply.send(result)
    return result
  } catch (error) {
    reply.code(500).send(error)
  }
}

export async function createCommentHandler(
  request: FastifyRequest<{
    Params: { id: number }
    Body: CreateCommentSchema
  }>,
  reply: FastifyReply
) {
  const { id } = request.params
  const { name } = request.user as Profile
  const { replyToId } = request.body

  const post = (await getPost(id, { comments: true })) as PostWithComments | null

  if (!post) {
    throw new NotFound("Post not found")
  }

  if (replyToId) {
    const replyComment = await getComment(replyToId)

    if (!replyComment) {
      throw new NotFound("You can't reply to a comment that does not exist")
    }

    const isRelatedToPost = post.comments?.find(comment => comment.id === replyToId)

    if (!isRelatedToPost) {
      throw new BadRequest("Comment is not related to this post")
    }
  }

  try {
    const result = await createComment(id, name, request.body)
    reply.send(result)
    return result
  } catch (error) {
    reply.code(500).send(error)
  }
}

export async function deleteCommentHandler(
  request: FastifyRequest<{
    Params: { id: number }
  }>,
  reply: FastifyReply
) {
  const { id } = request.params
  const { name } = request.user as Profile

  const comment = await getComment(id)

  if (!comment) {
    throw new NotFound("Comment not found")
  }

  if (name !== comment.owner) {
    throw new Forbidden("You do not have permission to delete this comment")
  }

  try {
    await deletePost(id)
    reply.send(204)
  } catch (error) {
    reply.code(500).send(error)
  }
}

export async function getPostsOfFollowedUsersHandler(
  request: FastifyRequest<{
    Querystring: {
      sort?: keyof Post
      sortOrder?: "asc" | "desc"
      limit?: number
      offset?: number
      _author?: boolean
      _reactions?: boolean
      _comments?: boolean
      _tag?: string
    }
  }>,
  reply: FastifyReply
) {
  const { id } = request.user as Profile
  const { sort, sortOrder, limit, offset, _author, _reactions, _comments, _tag } = request.query

  if (limit && limit > 100) {
    throw new BadRequest("Limit cannot be greater than 100")
  }

  const includes: PostIncludes = {
    author: Boolean(_author),
    reactions: Boolean(_reactions),
    comments: Boolean(_comments)
  }

  try {
    const posts = await getPostsOfFollowedUsers(id, sort, sortOrder, limit, offset, includes, _tag)
    reply.code(200).send(posts)
  } catch (error) {
    reply.code(500).send(error)
  }
}
