import { Prisma, SocialPost, UserProfile, SocialPostComment } from "@prisma-api-v2/client"
import { FastifyReply, FastifyRequest } from "fastify"
import { mediaGuard } from "@/utils/mediaGuard"
import { NotFound, Forbidden, InternalServerError, BadRequest, isHttpError } from "http-errors"

import {
  CreateCommentSchema,
  CreatePostBaseSchema,
  emojiSchema,
  postIdParamsSchema,
  postsQuerySchema
} from "./posts.schema"
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
import { ZodError } from "zod"

export interface SocialPostIncludes {
  author?: boolean
  reactions?: boolean
  comments?: boolean
}

type PostWithComments = Prisma.PromiseReturnType<typeof getPost> & {
  comments: Array<SocialPostComment> | []
}

export async function getPostsHandler(
  request: FastifyRequest<{
    Querystring: {
      limit?: number
      page?: number
      _author?: boolean
      _reactions?: boolean
      _comments?: boolean
      sort?: keyof SocialPost
      sortOrder?: "asc" | "desc"
      _tag?: string
    }
  }>
) {
  try {
    await postsQuerySchema.parseAsync(request.query)
    const { sort, sortOrder, limit, page, _author, _reactions, _comments, _tag } = request.query

    if (limit && limit > 100) {
      throw new BadRequest("Limit cannot be greater than 100")
    }

    const includes: SocialPostIncludes = {
      author: Boolean(_author),
      reactions: Boolean(_reactions),
      comments: Boolean(_comments)
    }

    const posts = await getPosts(sort, sortOrder, limit, page, includes, _tag)

    return posts
  } catch (error) {
    if (error instanceof ZodError) {
      throw new BadRequest(error.message)
    }

    if (isHttpError(error)) {
      throw error
    }

    throw new InternalServerError("Something went wrong.")
  }
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
  try {
    const { id } = await postIdParamsSchema.parseAsync(request.params)
    const { _author, _reactions, _comments } = request.query

    const includes: SocialPostIncludes = {
      author: Boolean(_author),
      reactions: Boolean(_reactions),
      comments: Boolean(_comments)
    }

    const post = await getPost(id, includes)

    if (!post.data) {
      throw new NotFound("No post with such ID")
    }

    return post
  } catch (error) {
    if (error instanceof ZodError) {
      throw new BadRequest(error.message)
    }

    if (isHttpError(error)) {
      throw error
    }

    throw new InternalServerError("Something went wrong.")
  }
}

export async function createPostHandler(
  request: FastifyRequest<{
    Body: CreatePostBaseSchema
    Querystring: {
      _author?: boolean
      _reactions?: boolean
      _comments?: boolean
    }
  }>
) {
  try {
    const { name } = request.user as UserProfile
    const { media } = request.body as SocialPost
    const { _author, _reactions, _comments } = request.query

    const includes: SocialPostIncludes = {
      author: Boolean(_author),
      reactions: Boolean(_reactions),
      comments: Boolean(_comments)
    }

    await mediaGuard(media)

    const post = await createPost({ ...request.body, owner: name }, includes)

    return post
  } catch (error) {
    if (error instanceof ZodError) {
      throw new BadRequest(error.message)
    }

    if (isHttpError(error)) {
      throw error
    }

    throw new InternalServerError("Something went wrong.")
  }
}

