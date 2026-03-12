import type { FastifyReply, FastifyRequest } from "fastify"
import { Forbidden, NotFound } from "http-errors"

import type { RequestUser } from "@/types/api"
import {
  type UpdateCommentSchema,
  commentParamsSchema,
  updateCommentSchema
} from "./comments.schema"
import { deleteComment, getComment, updateComment } from "./comments.service"

export async function updateCommentHandler(
  request: FastifyRequest<{
    Params: { id: string }
    Body: UpdateCommentSchema
  }>
) {
  const { id } = await commentParamsSchema.parseAsync(request.params)
  const data = await updateCommentSchema.parseAsync(request.body)
  const { name } = request.user as RequestUser

  const comment = await getComment(id)

  if (!comment.data) {
    throw new NotFound("No comment with such ID")
  }

  if (name.toLowerCase() !== comment.data.ownerName.toLowerCase()) {
    throw new Forbidden("You do not have permission to update this comment")
  }

  const updatedComment = await updateComment(id, data)

  return updatedComment
}

export async function deleteCommentHandler(
  request: FastifyRequest<{
    Params: { id: string }
  }>,
  reply: FastifyReply
) {
  const { id } = await commentParamsSchema.parseAsync(request.params)
  const { name } = request.user as RequestUser

  const comment = await getComment(id)

  if (!comment.data) {
    throw new NotFound("No comment with such ID")
  }

  if (name.toLowerCase() !== comment.data.ownerName.toLowerCase()) {
    throw new Forbidden("You do not have permission to delete this comment")
  }

  await deleteComment(id)

  reply.code(204)
}
