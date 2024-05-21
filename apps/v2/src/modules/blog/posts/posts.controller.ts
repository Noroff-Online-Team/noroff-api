import { FastifyReply, FastifyRequest } from "fastify"
import { mediaGuard } from "@noroff/api-utils"
import { BlogPost, UserProfile } from "@/prisma/generated/v2-client"
import { BadRequest, Forbidden, NotFound } from "http-errors"

import {
  CreatePostBaseSchema,
  mediaSchema,
  postIdWithNameParamsSchema,
  postsQuerySchema,
  profileNameSchema
} from "./posts.schema"
import { createPost, deletePost, getPost, getPosts, updatePost } from "./posts.service"

export async function getPostsHandler(
  request: FastifyRequest<{
    Params: { name: string }
    Querystring: {
      limit?: number
      page?: number
      sort?: keyof BlogPost
      sortOrder?: "asc" | "desc"
      _tag?: string
    }
  }>
) {
  const { name } = await profileNameSchema.parseAsync(request.params)
  await postsQuerySchema.parseAsync(request.query)
  const { sort, sortOrder, limit, page, _tag } = request.query

  if (limit && limit > 100) {
    throw new BadRequest("Limit cannot be greater than 100")
  }

  const posts = await getPosts(sort, sortOrder, limit, page, name, _tag)

  return posts
}

export async function getPostHandler(
  request: FastifyRequest<{
    Params: {
      id: string
      name: string
    }
  }>
) {
  const { id, name } = await postIdWithNameParamsSchema.parseAsync(request.params)

  const post = await getPost(id, name)

  if (!post.data) {
    throw new NotFound("No post with such ID")
  }

  return post
}

export async function createPostHandler(
  request: FastifyRequest<{
    Params: { name: string }
    Body: CreatePostBaseSchema
  }>,
  reply: FastifyReply
) {
  const { name: paramsName } = await profileNameSchema.parseAsync(request.params)
  await mediaSchema.parseAsync(request.body)
  const { name } = request.user as UserProfile
  const { media } = request.body

  if (name.toLowerCase() !== paramsName.toLowerCase()) {
    throw new Forbidden("You do not have permission to create a post for another user")
  }

  if (media?.url) {
    await mediaGuard(media.url)
  }

  const post = await createPost({ ...request.body, owner: name })

  reply.code(201).send(post)
}

export async function deletePostHandler(
  request: FastifyRequest<{
    Params: {
      id: string
      name: string
    }
  }>,
  reply: FastifyReply
) {
  const { id, name: paramsName } = await postIdWithNameParamsSchema.parseAsync(request.params)
  const { name } = request.user as UserProfile

  if (name.toLowerCase() !== paramsName.toLowerCase()) {
    throw new Forbidden("You do not have permission to delete this post")
  }

  const post = await getPost(id, name)

  if (!post.data) {
    throw new NotFound("Post not found")
  }

  await deletePost(id)

  reply.code(204)
}

export async function updatePostHandler(
  request: FastifyRequest<{
    Params: {
      id: string
      name: string
    }
    Body: CreatePostBaseSchema
  }>
) {
  const { id, name: paramsName } = await postIdWithNameParamsSchema.parseAsync(request.params)
  const { name } = request.user as UserProfile
  const { media } = request.body

  if (name.toLowerCase() !== paramsName.toLowerCase()) {
    throw new Forbidden("You do not have permission to update this post")
  }

  if (media?.url) {
    await mediaGuard(media.url)
  }

  const post = await getPost(id, name)

  if (!post.data) {
    throw new NotFound("Post not found")
  }

  const updatedPost = await updatePost(id, request.body)

  return updatedPost
}