export async function deletePostHandler(
  request: FastifyRequest<{
    Params: { id: number }
  }>,
  reply: FastifyReply
) {
  try {
    const { id } = await postIdParamsSchema.parseAsync(request.params)
    const { name } = request.user as UserProfile

    const post = await getPost(id)

    if (!post.data) {
      throw new NotFound("Post not found")
    }

    if (name.toLowerCase() !== post.data.owner.toLowerCase()) {
      throw new Forbidden("You do not have permission to delete this post")
    }

    await deletePost(id)

    return reply.code(204)
  } catch (error) {
    if (error instanceof ZodError) {
      throw new BadRequest(error.message)
    }

    if (isHttpError(error)) {
      throw error
    }

    throw new InternalServerError("Something went wrong.")
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
  }>
) {
  try {
    const { id } = await postIdParamsSchema.parseAsync(request.params)
    const { name } = request.user as UserProfile
    const { media } = request.body
    const { _author, _reactions, _comments } = request.query

    const includes: SocialPostIncludes = {
      author: Boolean(_author),
      reactions: Boolean(_reactions),
      comments: Boolean(_comments)
    }

    await mediaGuard(media)

    const post = await getPost(id)

    if (!post.data) {
      throw new NotFound("Post not found")
    }

    if (name.toLowerCase() !== post.data.owner.toLowerCase()) {
      throw new Forbidden("You do not have permission to edit this post")
    }

    const updatedPost = await updatePost(id, request.body, includes)

    return updatedPost
  } catch (error) {
    if (error instanceof ZodError) {
      throw new BadRequest(error.message)
    }

    if (isHttpError(error)) {
      throw error
    }

    throw new InternalServerError("Something went wrong.")
  }
}

export async function createReactionHandler(
  request: FastifyRequest<{
    Params: { id: number; symbol: string }
  }>
) {
  try {
    const { id } = await postIdParamsSchema.parseAsync(request.params)
    const { symbol } = request.params
    await emojiSchema.parseAsync(symbol)

    const post = await getPost(id)

    if (!post.data) {
      throw new NotFound("Post not found")
    }

    const result = await createReaction(id, symbol)

    return result
  } catch (error) {
    if (error instanceof ZodError) {
      throw new BadRequest(error.message)
    }

    if (isHttpError(error)) {
      throw error
    }

    throw new InternalServerError("Something went wrong.")
  }
}

export async function createCommentHandler(
  request: FastifyRequest<{
    Params: { id: number }
    Body: CreateCommentSchema
  }>
) {
  try {
    const { id } = await postIdParamsSchema.parseAsync(request.params)
    const { name } = request.user as UserProfile
    const { replyToId } = request.body

    const post = (await getPost(id, { comments: true })) as PostWithComments

    if (!post.data) {
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

    const result = await createComment(id, name, request.body)

    return result
  } catch (error) {
    if (error instanceof ZodError) {
      throw new BadRequest(error.message)
    }

    if (isHttpError(error)) {
      throw error
    }

    throw new InternalServerError("Something went wrong.")
  }
}

export async function deleteCommentHandler(
  request: FastifyRequest<{
    Params: { id: number }
  }>,
  reply: FastifyReply
) {
  try {
    const { id } = await postIdParamsSchema.parseAsync(request.params)
    const { name } = request.user as UserProfile

    const comment = await getComment(id)

    if (!comment) {
      throw new NotFound("Comment not found")
    }

    if (name.toLowerCase() !== comment.owner.toLowerCase()) {
      throw new Forbidden("You do not have permission to delete this comment")
    }

    await deletePost(id)

    return reply.code(204)
  } catch (error) {
    if (error instanceof ZodError) {
      throw new BadRequest(error.message)
    }

    if (isHttpError(error)) {
      throw error
    }

    throw new InternalServerError("Something went wrong.")
  }
}

export async function getPostsOfFollowedUsersHandler(
  request: FastifyRequest<{
    Querystring: {
      sort?: keyof SocialPost
      sortOrder?: "asc" | "desc"
      limit?: number
      page?: number
      _author?: boolean
      _reactions?: boolean
      _comments?: boolean
      _tag?: string
    }
  }>
) {
  try {
    const { id } = request.user as UserProfile
    const { sort, sortOrder, limit, page, _author, _reactions, _comments, _tag } = request.query

    if (limit && limit > 100) {
      throw new BadRequest("Limit cannot be greater than 100")
    }

    const includes: SocialPostIncludes = {
      author: Boolean(_author),
      reactions: Boolean(_reactions),
      comments: Boolean(_comments)
    }

    const posts = await getPostsOfFollowedUsers(id, sort, sortOrder, limit, page, includes, _tag)

    return posts
  } catch (error) {
    if (error instanceof ZodError) {
      throw new BadRequest(error.message)
    }

    if (isHttpError(error)) {
      throw error
    }

    throw new InternalServerError("Something went wrong.")
  }
}