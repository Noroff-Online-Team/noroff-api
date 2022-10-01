import { Post, Profile } from "@prisma/client"
import { FastifyReply, FastifyRequest } from "fastify"
import { mediaGuard } from "./../../../utils/mediaGuard";
import { CreateCommentSchema, CreatePostBaseSchema } from "./posts.schema"

import { getPosts, getPost, createPost, updatePost, createReaction, deletePost, createComment, getComment } from "./posts.service"

export interface PostIncludes {
  author?: boolean;
  reactions?: boolean;
  comments?: boolean;
}

export async function getPostsHandler(
  request: FastifyRequest<{
    Querystring: {
      limit?: number
      offset?: number
      _author?: boolean
      _reactions?: boolean
      _comments?: boolean,
      sort?: keyof Post
      sortOrder?: "asc" | "desc"
    }
  }>,
  reply: FastifyReply
) {
  const { sort, sortOrder, limit, offset, _author, _reactions, _comments } = request.query

  const includes: PostIncludes = {
    author: Boolean(_author),
    reactions: Boolean(_reactions),
    comments: Boolean(_comments)
  }

  const posts = await getPosts(sort, sortOrder, limit, offset, includes)
  reply.code(200).send(posts)
}

export async function getPostHandler(
  request: FastifyRequest<{
    Params: { id: number },
    Querystring: {
      _author?: boolean
      _reactions?: boolean
      _comments?: boolean,
    }
  }>,
  reply: FastifyReply
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
    const error = new Error("No post with such ID")
    return reply.code(404).send(error)
  }

  return post
}

export async function createPostHandler(
  request: FastifyRequest<{
    Body: CreatePostBaseSchema;
    Querystring: {
      _author?: boolean
      _reactions?: boolean
      _comments?: boolean,
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
    const post = await createPost({
      ...request.body,
      owner: name,
    }, includes)
    reply.send(post);
    return post
  } catch (error) {
    reply.code(400).send(error);
  }
}

export async function deletePostHandler(
  request: FastifyRequest<{ Params: { id: number } }>,
  reply: FastifyReply
) {
  const { id } = request.params
  const { name } = request.user as Profile
  const post = await getPost(id);

  if (!post) {
    reply.code(404).send("Post not found")
    return
  }

  if (name !== post.owner) {
    reply.code(403).send("You do not have permission to delete this post")
    return
  }

  try {
    await deletePost(id)
    reply.send(204);
  } catch (error) {
    reply.code(500).send(error)
  }
}

export async function updatePostHandler(
  request: FastifyRequest<{
    Params: { id: number },
    Body: CreatePostBaseSchema
    Querystring: {
      _author?: boolean
      _reactions?: boolean
      _comments?: boolean,
    }
  }>,
  reply: FastifyReply
) {
  const { id } = request.params
  const { name } = request.user as Profile
  const { media } = request.body;
  const { _author, _reactions, _comments } = request.query

  await mediaGuard(media)

  const includes: PostIncludes = {
    author: Boolean(_author),
    reactions: Boolean(_reactions),
    comments: Boolean(_comments)
  }

  const post = await getPost(id);

  if (!post) {
    reply.code(404).send("Post not found")
    return
  }

  if (name !== post.owner) {
    reply.code(403).send("You do not have permission to edit this post")
    return
  }

  try {
    const updatedPost = await updatePost(id, request.body, includes)
    reply.send(updatedPost);
    return updatedPost
  } catch (error) {
    reply.code(500).send(error)
  }
}

export async function createReactionHandler(request: FastifyRequest<{
  Params: { id: number, symbol: string }
}>,
  reply: FastifyReply
) {
  try {
    const { id, symbol } = request.params
    const match = symbol.match(/\p{Extended_Pictographic}/u)

    if (!match) {
      return reply.code(400).send("Only emoji codes are valid reactions")
    }

    const result = await createReaction(id, symbol)
    reply.send(result);
    return result
  } catch (error) {
    reply.code(500).send(error)
  }
}

export async function createCommentHandler(request: FastifyRequest<{
  Params: { id: number },
  Body: CreateCommentSchema
}>,
  reply: FastifyReply
) {
  const { id } = request.params
  const { name } = request.user as Profile
  try {
    const result = await createComment(id, name, request.body)
    reply.send(result);
    return result
  } catch (error) {
    reply.code(500).send(error)
  }
}

export async function deleteCommentHandler(request: FastifyRequest<{
  Params: { id: number }
}>,
  reply: FastifyReply
) {
  const { id } = request.params
  const { name } = request.user as Profile

  const comment = await getComment(id);

  if (!comment) {
    reply.code(404).send("Comment not found")
    return
  }

  if (name !== comment.owner) {
    reply.code(403).send("You do not have permission to delete this comment")
    return
  }

  try {
    await deletePost(id)
    reply.send(204);
  } catch (error) {
    reply.code(500).send(error)
  }
}

