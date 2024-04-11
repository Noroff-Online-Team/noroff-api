import { FastifyReply, FastifyRequest } from "fastify"
import { mediaGuard } from "@noroff/api-utils"
import { BlogPost, UserProfile } from "@prisma/v2-client"
import { BadRequest, Forbidden, NotFound } from "http-errors"

import {
  CreatePostBaseSchema,
  mediaSchema,
  postIdParamsSchema,
  postsQuerySchema,
  profileNameSchema
} from "./posts.schema"
import { createPost, deletePost, getPost, getPosts, updatePost } from "./posts.service"

export async function getPostsHandler(
  request: FastifyRequest<{
    Querystring: {
      limit?: number
      page?: number
      sort?: keyof BlogPost
      sortOrder?: "asc" | "desc"
      _tag?: string
    }
  }>
) {
  await postsQuerySchema.parseAsync(request.query)
  const { sort, sortOrder, limit, page, _tag } = request.query
  const { name } = request.user as UserProfile

  if (limit && limit > 100) {
    throw new BadRequest("Limit cannot be greater than 100")
  }

  const posts = await getPosts(sort, sortOrder, limit, page, name, _tag)

  return posts
}

export async function getPostHandler(
  request: FastifyRequest<{
    Params: { id: string }
  }>
) {
  const { id } = await postIdParamsSchema.parseAsync(request.params)
  const { name } = request.user as UserProfile

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
  const { name } = await profileNameSchema.parseAsync(request.params)
  await mediaSchema.parseAsync(request.body)
  const { name: requestUser } = request.user as UserProfile
  const { media } = request.body

  if (media?.url) {
    await mediaGuard(media.url)
  }

  if (name.toLowerCase() !== requestUser.toLowerCase()) {
    throw new Forbidden("You do not have permission to create a post for another user")
  }

  const post = await createPost({ ...request.body, owner: requestUser })

  reply.code(201).send(post)
}

export async function deletePostHandler(
  request: FastifyRequest<{
    Params: { id: string }
  }>,
  reply: FastifyReply
) {
  const { id } = await postIdParamsSchema.parseAsync(request.params)
  const { name } = request.user as UserProfile

  const post = await getPost(id, name)

  if (!post.data) {
    throw new NotFound("Post not found")
  }

  if (name.toLowerCase() !== post.data.author?.name.toLowerCase()) {
    throw new Forbidden("You do not have permission to delete this post")
  }

  await deletePost(id)

  reply.code(204)
}

export async function updatePostHandler(
  request: FastifyRequest<{
    Params: { id: string }
    Body: CreatePostBaseSchema
  }>
) {
  const { id } = await postIdParamsSchema.parseAsync(request.params)
  const { name } = request.user as UserProfile
  const { media } = request.body

  if (media?.url) {
    await mediaGuard(media.url)
  }

  const post = await getPost(id, name)

  if (!post.data) {
    throw new NotFound("Post not found")
  }

  if (name.toLowerCase() !== post.data.author?.name.toLowerCase()) {
    throw new Forbidden("You do not have permission to edit this post")
  }

  const updatedPost = await updatePost(id, request.body)

  return updatedPost
}
