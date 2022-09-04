import { Profile } from "@prisma/client"
import { FastifyReply, FastifyRequest } from "fastify"
import { CreateCommentSchema, CreatePostBaseSchema } from "./posts.schema"

import { getPosts, getPost, createPost, updatePost, createReaction, deletePost, createComment, getComment } from "./posts.service"

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
    Body: CreatePostBaseSchema;
  }>,
  reply: FastifyReply
) {
  const { name } = request.user as Profile
  try {
    const post = await createPost({
      ...request.body,
      owner: name,
    })
    reply.send(post);
    return post
  } catch (error) {
    reply.code(400).send(error);
  }
}

export async function deletePostHandler(
  request: FastifyRequest<{ Params: { id: string } }>, 
  reply: FastifyReply
  ) {
  const { id } = request.params
  const { name } = request.user as Profile
  const post = await getPost(Number(id));

  if (!post) {
    reply.code(404).send("Post not found")
    return
  }

  if (name !== post.author.name) {
    reply.code(403).send("You do not have permission to delete this post")
    return
  }

  try {
    await deletePost(Number(id))
    reply.send(204);
  } catch (error) {
    reply.code(500).send(error)
  }
}

export async function updatePostHandler(
  request: FastifyRequest<{
    Params: { id: string },
    Body: CreatePostBaseSchema
  }>,
  reply: FastifyReply
) {
  const { id } = request.params
  const { name } = request.user as Profile
  const post = await getPost(Number(id));

  if (!post) {
    reply.code(404).send("Post not found")
    return
  }

  if (name !== post.owner) {
    reply.code(403).send("You do not have permission to edit this post")
    return
  }

  try {
    const updatedPost = await updatePost(Number(id), request.body)
    reply.send(updatedPost);
    return updatedPost
  } catch (error) {
    reply.code(500).send(error)
  }
}

export async function createReactionHandler(request: FastifyRequest<{
  Params: { id: string, symbol: string }
}>,
  reply: FastifyReply
) {
  try {
    const { id, symbol } = request.params
    const result = await createReaction(Number(id), symbol)
    reply.send(result);
    return result
  } catch (error) {
    reply.code(500).send(error)
  }
}

export async function createCommentHandler(request: FastifyRequest<{
  Params: { id: string },
  Body: CreateCommentSchema
}>,
  reply: FastifyReply
) {
  const { id } = request.params
  const { name } = request.user as Profile
  try {
    const result = await createComment(Number(id), name, request.body)
    reply.send(result);
    return result
  } catch (error) {
    reply.code(500).send(error)
  }
}

export async function deleteCommentHandler(request: FastifyRequest<{
  Params: { id: string }
}>,
  reply: FastifyReply
) {
  const { id } = request.params
  const { name } = request.user as Profile

  const comment = await getComment(Number(id));

  if (!comment) {
    reply.code(404).send("Comment not found")
    return
  }

  if (name !== comment.owner) {
    reply.code(403).send("You do not have permission to delete this comment")
    return
  }

  try {
    await deletePost(Number(id))
    reply.send(204);
  } catch (error) {
    reply.code(500).send(error)
  }
}

