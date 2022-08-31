import { Prisma, Profile } from "@prisma/client"
import { FastifyReply, FastifyRequest } from "fastify"
import { PostSchema } from "./posts.schema"

import { getPosts, getPost, createPost, updatePost } from "./posts.service"

export async function getPostsHandler() {
  // Get all posts in chron order
  const posts = await getPosts()
  return posts
}

export async function getPostHandler(
  request: FastifyRequest<{
    Params: { id: number }
  }>,
  reply: FastifyReply
) {
  const { id } = request.params
  const post = await getPost(id)

  if (!post) {
    const error = new Error("No post with such ID")
    return reply.code(404).send(error)
  }

  return post
}

export async function createPostHandler(
  request: FastifyRequest<{
    Body: PostSchema;
  }>,
  reply: FastifyReply
) {
  const { id: userId } = request.user as Profile
  try {
    const post = await createPost({
      ...request.body,
      userId
    })
    reply.send(post);
    return post
  } catch (error) {
    reply.code(400).send(error);
  }
}

export async function updatePostHandler(
  request: FastifyRequest<{
    Params: { id: number }
  }>,
  reply: FastifyReply
) {
  const { id } = request.params
  const post = await updatePost(id, request.body as Prisma.PostUpdateInput)
  reply.send(post);
}